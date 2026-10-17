import type { DomainState } from '../../domain/types';
import type { NotificationKind } from '../../store/workspace';
import { localDate, runLabels } from '../../domain/format';
import { costSummary } from '../../domain/costs';
export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  at: string;
  url: string;
  tone: 'amber' | 'green' | 'blue';
}
export function notificationsFor(s: DomainState): NotificationItem[] {
  const items: NotificationItem[] = [];
  for (const c of s.cases.filter((c) => c.status !== 'closed'))
    items.push({
      id: `case:${c.id}:${c.status}:${c.verified}${c.detectionSignal ? ':' + c.detectionSignal.key : ''}`,
      kind: 'inspection',
      title:
        c.status === 'inspection'
          ? `Inspect Zone ${c.zoneId}`
          : `Review observations in Zone ${c.zoneId}`,
      detail:
        c.status === 'inspection'
          ? c.assignedTo
            ? `Assigned to ${c.assignedTo}.`
            : 'Assign an operator and inspect plants.'
          : 'View evidence and follow-up observation schedules.',
      at: c.detectionSignal?.triggeredAt ?? c.createdAt,
      url: `/hama?case=${c.id}`,
      tone: c.status === 'inspection' ? 'amber' : 'blue',
    });
  for (const d of s.devices.filter((d) => d.active && (d.connection !== 'online' || !d.calibrated)))
    items.push({
      id: `device:${d.id}:${d.connection}:${d.calibrated}`,
      kind: 'device',
      title:
        d.connection === 'offline'
          ? `${d.label} offline`
          : d.connection === 'stale'
            ? `${d.label}: delayed data`
            : `Calibration ${d.label}`,
      detail:
        d.connection === 'online'
          ? 'Check installation before using these readings.'
          : 'Check device connection and maintenance records.',
      at: d.lastSeen,
      url: `/perangkat?device=${d.id}&detailTab=condition`,
      tone: 'amber',
    });
  for (const r of s.runs.slice(-12))
    if (['Blocked', 'Failed', 'Needs reconciliation', 'Completed'].includes(r.status))
      items.push({
        id: `run:${r.id}:${r.status}`,
        kind: 'automation',
        title: `${r.routineName}: ${runLabels[r.status]}`,
        detail: r.reason || 'Open step details and device usage.',
        at: new Date((r.finishedAt ?? r.createdAt) * 1000).toISOString(),
        url: `/otomasi?tab=executions&run=${r.id}`,
        tone: r.status === 'Completed' ? 'green' : 'amber',
      });
  for (const e of s.expenses.filter((e) => e.status === 'draft'))
    items.push({
      id: `expense:${e.id}:draft`,
      kind: 'expense',
      title: 'Expense draft needs review',
      detail: e.note,
      at: e.createdAt,
      url: `/biaya?tab=expenses&status=draft&expense=${e.id}&period=${e.paidAt.slice(0, 7) || localDate(s.clock).slice(0, 7)}`,
      tone: 'blue',
    });
  const period = localDate(s.clock).slice(0, 7),
    cost = costSummary(s, { period });
  if (cost.remaining !== null && cost.remaining < 0)
    items.push({
      id: `budget:${period}:${cost.operating}`,
      kind: 'expense',
      title: 'Expenses exceed budget',
      detail: "Review the selected greenhouse's expenses and budget.",
      at: new Date(s.clock * 1000).toISOString(),
      url: `/biaya?period=${period}`,
      tone: 'amber',
    });
  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
}
