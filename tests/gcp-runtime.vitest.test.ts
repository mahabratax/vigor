import { afterEach, expect, it, vi } from 'vitest';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createGcpApp } from '../server/gcp/app';
let directory: string | undefined;
afterEach(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});
it('serves the app, deep links, worker and WASM with correct types without replacing missing assets with HTML', async () => {
  directory = await mkdtemp(join(tmpdir(), 'vigor-gcp-'));
  await mkdir(join(directory, 'assets'));
  await writeFile(join(directory, 'index.html'), '<title>Vigor</title>');
  await writeFile(join(directory, 'assets', 'worker.js'), 'self.onmessage = () => {};');
  await writeFile(join(directory, 'assets', 'sqlite.wasm'), new Uint8Array([0, 97, 115, 109]));
  const fetcher = vi.fn();
  const app = createGcpApp({ hosting: 'cloud-run', apiKey: '', model: '' }, directory, fetcher);
  const get = (path: string, method = 'GET') =>
    app(new Request(`https://vigor.example${path}`, { method }));
  expect(await (await get('/greenhouse?zone=A')).text()).toContain('Vigor');
  expect((await get('/assets/worker.js')).headers.get('content-type')).toContain('javascript');
  expect((await get('/assets/sqlite.wasm')).headers.get('content-type')).toBe('application/wasm');
  expect((await get('/assets/missing.js')).status).toBe(404);
  expect((await get('/assets/missing.png')).status).toBe(404);
  expect((await get('/.%2f.env')).status).toBe(404);
  expect((await get('/assets/%2e%2e%2f%2e%2e%2fsecret')).status).toBe(404);
  expect(await (await get('/api/ai/status')).json()).toMatchObject({
    configured: false,
    hosting: 'cloud-run',
  });
  expect((await get('/api/unknown')).status).toBe(404);
  expect(await (await get('/greenhouse', 'HEAD')).text()).toBe('');
  expect((await get('/greenhouse', 'POST')).status).toBe(405);
  expect(await (await get('/healthz')).json()).toMatchObject({ status: 'ok' });
  expect(fetcher).not.toHaveBeenCalled();
});
