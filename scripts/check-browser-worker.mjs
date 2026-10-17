// Execute the actual emitted browser worker + WASM in Node. This verifies the
// production asset graph and RPC, not real-browser rendering or storage policy.
import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import { IDBFactory } from 'fake-indexeddb';
import { verifyWorkerUrls } from './verify-worker-urls.mjs';
await verifyWorkerUrls();
const directory = 'dist/client/_next/static';
const assets = await readdir(directory);
const worker = assets.find((name) => /^browser\.worker-.*\.js$/.test(name));
const wasm = assets.find((name) => /^sql-wasm-browser-.*\.wasm$/.test(name));
assert(worker && wasm, 'Browser SQLite assets must be present in the production build.');
globalThis.self = globalThis;
globalThis.location = new URL(`https://vigor.invalid/_next/static/${worker}`);
globalThis.indexedDB = new IDBFactory();
let wasmRequests = 0;
globalThis.fetch = async (url) => {
  const requested = new URL(url, globalThis.location);
  assert.equal(
    requested.pathname,
    `/_next/static/${wasm}`,
    'No backend/API request may be needed.',
  );
  wasmRequests++;
  return new Response(await readFile(`${directory}/${wasm}`), {
    headers: { 'Content-Type': 'application/wasm' },
  });
};
const pending = new Map();
globalThis.postMessage = ({ id, result, error }) => {
  const callbacks = pending.get(id);
  pending.delete(id);
  if (error) callbacks.reject(new Error(error));
  else callbacks.resolve(result);
};
await import(pathToFileURL(resolve(directory, worker)).href);
let sequence = 0;
function rpc(method, payload) {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    globalThis.onmessage({ data: { id, method, payload } });
  });
}
const timeout = setTimeout(() => {
  console.error('Compiled worker did not respond.');
  process.exit(1);
}, 30000);
try {
  assert.equal((await rpc('workspace')).initialize, true);
  const initialized = await rpc('workspace', {
    requestId: crypto.randomUUID(),
    revision: 0,
    operation: 'initialize',
    payload: {},
  });
  assert.equal(Object.keys(initialized.greenhouses).length, 2);
  for (const state of Object.values(initialized.greenhouses)) {
    assert.equal(state.supplies.items.length, 5);
    assert.equal(state.production.lots.length, 3);
    assert.equal(state.production.sales.length, 3);
    assert.equal(state.production.receipts.length, 2);
  }
  const saved = await rpc('workspace', {
    requestId: crypto.randomUUID(),
    revision: 1,
    operation: 'preferences',
    greenhouseId: 'GH-01',
    payload: { theme: 'dark' },
  });
  assert.equal(saved.preferences.theme, 'dark');
  assert.equal((await rpc('workspace')).preferences.theme, 'dark');
  const backup = await rpc('export');
  assert.equal(new TextDecoder().decode(backup.slice(0, 16)), 'SQLite format 3\0');
  assert.equal((await rpc('inspect', { bytes: backup })).greenhouseCount, 2);
  assert.equal(wasmRequests, 1);
  console.log(
    'Compiled browser worker: startup, WASM loading, CRUD, persisted reload and backup passed; zero API requests.',
  );
} finally {
  clearTimeout(timeout);
}
