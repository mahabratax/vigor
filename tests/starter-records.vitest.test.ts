import { beforeAll, describe, expect, it } from 'vitest';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import { readFileSync, readdirSync } from 'node:fs';
import { IDBFactory } from 'fake-indexeddb';
import { addStarterRecords, STARTER_RECORDS_VERSION } from '../src/data/starterRecords';
import { createDomainStore } from '../src/store/store';
import { workspaceDefaults } from '../src/store/workspace';
import { BrowserEngine } from '../src/storage/engine';
import { IndexedDbFiles, type FileStore } from '../src/storage/idb';
import { openSqlite } from '../src/storage/sqlite';
import { commit } from '../server/repository';
import { encodeWorkspace } from '../server/workspace-codec';
import { encodeGreenhouses } from '../db/codec';
import { productionSummary, lotStock } from '../src/domain/production';
import { supplyBalance } from '../src/domain/supplies';
import { transition } from '../src/domain/actions';
let SQL: SqlJsStatic;
const migrations = readdirSync('drizzle')
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => readFileSync(`drizzle/${f}`, 'utf8'));
beforeAll(async () => {
  SQL = await initSqlJs();
});
const initial = () => createDomainStore().getState().greenhouses;
async function oldDatabase(bank = initial()) {
  const files = new IndexedDbFiles(new IDBFactory());
  const db = openSqlite(SQL, migrations);
  const rows = { ...encodeGreenhouses(bank), ...encodeWorkspace(workspaceDefaults(), 'GH-01', 3) };
  rows.members.find((m) => m.id === 'member-owner')!.principal = 'vigor-local-owner';
  await commit(
    db,
    0,
    crypto.randomUUID(),
    'original',
    'vigor-local-owner',
    'initial_seed',
    {},
    rows,
  );
  await files.save(db.sql.export(), 0);
  db.sql.close();
  return { files, engine: () => new BrowserEngine(SQL, migrations, files) };
}
describe('starter data enrichment', () => {
  it('balances supplies, grade stock, sales, receipts and profit without inventing device execution', () => {
    const bank = initial(),
      original = structuredClone(bank);
    expect(addStarterRecords(bank)).toEqual(['GH-01', 'GH-02']);
    for (const [id, s] of Object.entries(bank)) {
      const p = productionSummary(s),
        scale = id === 'GH-01' ? 1 : 0.8;
      expect(s.supplies!.items).toHaveLength(5);
      expect(s.supplies!.movements).toHaveLength(10);
      for (const item of s.supplies!.items)
        expect(supplyBalance(s, item.id)).toBeGreaterThanOrEqual(0);
      for (const m of s.supplies!.movements.filter((m) => m.kind === 'in')) {
        const expense = s.expenses.find((e) => e.id === m.expenseId)!;
        expect(expense.greenhouseId).toBe(id);
        expect(expense.deviceId).toBe(s.supplies!.items.find((i) => i.id === m.itemId)!.deviceId);
      }
      expect(s.maintenance.filter((m) => m.supplyItemId)).toHaveLength(1);
      expect(p.p.tasks).toHaveLength(4);
      expect(p.lots).toHaveLength(3);
      expect(p.sales).toHaveLength(3);
      expect(p.p.receipts).toHaveLength(2);
      expect(p.harvest).toBeCloseTo(140 * scale);
      expect(p.harvest).toBeCloseTo(p.sold + p.stock + p.rejected + p.loss);
      expect(p.revenue).toBe(2520000 * scale);
      expect(p.receivable).toBe(880000 * scale);
      expect(p.received + p.receivable).toBe(p.revenue);
      expect(p.reviewed).toBe(true);
      expect(p.saving).toBe(300000 * scale);
      const held = p.lots.find((l) => l.zoneId === 'B')!;
      expect(held.status).toBe('held');
      expect(p.sales.some((x) => x.lotId === held.id)).toBe(false);
      expect(lotStock(p.p, held, 'A')).toBeGreaterThan(0);
      expect(s.runs).toEqual(original[id].runs);
      expect(s.usages).toEqual(original[id].usages);
      expect(s.devices).toEqual(original[id].devices);
      expect(s.resources!.extras[0].basis).toBe('estimate');
      expect(s.resources!.coverage).toBe('partial');
      expect(s.expenses.slice(0, original[id].expenses.length)).toEqual(original[id].expenses);
    }
    expect(() => encodeGreenhouses(bank)).not.toThrow();
    const once = structuredClone(bank);
    expect(addStarterRecords(bank)).toEqual([]);
    expect(bank).toEqual(once);
  });
  it('preserves populated modules, personal costs, custom crops, and closed cycles', () => {
    const bank = initial();
    bank['GH-01'] = transition(bank['GH-01'], {
      type: 'supply_item',
      item: {
        name: 'Barang milik pengguna',
        unit: 'kg',
        category: 'Nutrisi',
        reorderAt: 2,
        deviceId: '',
        autoTask: false,
        operator: 'Pemilik',
      },
    }).data;
    bank['GH-01'] = transition(bank['GH-01'], { type: 'crop_sample' }).data;
    bank['GH-01'].expenses[0].source = 'operator';
    const prior = structuredClone(bank['GH-01']);
    bank['GH-02'].cycle.id = 'siklus-pengguna';
    const custom = structuredClone(bank['GH-02']);
    addStarterRecords(bank);
    expect(bank['GH-01'].supplies).toEqual(prior.supplies);
    expect(bank['GH-01'].production!.lots).toEqual(prior.production!.lots);
    expect(bank['GH-01'].production!.sales).toEqual(prior.production!.sales);
    expect(bank['GH-01'].production!.receipts).toEqual(prior.production!.receipts);
    expect(bank['GH-01'].production!.finance).toEqual(prior.production!.finance);
    expect(bank['GH-01'].expenses).toEqual(prior.expenses);
    expect(bank['GH-02']).toEqual(custom);
    const closed = structuredClone(bank);
    closed['GH-01'].production!.stage = 'closed';
    const snapshot = structuredClone(closed);
    expect(addStarterRecords(closed)).toEqual([]);
    expect(closed).toEqual(snapshot);
  });
  it('upgrades an existing SQLite file once, preserves profile, and survives backup restore', async () => {
    const bank = initial();
    bank['GH-01'].greenhouse.name = 'Nama pilihan saya';
    const { engine } = await oldDatabase(bank);
    const oldBackup = await engine().export();
    const upgraded = await engine().request();
    expect(upgraded.revision).toBe(2);
    expect(upgraded.greenhouses['GH-01'].greenhouse.name).toBe('Nama pilihan saya');
    expect(upgraded.greenhouses['GH-01'].production.sales).toHaveLength(3);
    expect(await engine().request()).toEqual(upgraded);
    const restored = await engine().restore(oldBackup, (await engine().info()).generation);
    expect(restored).toEqual(upgraded);
    const db = openSqlite(SQL, migrations, await engine().export());
    expect(db.sql.exec('PRAGMA integrity_check')[0].values[0][0]).toBe('ok');
    expect(db.sql.exec('PRAGMA foreign_key_check')).toEqual([]);
    expect(
      db.sql.exec(
        `SELECT count(*) FROM workspace_commits WHERE operation='${STARTER_RECORDS_VERSION}'`,
      )[0].values[0][0],
    ).toBe(1);
    db.sql.close();
  });
  it('concurrent startup applies one durable migration and a storage failure leaves the old database intact', async () => {
    const { engine, files } = await oldDatabase();
    const before = await engine().export();
    const broken: FileStore = {
      read: (key) => files.read(key),
      save: async () => {
        throw new Error('QuotaExceeded');
      },
    };
    await expect(new BrowserEngine(SQL, migrations, broken).request()).rejects.toThrow(
      'QuotaExceeded',
    );
    // Compare binary content directly instead of traversing every byte as an object property.
    expect(Buffer.compare(Buffer.from(await engine().export()), Buffer.from(before))).toBe(0);
    const results = await Promise.all([engine().request(), engine().request()]);
    expect(results[0]).toEqual(results[1]);
    expect(results[0].revision).toBe(2);
    expect((await engine().info()).generation).toBe(2);
  });
});
