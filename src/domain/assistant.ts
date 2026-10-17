import type { DomainState } from './types';
import type { CareTask } from './productionTypes';
import { activeBatch, zoneName } from './zones';
import { activeTarget, metricInfo } from './cropTargets';
import { TARGET_METRICS } from './growingTypes';
import { assessStoredReading, availableDevices } from './telemetry';
import { lotStock, production, productionSummary, zoneCases } from './production';
import { supplyBalance, supplyState } from './supplies';
import { previewRoutine } from './routinePreview';
import { localDate, money, num } from './format';

export type AssistantFocus = 'all' | 'health' | 'resources' | 'business';
export type AssistantAction =
  | { kind: 'navigate'; label: string; url: string }
  | { kind: 'inspection'; label: string; id: string }
  | { kind: 'release' | 'sale' | 'payment'; label: string; id: string };
export interface AssistantIssue {
  id: string;
  focus: Exclude<AssistantFocus, 'all'>[];
  rank: number;
  title: string;
  reason: string;
  impact: { value: string; label: string; detail: string };
  evidence: { label: string; value: string; url: string }[];
  steps: [string, string, string];
  verification: string;
  actions: AssistantAction[];
  followUp?: { zoneId: string; plantingId?: string; title: string };
  fingerprint: string;
  task?: CareTask;
  resolved: boolean;
}
export const assistantTaskKey = (id: string) => `assistant-v1:${id}`;
const route = (label: string, url: string): AssistantAction => ({ kind: 'navigate', label, url });
const enc = encodeURIComponent;

/** Explainable local decision support. No model, prediction, execution or state mutation. */
export function assistantIssues(s: DomainState): AssistantIssue[] {
  const p = production(s),
    items: AssistantIssue[] = [];
  const scopedId = (id: string) => `${s.greenhouse.id}:${s.cycle.id}:${id}`;
  const tracked = (id: string) => p.tasks.find((t) => t.key === assistantTaskKey(scopedId(id)));
  const followUp = (zoneId: string, title: string) =>
    s.zones.some((z) => z.id === zoneId && z.status !== 'inactive') && p.stage !== 'closed'
      ? { zoneId, plantingId: activeBatch(s, zoneId)?.id, title }
      : undefined;
  function add(
    id: string,
    facts: unknown,
    issue: Omit<AssistantIssue, 'id' | 'fingerprint' | 'task'>,
  ) {
    items.push({
      ...issue,
      id: scopedId(id),
      task: tracked(id),
      fingerprint: JSON.stringify([scopedId(id), facts, issue.followUp ?? null]),
    });
  }
  for (const c of s.cases) {
    const id = `case:${c.id}`,
      task = tracked(id);
    if (c.status === 'closed' && !task) continue;
    const name = zoneName(s, c.zoneId),
      url = `/hama?case=${enc(c.id)}`;
    const inspection = [...s.inspections]
      .filter((i) => i.caseId === c.id)
      .sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || b.id.localeCompare(a.id))[0];
    const lots = p.lots.filter(
      (l) =>
        l.zoneId === c.zoneId &&
        l.status !== 'void' &&
        (l.status === 'held' || c.status !== 'closed'),
    );
    const kg = lots.reduce((n, l) => n + lotStock(p, l, 'A') + lotStock(p, l, 'B'), 0);
    add(id, [c.status, c.verified, inspection, lots, kg, activeBatch(s, c.zoneId)?.id], {
      focus: kg > 0 ? ['health', 'business'] : ['health'],
      rank: kg > 0 ? 0 : 2,
      title:
        c.status === 'closed'
          ? `${name}: case review completed`
          : kg > 0
            ? `Resolve ${name}'s case before selling its harvest`
            : `Check the plant health finding in ${name}`,
      reason: c.verified
        ? 'An inspection is recorded. Review the control plan and check the plants again before closing this case.'
        : 'A recorded finding needs a plant inspection. A capture or alert alone does not confirm the pest or its severity.',
      impact: {
        value: kg > 0 ? `${num(kg, 1)} kg` : name,
        label: kg > 0 ? 'Stock awaiting case or lot review' : 'Plant inspection needed',
        detail:
          kg > 0
            ? 'This is recorded stock, not an estimate of lost yield. Other open cases may also prevent release.'
            : 'Confirm the finding before choosing a treatment.',
      },
      evidence: [
        { label: 'Pest case', value: `${c.id}: ${c.status}`, url },
        {
          label: 'Latest inspection',
          value: inspection
            ? `${inspection.affected} affected / ${inspection.examined} examined, ${inspection.at.slice(0, 10)}`
            : 'No plant inspection recorded',
          url,
        },
        ...(kg > 0
          ? [
              {
                label: 'Harvest records',
                value: `${lots.length} lot(s) in ${name}`,
                url: `/siklus?tab=harvest&zone=${enc(c.zoneId)}`,
              },
            ]
          : []),
      ],
      steps: [
        'Inspect the plants',
        'Assign and record follow-up',
        'Review the case, then the harvest lot',
      ],
      verification:
        c.status === 'closed'
          ? 'The case is closed. Harvest release remains a separate review.'
          : 'Record a follow-up inspection and review the control outcome. Completing a care task does not close the case or release stock.',
      actions: [
        ...(c.status !== 'closed'
          ? [{ kind: 'inspection' as const, label: 'Record inspection', id: c.id }]
          : []),
        route('Review case & control plan', url),
      ],
      followUp:
        c.status === 'closed'
          ? undefined
          : followUp(c.zoneId, `Follow up plant health in ${name} (${c.id})`),
      resolved: c.status === 'closed',
    });
  }
  for (const zone of s.zones.filter((z) => z.status !== 'inactive')) {
    const target = activeTarget(s, zone.id);
    if (!target) continue;
    for (const metric of TARGET_METRICS) {
      const range = target.limits[metric];
      const device = availableDevices(s).find(
        (d) => d.zones.includes(zone.id) && d.capabilities.includes(metric),
      );
      if (!range || !device) continue;
      const r = assessStoredReading(s, device.id, metric),
        id = `target:${target.id}:${metric}`;
      const outside = r.value !== null && (r.value < range.min || r.value > range.max);
      if (!outside && !tracked(id)) continue;
      const within = r.value !== null && !outside,
        info = metricInfo[metric];
      const url = `/greenhouse?tab=zones&zone=${enc(zone.id)}&panel=targets`;
      add(id, [target, r.quality, r.reading], {
        focus: ['health', 'resources'],
        rank: outside ? 1 : 8,
        title: `${zone.name}: ${info.label.toLowerCase()} ${within ? 'is back in range' : outside ? 'is outside target' : 'needs a fresh reading'}`,
        reason: outside
          ? 'A usable stored reading is outside the reviewed target for this crop stage. Check conditions before changing the routine.'
          : within
            ? 'The latest usable reading is within the reviewed range. Review the recorded work before attributing the change to it.'
            : 'The reading cannot verify current conditions. Record new evidence before declaring the issue resolved.',
        impact: {
          value: r.value === null ? 'Not verified' : `${num(r.value, 1)} ${info.unit}`,
          label: `Reviewed range ${range.min}–${range.max} ${info.unit}`,
          detail:
            'Targets come from your reviewed crop configuration; these are not model-generated thresholds.',
        },
        evidence: [
          {
            label: 'Sensor record',
            value: `${device.id}: ${r.quality}${r.reading ? `, ${r.reading.capturedAt}` : ''}`,
            url: `/perangkat?device=${enc(device.id)}`,
          },
          {
            label: 'Crop target',
            value: `${target.id}, version ${target.version}, ${target.stage}`,
            url,
          },
        ],
        steps: [
          'Check the recorded conditions',
          'Record the field adjustment',
          'Check a fresh reading against the target',
        ],
        verification: within
          ? 'Reading within target. This confirms current conditions, not the cause of the change.'
          : 'A fresh valid reading must return to the reviewed range. Task completion alone is not enough.',
        actions: [
          route('Review target & readings', url),
          route('Review routine checks', '/otomasi?tab=preview'),
        ],
        followUp: outside
          ? followUp(zone.id, `Check ${info.label.toLowerCase()} in ${zone.name} (${target.id})`)
          : undefined,
        resolved: within,
      });
    }
  }
  const blocked = s.routines
    .filter((r) => r.status === 'Active')
    .map((r) => ({ r, check: previewRoutine(s, r.id, s.clock) }))
    .filter(({ check }) => check.status === 'blocked');
  if (blocked.length) {
    const first = blocked[0];
    add(
      'routine-checks',
      blocked.map(({ check }) => [check.routineId, check.versionId, check.blockers]),
      {
        focus: ['resources'],
        rank: 4,
        title: 'Review routine checks before the next run',
        reason:
          'Saved routines have unresolved input or operating checks. Missing readings cannot establish that watering or dosing is safe.',
        impact: {
          value: String(blocked.length),
          label: 'Active routines with unresolved checks',
          detail:
            'Checks are read-only. No device command or background scheduler runs in this browser.',
        },
        evidence: blocked.map(({ r, check }) => ({
          label: r.name,
          value: `${check.blockers.length} unresolved check(s). ${check.blockers[0]}`,
          url: `/otomasi?tab=preview&routine=${enc(r.id)}`,
        })),
        steps: [
          'Review the blocking evidence',
          'Check devices and saved limits',
          'Preview the routine again',
        ],
        verification:
          'The preview must pass its checks with fresh inputs. A passing preview still does not execute physical devices.',
        actions: [route('Open routine preview', `/otomasi?tab=preview&routine=${enc(first.r.id)}`)],
        resolved: false,
      },
    );
  }
  for (const item of supplyState(s).items.filter((i) => i.active)) {
    const balance = supplyBalance(s, item.id);
    if (balance > item.reorderAt) continue;
    const ticket = s.maintenance.find(
      (t) => t.supplyItemId === item.id && t.status !== 'completed',
    );
    const device = s.devices.find((d) => d.id === item.deviceId);
    const url = `/perangkat?tab=supplies&supply=${enc(item.id)}`;
    add(`supply:${item.id}`, [item, balance, ticket?.id], {
      focus: ['resources'],
      rank: 3,
      title: `Replenish ${item.name}`,
      reason:
        'The stock ledger is at or below your reorder point. Check the physical balance and record the replenishment.',
      impact: {
        value: `${num(balance, 1)} ${item.unit}`,
        label: `Reorder point ${item.reorderAt} ${item.unit}`,
        detail: device
          ? `Linked to ${device.label} (${device.id}).`
          : 'Review the supply item and its device link.',
      },
      evidence: [
        {
          label: 'Stock ledger',
          value: `${item.id}: ${num(balance, 1)} ${item.unit} remaining`,
          url,
        },
        {
          label: 'Follow-up',
          value: ticket ? `${ticket.id}: ${ticket.status}` : 'No open replenishment ticket',
          url: ticket ? `/perangkat?tab=maintenance&search=${enc(ticket.id)}` : url,
        },
      ],
      steps: [
        'Check physical stock',
        'Record the stock movement',
        'Link the actual expense, if paid',
      ],
      verification:
        'The ledger must show the replenishment. Stock movements and payments are separate records; no purchase is created automatically.',
      actions: [
        route('Open stock ledger', url),
        ...(ticket
          ? [route('Open assigned ticket', `/perangkat?tab=maintenance&search=${enc(ticket.id)}`)]
          : []),
      ],
      resolved: false,
    });
  }
  for (const lot of p.lots.filter((l) => l.status !== 'void')) {
    const kg = lotStock(p, lot, 'A') + lotStock(p, lot, 'B');
    if (kg <= 0 || zoneCases(s, lot.zoneId).length) continue; // Case decision owns its blocked stock.
    const held = lot.status === 'held',
      url = `/siklus?tab=harvest&zone=${enc(lot.zoneId)}`;
    add(`lot:${lot.id}`, [lot, kg], {
      focus: ['business'],
      rank: held ? 5 : 7,
      title: held
        ? `Review the harvest from ${zoneName(s, lot.zoneId)}`
        : `Record sales for available ${lot.crop ?? s.cycle.crop}`,
      reason: held
        ? 'No open case currently blocks this zone. An operator must still review the lot before release.'
        : 'This released lot still has available stock. Record a sale only when a buyer and quantity are confirmed.',
      impact: {
        value: `${num(kg, 1)} kg`,
        label: held ? 'Awaiting lot review' : 'Available in this lot',
        detail: 'Unsold stock is not revenue or profit.',
      },
      evidence: [
        { label: 'Harvest lot', value: `${lot.id}, ${lot.date}, ${lot.status}`, url },
        {
          label: 'Remaining grades',
          value: `A: ${num(lotStock(p, lot, 'A'), 1)} kg / B: ${num(lotStock(p, lot, 'B'), 1)} kg`,
          url,
        },
      ],
      steps: ['Review lot condition', 'Record the confirmed sale', 'Record the received payment'],
      verification:
        'The stock ledger reduces only when a sale or loss is recorded. A sale remains receivable until payment is recorded.',
      actions: [
        {
          kind: held ? 'release' : 'sale',
          label: held ? 'Review harvest lot' : 'Record sale',
          id: lot.id,
        },
        route('Open harvest stock', url),
      ],
      resolved: false,
    });
  }
  for (const sale of p.sales.filter((x) => x.status === 'recorded')) {
    const paid = p.receipts.filter((r) => r.saleId === sale.id).reduce((n, r) => n + r.amount, 0);
    const balance = Math.round(sale.kg * sale.price) - paid;
    if (balance <= 0) continue;
    const due =
      sale.dueOn < localDate(s.clock)
        ? 'Overdue'
        : sale.dueOn === localDate(s.clock)
          ? 'Due today'
          : 'Upcoming payment';
    add(`sale:${sale.id}`, [sale, paid], {
      focus: ['business'],
      rank: due === 'Overdue' ? 2 : 6,
      title: `Follow up payment from ${sale.buyer}`,
      reason: `${due}. Record a receipt only after the payment arrives; the sale alone is not cash received.`,
      impact: {
        value: money(balance),
        label: 'Outstanding payment',
        detail: `Due ${sale.dueOn}. This amount is a receivable, not additional profit.`,
      },
      evidence: [
        {
          label: 'Sale',
          value: `${sale.id}, ${sale.kg} kg, ${money(sale.price)}/kg`,
          url: '/siklus?tab=sales',
        },
        { label: 'Recorded receipts', value: money(paid), url: '/siklus?tab=sales' },
      ],
      steps: ['Review the sale and due date', 'Confirm the buyer payment', 'Record the receipt'],
      verification:
        'The remaining balance is recalculated from receipts linked to this sale. Partial payments leave the remainder open.',
      actions: [
        { kind: 'payment', label: 'Record receipt', id: sale.id },
        route('Review sale & receipts', '/siklus?tab=sales'),
      ],
      resolved: false,
    });
  }
  const summary = productionSummary(s);
  if (!summary.reviewed && (p.sales.length > 0 || p.lots.length > 0)) {
    add('profit-review', [summary.revenue, summary.charge, summary.unassigned], {
      focus: ['business'],
      rank: 9,
      title: 'Review costs before reporting cycle profit',
      reason:
        'Sales and harvests are recorded, but the current cost allocation has not been reviewed. Incomplete costs can overstate profit.',
      impact: {
        value: 'Review needed',
        label: 'Cycle profit is provisional',
        detail: 'Savings are comparisons against a baseline and must not be added to profit again.',
      },
      evidence: [
        { label: 'Recorded revenue', value: money(summary.revenue), url: '/siklus?tab=sales' },
        { label: 'Allocated charges', value: money(summary.charge), url: '/biaya?tab=profit' },
      ],
      steps: [
        'Allocate cycle expenses',
        'Review accrued costs and depreciation',
        'Review profit and cash separately',
      ],
      verification:
        'Review the cost allocation after changes. Revenue, received cash, profit and resource savings measure different things.',
      actions: [route('Review cycle profit', '/biaya?tab=profit')],
      resolved: false,
    });
  }
  return items.sort(
    (a, b) =>
      Number(a.resolved) - Number(b.resolved) || a.rank - b.rank || a.id.localeCompare(b.id),
  );
}
