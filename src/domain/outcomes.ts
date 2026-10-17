import type { AutomationRun, DomainState } from './types';
import {
  TARGET_METRICS,
  type EvidenceSnapshot,
  type GrowingAction,
  type ReadingMetric,
  type RunEvidence,
} from './growingTypes';
import { activeTarget, metricInfo, metricReading } from './cropTargets';
import { activity, iso, isActiveRun, nextId } from './format';
export const verdictLabels = {
  improved: 'Improved, according to operator',
  unchanged: 'Unchanged',
  worse: 'Worsened, according to operator',
  inconclusive: 'Inconclusive',
};
export function evidenceSnapshot(s: DomainState, run: AutomationRun, id: string): EvidenceSnapshot {
  const metrics: ReadingMetric[] = [...TARGET_METRICS, 'level', 'flow'];
  return {
    id,
    at: s.clock,
    scenario: s.scenario,
    readings: run.snapshot.requiredDevices.flatMap((deviceId) => {
      const d = s.devices.find((d) => d.id === deviceId);
      if (!d) return [];
      const zoneIds = d.zones.filter((id) => run.snapshot.zones.includes(id));
      return metrics
        .filter((metric) => d.capabilities.includes(metric))
        .map((metric) => ({
          deviceId,
          label: d.label,
          zoneIds,
          metric,
          unit: metricInfo[metric].unit,
          ...metricReading(s, deviceId, metric),
          targets: zoneIds.flatMap((zoneId) => {
            const t = activeTarget(s, zoneId),
              r = t?.limits[metric as (typeof TARGET_METRICS)[number]];
            return t && r ? [{ zoneId, batchId: t.batchId, revisionId: t.id, ...r }] : [];
          }),
        }));
    }),
  };
}
export function captureRunStart(s: DomainState, run: AutomationRun) {
  if (!run.evidence)
    run.evidence = {
      before: evidenceSnapshot(s, run, `${run.id}-before`),
      followUps: [],
      reviews: [],
    };
}
export function captureRunFinish(s: DomainState, run: AutomationRun) {
  if (run.evidence && !run.evidence.after)
    run.evidence.after = evidenceSnapshot(s, run, `${run.id}-after`);
}
export function comparisonReadings(run: AutomationRun, afterId?: string) {
  const e = run.evidence;
  const snapshots = e ? [...(e.after ? [e.after] : []), ...e.followUps] : [];
  const after = snapshots.find((x) => x.id === afterId) ?? snapshots.at(-1);
  return {
    before: e?.before,
    after,
    snapshots,
    changedScenario: !!after && after.scenario !== e?.before.scenario,
    rows:
      e?.before.readings.map((before) => {
        const next = after?.readings.find(
          (n) =>
            n.deviceId === before.deviceId &&
            n.metric === before.metric &&
            n.unit === before.unit &&
            n.zoneIds.join(',') === before.zoneIds.join(','),
        );
        return {
          before,
          after: next,
          delta: next?.value != null && before.value !== null ? next.value - before.value : null,
        };
      }) ?? [],
  };
}
export function applyOutcome(
  s: DomainState,
  a: Extract<GrowingAction, { type: 'outcome_capture' | 'outcome_review' }>,
) {
  const run = s.runs.find((r) => r.id === a.runId);
  if (!run?.evidence?.after)
    throw new Error(
      'This run has no paired before-and-after readings. New executions can capture this evidence when connected.',
    );
  if (isActiveRun(run.status) || ['Scheduled', 'Needs reconciliation'].includes(run.status))
    throw new Error('Complete or review the execution state before reviewing outcomes.');
  const e = run.evidence;
  if (a.type === 'outcome_capture') {
    if (s.clock <= (e.followUps.at(-1)?.at ?? e.after!.at))
      throw new Error('A follow-up reading must be captured after the previous observation.');
    if (e.followUps.length >= 12)
      throw new Error(
        'The limit of 12 follow-up readings has been reached. Review existing observations.',
      );
    const id = nextId(`${run.id}-followup`, e.followUps);
    e.followUps.push(evidenceSnapshot(s, run, id));
    activity(
      s,
      'observation',
      'Follow-up reading saved',
      `${run.id}. Values reflect the current sample source.`,
      run.id,
      run.snapshot.zones[0],
      a.actor,
    );
    return { ok: true, id, message: 'Follow-up saved without replacing the original evidence.' };
  }
  const duplicate = e.reviews.find((r) => r.key === a.key);
  if (duplicate) return { ok: true, id: duplicate.id, message: 'Review already saved.' };
  if (!Object.hasOwn(verdictLabels, a.verdict) || a.notes.trim().length < 8 || !a.key)
    throw new Error('Select an outcome and enter notes of at least 8 characters.');
  const pairs = comparisonReadings(run, a.afterId);
  if (pairs.after?.id !== a.afterId) throw new Error('Follow-up reading not found.');
  if (a.verdict !== 'inconclusive' && !pairs.rows.some((r) => r.delta !== null))
    throw new Error('Insufficient comparable data. Select Inconclusive.');
  const id = nextId(`${run.id}-review`, e.reviews);
  e.reviews.push({
    id,
    afterId: a.afterId,
    verdict: a.verdict,
    notes: a.notes.trim(),
    actor: a.actor ?? 'Sample operator',
    at: iso(s.clock),
    key: a.key,
  });
  activity(
    s,
    'observation',
    `Outcome review ${run.id}`,
    `${verdictLabels[a.verdict]}. ${a.notes}`,
    run.id,
    run.snapshot.zones[0],
    a.actor,
  );
  return {
    ok: true,
    id,
    message: 'Operator review saved. Cases and tasks still require their own reviews.',
  };
}
export function validEvidence(value: unknown): value is RunEvidence {
  const e = value as RunEvidence;
  const snapshot = (s: EvidenceSnapshot) =>
    !!s &&
    typeof s.id === 'string' &&
    Number.isFinite(s.at) &&
    typeof s.scenario === 'string' &&
    Array.isArray(s.readings) &&
    s.readings.every(
      (r) =>
        r &&
        typeof r.deviceId === 'string' &&
        typeof r.label === 'string' &&
        typeof r.unit === 'string' &&
        typeof r.quality === 'string' &&
        Object.hasOwn(metricInfo, r.metric) &&
        (r.value === null || Number.isFinite(r.value)) &&
        Array.isArray(r.zoneIds) &&
        r.zoneIds.every((z) => typeof z === 'string') &&
        Array.isArray(r.targets) &&
        r.targets.every(
          (t) =>
            t &&
            typeof t.zoneId === 'string' &&
            typeof t.batchId === 'string' &&
            typeof t.revisionId === 'string' &&
            Number.isFinite(t.min) &&
            Number.isFinite(t.max) &&
            t.min <= t.max,
        ),
    );
  return (
    !!e &&
    snapshot(e.before) &&
    (!e.after || snapshot(e.after)) &&
    Array.isArray(e.followUps) &&
    e.followUps.length <= 12 &&
    e.followUps.every(snapshot) &&
    Array.isArray(e.reviews) &&
    e.reviews.every(
      (r) =>
        r &&
        [r.id, r.afterId, r.notes, r.actor, r.at, r.key].every((v) => typeof v === 'string') &&
        Object.hasOwn(verdictLabels, r.verdict),
    )
  );
}
