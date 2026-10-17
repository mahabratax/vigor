import type { Rows, Row } from '../db/codec';
import type { WorkspacePreferences, Member } from '../src/store/workspace';
import { workspaceDefaults } from '../src/store/workspace';
export const workspaceColumns: Record<string, string[]> = {
  members: ['id', 'principal', 'name', 'email', 'phone', 'position', 'role', 'active'],
  member_greenhouses: ['member_id', 'gh'],
  member_preferences: [
    'member_id',
    'theme',
    'collapsed',
    'active_gh',
    'inspection',
    'device',
    'automation',
    'expense',
  ],
  notification_reads: ['member_id', 'gh', 'notification_id'],
  guide_progress: ['member_id', 'gh', 'tour', 'step', 'finished'],
  guide_seen: ['member_id', 'gh', 'tour', 'step', 'ordinal'],
  guide_dismissed: ['member_id', 'gh'],
  workspace_meta: ['id', 'next_greenhouse_number', 'seed_version'],
};
export const workspaceKeys: Record<string, string[]> = {
  members: ['id'],
  member_greenhouses: ['member_id', 'gh'],
  member_preferences: ['member_id'],
  notification_reads: ['member_id', 'gh', 'notification_id'],
  guide_progress: ['member_id', 'gh', 'tour'],
  guide_seen: ['member_id', 'gh', 'tour', 'step'],
  guide_dismissed: ['member_id', 'gh'],
  workspace_meta: ['id'],
};
export function encodeWorkspace(
  p: WorkspacePreferences,
  activeId: string,
  next: number,
  original: Rows = {},
): Rows {
  const rows: Rows = Object.fromEntries(
    Object.keys(workspaceColumns).map((table) => [table, original[table] ?? []]),
  );
  rows.members = p.members.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    phone: m.phone,
    position: m.position,
    role: m.role,
    active: +m.active,
    principal: original.members?.find((x) => x.id === m.id)?.principal ?? null,
  }));
  rows.member_greenhouses = p.members.flatMap((m) =>
    m.greenhouseIds.map((gh) => ({ member_id: m.id, gh })),
  );
  const id = p.memberId;
  rows.member_preferences = [
    ...(original.member_preferences ?? []).filter((x) => x.member_id !== id),
    {
      member_id: id,
      theme: p.theme,
      collapsed: +p.collapsed,
      active_gh: activeId,
      ...Object.fromEntries(Object.entries(p.notificationKinds).map(([k, v]) => [k, +v])),
    },
  ];
  const read: Row[] = [],
    progress: Row[] = [],
    seen: Row[] = [],
    dismissed: Row[] = [];
  const scopes = new Set(
    p.members.find((m) => m.id === id)?.greenhouseIds.map((gh) => `${id}:${gh}`),
  );
  for (const [scope, ids] of Object.entries(p.readNotifications))
    if (scopes.has(scope))
      for (const n of new Set(ids))
        read.push({ member_id: id, gh: scope.slice(id.length + 1), notification_id: n });
  for (const [scope, tours] of Object.entries(p.guides?.progress ?? {}))
    if (scopes.has(scope))
      for (const [tour, t] of Object.entries(tours))
        if (t) {
          const gh = scope.slice(id.length + 1);
          progress.push({ member_id: id, gh, tour, step: t.step, finished: +t.finished });
          [...new Set(t.seen)].forEach((step, ordinal) =>
            seen.push({ member_id: id, gh, tour, step, ordinal }),
          );
        }
  for (const scope of new Set(p.guides?.dismissed ?? []))
    if (scopes.has(scope)) dismissed.push({ member_id: id, gh: scope.slice(id.length + 1) });
  for (const [table, list] of Object.entries({
    notification_reads: read,
    guide_progress: progress,
    guide_seen: seen,
    guide_dismissed: dismissed,
  }))
    rows[table] = [...(original[table] ?? []).filter((x) => x.member_id !== id), ...list];
  rows.workspace_meta = [{ id: 1, next_greenhouse_number: next, seed_version: 1 }];
  // Clear deleted greenhouse/member references for all users, including abandoned tours.
  const validGh = new Set(p.members.flatMap((m) => m.greenhouseIds)),
    validMembers = new Set(p.members.map((m) => m.id));
  for (const table of [
    'member_greenhouses',
    'notification_reads',
    'guide_progress',
    'guide_seen',
    'guide_dismissed',
  ])
    rows[table] = (rows[table] ?? []).filter(
      (r) => validGh.has(String(r.gh)) && validMembers.has(String(r.member_id)),
    );
  rows.member_preferences = rows.member_preferences
    .filter((r) => validMembers.has(String(r.member_id)))
    .map((r) => ({ ...r, active_gh: validGh.has(String(r.active_gh)) ? r.active_gh : null }));
  return rows;
}
export function decodeWorkspace(rows: Rows, memberId: string): WorkspacePreferences {
  const p = workspaceDefaults();
  p.memberId = memberId;
  p.previewRole = null;
  p.members = (rows.members ?? []).map(
    (r) =>
      ({
        id: r.id,
        name: r.name,
        email: r.email,
        phone: r.phone,
        position: r.position,
        role: r.role,
        active: !!r.active,
        greenhouseIds: (rows.member_greenhouses ?? [])
          .filter((a) => a.member_id === r.id)
          .map((a) => a.gh),
      }) as Member,
  );
  const prefs = rows.member_preferences?.find((r) => r.member_id === memberId);
  if (prefs) {
    p.theme = prefs.theme as typeof p.theme;
    p.collapsed = !!prefs.collapsed;
    for (const k of Object.keys(p.notificationKinds) as (keyof typeof p.notificationKinds)[])
      p.notificationKinds[k] = !!prefs[k];
  }
  for (const r of rows.notification_reads ?? [])
    if (r.member_id === memberId)
      (p.readNotifications[`${memberId}:${r.gh}`] ??= []).push(String(r.notification_id));
  for (const r of rows.guide_progress ?? [])
    if (r.member_id === memberId) {
      const scope = `${memberId}:${r.gh}`;
      const tours = (p.guides!.progress[scope] ??= {});
      (tours as Record<string, unknown>)[String(r.tour)] = {
        step: r.step,
        finished: !!r.finished,
        seen: (rows.guide_seen ?? [])
          .filter((x) => x.member_id === memberId && x.gh === r.gh && x.tour === r.tour)
          .sort((a, b) => Number(a.ordinal) - Number(b.ordinal))
          .map((x) => x.step),
      };
    }
  p.guides!.dismissed = (rows.guide_dismissed ?? [])
    .filter((r) => r.member_id === memberId)
    .map((r) => `${memberId}:${r.gh}`);
  return p;
}
