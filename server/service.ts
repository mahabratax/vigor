import { activity, isActiveRun } from '../src/domain/format';
import { z } from 'zod';
import { encodeGreenhouses, decodeGreenhouses, type Rows } from '../db/codec';
import { readDatabase, commit, Conflict, type Database } from './repository';
import { encodeWorkspace, decodeWorkspace } from './workspace-codec';
import { createDomainStore } from '../src/store/store';
import {
  workspaceDefaults,
  reconcileGreenhouseAccess,
  type WorkspacePreferences,
} from '../src/store/workspace';
import { actionPermission, can, ROLES, type Role } from '../src/features/access/permissions';
import type { Action, ActionResult } from '../src/domain/actions';
import type { DomainState } from '../src/domain/types';
import { loadGuides } from '../src/features/guide/model';
import { addStarterRecords, STARTER_RECORDS_VERSION } from '../src/data/starterRecords';
export interface Principal {
  id: string;
  email: string;
  name: string;
}
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
const memberSchema = z
  .object({
    id: z.string().min(1).max(100),
    name: z.string().trim().min(1).max(120),
    email: z.string().email().max(200),
    phone: z.string().max(40),
    position: z.string().max(160),
    role: z.enum(ROLES),
    active: z.boolean(),
    greenhouseIds: z.array(z.string().max(30)).max(200),
  })
  .strict();
const payloadSchema = z
  .object({
    requestId: z.string().uuid(),
    revision: z.number().int().nonnegative(),
    operation: z.enum([
      'initialize',
      'action',
      'greenhouse_create',
      'greenhouse_edit',
      'greenhouse_delete',
      'preferences',
      'select',
    ]),
    greenhouseId: z.string().max(30).optional(),
    previewRole: z.enum(ROLES).nullable().optional(),
    payload: z.unknown().optional(),
  })
  .strict();
// Removed simulator controls cannot advance time, fabricate device acknowledgements,
// reset shared records, or start a physical action through the API.
export const unavailableActions = new Set([
  'tick',
  'next',
  'play',
  'speed',
  'scenario',
  'profile',
  'reset',
  'detection_sample',
  'crop_sample',
  'heal',
  'run_once',
  'approve_run',
  'stop',
  'stop_all',
]);
const actionTypes = new Set([
  'clear_notice',
  'assign',
  'inspection',
  'plan',
  'approve_plan',
  'start_plan',
  'plan_task',
  'evaluate_plan',
  'routine_toggle',
  'routine_activate',
  'routine_save',
  'skip_once',
  'reconcile',
  'profile_review',
  'override',
  'maintenance_mode',
  'deactivate_device',
  'validate_zone',
  'maintenance',
  'maintenance_complete',
  'add_device',
  'expense',
  'void_expense',
  'undo_void',
  'baseline',
  'budget',
  'planner',
  'recurring_drafts',
  'evaluate_detection',
  'energy_save',
  'target_save',
  'target_activate',
  'outcome_capture',
  'outcome_review',
  'supply_item',
  'supply_archive',
  'supply_move',
  'supply_reverse',
  'supply_link_expense',
  'resource_extra',
  'resource_void',
  'resource_review',
  'zone_save',
  'zone_status',
  'zone_delete',
  'zone_devices',
  'planting_save',
  'planting_count',
  'planting_close',
  'assistant_task',
  'crop_task',
  'crop_task_done',
  'crop_harvest',
  'crop_loss',
  'crop_setup',
  'crop_release',
  'crop_lot_void',
  'crop_close',
  'crop_reopen',
  'crop_sale',
  'crop_receipt',
  'crop_sale_void',
  'crop_costs',
]);
function actorFor(rows: Rows, principal: Principal) {
  const m = rows.members?.find((m) => m.principal === principal.id);
  if (!m || !m.active)
    throw new HttpError(
      403,
      'This account has no Vigor access. Ask the Owner to add your account and Site access.',
    );
  return m;
}
export function responseState(rows: Rows, revision: number, principal: Principal) {
  const member = actorFor(rows, principal),
    preferences = decodeWorkspace(rows, String(member.id));
  const bank = decodeGreenhouses(rows),
    allowed = new Set(preferences.members.find((m) => m.id === member.id)!.greenhouseIds);
  const greenhouses = Object.fromEntries(Object.entries(bank).filter(([id]) => allowed.has(id)));
  if (!['Owner', 'Manager'].includes(String(member.role)))
    preferences.members = preferences.members.filter((m) => m.id === member.id);
  const activeId = String(
    rows.member_preferences?.find((p) => p.member_id === member.id)?.active_gh ??
      Object.keys(greenhouses)[0],
  );
  return {
    revision,
    greenhouses,
    activeId: greenhouses[activeId] ? activeId : Object.keys(greenhouses)[0],
    nextGreenhouseNumber: Number(rows.workspace_meta[0]?.next_greenhouse_number ?? 3),
    preferences,
  };
}
export async function getWorkspace(db: Database, principal: Principal) {
  const { rows, revision } = await readDatabase(db);
  if (!rows.workspace_meta.length) return { initialize: true, revision };
  const existing = rows.members.find((m) => m.principal === principal.id);
  // A directory member must also pass Sites authentication. Matching an email never grants Site access.
  if (
    !existing &&
    rows.members.some(
      (m) =>
        !m.principal && m.active && String(m.email).toLowerCase() === principal.email.toLowerCase(),
    )
  )
    return { claim: true, revision };
  return responseState(rows, revision, principal);
}
async function hash(value: string) {
  return Array.from(
    new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))),
  )
    .map((v) => v.toString(16).padStart(2, '0'))
    .join('');
}
function encodeChecked(bank: Record<string, DomainState>) {
  try {
    return encodeGreenhouses(bank);
  } catch (e) {
    throw new HttpError(422, e instanceof Error ? e.message : 'Invalid data relationship.');
  }
}
function invalid(message: string): never {
  throw new HttpError(422, message);
}
export async function mutateWorkspace(db: Database, principal: Principal, raw: unknown) {
  const parsed = payloadSchema.safeParse(raw);
  if (!parsed.success) invalid('Invalid request format. Reload the page.');
  const input = parsed.data,
    bodyHash = await hash(JSON.stringify(input));
  const previous = await db
    .prepare('SELECT body_hash,actor,result_id FROM workspace_commits WHERE request_id=?')
    .bind(input.requestId)
    .first<{ body_hash: string; actor: string; result_id: string | null }>();
  if (previous) {
    if (previous.body_hash !== bodyHash || previous.actor !== principal.id)
      throw new HttpError(409, 'This request key was used for a different change.');
    const current = await readDatabase(db);
    return {
      result: {
        ok: true,
        id: previous.result_id ?? undefined,
        message: 'Changes already saved.',
      },
      ...responseState(current.rows, current.revision, principal),
    };
  }
  const { rows, revision } = await readDatabase(db);
  if (input.revision !== revision) throw new Conflict();
  const payload = input.payload as any;
  if (input.operation === 'initialize') {
    if (rows.workspace_meta.length) {
      const member = rows.members.find(
        (m) =>
          !m.principal &&
          m.active &&
          String(m.email).toLowerCase() === principal.email.toLowerCase(),
      );
      if (!member)
        throw new HttpError(
          409,
          'The workspace already contains records. Browser data is not overwritten or merged automatically.',
        );
      const next = {
        ...rows,
        members: rows.members.map((m) =>
          m.id === member.id ? { ...m, principal: principal.id } : m,
        ),
      };
      await commit(
        db,
        revision,
        input.requestId,
        bodyHash,
        principal.id,
        'claim_account',
        rows,
        next,
      );
      return {
        result: { ok: true, message: 'Account connected.' },
        ...responseState(next, revision + 1, principal),
      };
    }
    const initial = createDomainStore().getState();
    let bank = initial.greenhouses,
      nextNumber = initial.nextGreenhouseNumber,
      p = workspaceDefaults();
    if (payload?.legacy) {
      const legacy = payload.legacy;
      if (
        !legacy.greenhouses ||
        typeof legacy.greenhouses !== 'object' ||
        Array.isArray(legacy.greenhouses)
      )
        invalid('Invalid browser data. The browser copy is retained.');
      bank = legacy.greenhouses;
      if (!Object.keys(bank).length || Object.keys(bank).length > 200)
        invalid('Invalid number of imported greenhouses.');
      if (Object.values(bank).some((s: any) => s.schemaVersion !== 3))
        invalid('Browser data version not supported. Previous records are unchanged.');
      nextNumber = Math.max(
        Number.isSafeInteger(legacy.nextGreenhouseNumber) ? legacy.nextGreenhouseNumber : 3,
        3,
        ...Object.keys(bank).map((id) => {
          if (!/^GH-\d{2,}$/.test(id)) invalid('Invalid imported greenhouse ID.');
          return Number(id.slice(3)) + 1;
        }),
      );
      if (payload.preferences) {
        const old = payload.preferences;
        const members = z.array(memberSchema).min(1).max(200).safeParse(old.members);
        if (!members.success) invalid('Invalid browser member list.');
        p = {
          ...p,
          members: members.data,
          theme: ['light', 'dark', 'system'].includes(old.theme) ? old.theme : 'light',
          collapsed: old.collapsed === true,
          guides: loadGuides(old.guides),
          readNotifications: old.readNotifications ?? {},
          notificationKinds: old.notificationKinds ?? p.notificationKinds,
        };
      }
    }
    // The first request is restricted by the existing owner-private Sites audience.
    const owner = p.members.find((m) => m.role === 'Owner' && m.active);
    if (!owner) invalid('The workspace needs an active Owner.');
    owner.name = principal.name;
    owner.email = principal.email;
    owner.greenhouseIds = Object.keys(bank);
    p.memberId = owner.id;
    p = reconcileGreenhouseAccess(p, Object.keys(bank));
    bank = structuredClone(bank);
    for (const s of Object.values(bank)) {
      let recovered = false;
      for (const run of s.runs.filter((r) => isActiveRun(r.status))) {
        run.status = 'Needs reconciliation';
        run.reason =
          'An earlier execution was unconfirmed during migration. Review its state before releasing resources.';
        for (const lock of s.locks.filter((l) => l.runId === run.id)) lock.state = 'unknown';
        for (const usage of s.usages.filter((u) => u.runId === run.id))
          usage.deliveryConfirmed = false;
        recovered = true;
      }
      s.playing = false;
      if (recovered)
        activity(
          s,
          'system',
          'Review execution before migration',
          'No executions resume automatically. Review their state and related resources.',
          s.greenhouse.id,
          undefined,
          principal.name,
        );
    }
    // Validate imported records before additive enrichment; never repair invalid
    // user data by silently replacing it with a starter module.
    encodeChecked(bank);
    addStarterRecords(bank);
    const encoded = encodeChecked(bank);
    let workspaceRows = encodeWorkspace(p, Object.keys(bank)[0], nextNumber);
    for (const member of p.members.filter((m) => m.id !== p.memberId)) {
      workspaceRows = encodeWorkspace(
        { ...p, memberId: member.id },
        member.greenhouseIds[0] ?? Object.keys(bank)[0],
        nextNumber,
        workspaceRows,
      );
    }
    const after = { ...encoded, ...workspaceRows };
    after.members = after.members.map((m) =>
      m.id === owner.id ? { ...m, principal: principal.id } : m,
    );
    await commit(
      db,
      revision,
      input.requestId,
      bodyHash,
      principal.id,
      `${payload?.legacy ? 'import_browser' : 'initial_seed'}:${STARTER_RECORDS_VERSION}`,
      rows,
      after,
    );
    return {
      result: {
        ok: true,
        message: payload?.legacy ? 'Browser data migrated to SQLite.' : 'Workspace ready.',
      },
      ...responseState(after, revision + 1, principal),
    };
  }
  const member = actorFor(rows, principal);
  const p = decodeWorkspace(rows, String(member.id));
  const role = (
    member.role === 'Owner' && input.previewRole ? input.previewRole : member.role
  ) as Role;
  const bank = decodeGreenhouses(rows);
  let activeId = String(
    rows.member_preferences.find((p) => p.member_id === member.id)?.active_gh ??
      Object.keys(bank)[0],
  );
  const greenhouseId = input.greenhouseId ?? activeId;
  const access = p.members.find((m) => m.id === member.id)!.greenhouseIds;
  if (!bank[greenhouseId] || !access.includes(greenhouseId))
    throw new HttpError(403, "Greenhouse is outside this account's access scope.");
  const domain = createDomainStore();
  domain.setState({
    greenhouses: bank,
    activeId: greenhouseId,
    data: bank[greenhouseId],
    nextGreenhouseNumber: Number(rows.workspace_meta[0].next_greenhouse_number),
  });
  const actor = { name: String(member.name), role, greenhouseIds: access };
  let result: ActionResult = { ok: true, message: 'Changes saved.' };
  let preferences = p;
  if (input.operation === 'action') {
    if (!payload || typeof payload.type !== 'string') invalid('Invalid action.');
    if (unavailableActions.has(payload.type))
      invalid(
        'Devices and scheduler are not connected. Execution controls are unavailable; records and configuration can still be managed.',
      );
    if (!actionTypes.has(payload.type)) invalid('Action not supported yet.');
    if (
      payload.type === 'maintenance' &&
      payload.id &&
      bank[greenhouseId].maintenance.find((m) => m.id === payload.id)?.deviceId !== payload.deviceId
    )
      invalid(
        "A maintenance ticket's device cannot be changed. Create a new ticket for another device.",
      );
    const action = { ...payload, actor: member.name } as Action;
    const permission = actionPermission(action);
    if (permission && !can(role, permission))
      throw new HttpError(403, 'Your account role does not allow this action.');
    if (
      action.type === 'start_plan' &&
      domain.getState().data.plans.find((p) => p.id === action.id)?.kind === 'simulator'
    )
      invalid(
        'Device plans require a gateway connection. Choose manual work to record care tasks.',
      );
    // Capture wall time for new records; historical readings keep their original timestamps.
    domain.setState({
      data: { ...domain.getState().data, clock: Math.floor(Date.now() / 1000), playing: false },
    });
    result = domain.getState().dispatch(action);
  } else if (input.operation === 'greenhouse_create')
    result = domain.getState().createGreenhouse(payload, actor);
  else if (input.operation === 'greenhouse_edit')
    result = domain.getState().editGreenhouse(greenhouseId, payload, actor);
  else if (input.operation === 'greenhouse_delete')
    result = domain.getState().deleteGreenhouse(greenhouseId, payload?.confirmation ?? '', actor);
  else if (input.operation === 'select') activeId = greenhouseId;
  else if (input.operation === 'preferences') {
    const patch = z
      .object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        collapsed: z.boolean().optional(),
        members: z.array(memberSchema).min(1).max(200).optional(),
        notificationKinds: z
          .object({
            inspection: z.boolean(),
            device: z.boolean(),
            automation: z.boolean(),
            expense: z.boolean(),
          })
          .optional(),
        readNotifications: z.record(z.array(z.string().max(300)).max(500)).optional(),
        guides: z.unknown().optional(),
      })
      .strict()
      .safeParse(payload);
    if (!patch.success) invalid('Invalid settings.');
    if (patch.data.members) {
      let members = patch.data.members;
      if (
        new Set(members.map((m) => m.id)).size !== members.length ||
        new Set(members.map((m) => m.email.toLowerCase())).size !== members.length
      )
        invalid('Duplicate member ID or email.');
      if (!can(role, 'team')) {
        for (const m of members) {
          const old = p.members.find((o) => o.id === m.id);
          if (
            !old ||
            (m.id !== member.id && JSON.stringify(m) !== JSON.stringify(old)) ||
            (m.id === member.id &&
              (m.role !== old.role ||
                m.active !== old.active ||
                m.email !== old.email ||
                JSON.stringify(m.greenhouseIds) !== JSON.stringify(old.greenhouseIds)))
          )
            throw new HttpError(403, 'Only the Owner can change member access.');
        }
        members = p.members.map((old) => members.find((m) => m.id === old.id) ?? old);
        patch.data.members = members;
      }
      const self = members.find((m) => m.id === member.id);
      if (!self || !self.active || self.role !== member.role || self.email !== member.email)
        invalid("This form cannot change the current account's access or email.");
      if (!members.some((m) => m.active && m.role === 'Owner'))
        invalid('At least one active Owner is required.');
      if (members.some((m) => m.greenhouseIds.some((id) => !bank[id])))
        invalid('Member scope contains unavailable greenhouses.');
    }
    preferences = {
      ...p,
      ...patch.data,
      guides: patch.data.guides === undefined ? p.guides : loadGuides(patch.data.guides),
    };
  }
  if (!result.ok) throw new HttpError(422, result.message);
  const state = domain.getState();
  preferences = reconcileGreenhouseAccess(preferences, Object.keys(state.greenhouses));
  if (!state.greenhouses[activeId]) activeId = Object.keys(state.greenhouses)[0];
  const after = {
    ...encodeChecked(state.greenhouses),
    ...encodeWorkspace(preferences, activeId, state.nextGreenhouseNumber, rows),
  };
  await commit(
    db,
    revision,
    input.requestId,
    bodyHash,
    principal.id,
    input.operation === 'action' ? payload.type : input.operation,
    rows,
    after,
    result.id,
  );
  return { result, ...responseState(after, revision + 1, principal) };
}
