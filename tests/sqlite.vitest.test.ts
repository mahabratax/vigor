import { workspaceDefaults } from '../src/store/workspace';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { describe, it, expect } from 'vitest';
import {
  type Database,
  type Statement,
  readDatabase,
  commit,
  Conflict,
} from '../server/repository';
import {
  encodeGreenhouses,
  decodeGreenhouses,
  materialize,
  type Rows,
  type Row,
} from '../db/codec';
import { mutateWorkspace, getWorkspace } from '../server/service';
import { createDomainStore } from '../src/store/store';
import { productionSummary, financeKey, production } from '../src/domain/production';
import { resourceKey } from '../src/domain/efficiency';
import { transition } from '../src/domain/actions';
export class SqliteAdapter implements Database {
  db = new DatabaseSync(':memory:');
  constructor() {
    this.db.exec('PRAGMA foreign_keys=ON');
    for (const f of readdirSync('drizzle')
      .filter((f) => f.endsWith('.sql'))
      .sort())
      this.db.exec(readFileSync('drizzle/' + f, 'utf8'));
  }
  prepare(sql: string): Statement {
    const statement = this.db.prepare(sql);
    let values: any[] = [];
    const wrapper = {
      bind: (...v: unknown[]) => {
        if (v.length > 100) throw Error('D1 binding limit exceeded');
        values = v;
        return wrapper;
      },
      all: async () => ({ results: statement.all(...values) as Row[] }),
      first: async () => statement.get(...values) ?? null,
      run: async () => statement.run(...values),
    };
    return wrapper as Statement;
  }
  async batch(statements: Statement[]) {
    this.db.exec('BEGIN');
    try {
      const result = [];
      for (const s of statements) result.push(await s.all());
      this.db.exec('COMMIT');
      return result;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    }
  }
  check() {
    expect(this.db.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    expect(this.db.prepare('PRAGMA integrity_check').get()?.integrity_check).toBe('ok');
  }
}
const owner = { id: 'verified-site-owner', email: 'owner@example.com', name: 'Owner kebun' };
const request = (
  revision: number,
  operation = 'action',
  payload: unknown = {},
  greenhouseId = 'GH-01',
) => ({ requestId: crypto.randomUUID(), revision, operation, payload, greenhouseId });
async function seed() {
  const db = new SqliteAdapter();
  const state = await mutateWorkspace(db, owner, request(0, 'initialize'));
  return { db, state };
}
describe('SQLite server persistence', () => {
  it('seeds normalized tables atomically, with no cross-greenhouse ID collisions or invented runs', async () => {
    const { db, state } = await seed();
    expect(state.revision).toBe(1);
    expect(Object.keys(state.greenhouses)).toHaveLength(2);
    expect(db.db.prepare("SELECT count(*) n FROM devices WHERE id='PUMP-01'").get()?.n).toBe(2);
    expect(db.db.prepare('SELECT count(*) n FROM automation_runs').get()?.n).toBe(0);
    expect(
      db.db
        .prepare(
          "SELECT count(*) n FROM resource_usages WHERE run_id LIKE 'HIST-%' AND run_id_resolved IS NULL",
        )
        .get()?.n,
    ).toBe(60);
    const fresh = (await getWorkspace(db, owner)) as typeof state;
    expect(fresh.greenhouses).toEqual(state.greenhouses);
    db.check();
  });
  it('preserves complete materialized data, ordering, derived totals and review fingerprints', async () => {
    const db = new SqliteAdapter();
    const initial = createDomainStore().getState().greenhouses;
    initial['GH-01'] = transition(initial['GH-01'], { type: 'crop_sample' }).data;
    const before = Object.fromEntries(
      Object.entries(initial).map(([id, s]) => [id, materialize(s)]),
    );
    const rows = encodeGreenhouses(before);
    await commit(db, 0, crypto.randomUUID(), 'roundtrip', 'test', 'import', {}, rows);
    const restored = decodeGreenhouses((await readDatabase(db)).rows);
    for (const id of Object.keys(before)) {
      expect(productionSummary(restored[id])).toEqual(productionSummary(before[id]));
      expect(financeKey(restored[id])).toEqual(financeKey(before[id]));
      expect(resourceKey(restored[id])).toEqual(resourceKey(before[id]));
      expect(encodeGreenhouses({ [id]: restored[id] })).toEqual(
        encodeGreenhouses({ [id]: before[id] }),
      );
    }
    db.check();
  });
  it('rejects missing related records and rolls back both data and revision', async () => {
    const { db } = await seed();
    const { rows, revision } = await readDatabase(db),
      after = structuredClone(rows);
    after.expenses[0].device_id = 'MISSING';
    await expect(
      commit(db, revision, crypto.randomUUID(), 'bad', 'test', 'test', rows, after),
    ).rejects.toThrow();
    expect(await readDatabase(db)).toEqual({ rows, revision });
    db.check();
  });
  it('deduplicates a retried command and rejects stale edits without overwriting', async () => {
    const { db } = await seed();
    const cmd = request(1, 'action', { type: 'budget', period: '2026-10', amount: 750000 });
    const a = await mutateWorkspace(db, owner, cmd),
      again = await mutateWorkspace(db, owner, cmd);
    expect(a.revision).toBe(2);
    expect(again.revision).toBe(2);
    await expect(
      mutateWorkspace(
        db,
        owner,
        request(1, 'action', { type: 'budget', period: '2026-10', amount: 1 }),
      ),
    ).rejects.toBeInstanceOf(Conflict);
    expect(
      ((await getWorkspace(db, owner)) as typeof a).greenhouses['GH-01'].budgets.find(
        (b) => b.period === '2026-10',
      )?.amount,
    ).toBe(750000);
    db.check();
  });
  it('creates and edits a greenhouse, reloads it, then deletes its children and permissions together', async () => {
    const { db } = await seed();
    const created = await mutateWorkspace(
      db,
      owner,
      request(1, 'greenhouse_create', {
        name: 'Kebun atap',
        location: 'Bogor',
        area: 120,
        plantedArea: 72,
        crop: 'Cabai',
        plantedOn: '2026-10-16',
        plants: 60,
      }),
    );
    const id = created.result.id!;
    expect(created.greenhouses[id].zones).toHaveLength(6);
    const updated = await mutateWorkspace(
      db,
      owner,
      request(
        2,
        'greenhouse_edit',
        { name: 'Kebun atap 2', location: 'Bandung', area: 120, plantedArea: 72 },
        id,
      ),
    );
    expect(updated.greenhouses[id].greenhouse.location).toBe('Bandung');
    const removed = await mutateWorkspace(
      db,
      owner,
      request(3, 'greenhouse_delete', { confirmation: 'Kebun atap 2' }, id),
    );
    expect(removed.greenhouses[id]).toBeUndefined();
    expect(removed.preferences.members[0].greenhouseIds).not.toContain(id);
    db.check();
  });
  it('persists preferences, guides and read notifications without granting a client-supplied role', async () => {
    const { db, state } = await seed();
    const scope = 'member-owner:GH-01';
    const changed = await mutateWorkspace(
      db,
      owner,
      request(1, 'preferences', {
        theme: 'dark',
        collapsed: true,
        guides: {
          progress: {
            [scope]: { workspace: { step: 'map', seen: ['location', 'map'], finished: false } },
          },
          dismissed: [scope],
        },
        readNotifications: { [scope]: ['case-1'] },
      }),
    );
    expect(changed.preferences.theme).toBe('dark');
    expect(changed.preferences.guides?.progress[scope]?.workspace?.seen).toEqual([
      'location',
      'map',
    ]);
    await expect(
      mutateWorkspace(
        db,
        { id: 'unbound', email: 'stranger@example.com', name: 'stranger' },
        request(2, 'action', { type: 'budget', period: '2026-10', amount: 5 }),
      ),
    ).rejects.toThrow('access');
    await expect(
      mutateWorkspace(db, owner, {
        ...request(2, 'action', { type: 'budget', period: '2026-10', amount: 5 }),
        previewRole: 'Viewer',
      }),
    ).rejects.toThrow('role');
    db.check();
  });
  it('preserves browser records on import and fails visibly instead of resetting invalid data', async () => {
    const db = new SqliteAdapter(),
      legacy = createDomainStore().getState();
    legacy.greenhouses['GH-01'].greenhouse.name = 'Nama tersimpan';
    legacy.nextGreenhouseNumber = 77;
    const preferences = workspaceDefaults();
    preferences.readNotifications = { 'member-manager:GH-02': ['notice-old'] };
    preferences.guides = {
      progress: {
        'member-manager:GH-02': {
          setup: { step: 'plants', seen: ['greenhouse'], finished: false },
        },
      },
      dismissed: [],
    };
    const imported = await mutateWorkspace(
      db,
      owner,
      request(0, 'initialize', { legacy, preferences }),
    );
    expect(imported.nextGreenhouseNumber).toBe(77);
    expect(
      db.db
        .prepare("SELECT notification_id FROM notification_reads WHERE member_id='member-manager'")
        .get()?.notification_id,
    ).toBe('notice-old');
    expect(
      db.db.prepare("SELECT step FROM guide_progress WHERE member_id='member-manager'").get()?.step,
    ).toBe('plants');
    expect(imported.greenhouses['GH-01'].greenhouse.name).toBe('Nama tersimpan');
    const bad = new SqliteAdapter();
    legacy.greenhouses['GH-01'].expenses[0].deviceId = 'invalid';
    await expect(
      mutateWorkspace(bad, owner, request(0, 'initialize', { legacy })),
    ).rejects.toThrow();
    expect((await readDatabase(bad)).revision).toBe(0);
    bad.check();
  });
  it('does not expose time controls or fake acknowledgements as server device execution', async () => {
    const { db } = await seed();
    for (const type of ['tick', 'reset', 'scenario', 'run_once', 'heal'])
      await expect(
        mutateWorkspace(db, owner, request(1, 'action', { type, id: 'PUMP-01', seconds: 100 })),
      ).rejects.toThrow('not connected');
    expect((await readDatabase(db)).revision).toBe(1);
    db.check();
  });
  it('records the care-to-sale workflow through server commands and reloads its profit inputs', async () => {
    const { db } = await seed();
    let revision = 1;
    const act = async (payload: any) => {
      const s = await mutateWorkspace(db, owner, request(revision, 'action', payload));
      revision = s.revision;
      return s;
    };
    let s = await act({
      type: 'crop_task',
      task: {
        title: 'Periksa tanaman zona D',
        zoneId: 'D',
        dueOn: '2026-10-16',
        operator: owner.name,
        key: 'care-one',
      },
    });
    await act({
      type: 'crop_task_done',
      id: s.result.id!,
      notes: 'Tanaman diperiksa, kondisi dicatat.',
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
        operator: owner.name,
        notes: 'Timbang dan sortasi.',
        key: 'harvest-one',
      },
    });
    const lotId = s.result.id!;
    await act({ type: 'crop_release', id: lotId, notes: 'Hasil pemeriksaan mutu disetujui.' });
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
        key: 'sale-one',
      },
    });
    const saleId = s.result.id!;
    const receipt = request(revision, 'action', {
      type: 'crop_receipt',
      receipt: {
        saleId,
        date: '2026-10-16',
        amount: 200000,
        reference: 'Pembayaran pertama',
        key: 'receipt-one',
      },
    });
    s = await mutateWorkspace(db, owner, receipt);
    revision = s.revision;
    await mutateWorkspace(db, owner, receipt);
    await act({
      type: 'crop_costs',
      shares: {},
      depreciation: 0,
      unpaidLabor: 0,
      otherAccrued: 0,
      baselineCost: null,
      notes: 'Biaya awal belum teralokasi.',
      reviewed: false,
    });
    const restored = (await getWorkspace(db, owner)) as typeof s;
    const p = restored.greenhouses['GH-01'].production!;
    expect(p.tasks.find((t) => t.key === 'care-one')?.status).toBe('done');
    expect(p.sales.filter((x) => x.key === 'sale-one')).toHaveLength(1);
    expect(p.receipts.filter((x) => x.key === 'receipt-one')).toHaveLength(1);
    expect(p.receipts.find((x) => x.key === 'receipt-one')?.amount).toBe(200000);
    expect(restored.greenhouses['GH-01'].clock).toBeLessThan(10000000000);
    expect(new Date(restored.greenhouses['GH-01'].events[0].at).getFullYear()).toBe(2026);
    db.check();
  });
  it('rejects corrupt import balances and supplied modules instead of silently replacing them', async () => {
    for (const corrupt of [
      (s: any) => {
        s.cultivation.batches[0].currentPlants -= 1;
        s.zones[0].plants -= 1;
        s.cycle.plants -= 1;
      },
      (s: any) => {
        s.production.cycleId = 'OTHER';
      },
      (s: any) => {
        s.energy.panelCount = -1;
      },
    ]) {
      const db = new SqliteAdapter(),
        bank = { 'GH-01': materialize(createDomainStore().getState().data) };
      corrupt(bank['GH-01']);
      await expect(
        mutateWorkspace(db, owner, request(0, 'initialize', { legacy: { greenhouses: bank } })),
      ).rejects.toThrow();
      expect((await readDatabase(db)).revision).toBe(0);
      db.check();
    }
  });
  it('imports an interrupted run as needing reconciliation and keeps evidence reviews immutable', async () => {
    const db = new SqliteAdapter();
    let s = createDomainStore().getState().data;
    s = transition(s, { type: 'run_once', id: 'RTN-003' }).data;
    s = transition(s, { type: 'tick', seconds: 240 }).data;
    const run = s.runs[0];
    expect(run.evidence?.after).toBeTruthy();
    s = transition(s, {
      type: 'outcome_review',
      runId: run.id,
      afterId: run.evidence!.after!.id,
      verdict: 'unchanged',
      notes: 'Nilai tercatat belum berubah.',
      actor: 'Petugas sebelumnya',
      key: 'review-initial',
    }).data;
    const finished = await mutateWorkspace(
      db,
      owner,
      request(0, 'initialize', { legacy: { greenhouses: { 'GH-01': s } } }),
    );
    expect(finished.greenhouses['GH-01'].runs[0].evidence!.reviews[0].at).toMatch(/^2026-/);
    db.check();
    const interruptedDb = new SqliteAdapter();
    let active = createDomainStore().getState().data;
    active = transition(active, { type: 'run_once', id: 'RTN-003' }).data;
    active = transition(active, { type: 'tick', seconds: 5 }).data;
    const imported = await mutateWorkspace(
      interruptedDb,
      owner,
      request(0, 'initialize', { legacy: { greenhouses: { 'GH-01': active } } }),
    );
    expect(imported.greenhouses['GH-01'].runs[0].status).toBe('Needs reconciliation');
    expect(imported.greenhouses['GH-01'].playing).toBe(false);
    interruptedDb.check();
  });
  it('stores unbound stock and rejects mismatched maintenance-device and plan-zone links', async () => {
    const { db } = await seed();
    const s = await mutateWorkspace(
      db,
      owner,
      request(1, 'action', {
        type: 'supply_item',
        item: {
          name: 'Media tanam',
          unit: 'pcs',
          category: 'Perawatan',
          reorderAt: 2,
          deviceId: '',
          autoTask: false,
          operator: owner.name,
        },
      }),
    );
    expect(s.greenhouses['GH-01'].supplies!.items.find((i) => i.id === s.result.id)?.deviceId).toBe(
      '',
    );
    expect(
      db.db
        .prepare('SELECT device_id FROM supply_items WHERE gh=? AND id=?')
        .get('GH-01', s.result.id!)?.device_id,
    ).toBeNull();
    await expect(
      mutateWorkspace(
        db,
        owner,
        request(2, 'action', { type: 'maintenance', id: 'MNT-005', deviceId: 'EC-01' }),
      ),
    ).rejects.toThrow("maintenance ticket's device");
    const before = await readDatabase(db),
      bad = structuredClone(before.rows);
    bad.expenses.find((e) => e.maintenance_id === 'MNT-005')!.device_id = 'EC-01';
    const bank = decodeGreenhouses(bad);
    expect(() => encodeGreenhouses(bank)).toThrow('Expense device');
    db.check();
  });
  it('limits an authenticated Viewer to assigned data, permits their own profile, and rejects privilege escalation', async () => {
    const { db, state } = await seed();
    const directory = state.preferences.members.find((m) => m.role === 'Viewer')!;
    const viewer = { id: 'viewer-principal', email: directory.email, name: directory.name };
    expect(await getWorkspace(db, viewer)).toMatchObject({ claim: true });
    const claimed = await mutateWorkspace(db, viewer, request(1, 'initialize'));
    expect(Object.keys(claimed.greenhouses)).toEqual(['GH-02']);
    expect(claimed.preferences.members).toHaveLength(1);
    const profile = await mutateWorkspace(
      db,
      viewer,
      request(
        2,
        'preferences',
        { members: [{ ...claimed.preferences.members[0], name: 'Nama baru' }] },
        'GH-02',
      ),
    );
    expect(profile.preferences.members[0].name).toBe('Nama baru');
    expect(db.db.prepare('SELECT count(*) n FROM members').get()?.n).toBe(4);
    await expect(
      mutateWorkspace(
        db,
        viewer,
        request(
          3,
          'action',
          {
            type: 'assistant_task',
            greenhouseId: 'GH-02',
            issueId: 'foreign-case',
            fingerprint: 'untrusted',
            operator: viewer.name,
            dueOn: '2026-10-20',
          },
          'GH-02',
        ),
      ),
    ).rejects.toThrow('role');
    await expect(
      mutateWorkspace(db, viewer, {
        ...request(3, 'action', { type: 'budget', period: '2026-10', amount: 1 }, 'GH-02'),
        previewRole: 'Owner',
      }),
    ).rejects.toThrow('role');
    await expect(mutateWorkspace(db, viewer, request(3, 'select', {}, 'GH-01'))).rejects.toThrow(
      'scope',
    );
    db.check();
  });
});
