import type { DomainState } from './types';
import { activity, isActiveRun, localDate, nextId } from './format';
import { productionSummary } from './production';
export interface ExtraUsage {
  id: string;
  date: string;
  waterLiters: number | null;
  energyKwh: number | null;
  basis: 'reading' | 'estimate';
  notes: string;
  key: string;
  void: boolean;
  voidReason?: string;
}
export interface ResourceState {
  version: 1;
  cycleId: string;
  shares: Record<string, number>;
  extras: ExtraUsage[];
  coverage: 'partial' | 'complete';
  notes: string;
  reviewKey: string | null;
}
export type ResourceAction =
  | {
      type: 'resource_extra';
      date: string;
      waterLiters: number | null;
      energyKwh: number | null;
      basis: 'reading' | 'estimate';
      notes: string;
      key: string;
      excludesRuns: boolean;
    }
  | { type: 'resource_void'; id: string; notes: string }
  | {
      type: 'resource_review';
      shares: Record<string, number>;
      coverage: 'partial' | 'complete';
      notes: string;
    };
export function resources(s: DomainState): ResourceState {
  return s.resources?.cycleId === s.cycle.id
    ? s.resources
    : {
        version: 1,
        cycleId: s.cycle.id,
        shares: {},
        extras: [],
        coverage: 'partial',
        notes: '',
        reviewKey: null,
      };
}
export function validResources(value: unknown, cycleId: string): value is ResourceState {
  const r = value as ResourceState;
  const optional = (n: unknown) =>
    n === null || (typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 1e9);
  return (
    !!r &&
    r.version === 1 &&
    r.cycleId === cycleId &&
    ['partial', 'complete'].includes(r.coverage) &&
    typeof r.notes === 'string' &&
    (r.reviewKey === null || typeof r.reviewKey === 'string') &&
    !!r.shares &&
    typeof r.shares === 'object' &&
    !Array.isArray(r.shares) &&
    Object.values(r.shares).every((n) => Number.isFinite(n) && n >= 0 && n <= 100) &&
    Array.isArray(r.extras) &&
    r.extras.every(
      (e) =>
        e &&
        [e.id, e.date, e.notes, e.key].every((x) => typeof x === 'string') &&
        Number.isFinite(Date.parse(e.date)) &&
        optional(e.waterLiters) &&
        optional(e.energyKwh) &&
        ['reading', 'estimate'].includes(e.basis) &&
        typeof e.void === 'boolean',
    )
  );
}
export function resourceRows(s: DomainState) {
  const r = resources(s),
    end = s.production?.closedOn ?? localDate(s.clock);
  return s.usages
    .filter((u) => {
      const date = localDate(Date.parse(u.at) / 1000),
        run = s.runs.find((run) => run.id === u.runId);
      return (
        date >= s.cycle.plantedOn && date <= end && (!run?.cycleId || run.cycleId === s.cycle.id)
      );
    })
    .map((u) => {
      const run = s.runs.find((run) => run.id === u.runId),
        percent = r.shares[u.id] ?? (run?.cycleId === s.cycle.id ? 100 : 0);
      return {
        usage: u,
        run,
        percent,
        water: (u.waterLiters * percent) / 100,
        energy: (u.energyKwh * percent) / 100,
        legacy: !run?.cycleId,
      };
    });
}
export function resourceKey(s: DomainState) {
  const r = resources(s);
  return JSON.stringify([
    s.cycle.id,
    s.cycle.plantedOn,
    localDate(s.clock),
    s.production?.closedOn,
    resourceRows(s).map((x) => [
      x.usage.id,
      x.usage.at,
      x.usage.waterLiters,
      x.usage.energyKwh,
      x.usage.deliveryConfirmed,
      x.percent,
      x.run?.status,
    ]),
    r.extras,
    r.coverage,
    r.notes,
  ]);
}
export function efficiencySummary(s: DomainState) {
  const r = resources(s),
    p = productionSummary(s),
    rows = resourceRows(s),
    extras = r.extras.filter((e) => !e.void);
  const kg = Math.max(
    0,
    p.lots
      .filter((l) => l.status === 'released')
      .reduce(
        (n, l) =>
          n +
          l.aKg +
          l.bKg -
          p.p.losses.filter((x) => x.lotId === l.id).reduce((t, x) => t + x.kg, 0),
        0,
      ),
  );
  const water =
      rows.reduce((n, r) => n + r.water, 0) + extras.reduce((n, e) => n + (e.waterLiters ?? 0), 0),
    energy =
      rows.reduce((n, r) => n + r.energy, 0) + extras.reduce((n, e) => n + (e.energyKwh ?? 0), 0);
  const hasWater =
      rows.some((r) => r.percent > 0 && r.usage.waterLiters > 0) ||
      extras.some((e) => e.waterLiters !== null),
    hasEnergy =
      rows.some((r) => r.percent > 0 && r.usage.energyKwh > 0) ||
      extras.some((e) => e.energyKwh !== null);
  const uncertain = rows.filter((r) => r.percent > 0 && !r.usage.deliveryConfirmed);
  const reviewed = !!r.reviewKey && r.reviewKey === resourceKey(s);
  return {
    r,
    p,
    rows,
    extras,
    kg,
    water,
    energy,
    hasWater,
    hasEnergy,
    uncertain,
    reviewed,
    waterPerKg: kg > 0 && hasWater ? water / kg : null,
    energyPerKg: kg > 0 && hasEnergy ? energy / kg : null,
    costPerKg: kg > 0 && p.reviewed ? p.charge / kg : null,
    complete: reviewed && r.coverage === 'complete' && !uncertain.length,
  };
}
export function applyResource(s: DomainState, a: ResourceAction) {
  if (s.production?.stage === 'closed')
    throw new Error('Reopen cycle review before changing usage records.');
  s.resources = resources(s);
  const r = s.resources;
  let id: string | undefined;
  if (a.type === 'resource_extra') {
    const dupe = r.extras.find((e) => e.key === a.key);
    if (dupe) return { ok: true, id: dupe.id, message: 'This usage has already been recorded.' };
    if (
      !a.key ||
      !a.excludesRuns ||
      a.notes.trim().length < 8 ||
      !['reading', 'estimate'].includes(a.basis)
    )
      throw new Error(
        'Enter a source or note and confirm that usage excludes separately recorded runs.',
      );
    if (a.waterLiters === null && a.energyKwh === null)
      throw new Error('Enter known water or energy usage. Leave unknown values empty.');
    if (
      [a.waterLiters, a.energyKwh].some(
        (n) => n !== null && (!Number.isFinite(n) || n < 0 || n > 1e9),
      )
    )
      throw new Error('Usage must be a nonnegative number.');
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(a.date) ||
      !Number.isFinite(Date.parse(a.date)) ||
      new Date(a.date).toISOString().slice(0, 10) !== a.date ||
      a.date < s.cycle.plantedOn ||
      a.date > localDate(s.clock)
    )
      throw new Error('Usage date must fall within the cycle and cannot be in the future.');
    id = nextId('RES', r.extras);
    r.extras.push({
      id,
      date: a.date,
      waterLiters: a.waterLiters,
      energyKwh: a.energyKwh,
      basis: a.basis,
      notes: a.notes.trim(),
      key: a.key,
      void: false,
    });
    r.reviewKey = null;
  } else if (a.type === 'resource_void') {
    const e = r.extras.find((e) => e.id === a.id && !e.void);
    if (!e || a.notes.trim().length < 5)
      throw new Error('Select an active record and enter a reason for voiding.');
    e.void = true;
    e.voidReason = a.notes.trim();
    r.reviewKey = null;
    id = e.id;
  } else {
    const ids = new Set(resourceRows(s).map((r) => r.usage.id));
    if (
      !a.shares ||
      Object.entries(a.shares).some(
        ([id, n]) => !ids.has(id) || !Number.isFinite(n) || n < 0 || n > 100,
      )
    )
      throw new Error('Usage allocation must be 0–100% of an available record.');
    if (!['partial', 'complete'].includes(a.coverage) || a.notes.trim().length < 8)
      throw new Error('Select coverage and enter review notes of at least 8 characters.');
    r.shares = structuredClone(a.shares);
    r.coverage = a.coverage;
    r.notes = a.notes.trim();
    const summary = efficiencySummary(s);
    if (
      a.coverage === 'complete' &&
      (summary.uncertain.length ||
        !summary.hasWater ||
        !summary.hasEnergy ||
        (!summary.rows.length && !summary.extras.length))
    )
      throw new Error(
        'Complete coverage requires water and energy records and resolution of uncertain usage.',
      );
    if (
      a.coverage === 'complete' &&
      (s.playing ||
        s.runs.some((run) => isActiveRun(run.status) || run.status === 'Needs reconciliation'))
    )
      throw new Error(
        'Pause the simulator and resolve active processes before declaring complete coverage.',
      );
    r.reviewKey = resourceKey(s);
  }
  activity(
    s,
    'expense',
    'Cycle usage review updated',
    'Usage and payments are separate. This adds no expense or claimed savings.',
    id ?? s.cycle.id,
  );
  return { ok: true, id, message: 'Usage record saved for this cycle.' };
}
