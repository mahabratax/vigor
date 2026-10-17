import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { handleRequest } from '../dist-gcp/server.mjs';

// Exercise the compiled server directly. No preview server or browser is started.
const get = (path) => handleRequest(new Request(`https://vigor-build.example${path}`));
const html = await (await get('/greenhouse')).text();
const login = await get('/login');
assert.equal(login.status, 200, 'Dedicated login path serves the client application');
assert.match(await login.text(), /Vigor/);
assert.match(html, /lang="en"/);
assert.match(html, /Vigor/);
for (const asset of [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((m) => m[1]))
  assert.equal((await get(asset)).status, 200, asset);
const assets = await readdir(new URL('../dist-gcp/client/assets/', import.meta.url));
const worker = assets.find((f) => f.startsWith('browser.worker-') && f.endsWith('.js'));
const wasm = assets.find((f) => f.endsWith('.wasm'));
assert.ok(worker, 'SQLite worker emitted');
assert.ok(wasm, 'SQLite WASM emitted');
assert.match((await get(`/assets/${worker}`)).headers.get('content-type'), /javascript/);
assert.equal((await get(`/assets/${wasm}`)).headers.get('content-type'), 'application/wasm');
assert.equal((await get('/assets/missing.js')).status, 404);
assert.equal((await get('/api/not-a-route')).status, 404);
const status = await (await get('/api/ai/status')).json();
assert.equal(status.hosting, 'cloud-run');
assert.equal(status.liveVerified, false);
const server = await readFile(new URL('../dist-gcp/server.mjs', import.meta.url), 'utf8');
for (const match of server.matchAll(/from ["']([^"']+)["']/g))
  assert.ok(match[1].startsWith('node:'), `Unbundled runtime import: ${match[1]}`);
for (const f of assets.filter((f) => f.endsWith('.js'))) {
  const code = await readFile(new URL(`../dist-gcp/client/assets/${f}`, import.meta.url), 'utf8');
  assert.ok(!code.includes('file:///ROOT'), 'Browser bundle contains rewritten local path');
  assert.ok(!code.includes('x-goog-api-key'), 'Provider implementation leaked into browser bundle');
}
console.log(
  'Compiled GCP app passed route, asset, worker/WASM, server-import and provider-isolation checks.',
);
