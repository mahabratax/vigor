import { z } from 'zod';

export const BRIEF_VERSION = 'vigor-brief-v1';
export const BRIEF_TTL = 15 * 60;
const id = z.string().min(1).max(300);
const text = (max: number) => z.string().trim().min(1).max(max);
const hash = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const evidenceSchema = z.object({ id, label: text(160), value: text(1200) }).strict();
export const findingSchema = z
  .object({
    id,
    sourceHash: hash,
    title: text(200),
    reason: text(1600),
    focus: z
      .array(z.enum(['health', 'resources', 'business']))
      .min(1)
      .max(3),
    impact: z.object({ value: text(200), label: text(200), detail: text(1000) }).strict(),
    evidence: z.array(evidenceSchema).min(1).max(12),
    availableActions: z.array(text(160)).max(6),
    verification: text(1600),
    followUpStatus: z.enum(['not_assigned', 'pending', 'done']),
  })
  .strict();
const contextSchema = z
  .object({
    crops: z
      .array(
        z
          .object({
            zoneId: id,
            crop: text(160).nullable(),
            stage: text(100).nullable(),
            reviewedTarget: z.boolean(),
          })
          .strict(),
      )
      .max(100),
    usableReadings: z.number().int().nonnegative(),
    totalReadings: z.number().int().nonnegative(),
    liveTelemetryConnected: z.literal(false),
    physicalExecution: z.literal(false),
    omittedFindings: z.number().int().nonnegative(),
  })
  .strict();
export const briefSnapshotSchema = z
  .object({
    contractVersion: z.literal(BRIEF_VERSION),
    snapshotId: hash,
    greenhouseId: id,
    cycleId: id,
    workspaceRevision: z.number().int().nonnegative(),
    capturedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    context: contextSchema,
    findings: z.array(findingSchema).max(24),
  })
  .strict();
export type BriefSnapshot = z.infer<typeof briefSnapshotSchema>;
export const briefRequestSchema = z
  .object({
    question: text(300),
    snapshot: briefSnapshotSchema,
  })
  .strict();
export const generatedBriefSchema = z
  .object({
    answer: text(1500),
    priorities: z
      .array(
        z
          .object({
            findingId: id,
            why: text(1000),
            evidenceIds: z.array(id).min(1).max(12),
            uncertainty: text(600),
          })
          .strict(),
      )
      .max(3),
    followUpQuestion: z.string().max(250),
  })
  .strict();
export type GeneratedBrief = z.infer<typeof generatedBriefSchema>;
export const briefResponseSchema = generatedBriefSchema
  .extend({
    contractVersion: z.literal(BRIEF_VERSION),
    snapshotId: hash,
    provider: z.literal('google-gemini'),
    model: text(100),
    requestId: id,
    generatedAt: z.string().datetime(),
    latencyMs: z.number().int().nonnegative(),
    usage: z
      .object({
        inputTokens: z.number().int().nonnegative().nullable(),
        outputTokens: z.number().int().nonnegative().nullable(),
        totalTokens: z.number().int().nonnegative().nullable(),
      })
      .strict(),
  })
  .strict();
export type BriefResponse = z.infer<typeof briefResponseSchema>;

/** Stable JSON: both runtimes hash the exact same values, independent of key order. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object')
    return `{${Object.entries(value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`)
      .join(',')}}`;
  return JSON.stringify(value);
}
export async function digest(value: unknown) {
  const data = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(canonicalJson(value)),
  );
  return `sha256:${Array.from(new Uint8Array(data), (n) => n.toString(16).padStart(2, '0')).join('')}`;
}
export function assertSnapshotTime(snapshot: BriefSnapshot, now: number) {
  const captured = Date.parse(snapshot.capturedAt) / 1000;
  const expires = Date.parse(snapshot.expiresAt) / 1000;
  if (
    !Number.isFinite(now) ||
    now < captured - 30 ||
    now > expires ||
    expires - captured !== BRIEF_TTL
  )
    throw new Error('This analysis has expired. Ask again using the latest records.');
}
export async function verifySnapshot(snapshot: BriefSnapshot, now: number) {
  assertSnapshotTime(snapshot, now);
  const { snapshotId, ...data } = snapshot;
  if ((await digest(data)) !== snapshotId)
    throw new Error('The analysis input is incomplete. Ask again.');
  const ids = snapshot.findings.map((f) => f.id);
  const evidence = snapshot.findings.flatMap((f) => f.evidence.map((e) => e.id));
  if (new Set(ids).size !== ids.length || new Set(evidence).size !== evidence.length)
    throw new Error('Duplicate evidence identifiers. Refresh the workspace.');
}
/** Structural grounding is enforced; prose still needs human review. */
export function validateGrounding(raw: unknown, snapshot: BriefSnapshot): GeneratedBrief {
  const response = generatedBriefSchema.parse(raw);
  const seen = new Set<string>();
  for (const item of response.priorities) {
    const finding = snapshot.findings.find((f) => f.id === item.findingId);
    if (!finding || seen.has(item.findingId))
      throw new Error('Gemini returned an unavailable or duplicate finding.');
    seen.add(item.findingId);
    if (
      new Set(item.evidenceIds).size !== item.evidenceIds.length ||
      item.evidenceIds.some((id) => !finding.evidence.some((e) => e.id === id))
    )
      throw new Error('Gemini returned a reference that does not match the finding.');
  }
  return response;
}
export function validateBrief(
  raw: unknown,
  snapshot: BriefSnapshot,
  current: {
    greenhouseId: string;
    cycleId: string;
    revision: number;
    now: number;
  },
): BriefResponse {
  assertSnapshotTime(snapshot, current.now);
  if (
    snapshot.greenhouseId !== current.greenhouseId ||
    snapshot.cycleId !== current.cycleId ||
    snapshot.workspaceRevision !== current.revision
  )
    throw new Error('Records changed. Ask Gemini again before taking action.');
  const response = briefResponseSchema.parse(raw);
  if (response.snapshotId !== snapshot.snapshotId)
    throw new Error('Gemini answered a different analysis request.');
  const { answer, priorities, followUpQuestion } = response;
  validateGrounding({ answer, priorities, followUpQuestion }, snapshot);
  return response;
}
