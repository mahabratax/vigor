import { describe, expect, it, vi } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { materialize } from '../db/codec';
import { addStarterRecords } from '../src/data/starterRecords';
import { createBriefSnapshot } from '../src/features/ai/briefInput';
import {
  canonicalJson,
  digest,
  verifySnapshot,
  validateBrief,
  validateGrounding,
} from '../src/features/ai/briefContract';
import { createAiHandler } from '../server/ai/handler';
import { generateBrief } from '../server/ai/gemini';

async function fixture() {
  const s = materialize(createFixture());
  addStarterRecords({ [s.greenhouse.id]: s });
  return { s, snapshot: await createBriefSnapshot(s, 4) };
}
function output(snapshot: Awaited<ReturnType<typeof fixture>>['snapshot']) {
  const f = snapshot.findings[0];
  return {
    answer: 'Inspect the recorded case before reviewing the linked harvest.',
    priorities: [
      {
        findingId: f.id,
        why: 'This case links plant care to harvest review.',
        evidenceIds: [f.evidence[0].id],
        uncertainty: 'The record does not establish current field conditions.',
      },
    ],
    followUpQuestion: 'Has a new inspection been recorded?',
  };
}
const config = {
  apiKey: 'unit-test-secret',
  model: 'gemini-test-model',
  hosting: 'cloud-run' as const,
};
const upstream = (data: unknown, finishReason = 'STOP') =>
  new Response(
    JSON.stringify({
      candidates: [{ finishReason, content: { parts: [{ text: JSON.stringify(data) }] } }],
      usageMetadata: { promptTokenCount: 700, candidatesTokenCount: 180, totalTokenCount: 980 },
    }),
  );
const post = (data: unknown, headers: Record<string, string> = {}) =>
  new Request('https://vigor.example/api/ai/brief', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'https://vigor.example', ...headers },
    body: JSON.stringify(data),
  });
describe('Gemini input projection and response grounding', () => {
  it('excludes profiles, buyer names, notes and raw source fingerprints while retaining linked facts', async () => {
    const { s, snapshot } = await fixture();
    const text = JSON.stringify(snapshot);
    for (const sale of s.production!.sales) expect(text).not.toContain(sale.buyer);
    expect(text).not.toContain('fingerprint');
    expect(snapshot.findings.some((f) => f.id.includes(':case:'))).toBe(true);
    expect(snapshot.findings.some((f) => f.id.includes(':sale:'))).toBe(true);
    expect(snapshot.context.liveTelemetryConnected).toBe(false);
    await expect(verifySnapshot(snapshot, Date.now() / 1000)).resolves.toBeUndefined();
    expect(canonicalJson({ b: 2, a: 1 })).toBe(canonicalJson({ a: 1, b: 2 }));
  });
  it('rejects tampered or expired snapshots and duplicate records', async () => {
    const { snapshot } = await fixture();
    await expect(
      verifySnapshot({ ...snapshot, greenhouseId: 'other' }, Date.now() / 1000),
    ).rejects.toThrow('incomplete');
    await expect(
      verifySnapshot(snapshot, Date.parse(snapshot.expiresAt) / 1000 + 1),
    ).rejects.toThrow('expired');
    const { snapshotId, ...data } = {
      ...snapshot,
      findings: [snapshot.findings[0], snapshot.findings[0]],
    };
    await expect(
      verifySnapshot({ ...data, snapshotId: await digest(data) }, Date.now() / 1000),
    ).rejects.toThrow('Duplicate');
  });
  it('rejects unknown findings, another finding’s evidence, duplicate priorities and invented command fields', async () => {
    const { snapshot } = await fixture();
    const valid = output(snapshot);
    expect(validateGrounding(valid, snapshot)).toEqual(valid);
    const replace = (patch: object) => ({
      ...valid,
      priorities: [{ ...valid.priorities[0], ...patch }],
    });
    expect(() => validateGrounding(replace({ findingId: 'foreign' }), snapshot)).toThrow();
    expect(() =>
      validateGrounding(replace({ evidenceIds: [snapshot.findings[1].evidence[0].id] }), snapshot),
    ).toThrow();
    expect(() =>
      validateGrounding(
        { ...valid, priorities: [valid.priorities[0], valid.priorities[0]] },
        snapshot,
      ),
    ).toThrow();
    expect(() => validateGrounding(replace({ execute: 'spray' }), snapshot)).toThrow();
  });
});
describe('real provider path with mocked Google transport (not live model evaluation)', () => {
  it('posts to the fixed Google endpoint, stamps metadata and keeps credentials out of responses', async () => {
    const { snapshot } = await fixture();
    const fetcher = vi.fn(async () => upstream(output(snapshot)));
    const handler = createAiHandler(config, fetcher as typeof fetch);
    const r = await handler(
      post({ question: 'What should I do before selling harvest?', snapshot }),
    );
    expect(r.status).toBe(200);
    const data = (await r.json()) as any;
    expect(data).toMatchObject({
      provider: 'google-gemini',
      model: config.model,
      snapshotId: snapshot.snapshotId,
      usage: { totalTokens: 980 },
    });
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-test-model:generateContent',
    );
    expect(url).not.toContain(config.apiKey);
    expect(new Headers(init.headers).get('x-goog-api-key')).toBe(config.apiKey);
    expect(JSON.stringify(data)).not.toContain(config.apiKey);
    const current = {
      greenhouseId: snapshot.greenhouseId,
      cycleId: snapshot.cycleId,
      revision: 4,
      now: Date.now() / 1000,
    };
    expect(validateBrief(data, snapshot, current)).toEqual(data);
    for (const changed of [{ revision: 5 }, { greenhouseId: 'other' }, { cycleId: 'old' }])
      expect(() => validateBrief(data, snapshot, { ...current, ...changed })).toThrow(
        'Records changed',
      );
    expect(() =>
      validateBrief({ ...data, snapshotId: 'sha256:' + '0'.repeat(64) }, snapshot, current),
    ).toThrow('different');
  });
  it.each([429, 401, 403, 404, 500])('redacts upstream failure %s', async (status) => {
    const { snapshot } = await fixture();
    const handler = createAiHandler(
      config,
      vi.fn(
        async () => new Response('private upstream ' + config.apiKey, { status }),
      ) as typeof fetch,
    );
    const r = await handler(post({ question: 'Why?', snapshot }));
    expect(r.status).toBe(status === 429 ? 429 : status === 500 ? 502 : 503);
    expect(await r.text()).not.toContain(config.apiKey);
  });
  it('rejects blocked, truncated, non-JSON and ungrounded provider answers', async () => {
    const { snapshot } = await fixture();
    for (const response of [
      upstream(output(snapshot), 'MAX_TOKENS'),
      upstream(output(snapshot), 'SAFETY'),
      new Response('bad JSON'),
      upstream({
        ...output(snapshot),
        priorities: [{ ...output(snapshot).priorities[0], findingId: 'invented' }],
      }),
    ]) {
      await expect(
        generateBrief(
          config,
          'Why?',
          snapshot,
          undefined,
          vi.fn(async () => response) as typeof fetch,
        ),
      ).rejects.toThrow();
    }
  });
  it('rejects cross-origin, unconfigured, oversized and malformed requests before sending data', async () => {
    const { snapshot } = await fixture(),
      fetcher = vi.fn();
    const handler = createAiHandler(config, fetcher);
    expect(
      (await handler(post({ question: 'Why?', snapshot }, { Origin: 'https://other.example' })))
        .status,
    ).toBe(403);
    expect(
      (
        await createAiHandler(
          { ...config, apiKey: '' },
          fetcher,
        )(post({ question: 'Why?', snapshot }))
      ).status,
    ).toBe(503);
    expect((await handler(post({ padding: 'x'.repeat(100 * 1024) }))).status).toBe(413);
    expect(
      (await handler(post({ question: 'Why?', snapshot: { ...snapshot, extra: 'invalid' } })))
        .status,
    ).toBe(400);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it('reports configured without claiming a live-verified model call, and limits requests', async () => {
    const { snapshot } = await fixture();
    const fetcher = vi.fn(async () => upstream(output(snapshot)));
    const handler = createAiHandler(config, fetcher as typeof fetch);
    const status = await handler(new Request('https://vigor.example/api/ai/status'));
    expect(await status.json()).toMatchObject({ configured: true, liveVerified: false });
    for (let i = 0; i < 12; i++)
      expect((await handler(post({ question: 'Why?', snapshot }))).status).toBe(200);
    const limited = await handler(post({ question: 'Why?', snapshot }));
    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBe('60');
    expect(fetcher).toHaveBeenCalledTimes(12);
  });
  it('supports cancellation without fallback fabricated answers', async () => {
    const { snapshot } = await fixture(),
      controller = new AbortController();
    controller.abort();
    await expect(
      generateBrief(
        config,
        'Why?',
        snapshot,
        controller.signal,
        vi.fn(async () => {
          throw new DOMException('Aborted', 'AbortError');
        }) as typeof fetch,
      ),
    ).rejects.toThrow('cancelled');
  });
});
