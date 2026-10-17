import { dateLabel, localDate, monthLabel } from './format';
import type { CostScope, DomainState } from './types';

export type PeriodScope = Pick<CostScope, 'period' | 'from' | 'to'>;
export const validMonth = (value: string | null | undefined): value is string =>
  !!value && /^(?:19|[2-9]\d)\d{2}-(?:0[1-9]|1[0-2])$/.test(value);
export function validDate(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !validMonth(value.slice(0, 7))) return false;
  const at = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(at) && new Date(at).toISOString().slice(0, 10) === value;
}
export function shiftMonth(period: string, offset: number) {
  const [year, month] = period.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1 + offset, 1)).toISOString().slice(0, 7);
}
/** All money and device views use the same date boundaries. No fixture month defaults. */
export function resolvePeriod(
  clock: number,
  selected?: string | null,
  from?: string | null,
  to?: string | null,
): PeriodScope {
  const today = localDate(clock),
    current = today.slice(0, 7);
  if (selected === '3months')
    return { period: '3months', from: `${shiftMonth(current, -2)}-01`, to: today };
  if (selected === 'custom')
    return { period: 'custom', from: from ?? `${current}-01`, to: to ?? today };
  return { period: validMonth(selected) ? selected : current };
}
export function periodError(scope: PeriodScope): string | null {
  if (!['custom', '3months'].includes(scope.period)) return null;
  if (!validDate(scope.from) || !validDate(scope.to)) return 'Enter a valid start and end date.';
  if (scope.from > scope.to) return 'Start date must be on or before the end date.';
  return null;
}
export function costMonths(s: DomainState, selected?: string) {
  const current = localDate(s.clock).slice(0, 7);
  return [
    ...new Set(
      [
        current,
        shiftMonth(current, -1),
        shiftMonth(current, -2),
        ...s.expenses.flatMap((e) => [
          e.paidAt.slice(0, 7),
          ...(e.usageSlices?.map((a) => a.period) ?? []),
        ]),
        ...s.budgets.map((b) => b.period),
        s.baseline?.period,
        selected,
      ].filter(validMonth),
    ),
  ]
    .sort()
    .reverse();
}
export function periodLabel(scope: PeriodScope) {
  if (['custom', '3months'].includes(scope.period))
    return periodError(scope)
      ? 'Invalid date range'
      : `${dateLabel(scope.from!)} – ${dateLabel(scope.to!)}`;
  return monthLabel(scope.period);
}
export function periodQuery(scope: PeriodScope) {
  const q = new URLSearchParams({ period: scope.period });
  if (scope.period === 'custom') {
    q.set('from', scope.from ?? '');
    q.set('to', scope.to ?? '');
  }
  return q.toString();
}
