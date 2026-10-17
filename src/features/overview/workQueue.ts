import type { DomainState } from '../../domain/types';
import type { IconName } from '../../components/ui';
import { localDate, money } from '../../domain/format';
import { zoneName } from '../../domain/zones';
import { production } from '../../domain/production';
import { supplyBalance, supplyState } from '../../domain/supplies';
import { availableDevices } from '../../domain/telemetry';

export interface WorkItem {
  id: string;
  title: string;
  detail: string;
  meta: string;
  url: string;
  icon: IconName;
  priority: number;
  label: string;
}
export function workQueue(s: DomainState): WorkItem[] {
  const items: WorkItem[] = [],
    today = localDate(s.clock),
    p = production(s);
  const openTickets = s.maintenance.filter((m) => m.status !== 'completed');
  for (const run of s.runs.filter((r) => r.status === 'Needs reconciliation'))
    items.push({
      id: `run:${run.id}`,
      title: `Review state ${run.routineName}`,
      detail: 'Final state is uncertain. Review it before reusing the device.',
      meta: run.id,
      url: `/otomasi?tab=executions&run=${encodeURIComponent(run.id)}`,
      icon: 'alert',
      priority: 0,
      label: 'State uncertain',
    });
  for (const c of s.cases.filter((c) => c.status !== 'closed'))
    items.push({
      id: `case:${c.id}`,
      title: `${c.verified ? 'Review follow-up' : 'Inspect plants'} in ${zoneName(s, c.zoneId)}`,
      detail: c.verified
        ? 'Inspection recorded. Open the case to review its plan and control outcomes.'
        : 'Open the finding and record a plant inspection.',
      meta: c.assignedTo ?? 'Unassigned',
      url: `/hama?case=${encodeURIComponent(c.id)}`,
      icon: 'bug',
      priority: c.verified ? 3 : 1,
      label: c.verified ? 'Follow up' : 'Inspection needed',
    });
  for (const ticket of openTickets) {
    const date = localDate(Date.parse(ticket.dueAt) / 1000);
    items.push({
      id: `maintenance:${ticket.id}`,
      title: ticket.title,
      detail: `${ticket.deviceId}. Open the ticket to record work and results.`,
      meta: ticket.operator ?? 'Unassigned',
      url: `/perangkat?tab=maintenance&search=${encodeURIComponent(ticket.id)}`,
      icon: 'wrench',
      priority: date <= today ? 2 : 6,
      label: date < today ? 'Overdue' : date === today ? 'Today' : 'Scheduled',
    });
  }
  for (const device of availableDevices(s).filter(
    (d) =>
      (d.connection !== 'online' || !d.calibrated || d.maintenance) &&
      !openTickets.some((m) => m.deviceId === d.id),
  ))
    items.push({
      id: `device:${device.id}`,
      title: `Check ${device.label}`,
      detail:
        device.connection !== 'online'
          ? 'Reading unavailable. Check device connection and condition.'
          : 'Check installation or maintenance state before using these readings.',
      meta: device.id,
      url: `/perangkat?device=${encodeURIComponent(device.id)}&detailTab=condition`,
      icon: 'devices',
      priority: 2,
      label: 'Devices',
    });
  for (const task of p.tasks.filter((t) => t.status === 'pending'))
    items.push({
      id: `care:${task.id}`,
      title: task.title,
      detail: `${zoneName(s, task.zoneId)}. Record results after completing the work.`,
      meta: task.operator || 'Unassigned',
      url: `/siklus?tab=care&zone=${encodeURIComponent(task.zoneId)}&task=${encodeURIComponent(task.id)}`,
      icon: 'leaf',
      priority: task.dueOn <= today ? 3 : 7,
      label: task.dueOn < today ? 'Overdue' : task.dueOn === today ? 'Today' : 'Scheduled',
    });
  for (const item of supplyState(s).items.filter(
    (i) =>
      i.active &&
      supplyBalance(s, i.id) <= i.reorderAt &&
      !openTickets.some((m) => m.supplyItemId === i.id),
  ))
    items.push({
      id: `supply:${item.id}`,
      title: `Check stock ${item.name}`,
      detail: `Tersisa ${supplyBalance(s, item.id)} ${item.unit}. Review refill or restocking needs.`,
      meta: item.deviceId,
      url: `/perangkat?tab=supplies&supply=${encodeURIComponent(item.id)}`,
      icon: 'box',
      priority: 4,
      label: 'Low stock',
    });
  for (const lot of p.lots.filter((l) => l.status === 'held'))
    items.push({
      id: `lot:${lot.id}`,
      title: `Review harvest output ${zoneName(s, lot.zoneId)}`,
      detail: 'Lot not released. Review grades and zone cases before sale.',
      meta: lot.id,
      url: `/siklus?tab=harvest&lot=${encodeURIComponent(lot.id)}`,
      icon: 'box',
      priority: 4,
      label: 'Review harvest',
    });
  for (const sale of p.sales.filter((x) => x.status === 'recorded' && x.dueOn <= today)) {
    const remaining =
      Math.round(sale.kg * sale.price) -
      p.receipts.filter((r) => r.saleId === sale.id).reduce((n, r) => n + r.amount, 0);
    if (remaining > 0)
      items.push({
        id: `sale:${sale.id}`,
        title: `Review receipt ${sale.buyer}`,
        detail: `Outstanding balance ${money(remaining)}. Record only payments already received.`,
        meta: sale.id,
        url: `/siklus?tab=sales&sale=${encodeURIComponent(sale.id)}`,
        icon: 'wallet',
        priority: 5,
        label: 'Due date',
      });
  }
  const seen = new Set<string>();
  for (const run of [...s.runs].sort((a, b) => b.createdAt - a.createdAt)) {
    if (seen.has(run.routineId)) continue;
    seen.add(run.routineId);
    if (
      run.evidence?.before &&
      run.evidence.after &&
      !run.evidence.reviews.length &&
      ['Completed', 'Stopped', 'Failed'].includes(run.status)
    )
      items.push({
        id: `outcome:${run.id}`,
        title: `Outcome review ${run.routineName}`,
        detail: 'Before-and-after readings are available. Record an operator assessment.',
        meta: run.id,
        url: `/otomasi?tab=executions&run=${encodeURIComponent(run.id)}`,
        icon: 'eye',
        priority: 5,
        label: 'Outcome review',
      });
  }
  return items.sort((a, b) => a.priority - b.priority || a.id.localeCompare(b.id));
}
