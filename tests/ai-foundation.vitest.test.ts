import { describe, expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { materialize } from '../db/codec';
import { assessStoredReading, sensorValue } from '../src/domain/telemetry';
import { metricReading } from '../src/domain/cropTargets';
import { previewRoutine } from '../src/domain/routinePreview';
import {
  buildAiInput,
  createAiSnapshot,
  validateAiResponse,
  analyzeSnapshot,
  unconfiguredAiProvider,
  AI_CONTRACT_VERSION,
} from '../src/features/ai/foundation';
function state() {
  const s = materialize(createFixture());
  for (const d of s.devices) {
    d.connection = 'online';
    d.calibrated = true;
    d.maintenance = false;
  }
  s.readings = [
    {
      id: 'old',
      deviceId: 'MEDIA-A',
      metric: 'media',
      value: 22,
      unit: '%',
      capturedAt: new Date((s.clock - 120) * 1000).toISOString(),
      provenance: 'initial_import',
    },
    {
      id: 'new',
      deviceId: 'MEDIA-A',
      metric: 'media',
      value: 47,
      unit: '%',
      capturedAt: new Date((s.clock - 60) * 1000).toISOString(),
      provenance: 'initial_import',
    },
  ];
  return s;
}
describe('stored sensor evidence', () => {
  it('selects the newest reading by device and metric, independent of row order', () => {
    const s = state();
    expect(sensorValue(s, 'MEDIA-A')).toBe(47);
    s.readings!.reverse();
    expect(sensorValue(s, 'MEDIA-A')).toBe(47);
    expect(metricReading(s, 'MEDIA-A', 'media').value).toBe(47);
  });
  it.each([
    ['null', { value: null }, 'missing'],
    ['wrong unit', { unit: '°C' }, 'invalid'],
    ['nonfinite', { value: NaN }, 'invalid'],
    ['out of range', { value: 101 }, 'invalid'],
    ['invalid timestamp', { capturedAt: 'invalid' }, 'invalid'],
  ])('does not fall back when newest reading has %s', (_, patch, quality) => {
    const s = state();
    Object.assign(s.readings![1], patch);
    expect(assessStoredReading(s, 'MEDIA-A', 'media')).toMatchObject({ value: null, quality });
  });
  it('distinguishes a measured zero from missing and stale readings', () => {
    const s = state();
    s.readings![1].value = 0;
    expect(sensorValue(s, 'MEDIA-A')).toBe(0);
    expect(assessStoredReading(s, 'MEDIA-A', 'media', s.clock + 1801).quality).toBe('stale');
    expect(assessStoredReading(s, 'MEDIA-A', 'media', s.clock - 90).quality).toBe('future');
  });
  it('reads humidity from the stored metric rather than a zone placeholder', () => {
    const s = state();
    s.zones[0].humidity = 99;
    s.readings!.push({
      id: 'rh',
      deviceId: 'TH-A-01',
      metric: 'humidity',
      value: 58,
      unit: '%',
      capturedAt: new Date(s.clock * 1000).toISOString(),
      provenance: 'initial_import',
    });
    expect(sensorValue(s, 'TH-A-01', 'humidity')).toBe(58);
    expect(metricReading(s, 'TH-A-01', 'humidity').value).toBe(58);
  });
  it('rejects unavailable, uncalibrated and maintenance devices', () => {
    const s = state(),
      d = s.devices.find((d) => d.id === 'MEDIA-A')!;
    d.calibrated = false;
    expect(sensorValue(s, d.id)).toBeNull();
    d.calibrated = true;
    d.maintenance = true;
    expect(sensorValue(s, d.id)).toBeNull();
    d.maintenance = false;
    d.connection = 'offline';
    expect(sensorValue(s, d.id)).toBeNull();
  });
});
describe('AI boundary', () => {
  const raw = (snapshot: Awaited<ReturnType<typeof createAiSnapshot>>) => ({
    contractVersion: AI_CONTRACT_VERSION,
    snapshotId: snapshot.snapshotId,
    model: 'test-provider',
    recommendations: [
      {
        id: 'R-1',
        zoneId: 'A',
        priority: 'medium',
        title: 'Review the sensor',
        reason: 'Confirm the recorded reading before scheduling irrigation.',
        evidenceIds: ['reading:MEDIA-A:media'],
        uncertainty: 'No live telemetry connection.',
        action: { kind: 'review_device', deviceId: 'MEDIA-A' },
      },
    ],
  });
  it('exports a detached, selected-greenhouse snapshot without member or payment data', async () => {
    const s = state(),
      before = JSON.stringify(s);
    const snapshot = await createAiSnapshot(s, 3, s.clock);
    expect(snapshot.snapshotId).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(snapshot.policy.physicalExecution).toBe(false);
    expect(snapshot.readiness.providerStatus).toBe('not_configured');
    expect(JSON.stringify(snapshot)).not.toContain('Budi Santoso');
    expect(snapshot).not.toHaveProperty('expenses');
    expect(JSON.stringify(s)).toBe(before);
    expect((await createAiSnapshot(s, 3, s.clock)).snapshotId).toBe(snapshot.snapshotId);
    expect(buildAiInput(s, 3, s.clock + 86400).readiness.usableReadings).toBe(0);
  });
  it('accepts scoped advisory output and rejects stale, mismatched or invented evidence', async () => {
    const s = state(),
      snapshot = await createAiSnapshot(s, 3, s.clock);
    const current = { greenhouseId: s.greenhouse.id, revision: 3, now: s.clock };
    expect(validateAiResponse(raw(snapshot), snapshot, current).recommendations).toHaveLength(1);
    for (const patch of [{ greenhouseId: 'GH-02' }, { revision: 4 }, { now: s.clock + 901 }])
      expect(() => validateAiResponse(raw(snapshot), snapshot, { ...current, ...patch })).toThrow();
    const invented = raw(snapshot);
    invented.recommendations[0].evidenceIds = ['not-real'];
    expect(() => validateAiResponse(invented, snapshot, current)).toThrow(/evidence/);
    const otherZone = raw(snapshot);
    otherZone.recommendations[0].zoneId = 'B';
    expect(() => validateAiResponse(otherZone, snapshot, current)).toThrow();
    const duplicate = raw(snapshot);
    duplicate.recommendations.push(duplicate.recommendations[0]);
    expect(() => validateAiResponse(duplicate, snapshot, current)).toThrow(/Duplicate/);
    const command = raw(snapshot);
    (command.recommendations[0].action as any).dose = 5;
    expect(() => validateAiResponse(command, snapshot, current)).toThrow();
  });
  it('does not fabricate analysis without credentials and rechecks revision after a provider returns', async () => {
    const s = state(),
      snapshot = await createAiSnapshot(s, 3, s.clock);
    const current = () => ({ greenhouseId: s.greenhouse.id, revision: 4, now: s.clock });
    await expect(analyzeSnapshot(unconfiguredAiProvider, snapshot, current)).rejects.toThrow(
      /not connected/,
    );
    await expect(
      analyzeSnapshot(
        {
          async analyze() {
            return raw(snapshot);
          },
        },
        snapshot,
        current,
      ),
    ).rejects.toThrow(/changed/);
  });
  it('previews existing rules without creating an execution or accounting activity', () => {
    const s = state(),
      before = JSON.stringify(s);
    const result = previewRoutine(s, s.routines[0].id, s.clock);
    expect(result.status).toBe('blocked');
    expect(result.blockers.some((b) => b.includes('reading'))).toBe(true);
    expect(result.physicalExecution).toBe(false);
    expect(JSON.stringify(s)).toBe(before);
  });
});

it('keeps legacy database values stable while presenting and searching English labels', async () => {
  const { displayLabel, matchesSearch } = await import('../src/i18n/display');
  const original = {
    category: 'Nutrisi',
    stage: 'Generatif',
    name: 'Kamera B-02',
    note: 'Catatan pribadi Aldi',
  };
  expect(displayLabel(original.category)).toBe('Nutrients');
  expect(displayLabel(original.stage)).toBe('Reproductive');
  expect(displayLabel(original.name)).toBe('Camera B-02');
  expect(matchesSearch('camera b-02', original.name)).toBe(true);
  expect(matchesSearch('kamera b-02', original.name)).toBe(true);
  expect(displayLabel(original.note)).toBe(original.note);
  expect(original).toEqual({
    category: 'Nutrisi',
    stage: 'Generatif',
    name: 'Kamera B-02',
    note: 'Catatan pribadi Aldi',
  });
});
