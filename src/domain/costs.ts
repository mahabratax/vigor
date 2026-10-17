import { localDate, periodOf } from './format';
import { periodError, resolvePeriod, validDate, validMonth } from './periods';
import type {
  CostAllocation,
  CostItem,
  CostScope,
  DomainState,
  ExpenseCategory,
  ExpenseRecord,
  ExpenseView,
  SavingsComparison,
} from './types';
export const OPERATING_CATEGORIES: ExpenseCategory[] = [
  'Air',
  'Nutrisi',
  'Listrik',
  'Internet',
  'Perawatan',
  'Tenaga dibayar',
];
export const ALL_EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ...OPERATING_CATEGORIES,
  'Benih & media',
  'Kemasan & distribusi',
  'Sewa & lainnya',
  'Investasi',
];
export function inPeriod(date: string, scope: CostScope, clock: number): boolean {
  const d =
    date.length > 10 && Number.isFinite(Date.parse(date))
      ? localDate(Date.parse(date) / 1000)
      : date.slice(0, 10);
  const resolved = resolvePeriod(clock, scope.period, scope.from, scope.to);
  if (periodError(resolved)) return false;
  if (resolved.from && resolved.to) return d >= resolved.from && d <= resolved.to;
  return periodOf(d) === resolved.period;
}
export function scopedValue(
  s: DomainState,
  e: ExpenseRecord,
  scope: CostScope,
): {
  amount: number;
  source: ExpenseView['source'];
} | null {
  if (scope.category && scope.category !== e.category) return null;
  if (!scope.deviceId && !scope.zoneId) return { amount: e.amount, source: 'Tercatat' };
  if (
    (!scope.deviceId || e.deviceId === scope.deviceId) &&
    (!scope.zoneId || e.zoneId === scope.zoneId)
  )
    return { amount: e.amount, source: 'Tercatat' };
  const allocations = s.allocations.filter(
    (a) =>
      a.expenseId === e.id &&
      (!scope.deviceId || a.deviceId === scope.deviceId) &&
      (!scope.zoneId || a.zoneId === scope.zoneId),
  );
  return allocations.length
    ? { amount: allocations.reduce((v, a) => v + a.amount, 0), source: 'Alokasi' }
    : null;
}
export function expenseRows(
  s: DomainState,
  scope: CostScope,
  includeVoided = false,
): ExpenseView[] {
  return s.expenses
    .filter(
      (e) =>
        (includeVoided || e.status === 'paid') &&
        e.greenhouseId === s.greenhouse.id &&
        inPeriod(e.paidAt, scope, s.clock),
    )
    .flatMap((record) => {
      const val = scopedValue(s, record, scope);
      return val ? [{ record, ...val }] : [];
    })
    .sort(
      (a, b) =>
        b.record.paidAt.localeCompare(a.record.paidAt) || b.record.id.localeCompare(a.record.id),
    );
}
export function costSummary(s: DomainState, scope: CostScope) {
  const rows = expenseRows(s, scope);
  const operating = rows
    .filter((e) => e.record.category !== 'Investasi')
    .reduce((a, e) => a + e.amount, 0);
  const investment = rows
    .filter((e) => e.record.category === 'Investasi')
    .reduce((a, e) => a + e.amount, 0);
  const budget =
    scope.deviceId || scope.zoneId || scope.category
      ? null
      : (s.budgets.find((b) => b.period === scope.period)?.amount ?? null);
  return {
    rows,
    operating,
    investment,
    total: operating + investment,
    budget,
    remaining: budget === null ? null : budget - operating,
    partial: scope.period === localDate(s.clock).slice(0, 7),
  };
}
export function consumedCost(
  s: DomainState,
  scope: CostScope,
  category: ExpenseCategory,
): number | null {
  const matches = s.expenses.filter(
    (e) => e.status === 'paid' && e.category === category && e.greenhouseId === s.greenhouse.id,
  );
  let found = false,
    total = 0;
  for (const record of matches) {
    const scoped = scopedValue(s, record, scope);
    if (!scoped) continue;
    if (record.usageSlices) {
      for (const slice of record.usageSlices) {
        if (inPeriod(slice.period + '-01', scope, s.clock)) {
          found = true;
          total += slice.amount * (record.amount ? scoped.amount / record.amount : 0);
        }
      }
    } else if (inPeriod(record.paidAt, scope, s.clock)) {
      found = true;
      total += scoped.amount;
    }
  }
  return found ? total : null;
}
export function comparison(s: DomainState, scope: CostScope): SavingsComparison {
  const values = OPERATING_CATEGORIES.map((c) => ({
    category: c,
    value: consumedCost(s, scope, c),
  }));
  const missing = values.filter((v) => v.value === null).map((v) => v.category);
  const actual = values.reduce((v, x) => v + (x.value ?? 0), 0);
  const empty = (reason: string, baseline: number | null = null): SavingsComparison => ({
    canCompare: false,
    partial: missing.length > 0,
    reason,
    baseline,
    actual,
    difference: null,
    percent: null,
    missing,
  });
  if (!s.baseline) return empty('Enter a pre-automation baseline to compare costs.');
  if (scope.zoneId || scope.deviceId || scope.category)
    return empty('The greenhouse-wide baseline does not match the selected scope.');
  if (OPERATING_CATEGORIES.some((c) => s.baseline?.categories[c] === undefined))
    return empty('Baseline categories are incomplete.');
  if (
    s.baseline.zones.length !== s.zones.length ||
    s.baseline.area !== s.greenhouse.plantedArea ||
    s.baseline.crop !== s.cycle.crop ||
    s.baseline.phase !== s.cycle.phase
  )
    return empty('Area, zones, crop, or growth stage differs from the baseline.');
  let baseline = OPERATING_CATEGORIES.reduce((a, c) => a + (s.baseline?.categories[c] ?? 0), 0);
  if (scope.period !== s.baseline.period) {
    if (scope.period !== localDate(s.clock).slice(0, 7) || !s.baseline.normalizedDaily)
      return empty(
        'Periods are not equivalent. Normalization is not applied automatically.',
        baseline,
      );
    const elapsedDays = Number(localDate(s.clock).slice(8, 10));
    baseline = (baseline / s.baseline.days) * elapsedDays;
  }
  if (missing.length)
    return empty('Records are incomplete. Missing amounts are not treated as zero.', baseline);
  if (baseline <= 0)
    return empty('The baseline must exceed zero to calculate a percentage.', baseline);
  const difference = baseline - actual;
  return {
    canCompare: true,
    partial: false,
    reason:
      s.baseline.source === 'assumption'
        ? 'Estimate against an unvalidated manual baseline'
        : 'Difference from baseline records; not evidence of causation.',
    baseline,
    actual,
    difference,
    percent: (difference / baseline) * 100,
    missing,
  };
}
export function validateExpense(s: DomainState, e: ExpenseRecord, editingId?: string): string[] {
  const errors: string[] = [];
  const previous = editingId ? s.expenses.find((record) => record.id === editingId) : undefined;
  const unchangedHistoricalScope =
    previous?.deviceId === e.deviceId && previous?.zoneId === e.zoneId;
  if (!validDate(e.paidAt)) errors.push('Select a valid payment date.');
  if (e.paidAt > localDate(s.clock) && e.status === 'paid')
    errors.push('Payment date cannot be in the future.');
  if (!Number.isFinite(e.amount) || e.amount <= 0 || e.amount > 1000000000000)
    errors.push('Amount must be greater than zero and no more than IDR 1 trillion.');
  if (!ALL_EXPENSE_CATEGORIES.includes(e.category)) errors.push('Select an expense category.');
  if (e.deviceId && !s.devices.some((d) => d.id === e.deviceId)) errors.push('Device not found.');
  if (e.zoneId && !s.zones.some((z) => z.id === e.zoneId)) errors.push('Zone not found.');
  if (
    e.deviceId &&
    e.zoneId &&
    !unchangedHistoricalScope &&
    !s.devices.find((d) => d.id === e.deviceId)?.zones.includes(e.zoneId)
  )
    errors.push('Zone and device do not match.');
  if (e.usageSlices) {
    if (
      e.usageSlices.some((a) => !validMonth(a.period) || !Number.isFinite(a.amount) || a.amount < 0)
    )
      errors.push('Allocation period or amount is invalid.');
    if (Math.abs(e.usageSlices.reduce((a, r) => a + r.amount, 0) - e.amount) > 0.01)
      errors.push('Usage allocations must add up to the payment amount.');
    if (new Set(e.usageSlices.map((a) => a.period)).size !== e.usageSlices.length)
      errors.push('Usage periods cannot repeat.');
  }
  const allocated = s.allocations
    .filter((a) => a.expenseId === editingId)
    .reduce((a, x) => a + x.amount, 0);
  if (allocated > e.amount)
    errors.push('The amount is below existing allocations. Update allocations first.');
  return errors;
}
export function validateAllocations(
  record: ExpenseRecord,
  allocations: CostAllocation[],
): string[] {
  const errors: string[] = [];
  if (
    allocations.some((a) => a.expenseId !== record.id || !Number.isFinite(a.amount) || a.amount < 0)
  )
    errors.push('Invalid allocation or amount.');
  if (allocations.reduce((a, x) => a + x.amount, 0) > record.amount)
    errors.push('Total allocations cannot exceed the bill.');
  return errors;
}
export function possibleDuplicate(s: DomainState, e: ExpenseRecord) {
  return s.expenses.find(
    (x) =>
      x.id !== e.id &&
      x.status !== 'void' &&
      x.category === e.category &&
      x.paidAt === e.paidAt &&
      x.amount === e.amount &&
      x.deviceId === e.deviceId,
  );
}
export function plannerItems(zones: number, ownedController: boolean): CostItem[] {
  return [
    { id: 'camera', label: 'Monitoring camera', quantity: zones, unitPrice: 300000, owned: false },
    {
      id: 'sensor',
      label: 'Temperature/RH sensor',
      quantity: zones,
      unitPrice: 200000,
      owned: false,
    },
    {
      id: 'gateway',
      label: 'Gateway / controller',
      quantity: 1,
      unitPrice: 700000,
      owned: ownedController,
    },
    { id: 'power', label: 'Power & enclosure', quantity: 1, unitPrice: 300000, owned: false },
    { id: 'cable', label: 'Cables & mounting', quantity: 1, unitPrice: 200000, owned: false },
    { id: 'install', label: 'Installation', quantity: 1, unitPrice: 300000, owned: false },
    { id: 'materials', label: 'Initial materials', quantity: 1, unitPrice: 100000, owned: false },
  ];
}
export function plannerTotal(items: CostItem[], contingency = 10) {
  const subtotal = items.reduce((a, i) => a + (i.owned ? 0 : i.quantity * (i.unitPrice ?? 0)), 0);
  return {
    subtotal,
    contingency: Math.round((subtotal * contingency) / 100),
    total: subtotal + Math.round((subtotal * contingency) / 100),
    incomplete: items.some((i) => !i.owned && i.unitPrice === null),
  };
}
export function deviceUsage(s: DomainState, id: string, period: string | CostScope) {
  const scope = typeof period === 'string' ? { period } : period;
  const rows = s.usages.filter((u) => u.deviceId === id && inPeriod(u.at, scope, s.clock));
  return {
    seconds: rows.reduce((v, r) => v + r.seconds, 0),
    kwh: rows.reduce((v, r) => v + r.energyKwh, 0),
    water: rows.reduce((v, r) => v + r.waterLiters, 0),
    rows,
  };
}
