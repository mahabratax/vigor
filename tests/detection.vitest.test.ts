import { describe, expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { createGreenhouseFixture } from '../src/data/greenhouses';
import {
  applyDetectionSample,
  assessDetection,
  detectionSummary,
  evaluateDetections,
} from '../src/domain/detection';
import { transition } from '../src/domain/actions';
import { trendData } from '../src/domain/selectors';
import { notificationsFor } from '../src/features/workspace/notifications';
import { actionPermission, can } from '../src/features/access/permissions';
import { createDomainStore } from '../src/store/store';
import type { DomainState } from '../src/domain/types';

describe('explainable trap observation rules', () => {
  it('derives the decision and reasons from the same readings as the graph', () => {
    const s = createFixture(),
      result = assessDetection(s, 'B');
    expect(result.status).toBe('review');
    expect(result.readings.map((o) => o.newCaptures)).toEqual([12, 19, 26]);
    expect(result.baseline).toBe(15.5);
    expect(result.growthPercent).toBeCloseTo(67.7419);
    expect(result.checks.every((c) => c.pass)).toBe(true);
    expect(trendData(s).at(-1)?.B).toBe(result.latest);
    expect(detectionSummary(s)).toMatchObject({ review: 1, unavailable: 2, usable: 4 });
    expect(detectionSummary(createGreenhouseFixture('GH-02'))).toMatchObject({
      review: 0,
      unavailable: 0,
      usable: 6,
    });
  });
  it('preserves the distinction between no captures and a missing reading', () => {
    const s = createFixture();
    applyDetectionSample(s, 'D', 'missing');
    expect(assessDetection(s, 'D')).toMatchObject({
      status: 'unavailable',
      latest: null,
      baseline: null,
      growthPercent: null,
    });
    for (const o of s.observations.filter((o) => o.zoneId === 'D')) o.newCaptures = 0;
    expect(assessDetection(s, 'D')).toMatchObject({
      status: 'normal',
      latest: 0,
      baseline: 0,
      growthPercent: null,
    });
    expect(assessDetection(s, 'D').checks.find((c) => c.id === 'growth')?.pass).toBe(false);
  });
  it.each([-1, 2.5, Infinity, NaN])('rejects invalid capture count %s', (count) => {
    const s = createFixture();
    s.observations.filter((o) => o.zoneId === 'B').at(-1)!.newCaptures = count;
    expect(assessDetection(s, 'B').status).toBe('unavailable');
    expect(evaluateDetections(s)).toEqual({ created: 0, linked: 0 });
  });
  const badSources: [string, (s: DomainState) => void][] = [
    [
      'offline camera',
      (s) => {
        s.devices.find((d) => d.id === 'CAM-B-02')!.connection = 'offline';
      },
    ],
    [
      'uncalibrated camera',
      (s) => {
        s.devices.find((d) => d.id === 'CAM-B-02')!.calibrated = false;
      },
    ],
    [
      'different source',
      (s) => {
        s.observations.filter((o) => o.zoneId === 'B').at(-1)!.sourceDeviceId = 'CAM-A-01';
      },
    ],
    [
      'unequal interval',
      (s) => {
        s.observations.filter((o) => o.zoneId === 'B').at(-1)!.intervalHours = 12;
      },
    ],
    [
      'nonconsecutive observations',
      (s) => {
        s.observations = s.observations.filter((o) => o.id !== 'OBS-B-12');
      },
    ],
    [
      'future timestamp',
      (s) => {
        s.clock -= 3600;
      },
    ],
    [
      'stale timestamp',
      (s) => {
        s.clock += 37 * 3600;
      },
    ],
  ];
  it.each(badSources)('holds a decision for %s', (_name, mutate) => {
    const s = createFixture();
    mutate(s);
    expect(assessDetection(s, 'B').status).toBe('unavailable');
    expect(assessDetection(s, 'B').signalKey).toBeNull();
  });
  it.each([
    [[8, 12, 20], 'review'],
    [[12, 18, 21], 'watch'],
    [[21, 10, 28], 'watch'],
    [[3, 4, 19], 'normal'],
  ] as const)('combines quantity, growth and sustained trend for %j', (counts, status) => {
    const s = createFixture(),
      rows = s.observations.filter((o) => o.zoneId === 'B').slice(-3);
    rows.forEach((o, i) => {
      o.newCaptures = counts[i];
    });
    expect(assessDetection(s, 'B').status).toBe(status);
  });
  it('uses the existing simulation scenarios consistently across analysis and charts', () => {
    const s = createFixture();
    s.scenario = 'increasing';
    expect(assessDetection(s, 'B').latest).toBe(34);
    expect(trendData(s).at(-1)?.B).toBe(34);
    s.scenario = 'insufficient';
    expect(assessDetection(s, 'B').latest).toBeNull();
    expect(trendData(s).at(-1)?.B).toBeNull();
    applyDetectionSample(s, 'B', 'stable');
    expect(assessDetection(s, 'B').status).toBe('normal');
    expect(trendData(s).at(-1)?.B).toBe(5);
  });
});

describe('monitoring to inspection workflow', () => {
  it('automatically opens one case and notification, without issuing commands or recording payment', () => {
    const initial = createFixture();
    const s = transition(initial, { type: 'detection_sample', zoneId: 'D', sample: 'rising' }).data;
    const c = s.cases.find((c) => c.zoneId === 'D')!;
    expect(c).toMatchObject({
      status: 'inspection',
      verified: false,
      assignedTo: null,
      sourceDeviceId: 'CAM-D-01',
    });
    expect(c.detectionSignal?.values).toEqual([12, 19, 28]);
    expect(s.events.some((e) => e.type === 'observation' && e.objectId === c.id)).toBe(true);
    expect(notificationsFor(s).filter((n) => n.url === `/hama?case=${c.id}`)).toHaveLength(1);
    expect(s.commands).toEqual(initial.commands);
    expect(s.expenses).toEqual(initial.expenses);
    expect(s.runs).toEqual(initial.runs);
    expect(initial.cases.find((c) => c.zoneId === 'D' && c.status !== 'closed')).toBeUndefined();
    const again = transition(s, { type: 'evaluate_detection' }).data;
    expect(again.cases).toHaveLength(s.cases.length);
    expect(again.events).toHaveLength(s.events.length);
  });
  it('evaluates observation changes on a demo tick and reuses an open case', () => {
    const s = createFixture();
    applyDetectionSample(s, 'B', 'rising');
    const next = transition(s, { type: 'tick', seconds: 1 }).data;
    expect(next.cases).toHaveLength(s.cases.length);
    expect(next.cases.find((c) => c.id === 'INS-024')?.detectionSignal?.values).toEqual([
      12, 19, 28,
    ]);
    expect(next.cases.find((c) => c.id === 'INS-024')?.verified).toBe(false);
  });
  it('does not recreate a reviewed case from identical readings, but accepts a new later signal', () => {
    const s = createFixture();
    const previous = s.cases.filter((c) => c.zoneId === 'D').length;
    applyDetectionSample(s, 'D', 'rising');
    evaluateDetections(s);
    const original = s.cases.find((c) => c.zoneId === 'D')!;
    original.status = 'closed';
    original.closedAt = new Date(s.clock * 1000).toISOString();
    evaluateDetections(s);
    expect(s.cases.filter((c) => c.zoneId === 'D')).toHaveLength(previous + 1);
    expect(assessDetection(s, 'D').linkedCase?.id).toBe(original.id);
    s.clock += 86400;
    applyDetectionSample(s, 'D', 'rising');
    evaluateDetections(s);
    expect(s.cases.filter((c) => c.zoneId === 'D')).toHaveLength(previous + 2);
  });
  it('retains the trigger snapshot and case when subsequent readings recover or disappear', () => {
    const s = createFixture();
    applyDetectionSample(s, 'D', 'rising');
    evaluateDetections(s);
    const c = s.cases.find((c) => c.zoneId === 'D')!,
      snapshot = structuredClone(c.detectionSignal);
    applyDetectionSample(s, 'D', 'stable');
    evaluateDetections(s);
    expect(c.status).toBe('inspection');
    expect(c.detectionSignal).toEqual(snapshot);
    applyDetectionSample(s, 'D', 'missing');
    evaluateDetections(s);
    expect(c.status).toBe('inspection');
    expect(c.detectionSignal).toEqual(snapshot);
  });
  it('does not produce a case for a disconnected source even when a sample rises', () => {
    const next = transition(createFixture(), {
      type: 'detection_sample',
      zoneId: 'E',
      sample: 'rising',
    }).data;
    expect(assessDetection(next, 'E').status).toBe('unavailable');
    expect(next.cases.some((c) => c.zoneId === 'E')).toBe(false);
  });
  it('isolates the incoming sample and case to the active greenhouse', () => {
    const store = createDomainStore();
    store.getState().dispatch({ type: 'detection_sample', zoneId: 'D', sample: 'rising' });
    store.getState().switchGreenhouse('GH-02');
    expect(assessDetection(store.getState().data, 'D').status).toBe('normal');
    expect(store.getState().data.cases.some((c) => c.zoneId === 'D' && c.status !== 'closed')).toBe(
      false,
    );
    store.getState().switchGreenhouse('GH-01');
    expect(assessDetection(store.getState().data, 'D').linkedCase?.status).toBe('inspection');
  });
  it('limits sample controls and case evaluation according to existing permissions', () => {
    expect(actionPermission({ type: 'detection_sample', zoneId: 'D', sample: 'rising' })).toBe(
      'automation',
    );
    expect(actionPermission({ type: 'evaluate_detection' })).toBe('inspection');
    expect(can('Viewer', 'inspection')).toBe(false);
    expect(can('Operator', 'automation')).toBe(false);
  });
});
