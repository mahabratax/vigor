import type { DomainState } from './types';
import { checkRoutineGuards, validateRoutine } from './scheduler';
import { assessStoredReading, SENSOR_METRICS } from './telemetry';
/** Read-only preview: no clock, commands, run, usage or accounting writes. */
export function previewRoutine(
  s: DomainState,
  routineId: string,
  now = Math.floor(Date.now() / 1000),
) {
  const r = s.routines.find((r) => r.id === routineId);
  if (!r) throw new Error('Routine not found.');
  const context = { ...s, clock: now };
  const blockers = [...validateRoutine(context, r)];
  const guard = checkRoutineGuards(context, r);
  if (guard) blockers.push(guard);
  if (r.status !== 'Active') blockers.push('Activate this reviewed routine before scheduling it.');
  for (const deviceId of r.version.requiredDevices) {
    const device = s.devices.find((d) => d.id === deviceId);
    for (const metric of SENSOR_METRICS.filter((m) => device?.capabilities.includes(m))) {
      const reading = assessStoredReading(context, deviceId, metric, now);
      if (reading.quality !== 'ready')
        blockers.push(`${deviceId}: ${metric} reading is ${reading.quality}.`);
    }
  }
  if (r.version.resource && s.locks.some((l) => l.id === r.version.resource))
    blockers.push('The shared resource is reserved by another execution.');
  const durationSeconds = r.version.steps.reduce((sum, step) => sum + step.duration, 0);
  const waterLiters = r.version.steps
    .filter((step) => ['water', 'dose', 'flush'].includes(step.action))
    .reduce((sum, step) => sum + (step.duration * r.version.flowLpm) / 60, 0);
  return {
    routineId: r.id,
    versionId: r.version.id,
    checkedAt: now,
    status: blockers.length ? ('blocked' as const) : ('ready_for_simulation' as const),
    blockers: [...new Set(blockers)],
    steps: r.version.steps.map((step) => ({ ...step, deviceIds: [...step.deviceIds] })),
    estimates: { durationSeconds, waterLiters },
    physicalExecution: false as const,
  };
}
