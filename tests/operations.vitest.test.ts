import { expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { advanceInPlace } from '../src/domain/scheduler';
import { operationReview } from '../src/features/greenhouse/operationsModel';
import { normalizeQuery } from '../src/app/navigation';

it('reads the existing schedule and sensor values without modifying the domain or the ledger', () => {
  const s = createFixture(),
    before = JSON.stringify(s);
  const review = operationReview(s, s.routines[0]);
  expect(review.next).toBe(Date.parse('2026-10-13T10:00:00+07:00') / 1000);
  expect(review.readings.find((r) => r.id === 'LEVEL-01')).toMatchObject({ value: 72, unit: '%' });
  expect(review.status).toBe('Awaiting trigger');
  expect(review.guard).toBeNull();
  expect(review.latest).toBeNull();
  expect(JSON.stringify(s)).toBe(before);
});
it('explains low-tank guards and missing readings instead of presenting them as normal', () => {
  const s = createFixture();
  s.scenario = 'low_tank';
  let review = operationReview(s, s.routines[0]);
  expect(review.readings.find((r) => r.id === 'LEVEL-01')?.value).toBe(8);
  expect(review.guard).toMatch(/tank/i);
  expect(review.status).toBe('Conditions not met');
  const sensor = s.devices.find((d) => d.id === 'LEVEL-01')!;
  sensor.connection = 'offline';
  review = operationReview(s, s.routines[0]);
  expect(review.readings.find((r) => r.id === 'LEVEL-01')).toMatchObject({
    value: null,
    quality: 'Offline',
  });
  sensor.connection = 'online';
  sensor.maintenance = true;
  expect(operationReview(s, s.routines[0]).readings.find((r) => r.id === 'LEVEL-01')).toMatchObject(
    { value: null, quality: 'Under maintenance' },
  );
});
it('shows no made-up telemetry for custom greenhouses and respects the active device profile', () => {
  const s = createFixture();
  s.greenhouse.source = 'custom';
  expect(operationReview(s, s.routines[0]).readings.every((r) => r.value === null)).toBe(true);
  s.profile = 'monitoring';
  const review = operationReview(s, s.routines[0]);
  expect(review.required.find((r) => r.id === 'PUMP-01')?.device).toBeUndefined();
  expect(review.guard).toMatch(/not installed in profile Monitoring/);
});
it('follows the real sensor episode, run status and outcome without claiming crop recovery', () => {
  const s = createFixture(),
    r = s.routines.find((r) => r.id === 'RTN-003')!;
  expect(operationReview(s, r).status).toBe('Awaiting trigger');
  s.scenario = 'increasing';
  expect(operationReview(s, r).status).toBe('Confirming condition');
  advanceInPlace(s, 15);
  expect(operationReview(s, r).trigger).toContain('16 seconds');
  advanceInPlace(s, 25);
  expect(operationReview(s, r).latest?.status).toBe('Running');
  expect(operationReview(s, r).trigger).toContain('This episode was processed');
  advanceInPlace(s, 240);
  const review = operationReview(s, r);
  expect(review.latest?.status).toBe('Completed');
  expect(review.outcome).toContain('has not confirmed temperature recovery');
  expect(review.followUp).toBe('/perangkat?device=TH-A-01');
  expect(s.expenses).toHaveLength(7);
});
it('distinguishes creation of a human task from completion of the physical work', () => {
  const s = createFixture(),
    r = s.routines.find((r) => r.id === 'RTN-004')!;
  advanceInPlace(s, Date.parse('2026-10-13T13:01:00+07:00') / 1000 - s.clock);
  let review = operationReview(s, r);
  expect(review.latest?.status).toBe('Completed');
  expect(review.outcome).toContain('still needs to complete the physical work');
  expect(review.maintenance).toBeTruthy();
  review.maintenance!.status = 'completed';
  review = operationReview(s, r);
  expect(review.outcome).toContain('marked completed by the operator');
});
it('shows paused and uncertain execution states and preserves their workflow deep links', () => {
  const s = createFixture(),
    r = s.routines[0];
  r.status = 'Paused';
  expect(operationReview(s, r).status).toBe('Paused');
  r.status = 'Active';
  advanceInPlace(s, Date.parse('2026-10-13T10:00:30+07:00') / 1000 - s.clock);
  const run = s.runs.find((run) => run.routineId === r.id)!;
  run.status = 'Needs reconciliation';
  s.locks.forEach((lock) => (lock.state = 'unknown'));
  const review = operationReview(s, r);
  expect(review.status).toBe('State review needed');
  expect(review.outcome).toContain('unconfirmed');
  expect(review.lock?.state).toBe('unknown');
  expect(normalizeQuery('/greenhouse', 'tab=operations&routine=RTN-001&zone=A')).toBe(
    'tab=operations&routine=RTN-001&zone=A',
  );
});
