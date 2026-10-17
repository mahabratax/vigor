import { briefRequestSchema, verifySnapshot } from '../../src/features/ai/briefContract';
import { generateBrief, GatewayError, type GeminiConfig } from './gemini';

export interface AiRuntime extends GeminiConfig {
  hosting: 'cloud-run' | 'sites';
}
export const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extra,
    },
  });

/** One private Cloud Run service shares this budget across all callers on its instance.
 * IAM controls access. This limiter is an extra cost guard, not user authentication. */
export function createAiHandler(config: AiRuntime, fetcher: typeof fetch = fetch) {
  let windowStart = 0,
    used = 0,
    inflight = 0;
  const configured = !!config.apiKey && /^gemini-[a-zA-Z0-9._-]+$/.test(config.model);
  return async function handleAi(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/api/ai/status' && request.method === 'GET')
      return json({
        provider: 'google-gemini',
        configured,
        model: configured ? config.model : null,
        hosting: config.hosting,
        liveVerified: false,
        message: configured
          ? 'Configured. A successful analysis will verify model access.'
          : config.hosting === 'sites'
            ? 'Gemini runs on the separate Google Cloud deployment. This private Site uses local records.'
            : 'Configure the Gemini API key and model in the Cloud Run service.',
      });
    if (url.pathname !== '/api/ai/brief') return json({ error: 'API route not found.' }, 404);
    if (request.method !== 'POST')
      return json({ error: 'Use POST for analysis.' }, 405, { Allow: 'POST' });
    const origin = request.headers.get('origin');
    if ((origin && origin !== url.origin) || request.headers.get('sec-fetch-site') === 'cross-site')
      return json(
        { error: 'Open the assistant from this deployment.', code: 'origin_mismatch' },
        403,
      );
    if (!configured)
      return json(
        { error: 'Gemini is not configured on this deployment.', code: 'not_configured' },
        503,
      );
    if (!request.headers.get('content-type')?.startsWith('application/json'))
      return json({ error: 'Expected a JSON analysis request.' }, 415);
    if (Number(request.headers.get('content-length')) > 96 * 1024)
      return json({ error: 'The selected records are too large for one analysis.' }, 413);
    let parsed;
    try {
      // Read with a real byte bound; Content-Length alone is not trusted.
      const reader = request.body?.getReader();
      const chunks: Uint8Array[] = [];
      let size = 0;
      if (reader)
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          size += value.byteLength;
          if (size > 96 * 1024) {
            await reader.cancel();
            return json({ error: 'Analysis input is too large.' }, 413);
          }
          chunks.push(value);
        }
      const bytes = new Uint8Array(size);
      let offset = 0;
      for (const c of chunks) {
        bytes.set(c, offset);
        offset += c.byteLength;
      }
      parsed = briefRequestSchema.parse(JSON.parse(new TextDecoder().decode(bytes)));
      await verifySnapshot(parsed.snapshot, Math.floor(Date.now() / 1000));
    } catch {
      return json(
        {
          error: 'Analysis inputs are invalid or expired. Ask again using the latest records.',
          code: 'invalid_input',
        },
        400,
      );
    }
    if (Date.now() - windowStart >= 60_000) {
      windowStart = Date.now();
      used = 0;
    }
    if (used >= 12 || inflight >= 2)
      return json(
        {
          error: 'The analysis limit has been reached. Try again in a minute.',
          code: 'rate_limit',
        },
        429,
        { 'Retry-After': '60' },
      );
    used++;
    inflight++;
    try {
      const result = await generateBrief(
        config,
        parsed.question,
        parsed.snapshot,
        request.signal,
        fetcher,
      );
      return json(result);
    } catch (e) {
      return e instanceof GatewayError
        ? json({ error: e.message, code: e.code }, e.status)
        : json(
            {
              error: 'Analysis could not be completed. Your records have not changed.',
              code: 'internal_error',
            },
            500,
          );
    } finally {
      inflight--;
    }
  };
}
