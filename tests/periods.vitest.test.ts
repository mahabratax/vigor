import { describe, expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { costSummary, deviceUsage, inPeriod, validateExpense } from '../src/domain/costs';
import {
  costMonths,
  periodError,
  periodLabel,
  periodQuery,
  resolvePeriod,
  validDate,
} from '../src/domain/periods';

const at = (iso: string) => Date.parse(iso) / 1000;
describe('shared expense and device periods', () => {
  it('uses the Jakarta month and rolls the trailing range across the year boundary', () => {
    const clock = at('2026-12-31T17:30:00Z');
    expect(resolvePeriod(clock)).toEqual({ period: '2027-01' });
    expect(resolvePeriod(clock, '3months')).toEqual({
      period: '3months',
      from: '2026-11-01',
      to: '2027-01-01',
    });
    expect(resolvePeriod(clock, 'custom')).toEqual({
      period: 'custom',
      from: '2027-01-01',
      to: '2027-01-01',
    });
    expect(resolvePeriod(clock, '2026-13')).toEqual({ period: '2027-01' });
    expect(inPeriod('2026-12-31T17:30:00Z', { period: '2027-01' }, clock)).toBe(true);
    expect(inPeriod('2027-01-02', { period: '3months' }, clock)).toBe(false);
  });

  it('rejects impossible and reversed dates without reporting false zero costs', () => {
    const s = createFixture();
    expect(validDate('2028-02-29')).toBe(true);
    expect(validDate('2027-02-29')).toBe(false);
    const reversed = resolvePeriod(s.clock, 'custom', '2026-10-13', '2026-10-01');
    expect(periodError(reversed)).toContain('Start date');
    expect(inPeriod('2026-10-05', reversed, s.clock)).toBe(false);
    expect(periodLabel(resolvePeriod(s.clock, 'custom', 'bad', '2026-10-13'))).toBe(
      'Invalid date range',
    );
    expect(validateExpense(s, { ...s.expenses[0], paidAt: '2026-02-30' })).toContain(
      'Select a valid payment date.',
    );
  });

  it('keeps a custom range and allocation totals when moving between costs and devices', () => {
    const s = createFixture();
    const scope = resolvePeriod(s.clock, 'custom', '2026-09-01', '2026-09-30');
    expect(periodQuery(scope)).toBe('period=custom&from=2026-09-01&to=2026-09-30');
    expect(costSummary(s, { ...scope, deviceId: 'PUMP-01' }).total).toBe(85500);
    expect(costSummary(s, scope).total).toBe(1080000);
    expect(deviceUsage(s, 'PUMP-01', scope).seconds).toBe(
      deviceUsage(s, 'PUMP-01', '2026-09').seconds,
    );
    const usage = {
      ...s.usages[0],
      id: 'TEST-BOUNDARY',
      deviceId: 'PUMP-01',
      at: '2026-09-30T18:00:00Z',
    };
    s.usages = [usage];
    expect(deviceUsage(s, 'PUMP-01', scope).rows).toHaveLength(0);
    expect(
      deviceUsage(s, 'PUMP-01', resolvePeriod(s.clock, 'custom', '2026-10-01', '2026-10-01')).rows,
    ).toHaveLength(1);
  });

  it('offers historical months from records while keeping the current month available', () => {
    const s = createFixture();
    s.clock = at('2027-01-10T01:00:00Z');
    expect(costMonths(s)).toEqual(['2027-01', '2026-12', '2026-11', '2026-10', '2026-09']);
    expect(costMonths(s, '2026-02')).toContain('2026-02');
    expect(costMonths(s, 'bad')).not.toContain('bad');
  });
});
