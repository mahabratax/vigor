import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { createAiHandler, json, type AiRuntime } from '../ai/handler';

const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};
/** Deployment is private by Cloud Run IAM. Do not expose this handler publicly
 * without verified identity, per-user budgets and authorization. */
export function createGcpApp(config: AiRuntime, directory: string, fetcher: typeof fetch = fetch) {
  const api = createAiHandler(config, fetcher),
    root = resolve(directory);
  return async (request: Request): Promise<Response> => {
    const url = new URL(request.url);
    if (url.pathname === '/healthz') return json({ status: 'ok', service: 'vigor' });
    if (url.pathname.startsWith('/api/')) return api(request);
    if (!['GET', 'HEAD'].includes(request.method))
      return new Response('Method not allowed', { status: 405 });
    let pathname: string;
    try {
      pathname = decodeURIComponent(url.pathname);
    } catch {
      return new Response('Invalid path', { status: 400 });
    }
    const file = resolve(root, `.${pathname}`);
    if (
      (file !== root && !file.startsWith(root + sep)) ||
      pathname.split('/').some((s) => s.startsWith('.'))
    )
      return new Response('Not found', { status: 404 });
    let bytes: Uint8Array,
      extension = extname(file),
      index = false;
    try {
      bytes = await readFile(file);
    } catch {
      // Missing scripts/images must be a 404, never HTML with status 200.
      if (extension || pathname.startsWith('/assets/'))
        return new Response('Not found', { status: 404 });
      try {
        bytes = await readFile(resolve(root, 'index.html'));
        extension = '.html';
        index = true;
      } catch {
        return new Response('The application build is unavailable.', { status: 503 });
      }
    }
    return new Response(request.method === 'HEAD' ? null : new Uint8Array(bytes).buffer, {
      headers: {
        'Content-Type': mime[extension] ?? 'application/octet-stream',
        'Cache-Control': index || extension === '.html' ? 'no-cache' : 'public, max-age=3600',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy':
          "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; worker-src 'self' blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      },
    });
  };
}
