import { z } from 'zod';
import type { DomainState } from '../../domain/types';
import {
  assessStoredReading,
  SENSOR_MAX_AGE_SECONDS,
  SENSOR_METRICS,
} from '../../domain/telemetry';
import { activeTarget } from '../../domain/cropTargets';
import { checkRoutineGuards, validateRoutine } from '../../domain/scheduler';

export const AI_CONTRACT_VERSION = 'vigor-actions-v1';
export const AI_RESPONSE_TTL_SECONDS = 15 * 60;
export const AI_PROVIDER_STATUS = 'not_configured' as const;
const id = z.string().min(1).max(200);
const recommendationSchema = z
  .object({
    id,
    zoneId: id,
    priority: z.enum(['high', 'medium', 'low']),
    title: z.string().trim().min(1).max(160),
    reason: z.string().trim().min(1).max(1500),
    evidenceIds: z.array(id).min(1).max(20),
    uncertainty: z.string().trim().min(1).max(500),
    action: z
      .object({
        kind: z.enum(['inspect_zone', 'review_device', 'review_routine', 'observe']),
        deviceId: id.optional(),
        routineId: id.optional(),
      })
      .strict(),
  })
  .strict();
export const aiResponseSchema = z
  .object({
    contractVersion: z.literal(AI_CONTRACT_VERSION),
    snapshotId: id,
    model: z.string().min(1).max(100),
    recommendations: z.array(recommendationSchema).max(12),
  })
  .strict();
export type AiResponse = z.infer<typeof aiResponseSchema>;
export type AiInput = ReturnType<typeof buildAiInput>;
export type AiSnapshot = AiInput & { snapshotId: string };

/** Read-only projection, not another operational database. Export contains no
 * member identities, customer names, device credentials, attachments or balances. */
export function buildAiInput(
  s: DomainState,
  revision: number,
  now = Math.floor(Date.now() / 1000),
) {
  if (!Number.isSafeInteger(revision) || revision < 0 || !Number.isFinite(now))
    throw new Error('Invalid workspace revision or analysis time.');
  const context = { ...s, clock: now };
  const activeZones = s.zones
    .filter((z) => z.status !== 'inactive')
    .sort((a, b) => a.id.localeCompare(b.id));
  const zoneIds = new Set(activeZones.map((z) => z.id));
  const devices = s.devices.filter(
    (d) => d.active && (d.zones.length === 0 || d.zones.some((id) => zoneIds.has(id))),
  );
  const readings = devices
    .flatMap((d) =>
      SENSOR_METRICS.filter((metric) => d.capabilities.includes(metric)).map((metric) => {
        const result = assessStoredReading(context, d.id, metric, now);
        return {
          id: `reading:${d.id}:${metric}`,
          readingId: result.reading?.id ?? null,
          deviceId: d.id,
          zoneIds: d.zones.filter((id) => zoneIds.has(id)),
          metric,
          value: result.value,
          unit: result.unit,
          capturedAt: result.reading?.capturedAt ?? null,
          ageSeconds: result.ageSeconds,
          quality: result.quality,
          provenance: result.reading?.provenance ?? 'none',
        };
      }),
    )
    .sort((a, b) => a.id.localeCompare(b.id));
  const cases = s.cases
    .filter((c) => c.status !== 'closed' && zoneIds.has(c.zoneId))
    .map((c) => ({
      id: `case:${c.id}`,
      caseId: c.id,
      zoneId: c.zoneId,
      status: c.status,
      verified: c.verified,
      createdAt: c.createdAt,
      inspections: s.inspections
        .filter((i) => i.caseId === c.id)
        .map((i) => ({
          id: i.id,
          at: i.at,
          examined: i.examined,
          affected: i.affected,
          outcome: i.outcome,
        })),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
  return {
    contractVersion: AI_CONTRACT_VERSION,
    greenhouseId: s.greenhouse.id,
    workspaceRevision: revision,
    capturedAt: new Date(now * 1000).toISOString(),
    expiresAt: new Date((now + AI_RESPONSE_TTL_SECONDS) * 1000).toISOString(),
    locale: 'en',
    timeZone: 'Asia/Jakarta',
    mode: 'advisory_only',
    policy: {
      sensorMaxAgeSeconds: SENSOR_MAX_AGE_SECONDS,
      physicalExecution: false,
      automaticChemicalActions: false,
    },
    zones: activeZones.map((zone) => {
      const batch = s.cultivation?.batches.find(
        (b) => b.zoneId === zone.id && b.status === 'active',
      );
      const target = activeTarget(s, zone.id);
      return {
        id: zone.id,
        name: zone.name,
        validated: zone.validated,
        areaSquareMeters: zone.area,
        batch: batch
          ? {
              id: batch.id,
              crop: batch.crop,
              variety: batch.variety,
              stage: batch.stage,
              plants: batch.currentPlants,
            }
          : null,
        target: target
          ? {
              id: target.id,
              version: target.version,
              limits: structuredClone(target.limits),
              reviewedAt: target.reviewedAt,
            }
          : null,
      };
    }),
    devices: devices.map((d) => ({
      id: d.id,
      zoneIds: [...d.zones],
      connection: d.connection,
      calibrated: d.calibrated,
      maintenance: d.maintenance,
    })),
    readings,
    cases,
    routines: s.routines
      .filter((r) => r.version.zones.every((id) => zoneIds.has(id)))
      .map((r) => ({
        id: r.id,
        versionId: r.version.id,
        zoneIds: [...r.version.zones],
        status: r.status,
        reviewed: r.version.reviewed,
        policy: r.policy,
        blockers: [
          ...validateRoutine(context, r),
          ...[checkRoutineGuards(context, r)].filter((x): x is string => !!x),
        ],
      })),
    readiness: {
      usableReadings: readings.filter((r) => r.quality === 'ready').length,
      totalReadings: readings.length,
      missingTargets: activeZones
        .filter((zone) => !activeTarget(s, zone.id))
        .map((zone) => zone.id),
      liveTelemetryConnected: false,
      providerStatus: AI_PROVIDER_STATUS,
    },
  };
}
export async function createAiSnapshot(
  s: DomainState,
  revision: number,
  now?: number,
): Promise<AiSnapshot> {
  const input = buildAiInput(s, revision, now);
  const bytes = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(JSON.stringify(input)),
  );
  const hash = Array.from(new Uint8Array(bytes), (x) => x.toString(16).padStart(2, '0')).join('');
  return { ...input, snapshotId: `sha256:${hash}` };
}
/** Revalidate against current workspace scope/revision before even showing a response.
 * Passing this gate never grants authority to execute a device command. */
export function validateAiResponse(
  raw: unknown,
  snapshot: AiSnapshot,
  current: {
    greenhouseId: string;
    revision: number;
    now: number;
  },
): AiResponse {
  const response = aiResponseSchema.parse(raw);
  if (
    snapshot.greenhouseId !== current.greenhouseId ||
    snapshot.workspaceRevision !== current.revision
  )
    throw new Error('Workspace changed. Create a new analysis snapshot.');
  if (
    !Number.isFinite(current.now) ||
    current.now * 1000 < Date.parse(snapshot.capturedAt) ||
    current.now * 1000 > Date.parse(snapshot.expiresAt)
  )
    throw new Error('Analysis snapshot expired. Review the latest inputs.');
  if (response.snapshotId !== snapshot.snapshotId)
    throw new Error('AI response does not match the input snapshot.');
  const ids = new Set<string>();
  const evidence = new Map<string, string[]>([
    ...snapshot.readings.map((r) => [r.id, r.zoneIds] as [string, string[]]),
    ...snapshot.cases.map((c) => [c.id, [c.zoneId]] as [string, string[]]),
  ]);
  for (const item of response.recommendations) {
    if (ids.has(item.id)) throw new Error('Duplicate recommendation ID.');
    ids.add(item.id);
    if (!snapshot.zones.some((z) => z.id === item.zoneId))
      throw new Error('Recommendation refers to an unavailable zone.');
    if (
      new Set(item.evidenceIds).size !== item.evidenceIds.length ||
      item.evidenceIds.some(
        (id) =>
          !evidence.has(id) ||
          (evidence.get(id)!.length > 0 && !evidence.get(id)!.includes(item.zoneId)),
      )
    )
      throw new Error('Recommendation evidence is missing or belongs to another zone.');
    const action = item.action;
    if (action.kind === 'review_device') {
      const device = snapshot.devices.find((d) => d.id === action.deviceId);
      if (
        !device ||
        (device.zoneIds.length && !device.zoneIds.includes(item.zoneId)) ||
        action.routineId
      )
        throw new Error('Device review target is invalid.');
    } else if (action.kind === 'review_routine') {
      const routine = snapshot.routines.find((r) => r.id === action.routineId);
      if (!routine || !routine.zoneIds.includes(item.zoneId) || action.deviceId)
        throw new Error('Routine review target is invalid.');
    } else if (action.deviceId || action.routineId) throw new Error('Unexpected action target.');
  }
  return response;
}
export interface AiProvider {
  analyze(input: AiSnapshot, signal?: AbortSignal): Promise<unknown>;
}
export const unconfiguredAiProvider: AiProvider = {
  async analyze() {
    throw new Error('AI is not connected. Configure a server-side Gemini integration first.');
  },
};
/** Future Google Cloud gateway contract. The browser never accepts or stores an API key.
 * The gateway must authenticate, authorize scope and apply rate limits independently. */
export async function analyzeSnapshot(
  provider: AiProvider,
  snapshot: AiSnapshot,
  getCurrent: () => { greenhouseId: string; revision: number; now: number },
  signal?: AbortSignal,
) {
  const raw = await provider.analyze(snapshot, signal);
  if (signal?.aborted) throw new Error('Analysis cancelled.');
  return validateAiResponse(raw, snapshot, getCurrent());
}
