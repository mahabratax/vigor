import type { DomainState } from '../../domain/types';
import { assistantIssues } from '../../domain/assistant';
import { buildAiInput } from './foundation';
import {
  BRIEF_VERSION,
  BRIEF_TTL,
  briefSnapshotSchema,
  digest,
  type BriefSnapshot,
} from './briefContract';

/** Explicit projection: no customer names, staff identities, task notes, images,
 * raw source fingerprints or database export. Financial record amounts ARE included. */
export async function createBriefSnapshot(
  s: DomainState,
  revision: number,
  now = Math.floor(Date.now() / 1000),
): Promise<BriefSnapshot> {
  const input = buildAiInput(s, revision, now);
  const issues = assistantIssues({ ...s, clock: now }).filter((i) => !i.resolved);
  const clip = (value: string, max: number) => value.slice(0, max) || 'Not recorded';
  const findings = await Promise.all(
    issues.slice(0, 24).map(async (i) => ({
      id: i.id,
      sourceHash: await digest(i.fingerprint),
      // Buyer identity is only resolved by the UI after a validated response.
      title: clip(
        i.id.includes(':sale:') ? `Follow up sale ${i.id.split(':sale:')[1]}` : i.title,
        200,
      ),
      reason: clip(i.reason, 1600),
      focus: i.focus,
      impact: {
        value: clip(i.impact.value, 200),
        label: clip(i.impact.label, 200),
        detail: clip(i.impact.detail, 1000),
      },
      evidence: i.evidence.slice(0, 12).map((e, n) => ({
        id: `${i.id}:e${n}`,
        label: clip(e.label, 160),
        value: clip(e.value, 1200),
      })),
      availableActions: i.actions.map((a) => a.label).slice(0, 6),
      verification: clip(i.verification, 1600),
      followUpStatus: i.task?.status ?? ('not_assigned' as const),
    })),
  );
  const data = {
    contractVersion: BRIEF_VERSION,
    greenhouseId: s.greenhouse.id,
    cycleId: s.cycle.id,
    workspaceRevision: revision,
    capturedAt: new Date(now * 1000).toISOString(),
    expiresAt: new Date((now + BRIEF_TTL) * 1000).toISOString(),
    context: {
      crops: input.zones.map((z) => ({
        zoneId: z.id,
        crop: z.batch?.crop ?? null,
        stage: z.batch?.stage ?? null,
        reviewedTarget: !!z.target,
      })),
      usableReadings: input.readiness.usableReadings,
      totalReadings: input.readiness.totalReadings,
      liveTelemetryConnected: false as const,
      physicalExecution: false as const,
      omittedFindings: Math.max(0, issues.length - findings.length),
    },
    findings,
  };
  const parsed = briefSnapshotSchema.parse({ ...data, snapshotId: `sha256:${'0'.repeat(64)}` });
  const { snapshotId: _, ...normalized } = parsed;
  return { ...normalized, snapshotId: await digest(normalized) };
}
