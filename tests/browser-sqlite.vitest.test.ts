import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { readFileSync, readdirSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { BrowserEngine } from '../src/storage/engine';
import { IndexedDbFiles, type FileStore } from '../src/storage/idb';
import { createDomainStore } from '../src/store/store';
import { workspaceDefaults } from '../src/store/workspace';
import { openSqlite } from '../src/storage/sqlite';
import { assistantIssues, assistantTaskKey } from '../src/domain/assistant';
let SQL: SqlJsStatic;
const migrations = readdirSync('drizzle')
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => readFileSync(`drizzle/${f}`, 'utf8'));
beforeAll(async () => {
  SQL = await initSqlJs();
});
const request = (
  revision: number,
  operation = 'preferences',
  payload: unknown = { theme: 'dark' },
  greenhouseId = 'GH-01',
) => ({ requestId: crypto.randomUUID(), revision, operation, payload, greenhouseId });
function setup() {
  const files = new IndexedDbFiles(new IDBFactory());
  const engine = new BrowserEngine(SQL, migrations, files);
  return { files, engine, reopen: () => new BrowserEngine(SQL, migrations, files) };
}
const seed = (engine: BrowserEngine) =>
  engine.request(request(0, 'initialize', {})) as Promise<any>;
describe('Browser SQLite with real WASM and IndexedDB transaction semantics', () => {
  it('persists an assistant follow-up and source relationship across reloads without duplicates', async () => {
    const { engine, reopen } = setup();
    const first = await seed(engine);
    const s = first.greenhouses['GH-01'];
    s.clock = Math.floor(Date.now() / 1000);
    const issue = assistantIssues(s).find((i) => i.followUp && i.id.includes('case:'))!;
    const payload = {
      type: 'assistant_task',
      greenhouseId: 'GH-01',
      issueId: issue.id,
      fingerprint: issue.fingerprint,
      operator: 'Budi Santoso',
      dueOn: '2026-10-20',
    };
    const created: any = await engine.request(request(first.revision, 'action', payload));
    expect(created.result.ok).toBe(true);
    const reloaded: any = await reopen().request();
    const tasks = reloaded.greenhouses['GH-01'].production.tasks.filter(
      (t: any) => t.key === assistantTaskKey(issue.id),
    );
    expect(tasks).toHaveLength(1);
    expect(tasks[0]).toMatchObject({
      id: created.result.id,
      zoneId: issue.followUp!.zoneId,
      plantingId: issue.followUp!.plantingId,
    });
    const retry: any = await reopen().request(request(reloaded.revision, 'action', payload));
    expect(retry.result.id).toBe(created.result.id);
    expect(
      retry.greenhouses['GH-01'].production.tasks.filter(
        (t: any) => t.key === assistantTaskKey(issue.id),
      ),
    ).toHaveLength(1);
    await expect(
      reopen().request(request(retry.revision, 'action', payload, 'GH-02')),
    ).rejects.toThrow('greenhouse changed');
    const db = openSqlite(SQL, migrations, await engine.export());
    expect(db.sql.exec('PRAGMA foreign_key_check')).toEqual([]);
    db.sql.close();
  });
  it('initializes and reopens the normalized database without an API or server identity', async () => {
    const { engine, reopen } = setup();
    expect(await engine.request()).toEqual({ initialize: true, revision: 0 });
    const first = await seed(engine),
      reloaded: any = await reopen().request();
    expect(reloaded).toMatchObject({ revision: 1, greenhouses: first.greenhouses });
    expect(Object.keys(reloaded.greenhouses)).toHaveLength(2);
    const bytes = await engine.export();
    expect(new TextDecoder().decode(bytes.slice(0, 16))).toBe('SQLite format 3\0');
    const db = openSqlite(SQL, migrations, bytes);
    expect(db.sql.exec('PRAGMA integrity_check')[0].values[0][0]).toBe('ok');
    expect(db.sql.exec('PRAGMA foreign_key_check')).toEqual([]);
    expect(
      Number(db.sql.exec("SELECT count(*) FROM sqlite_master WHERE type='table'")[0].values[0][0]),
    ).toBe(86);
    db.sql.close();
  });
  it('imports legacy greenhouse and profile data once, preserving relations and counters', async () => {
    const { engine, reopen } = setup();
    const legacy = createDomainStore().getState(),
      preferences = workspaceDefaults();
    legacy.greenhouses['GH-01'].greenhouse.name = 'Kebun browser lama';
    preferences.members[0].name = 'Pemilik tersimpan';
    preferences.theme = 'dark';
    const imported: any = await engine.request(
      request(0, 'initialize', {
        legacy: { greenhouses: legacy.greenhouses, nextGreenhouseNumber: 42 },
        preferences,
      }),
    );
    expect(imported.preferences.members[0].name).toBe('Pemilik tersimpan');
    expect(imported.preferences.theme).toBe('dark');
    expect(imported.nextGreenhouseNumber).toBe(42);
    expect(((await reopen().request()) as any).greenhouses['GH-01'].greenhouse.name).toBe(
      'Kebun browser lama',
    );
    await expect(engine.request(request(1, 'initialize', {}))).rejects.toThrow();
  });
  it('persists CRUD and preferences and rejects stale writes from another tab', async () => {
    const { engine, reopen } = setup();
    await seed(engine);
    const changed: any = await engine.request(request(1));
    expect(changed.preferences.theme).toBe('dark');
    await expect(
      reopen().request(request(1, 'preferences', { theme: 'light' })),
    ).rejects.toMatchObject({ status: 409 });
    const created: any = await engine.request(
      request(2, 'greenhouse_create', {
        name: 'Kebun uji lokal',
        location: 'Bogor',
        area: 100,
        plantedArea: 70,
        crop: 'Lettuce',
        plantedOn: '2026-10-16',
        plants: 100,
      }),
    );
    expect(created.result.ok).toBe(true);
    expect(((await reopen().request()) as any).greenhouses[created.result.id].greenhouse.name).toBe(
      'Kebun uji lokal',
    );
  });
  it('commits only one of two simultaneous tab writes with the same revision', async () => {
    const { engine, reopen } = setup();
    await seed(engine);
    const outcomes = await Promise.allSettled([
      engine.request(request(1, 'preferences', { theme: 'dark' })),
      reopen().request(request(1, 'preferences', { collapsed: true })),
    ]);
    expect(outcomes.filter((r) => r.status === 'fulfilled')).toHaveLength(1);
    expect(
      (outcomes.find((r) => r.status === 'rejected') as PromiseRejectedResult).reason.status,
    ).toBe(409);
    expect(((await reopen().request()) as any).revision).toBe(2);
  });
  it('does not acknowledge a change or lose earlier data when durable storage fails', async () => {
    const { engine, files, reopen } = setup();
    await seed(engine);
    const broken: FileStore = {
      read: (key) => files.read(key),
      save: async () => {
        throw new Error('QuotaExceededError');
      },
    };
    await expect(new BrowserEngine(SQL, migrations, broken).request(request(1))).rejects.toThrow(
      'QuotaExceededError',
    );
    expect(await reopen().request()).toMatchObject({
      revision: 1,
      preferences: { theme: 'light' },
    });
  });
  it('validates backup before replacement and retains the prior database', async () => {
    const { engine, reopen } = setup();
    await seed(engine);
    const backup = await engine.export();
    await engine.request(request(1));
    const reviewed = await engine.inspect(backup);
    expect(reviewed.greenhouseCount).toBe(2);
    await engine.restore(backup, reviewed.generation);
    expect(await reopen().request()).toMatchObject({
      revision: 1,
      preferences: { theme: 'light' },
    });
    const db = openSqlite(SQL, migrations, await engine.export(true));
    expect(
      db.sql.exec("SELECT theme FROM member_preferences WHERE member_id='member-owner'")[0]
        .values[0][0],
    ).toBe('dark');
    db.sql.close();
    await expect(
      engine.restore(new TextEncoder().encode('not a database'), (await engine.info()).generation),
    ).rejects.toThrow('SQLite');
    expect(((await reopen().request()) as any).revision).toBe(1);
  });
  it('rejects a restore when another tab has changed data since backup review', async () => {
    const { engine, reopen } = setup();
    await seed(engine);
    const backup = await engine.export(),
      review = await engine.inspect(backup);
    await reopen().request(request(1));
    await expect(engine.restore(backup, review.generation)).rejects.toMatchObject({ status: 409 });
    expect(((await engine.request()) as any).preferences.theme).toBe('dark');
  });
  it('does not persist an invalid legacy import, invalid references, or unsupported execution', async () => {
    const { engine } = setup();
    const legacy = createDomainStore().getState();
    legacy.greenhouses['GH-01'].expenses[0].deviceId = 'missing-device';
    await expect(
      engine.request(request(0, 'initialize', { legacy: { greenhouses: legacy.greenhouses } })),
    ).rejects.toThrow();
    expect((await engine.info()).bytes).toBe(0);
    await seed(engine);
    await expect(
      engine.request(request(1, 'action', { type: 'run_once', id: 'RTN-003' })),
    ).rejects.toThrow('not connected');
    expect(((await engine.request()) as any).revision).toBe(1);
  });
  it('persists care, harvest, sale and receipt exactly once across engine reopenings', async () => {
    const { engine, reopen } = setup();
    await seed(engine);
    let revision = 1;
    const act = async (action: unknown) => {
      const state: any = await reopen().request(request(revision, 'action', action));
      revision = state.revision;
      return state;
    };
    let s = await act({
      type: 'crop_task',
      task: {
        title: 'Periksa tanaman zona D',
        zoneId: 'D',
        dueOn: '2026-10-16',
        operator: 'Pemilik',
        key: 'care-local',
      },
    });
    await act({
      type: 'crop_task_done',
      id: s.result.id,
      notes: 'Tanaman diperiksa.',
    });
    s = await act({
      type: 'crop_harvest',
      lot: {
        zoneId: 'D',
        date: '2026-10-16',
        grossKg: 50,
        aKg: 35,
        bKg: 12,
        rejectedKg: 3,
        operator: 'Pemilik',
        notes: 'Ditimbang.',
        key: 'harvest-local',
      },
    });
    const lotId = s.result.id;
    await act({ type: 'crop_release', id: lotId, notes: 'Mutu disetujui.' });
    s = await act({
      type: 'crop_sale',
      sale: {
        lotId,
        grade: 'A',
        kg: 30,
        price: 10000,
        date: '2026-10-16',
        dueOn: '2026-10-20',
        buyer: 'Toko sayur',
        key: 'sale-local',
      },
    });
    const receipt = request(revision, 'action', {
      type: 'crop_receipt',
      receipt: {
        saleId: s.result.id,
        date: '2026-10-16',
        amount: 200000,
        reference: 'Pembayaran pertama',
        key: 'receipt-local',
      },
    });
    await reopen().request(receipt);
    await reopen().request(receipt);
    const saved: any = await reopen().request();
    expect(
      saved.greenhouses['GH-01'].production.tasks.find((t: any) => t.key === 'care-local').status,
    ).toBe('done');
    const receipts = saved.greenhouses['GH-01'].production.receipts.filter(
      (r: any) => r.key === 'receipt-local',
    );
    expect(receipts).toHaveLength(1);
    expect(receipts[0].amount).toBe(200000);
  });
});
