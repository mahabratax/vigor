import type { DomainState, Observation, PestCase, ZoneId } from './types';
import { activity, iso, localDate, nextId, number } from './format';
import { observationsForZone } from './observations';

/** Presentation thresholds, not a validated agronomic intervention threshold. */
export const DETECTION_RULE = {
  version: 'trap-trend-demo-v1',
  minimumCount: 20,
  ratio: 1.5,
  maxAgeHours: 36,
} as const;
export type DetectionStatus = 'review' | 'watch' | 'normal' | 'unavailable';
export type DetectionSample = 'rising' | 'stable' | 'missing';
export interface DetectionCheck {
  id: string;
  label: string;
  detail: string;
  pass: boolean;
}
export interface DetectionAssessment {
  zoneId: ZoneId;
  deviceId: string | null;
  status: DetectionStatus;
  title: string;
  reason: string;
  readings: Observation[];
  latest: number | null;
  baseline: number | null;
  growthPercent: number | null;
  checks: DetectionCheck[];
  signalKey: string | null;
  linkedCase: PestCase | null;
  reviewed: boolean;
}

export function assessDetection(s: DomainState, zoneId: ZoneId): DetectionAssessment {
  const zone = s.zones.find((z) => z.id === zoneId);
  const camera = s.devices.find((d) => d.type === 'camera' && d.zones.includes(zoneId));
  const readings = observationsForZone(s, zoneId).slice(-3),
    last = readings.at(-1);
  const ageHours = last ? (s.clock - Date.parse(last.at) / 1000) / 3600 : Infinity;
  const countsValid =
    readings.length === 3 &&
    readings.every(
      (o) => o.newCaptures !== null && Number.isInteger(o.newCaptures) && o.newCaptures >= 0,
    );
  const intervalsValid =
    readings.length === 3 &&
    readings.every(
      (o, i) =>
        o.intervalHours === 24 &&
        (i === 0 ||
          Math.abs(Date.parse(o.at) - Date.parse(readings[i - 1].at) - 86400000) <= 60000),
    );
  const checks: DetectionCheck[] = [
    {
      id: 'source',
      label: 'Camera ready',
      pass: !!camera?.active && camera.connection === 'online' && camera.calibrated,
      detail: !camera?.active
        ? 'Camera unavailable or inactive.'
        : camera.connection !== 'online'
          ? 'Check the camera connection.'
          : !camera.calibrated
            ? 'Camera installation has not been validated.'
            : `${camera.id} online and validated.`,
    },
    {
      id: 'zone',
      label: 'Zone validated',
      pass: !!zone?.validated && zone.status !== 'inactive',
      detail: zone?.validated
        ? `Installation in Zone ${zoneId} validated.`
        : 'Validate zone installation before comparing data.',
    },
    {
      id: 'fresh',
      label: 'Reading is recent enough',
      pass: Number.isFinite(ageHours) && ageHours >= 0 && ageHours <= DETECTION_RULE.maxAgeHours,
      detail:
        Number.isFinite(ageHours) && ageHours >= 0
          ? `${number(ageHours, 1)} hours since the last reading. Prototype limit: 36 hours.`
          : 'Observation timestamp is missing or in the future.',
    },
    {
      id: 'readings',
      label: 'Three complete readings',
      pass: countsValid,
      detail: countsValid
        ? 'Three valid capture counts. Zero is a valid observation.'
        : 'Missing or invalid readings are not treated as zero.',
    },
    {
      id: 'intervals',
      label: 'Comparable intervals',
      pass: intervalsValid,
      detail: intervalsValid
        ? 'Three consecutive 24-hour intervals.'
        : 'Three consecutive 24-hour intervals are required, without gaps or overlap.',
    },
    {
      id: 'matching-source',
      label: 'Same source',
      pass:
        !!camera && readings.length === 3 && readings.every((o) => o.sourceDeviceId === camera.id),
      detail: 'The comparison uses the same camera in this zone.',
    },
  ];
  const valid = checks.every((c) => c.pass);
  const latest =
    last?.newCaptures != null && Number.isInteger(last.newCaptures) && last.newCaptures >= 0
      ? last.newCaptures
      : null;
  const baseline = valid ? (readings[0].newCaptures! + readings[1].newCaptures!) / 2 : null;
  const growthPercent =
    baseline !== null && baseline > 0 ? ((latest! - baseline) / baseline) * 100 : null;
  const signalKey = valid
    ? `detection:${DETECTION_RULE.version}:${s.greenhouse.id}:${zoneId}:${readings.map((o) => `${o.id}:${o.at}:${o.newCaptures}`).join('|')}`
    : null;
  const highCount = valid && latest! >= DETECTION_RULE.minimumCount;
  const ratio = valid && baseline! > 0 && latest! >= baseline! * DETECTION_RULE.ratio;
  const consecutive =
    valid &&
    readings[1].newCaptures! > readings[0].newCaptures! &&
    latest! > readings[1].newCaptures!;
  const status: DetectionStatus = !valid
    ? 'unavailable'
    : highCount && ratio && consecutive
      ? 'review'
      : highCount
        ? 'watch'
        : 'normal';
  if (valid)
    checks.push(
      {
        id: 'count',
        label: 'Prototype count threshold reached',
        pass: highCount,
        detail: `${latest} captures against a threshold of ${DETECTION_RULE.minimumCount} per 24 hours.`,
      },
      {
        id: 'growth',
        label: 'Increase of at least 50%',
        pass: ratio,
        detail: `Latest ${latest}; average of the previous two intervals ${number(baseline!, 1)}. ${baseline === 0 ? 'A percentage cannot be calculated from a zero baseline.' : `Change ${number(growthPercent!, 1)}%.`}`,
      },
      {
        id: 'consecutive',
        label: 'Two consecutive increases',
        pass: consecutive,
        detail: readings.map((o) => o.newCaptures).join(' → ') + ' captures.',
      },
    );
  const linkedCase =
    s.cases.find((c) => c.zoneId === zoneId && c.status !== 'closed') ??
    s.cases.find((c) => c.detectionSignal?.key === signalKey) ??
    null;
  return {
    zoneId,
    deviceId: camera?.id ?? null,
    status,
    readings,
    latest,
    baseline,
    growthPercent,
    checks,
    signalKey,
    linkedCase,
    reviewed:
      !!signalKey &&
      (s.seenTriggers.includes(signalKey) ||
        s.cases.some((c) => c.detectionSignal?.key === signalKey)),
    title: {
      review: 'Plant review needed',
      watch: 'More observations needed',
      normal: 'No alert triggered',
      unavailable: 'Cannot assess yet',
    }[status],
    reason: !valid
      ? checks.find((c) => !c.pass)!.detail
      : status === 'review'
        ? `${latest} captures per 24 hours, above the baseline of ${number(baseline!, 1)} and rising for two consecutive intervals.`
        : status === 'watch'
          ? 'The count reached the prototype threshold, but the rising trend does not meet every rule.'
          : 'The count is below the prototype threshold. This does not confirm that plants are pest-free.',
  };
}

export function detectionSummary(s: DomainState) {
  const zones = s.zones.map((z) => assessDetection(s, z.id));
  return {
    zones,
    review: zones.filter((z) => z.status === 'review').length,
    unavailable: zones.filter((z) => z.status === 'unavailable').length,
    usable: zones.filter((z) => z.status !== 'unavailable').length,
  };
}

/** Evaluate new signals once. Never close a case or trigger an actuator from a trap count. */
export function evaluateDetections(s: DomainState) {
  let created = 0,
    linked = 0;
  for (const assessment of detectionSummary(s).zones) {
    if (assessment.status !== 'review' || !assessment.signalKey || assessment.reviewed) continue;
    s.seenTriggers.push(assessment.signalKey);
    let c = s.cases.find((c) => c.zoneId === assessment.zoneId && c.status !== 'closed');
    if (c) linked++;
    else {
      c = {
        id: nextId('INS', s.cases),
        zoneId: assessment.zoneId,
        title: `Rising captures in Zone ${assessment.zoneId}`,
        status: 'inspection',
        verified: false,
        assignedTo: null,
        createdAt: iso(s.clock),
        sourceDeviceId: assessment.deviceId!,
      };
      s.cases.unshift(c);
      created++;
    }
    c.detectionSignal = {
      key: assessment.signalKey,
      ruleVersion: DETECTION_RULE.version,
      observationIds: assessment.readings.map((o) => o.id),
      values: assessment.readings.map((o) => o.newCaptures!),
      baseline: assessment.baseline!,
      triggeredAt: iso(s.clock),
    };
    activity(
      s,
      'observation',
      `Monitoring signal in Zone ${assessment.zoneId} linked to ${c.id}`,
      `${assessment.reason} Prototype rule. Identifying insects and plant condition requires inspection.`,
      c.id,
      assessment.zoneId,
      'Sample monitoring',
    );
  }
  return { created, linked };
}

/** Changes only one zone's synthetic observations; no image analysis or network request. */
export function applyDetectionSample(s: DomainState, zoneId: ZoneId, sample: DetectionSample) {
  if (!s.zones.some((z) => z.id === zoneId)) throw new Error('Zone not found.');
  if (!['rising', 'stable', 'missing'].includes(sample)) throw new Error('Scenario unavailable.');
  const source = s.devices.find((d) => d.type === 'camera' && d.zones.includes(zoneId));
  if (!source) throw new Error('No camera available in this zone.');
  const values =
    sample === 'rising' ? [12, 19, 28] : sample === 'stable' ? [4, 5, 5] : [12, 19, null];
  const start = s.clock - 2 * 86400;
  s.observations = s.observations.filter(
    (o) => o.zoneId !== zoneId || localDate(Date.parse(o.at) / 1000) < localDate(start),
  );
  values.forEach((value, i) =>
    s.observations.push({
      id: `DEMO-${zoneId}-${sample}-${s.clock}-${i}`,
      zoneId,
      at: iso(start + i * 86400),
      intervalHours: 24,
      newCaptures: value,
      sourceDeviceId: source.id,
    }),
  );
  s.playing = false;
  if (zoneId === 'B' && ['increasing', 'insufficient'].includes(s.scenario)) s.scenario = 'normal';
  activity(
    s,
    'system',
    `Monitoring sample for Zone ${zoneId} dimuat`,
    {
      rising: 'Rising captures: 12, 19, 28.',
      stable: 'Stable captures: 4, 5, 5.',
      missing: 'Latest reading missing; not treated as zero.',
    }[sample],
    source.id,
    zoneId,
    'Simulation controls',
  );
}
