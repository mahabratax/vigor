import type { DomainState, StoredReading } from './types';
export const SENSOR_MAX_AGE_SECONDS = 30 * 60;
export const SENSOR_METRICS = [
  'temperature',
  'humidity',
  'media',
  'level',
  'flow',
  'ec',
  'ph',
] as const;
export type SensorMetric = (typeof SENSOR_METRICS)[number];
export type ReadingQuality =
  | 'ready'
  | 'missing'
  | 'offline'
  | 'stale'
  | 'uncalibrated'
  | 'maintenance'
  | 'invalid'
  | 'future'
  | 'unsupported';
const units: Record<SensorMetric, string> = {
  temperature: '°C',
  humidity: '%',
  media: '%',
  level: '%',
  flow: 'L/min',
  ec: 'mS/cm',
  ph: 'pH',
};
const limits: Record<SensorMetric, [number, number]> = {
  temperature: [-50, 80],
  humidity: [0, 100],
  media: [0, 100],
  level: [0, 100],
  flow: [0, 10000],
  ec: [0, 20],
  ph: [0, 14],
};
export interface ReadingAssessment {
  deviceId: string;
  metric: SensorMetric;
  reading: StoredReading | null;
  value: number | null;
  unit: string;
  ageSeconds: number | null;
  quality: ReadingQuality;
}
/** One source of truth for stored telemetry. Invalid latest data never falls back
 * to an older, more convenient value. Freshness is a configurable technical policy,
 * not a validated crop threshold. Times are epoch seconds throughout the domain. */
export function assessStoredReading(
  s: DomainState,
  deviceId: string,
  metric: SensorMetric,
  now = s.clock,
  maxAgeSeconds = SENSOR_MAX_AGE_SECONDS,
): ReadingAssessment {
  const device = availableDevices(s).find((d) => d.id === deviceId);
  const readings = (s.readings ?? []).filter((r) => r.deviceId === deviceId && r.metric === metric);
  const invalidTime = readings.find((r) => !Number.isFinite(Date.parse(r.capturedAt)));
  const reading =
    invalidTime ??
    [...readings].sort(
      (a, b) => Date.parse(b.capturedAt) - Date.parse(a.capturedAt) || b.id.localeCompare(a.id),
    )[0] ??
    null;
  const age = reading ? now - Date.parse(reading.capturedAt) / 1000 : NaN;
  let quality: ReadingQuality = 'ready';
  if (!device || !device.capabilities.includes(metric)) quality = 'unsupported';
  else if (device.maintenance) quality = 'maintenance';
  else if (device.connection !== 'online')
    quality = device.connection === 'stale' ? 'stale' : 'offline';
  else if (!device.calibrated) quality = 'uncalibrated';
  else if (!reading || reading.value === null) quality = 'missing';
  else if (
    !Number.isFinite(now) ||
    !Number.isFinite(maxAgeSeconds) ||
    maxAgeSeconds < 0 ||
    !Number.isFinite(age) ||
    !Number.isFinite(reading.value) ||
    reading.value < limits[metric][0] ||
    reading.value > limits[metric][1] ||
    (reading.unit !== units[metric] && !(metric === 'ph' && reading.unit === ''))
  )
    quality = 'invalid';
  else if (age < 0) quality = 'future';
  else if (age > maxAgeSeconds) quality = 'stale';
  return {
    deviceId,
    metric,
    reading,
    value: quality === 'ready' ? reading!.value : null,
    unit: units[metric],
    ageSeconds: Number.isFinite(age) ? age : null,
    quality,
  };
}
export function availableDevices(s: DomainState) {
  return s.devices.filter(
    (d) => d.active && (s.profile === 'automation' || ['camera', 'sensor'].includes(d.type)),
  );
}
export function sensorValue(s: DomainState, id: string, metric?: SensorMetric): number | null {
  const d = availableDevices(s).find((x) => x.id === id);
  if (!d || d.connection !== 'online' || !d.calibrated || d.maintenance) return null;
  const selectedMetric =
    metric ?? SENSOR_METRICS.find((m) => m !== 'humidity' && d.capabilities.includes(m));
  if (s.readings) return selectedMetric ? assessStoredReading(s, id, selectedMetric).value : null;
  if (metric === 'humidity') {
    const zone = s.zones.find((z) => z.id === d.zones[0]);
    return s.greenhouse.source !== 'custom' &&
      zone?.validated &&
      zone.status !== 'inactive' &&
      d.capabilities.includes('humidity') &&
      !(s.scenario === 'insufficient' && id === 'TH-B-01')
      ? zone.humidity
      : null;
  }
  // A configured device does not create a measurement. Custom greenhouses have no sensor feed.
  if (s.greenhouse.source === 'custom') return null;
  if (s.scenario === 'insufficient' && (id === 'MEDIA-A' || id === 'TH-B-01')) return null;
  if (id === 'MEDIA-A') return s.scenario === 'increasing' ? 26 : 38;
  if (id === 'MEDIA-B') return s.scenario === 'wet_media' ? 78 : 44;
  if (id === 'LEVEL-01') return s.scenario === 'low_tank' ? 8 : 72;
  if (id === 'NUTRI-LEVEL-01') return 68;
  if (id === 'EC-01') return 1.8;
  if (id === 'PH-01') return 6.1;
  if (id === 'FLOW-01') {
    if (s.scenario === 'no_flow') return 0;
    const active = s.runs.some(
      (r) =>
        (r.status === 'Running' || r.status === 'Verifying') &&
        r.resource === 'PUMP-01' &&
        ['water', 'dose', 'flush', 'verify_flow'].includes(r.steps[r.stepIndex]?.action),
    );
    return active || s.scenario === 'flow_stuck' ? 16 : 0;
  }
  if (id.startsWith('TH-')) {
    const z = s.zones.find((z) => z.id === d.zones[0]);
    if (!z || z.status === 'inactive' || !z.temperature) return null;
    return s.scenario === 'increasing' && id === 'TH-A-01' ? 30.2 : z.temperature;
  }
  return null;
}
