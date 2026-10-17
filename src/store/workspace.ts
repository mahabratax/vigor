import type { ActionResult } from '../domain/actions';
import { createStore } from 'zustand/vanilla';
import { GREENHOUSE_IDS, type GreenhouseId } from '../data/greenhouses';
import { ROLES, type Role } from '../features/access/permissions';
import { store } from './store';
import { validGreenhouseId } from '../domain/greenhouses';
import { loadGuides, type GuidePreferences } from '../features/guide/model';
export type Theme = 'light' | 'dark' | 'system';
export type NotificationKind = 'inspection' | 'device' | 'automation' | 'expense';
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  role: Role;
  greenhouseIds: GreenhouseId[];
  active: boolean;
}
export interface WorkspacePreferences {
  version: 1;
  theme: Theme;
  collapsed: boolean;
  loggedIn: boolean;
  memberId: string;
  previewRole: Role | null;
  members: Member[];
  readNotifications: Record<string, string[]>;
  notificationKinds: Record<NotificationKind, boolean>;
  storageWarning: string | null;
  guides?: GuidePreferences;
}
export const WORKSPACE_STORAGE_KEY = 'vigor-workspace-v1';
export function workspaceDefaults(): WorkspacePreferences {
  return {
    version: 1,
    theme: 'light',
    collapsed: false,
    loggedIn: true,
    memberId: 'member-owner',
    previewRole: null,
    members: [
      {
        id: 'member-owner',
        name: 'Budi Santoso',
        email: 'budi@vigor.example',
        phone: '',
        position: 'Farm owner',
        role: 'Owner',
        greenhouseIds: [...GREENHOUSE_IDS],
        active: true,
      },
      {
        id: 'member-manager',
        name: 'Mira Lestari',
        email: 'mira@vigor.example',
        phone: '',
        position: 'Farm manager',
        role: 'Manager',
        greenhouseIds: [...GREENHOUSE_IDS],
        active: true,
      },
      {
        id: 'member-operator',
        name: 'Dimas Pratama',
        email: 'dimas@vigor.example',
        phone: '',
        position: 'Farm operator',
        role: 'Operator',
        greenhouseIds: ['GH-01'],
        active: true,
      },
      {
        id: 'member-viewer',
        name: 'Nisa Rahma',
        email: 'nisa@vigor.example',
        phone: '',
        position: 'Pengamat',
        role: 'Viewer',
        greenhouseIds: ['GH-02'],
        active: true,
      },
    ],
    readNotifications: {},
    notificationKinds: { inspection: true, device: true, automation: true, expense: true },
    storageWarning: null,
    guides: { progress: {}, dismissed: [] },
  };
}
export function reconcileGreenhouseAccess(
  p: WorkspacePreferences,
  ids: readonly string[],
): WorkspacePreferences {
  const members = p.members.map((m) => {
    const greenhouseIds =
      m.role === 'Owner' ? [...ids] : m.greenhouseIds.filter((id) => ids.includes(id));
    return { ...m, greenhouseIds, active: m.active && greenhouseIds.length > 0 };
  });
  const selected = members.find((m) => m.id === p.memberId && m.active);
  return {
    ...p,
    members,
    loggedIn: p.loggedIn && !!selected,
    memberId: selected?.id ?? members.find((m) => m.role === 'Owner' && m.active)!.id,
    readNotifications: Object.fromEntries(
      Object.entries(p.readNotifications).filter(([key]) =>
        ids.some((id) => key.endsWith(`:${id}`)),
      ),
    ),
  };
}
export function loadPreferences(
  raw: string | null,
  ids: readonly string[] = GREENHOUSE_IDS,
): WorkspacePreferences {
  const base = reconcileGreenhouseAccess(workspaceDefaults(), ids);
  if (!raw) return base;
  try {
    const p = JSON.parse(raw);
    if (p.version !== 1 || !Array.isArray(p.members) || !p.members.length) throw new Error();
    if (
      !p.members.every(
        (m: Member) =>
          typeof m.id === 'string' &&
          typeof m.name === 'string' &&
          typeof m.email === 'string' &&
          ROLES.includes(m.role) &&
          typeof m.active === 'boolean' &&
          Array.isArray(m.greenhouseIds) &&
          m.greenhouseIds.every(validGreenhouseId),
      )
    )
      throw new Error();
    if (!p.members.some((m: Member) => m.role === 'Owner' && m.active)) throw new Error();
    const selected = p.members.find((m: Member) => m.id === p.memberId && m.active);
    return reconcileGreenhouseAccess(
      {
        ...base,
        members: p.members.map((m: Member) => ({
          ...m,
          phone: typeof m.phone === 'string' ? m.phone : '',
          position: typeof m.position === 'string' ? m.position : '',
        })),
        theme: ['light', 'dark', 'system'].includes(p.theme) ? p.theme : base.theme,
        collapsed: p.collapsed === true,
        guides: loadGuides(p.guides),
        loggedIn: p.loggedIn !== false && !!selected,
        memberId: selected?.id ?? p.members.find((m: Member) => m.role === 'Owner').id,
        readNotifications:
          p.readNotifications && typeof p.readNotifications === 'object'
            ? Object.fromEntries(
                Object.entries(p.readNotifications)
                  .filter(([, v]) => Array.isArray(v))
                  .map(([k, v]) => [
                    k,
                    (v as unknown[]).filter((x) => typeof x === 'string').slice(-500),
                  ]),
              )
            : {},
        notificationKinds: Object.fromEntries(
          Object.keys(base.notificationKinds).map((k) => [
            k,
            typeof p.notificationKinds?.[k] === 'boolean' ? p.notificationKinds[k] : true,
          ]),
        ) as Record<NotificationKind, boolean>,
      },
      ids,
    );
  } catch {
    return {
      ...base,
      storageWarning: 'Could not read saved settings. Initial settings restored.',
    };
  }
}
interface WorkspaceStore {
  preferences: WorkspacePreferences;
  update: (patch: Partial<WorkspacePreferences>) => Promise<ActionResult>;
}
function storage() {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}
const browserStorage = storage();
let initial = reconcileGreenhouseAccess(
  workspaceDefaults(),
  Object.keys(store.getState().greenhouses),
);
try {
  initial = loadPreferences(
    browserStorage?.getItem(WORKSPACE_STORAGE_KEY) ?? null,
    Object.keys(store.getState().greenhouses),
  );
} catch {
  initial.storageWarning = 'Could not read browser settings.';
}
let workspaceWriter: ((patch: Partial<WorkspacePreferences>) => Promise<ActionResult>) | undefined;
export const setWorkspaceWriter = (writer: typeof workspaceWriter) => {
  workspaceWriter = writer;
};
export const workspaceStore = createStore<WorkspaceStore>()((set, get) => ({
  preferences: initial,
  async update(patch) {
    if (workspaceWriter) return workspaceWriter(patch);
    const next = { ...get().preferences, ...patch };
    set({ preferences: next });
    try {
      browserStorage?.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(next));
    } catch {
      set({
        preferences: {
          ...next,
          storageWarning:
            'Settings are saved for this session only because browser storage is unavailable.',
        },
      });
    }
    return { ok: true, message: '' };
  },
}));
export function syncGreenhouseAccess() {
  workspaceStore
    .getState()
    .update(
      reconcileGreenhouseAccess(
        workspaceStore.getState().preferences,
        Object.keys(store.getState().greenhouses),
      ),
    );
}
export const currentMember = (p: WorkspacePreferences) =>
  p.members.find((m) => m.id === p.memberId) ?? p.members[0];
export const effectiveRole = (p: WorkspacePreferences) =>
  currentMember(p).role === 'Owner' && p.previewRole ? p.previewRole : currentMember(p).role;
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
