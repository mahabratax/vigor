import type { DomainState } from './types';
import {
  TARGET_METRICS,
  type GrowingAction,
  type TargetLimits,
  type TargetMetric,
  type TargetRevision,
  type TargetState,
} from './growingTypes';
import { PLANT_STAGES, type PlantStage } from './zoneTypes';
import { activeBatch, cultivation } from './zones';
import { activity, iso, nextId } from './format';
import { assessStoredReading, availableDevices, sensorValue } from './telemetry';

export const metricInfo: Record<
  TargetMetric | 'level' | 'flow',
  { label: string; unit: string; min: number; max: number }
> = {
  temperature: { label: 'Air temperature', unit: '°C', min: -50, max: 80 },
  humidity: { label: 'Air humidity', unit: '%', min: 0, max: 100 },
  media: { label: 'Growing media moisture', unit: '%', min: 0, max: 100 },
  ec: { label: 'Solution EC', unit: 'mS/cm', min: 0, max: 20 },
  ph: { label: 'Solution pH', unit: '', min: 0, max: 14 },
  level: { label: 'Tank level', unit: '%', min: 0, max: 100 },
  flow: { label: 'Flow', unit: 'L/min', min: 0, max: 10000 },
};
export function targetState(s: DomainState): TargetState {
  return s.targets ?? { version: 1, revisions: [] };
}
export function validLimits(limits: unknown): limits is TargetLimits {
  if (!limits || typeof limits !== 'object' || Array.isArray(limits)) return false;
  const entries = Object.entries(limits);
  return (
    entries.length > 0 &&
    entries.every(([key, r]) => {
      if (!TARGET_METRICS.includes(key as TargetMetric) || !r || typeof r !== 'object')
        return false;
      const range = r as { min: number; max: number },
        info = metricInfo[key as TargetMetric];
      return (
        Number.isFinite(range.min) &&
        Number.isFinite(range.max) &&
        range.min >= info.min &&
        range.max <= info.max &&
        range.min <= range.max
      );
    })
  );
}
export function validTargets(value: unknown): value is TargetState {
  const p = value as TargetState;
  return (
    !!p &&
    p.version === 1 &&
    Array.isArray(p.revisions) &&
    p.revisions.every(
      (r) =>
        !!r &&
        Number.isFinite(Date.parse(r.createdAt)) &&
        [r.id, r.batchId, r.zoneId, r.crop, r.variety, r.notes, r.createdAt, r.createdBy].every(
          (x) => typeof x === 'string',
        ) &&
        PLANT_STAGES.includes(r.stage) &&
        Number.isInteger(r.version) &&
        r.version > 0 &&
        validLimits(r.limits) &&
        ['draft', 'active', 'superseded'].includes(r.status) &&
        (r.status !== 'active' ||
          (typeof r.reviewedAt === 'string' && typeof r.reviewedBy === 'string')),
    )
  );
}
export function activeTarget(
  s: DomainState,
  zoneId: string,
  stage?: PlantStage,
): TargetRevision | undefined {
  const b = activeBatch(s, zoneId);
  if (!b) return;
  return targetState(s).revisions.find(
    (r) =>
      r.batchId === b.id &&
      r.stage === (stage ?? b.stage) &&
      r.crop === b.crop &&
      r.variety === b.variety &&
      r.status === 'active',
  );
}
export function metricReading(
  s: DomainState,
  deviceId: string,
  metric: TargetMetric | 'level' | 'flow',
) {
  if (s.readings) {
    const result = assessStoredReading(s, deviceId, metric);
    const labels = {
      ready: 'Recorded reading',
      missing: 'No reading',
      offline: 'Offline',
      stale: 'Reading expired',
      uncalibrated: 'Calibration needed',
      maintenance: 'Under maintenance',
      invalid: 'Invalid reading',
      future: 'Future timestamp',
      unsupported: 'Sensor unavailable',
    };
    return { value: result.value, quality: labels[result.quality] };
  }
  const d = availableDevices(s).find((d) => d.id === deviceId);
  const z = d ? s.zones.find((z) => z.id === d.zones[0]) : undefined;
  const quality = !d
    ? 'Unavailable'
    : d.maintenance
      ? 'Under maintenance'
      : d.connection !== 'online'
        ? d.connection === 'stale'
          ? 'Expired data'
          : 'Offline'
        : !d.calibrated
          ? 'Not calibrated'
          : s.greenhouse.source === 'custom'
            ? 'No data yet'
            : 'Initial data';
  if (quality !== 'Initial data') return { value: null, quality };
  const value =
    metric === 'humidity'
      ? z &&
        z.validated &&
        z.status !== 'inactive' &&
        !(s.scenario === 'insufficient' && d!.id === 'TH-B-01')
        ? z.humidity
        : null
      : sensorValue(s, deviceId);
  return { value, quality: value === null ? 'No data yet' : quality };
}
export function zoneTargetReadings(s: DomainState, zoneId: string) {
  const target = activeTarget(s, zoneId);
  return TARGET_METRICS.map((metric) => {
    const device = availableDevices(s).find(
      (d) => d.zones.includes(zoneId) && d.capabilities.includes(metric),
    );
    const reading = device
      ? metricReading(s, device.id, metric)
      : { value: null, quality: 'Sensor unavailable' };
    const range = target?.limits[metric];
    return {
      metric,
      device,
      ...reading,
      range,
      status:
        reading.value === null
          ? 'missing'
          : !range
            ? 'unset'
            : reading.value < range.min
              ? 'low'
              : reading.value > range.max
                ? 'high'
                : 'within',
    };
  });
}
export function applyTarget(
  s: DomainState,
  a: Extract<GrowingAction, { type: 'target_save' | 'target_activate' }>,
) {
  if (s.production?.stage === 'closed')
    throw new Error('Reopen the cycle review before changing crop targets.');
  s.targets = targetState(s);
  let id: string;
  if (a.type === 'target_save') {
    const b = cultivation(s).batches.find((b) => b.id === a.batchId && b.status === 'active');
    if (!b || s.zones.find((z) => z.id === b.zoneId)?.status === 'inactive')
      throw new Error('Select an active batch and zone.');
    if (!PLANT_STAGES.includes(a.stage) || !validLimits(a.limits))
      throw new Error('Enter at least one complete range. Minimum cannot exceed maximum.');
    if (a.notes.trim().length < 8)
      throw new Error('Enter the target basis in at least 8 characters.');
    const prior = s.targets.revisions.filter((r) => r.batchId === b.id && r.stage === a.stage);
    prior.filter((r) => r.status === 'draft').forEach((r) => (r.status = 'superseded'));
    id = nextId('TGT', s.targets.revisions);
    s.targets.revisions.unshift({
      id,
      batchId: b.id,
      zoneId: b.zoneId,
      crop: b.crop,
      variety: b.variety,
      stage: a.stage,
      version: Math.max(0, ...prior.map((r) => r.version)) + 1,
      limits: structuredClone(a.limits),
      notes: a.notes.trim(),
      createdAt: iso(s.clock),
      createdBy: a.actor ?? 'Sample operator',
      status: 'draft',
    });
    activity(
      s,
      'routine',
      'Crop target draft saved',
      `${b.crop}, ${a.stage}. The active target is unchanged.`,
      id,
      b.zoneId,
      a.actor,
    );
  } else {
    const r = s.targets.revisions.find((r) => r.id === a.id && r.status === 'draft');
    const b = r ? activeBatch(s, r.zoneId) : null;
    if (
      !r ||
      !b ||
      b.id !== r.batchId ||
      b.crop !== r.crop ||
      b.variety !== r.variety ||
      s.zones.find((z) => z.id === r.zoneId)?.status === 'inactive'
    )
      throw new Error('Batch details changed. Save a draft for the active crop before review.');
    s.targets.revisions
      .filter((t) => t.batchId === r.batchId && t.stage === r.stage && t.status === 'active')
      .forEach((t) => (t.status = 'superseded'));
    r.status = 'active';
    r.reviewedAt = iso(s.clock);
    r.reviewedBy = a.actor ?? 'Sample operator';
    id = r.id;
    activity(
      s,
      'routine',
      'Crop target reviewed',
      `${r.crop}, ${r.stage}, v${r.version}. This is a monitoring target; automation parameters require separate review.`,
      id,
      r.zoneId,
      a.actor,
    );
  }
  return {
    ok: true,
    id,
    message:
      a.type === 'target_save'
        ? 'Target draft saved. Review it before using it for monitoring.'
        : 'Target reviewed. It applies when the batch enters the selected stage.',
  };
}
