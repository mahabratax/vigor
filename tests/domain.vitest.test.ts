/** Native target regressions. The broader domain suite is tests/offline-domain.cjs. */
import { describe, it, expect } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import {
  costSummary,
  comparison,
  expenseRows,
  plannerItems,
  plannerTotal,
} from '../src/domain/costs';
import { advanceInPlace, nextOccurrence } from '../src/domain/scheduler';
import { hydrate } from '../src/domain/storage';
import { kpis } from '../src/domain/selectors';

describe('September fixture reconciliation', () => {
  it('retains one ledger and distinct budget / baseline concepts', () => {
    const s = createFixture();
    expect(costSummary(s, { period: '2026-09' })).toMatchObject({
      operating: 1080000,
      remaining: 120000,
      budget: 1200000,
    });
    expect(comparison(s, { period: '2026-09' })).toMatchObject({
      canCompare: true,
      baseline: 1400000,
      difference: 320000,
    });
    expect(
      expenseRows(s, { period: '2026-09', deviceId: 'PUMP-01' }).reduce((a, x) => a + x.amount, 0),
    ).toBe(85500);
    expect(s.expenses).toHaveLength(7);
  });
  it('keeps installation planning separate from actual expenses', () => {
    const s = createFixture();
    expect(plannerTotal(plannerItems(2, false)).total).toBe(2860000);
    expect(plannerTotal(plannerItems(2, true)).total).toBe(2090000);
    expect(s.expenses).toHaveLength(7);
  });
  it('does not present missing baseline as zero savings', () => {
    const s = createFixture();
    s.baseline = null;
    expect(comparison(s, { period: '2026-09' }).canCompare).toBe(false);
  });
});
describe('Single deterministic simulator', () => {
  it('runs irrigation and fertigation without per-run approval', () => {
    const s = createFixture();
    advanceInPlace(s, Date.parse('2026-10-13T10:34:00+07:00') / 1000 - s.clock);
    expect(
      s.runs.filter(
        (r) => ['RTN-001', 'RTN-002'].includes(r.routineId) && r.status === 'Completed',
      ),
    ).toHaveLength(2);
    expect(s.expenses).toHaveLength(7);
    expect(s.locks).toHaveLength(0);
  });
  it('uses explicit WIB slots and keeps counts independent of observation coverage', () => {
    const s = createFixture();
    expect(nextOccurrence(s.routines[0], s.clock)).toBe(
      Date.parse('2026-10-13T10:00:00+07:00') / 1000,
    );
    expect(kpis(s)).toMatchObject({ devices: 25, online: 24, coverage: 4, observationsOnline: 11 });
  });
  it('does not resume an active run after reload', () => {
    const s = createFixture();
    advanceInPlace(s, Date.parse('2026-10-13T10:00:30+07:00') / 1000 - s.clock);
    const restored = hydrate(JSON.stringify(s));
    expect(restored.playing).toBe(false);
    expect(restored.runs[0].status).toBe('Needs reconciliation');
  });
});
