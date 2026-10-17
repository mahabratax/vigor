import { describe, it, expect } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { transition, type Action } from '../src/domain/actions';
import type { DomainState } from '../src/domain/types';
import { activeBatch, cultivation } from '../src/domain/zones';
import { activeTarget, zoneTargetReadings } from '../src/domain/cropTargets';
import { comparisonReadings } from '../src/domain/outcomes';
import { supplyBalance } from '../src/domain/supplies';
import { efficiencySummary, resourceRows, resources } from '../src/domain/efficiency';
import { cycleExpenses, production, productionSummary } from '../src/domain/production';
import { hydrate } from '../src/domain/storage';
import { can, actionPermission } from '../src/features/access/permissions';
import { createDomainStore } from '../src/store/store';
const run = (s: DomainState, a: Action) => transition(s, a).data;
function target(s = createFixture(), min = 26, max = 29) {
  const b = activeBatch(s, 'A')!;
  return run(s, {
    type: 'target_save',
    batchId: b.id,
    stage: b.stage,
    limits: { temperature: { min, max }, humidity: { min: 60, max: 80 } },
    notes: 'Acuan demonstrasi yang direview petugas.',
    actor: 'Aldi',
  });
}
function active(s = createFixture()) {
  s = target(s);
  return run(s, { type: 'target_activate', id: s.targets!.revisions[0].id, actor: 'Aldi' });
}
function finished() {
  let s = active();
  s = run(s, { type: 'run_once', id: 'RTN-003' });
  s = run(s, { type: 'tick', seconds: 240 });
  s = run(s, { type: 'play', value: false });
  return s;
}
function item(s = createFixture(), autoTask = false) {
  return run(s, {
    type: 'supply_item',
    item: {
      name: 'Nutrisi A',
      unit: 'L',
      category: 'Nutrisi',
      reorderAt: 2,
      deviceId: 'DOSE-01',
      autoTask,
      operator: 'Aldi',
    },
  });
}
function move(
  s: DomainState,
  kind: 'in' | 'use' | 'waste',
  quantity: number,
  key = `${kind}-${s.supplies!.movements.length}`,
) {
  return run(s, {
    type: 'supply_move',
    itemId: s.supplies!.items[0].id,
    kind,
    quantity,
    date: '2026-10-13',
    notes: 'Catatan petugas untuk demonstrasi.',
    key,
  });
}
function reviewedHarvest(s = createFixture()) {
  s = run(s, { type: 'crop_sample' });
  return run(s, {
    type: 'crop_costs',
    shares: Object.fromEntries(
      cycleExpenses(s)
        .filter((e) => e.status === 'paid')
        .map((e) => [e.id, 100]),
    ),
    depreciation: 120000,
    otherAccrued: 50000,
    unpaidLabor: 100000,
    baselineCost: 1600000,
    notes: 'Alokasi biaya contoh telah direview.',
    reviewed: true,
  });
}

describe('crop targets are versioned monitoring references', () => {
  it('keeps a draft separate from the active reference and the automation configuration', () => {
    const original = createFixture(),
      routines = JSON.stringify(original.routines);
    let s = target(original);
    expect(activeTarget(s, 'A')).toBeUndefined();
    expect(original.targets).toBeUndefined();
    s = run(s, { type: 'target_activate', id: s.targets!.revisions[0].id, actor: 'Aldi' });
    expect(activeTarget(s, 'A')?.version).toBe(1);
    expect(zoneTargetReadings(s, 'A')[0].status).toBe('within');
    s = target(s, 20, 25);
    expect(activeTarget(s, 'A')?.version).toBe(1);
    s = run(s, { type: 'target_activate', id: s.targets!.revisions[0].id });
    expect(activeTarget(s, 'A')?.version).toBe(2);
    expect(zoneTargetReadings(s, 'A')[0].status).toBe('high');
    expect(JSON.stringify(s.routines)).toBe(routines);
  });
  it('binds a reference to the exact batch, crop, variety and phase', () => {
    const s = active();
    s.cultivation = cultivation(s);
    const b = activeBatch(s, 'A')!;
    b.stage = 'Persemaian';
    expect(activeTarget(s, 'A')).toBeUndefined();
    b.stage = s.targets!.revisions[0].stage;
    b.variety = 'Varietas berbeda';
    expect(activeTarget(s, 'A')).toBeUndefined();
    const draft = target();
    draft.cultivation = cultivation(draft);
    activeBatch(draft, 'A')!.crop = 'Lettuce';
    expect(() =>
      run(draft, { type: 'target_activate', id: draft.targets!.revisions[0].id }),
    ).toThrow('Batch details changed');
  });
  it.each([
    [30, 20],
    [NaN, 30],
    [-60, 30],
    [20, Infinity],
  ])('rejects invalid temperature range %s–%s', (min, max) => {
    expect(() => target(createFixture(), min, max)).toThrow('range');
  });
  it('keeps missing and custom-house telemetry missing', () => {
    const s = active();
    s.devices.find((d) => d.id === 'TH-A-01')!.connection = 'offline';
    expect(
      zoneTargetReadings(s, 'A')
        .filter((r) => ['temperature', 'humidity'].includes(r.metric))
        .every((r) => r.value === null),
    ).toBe(true);
    s.devices.find((d) => d.id === 'TH-A-01')!.connection = 'online';
    s.greenhouse.source = 'custom';
    expect(zoneTargetReadings(s, 'A').every((r) => r.value === null)).toBe(true);
  });
  it('rejects target changes after cycle closure', () => {
    const s = active();
    s.production = { ...production(s), stage: 'closed' };
    expect(() => target(s)).toThrow('Reopen');
  });
});
describe('actual simulator boundaries produce immutable evidence', () => {
  it('records before actual execution and after finish with target revision snapshots', () => {
    let s = finished();
    const r = s.runs.find((r) => r.routineId === 'RTN-003')!,
      before = JSON.stringify(r.evidence!.before);
    expect(r.cycleId).toBe(s.cycle.id);
    expect(r.evidence!.before.at).toBe(r.startedAt);
    expect(r.evidence!.after!.at).toBe(r.finishedAt);
    expect(r.evidence!.before.readings[0].targets[0].revisionId).toBe(s.targets!.revisions[0].id);
    s = target(s, 20, 24);
    s = run(s, { type: 'target_activate', id: s.targets!.revisions[0].id });
    expect(JSON.stringify(s.runs.find((x) => x.id === r.id)!.evidence!.before)).toBe(before);
    expect(
      comparisonReadings(r)
        .rows.filter((x) => x.delta !== null)
        .every((x) => x.delta === 0),
    ).toBe(true);
  });
  it('never fabricates before/after pairs for blocked or legacy runs', () => {
    let s = createFixture();
    s = run(s, { type: 'scenario', value: 'low_tank' });
    s = run(s, { type: 'run_once', id: 'RTN-001' });
    expect(s.runs[0].status).toBe('Blocked');
    expect(s.runs[0].evidence).toBeUndefined();
    expect(() => run(s, { type: 'outcome_capture', runId: s.runs[0].id })).toThrow(
      'paired before-and-after',
    );
    s = finished();
    delete s.runs[0].evidence;
    expect(hydrate(JSON.stringify(s)).runs[0].evidence).toBeUndefined();
  });
  it('stores follow-up changes as scenario data and keeps human review separate from case closure', () => {
    let s = finished();
    const id = s.runs[0].id,
      before = JSON.stringify(s.runs[0].evidence!.before);
    s = run(s, { type: 'scenario', value: 'increasing' });
    s = run(s, { type: 'outcome_capture', runId: id });
    const cases = JSON.stringify(s.cases);
    const c = comparisonReadings(s.runs[0]);
    expect(c.changedScenario).toBe(true);
    expect(c.rows.find((r) => r.before.metric === 'temperature')!.delta).toBeCloseTo(2.4);
    const a: Action = {
      type: 'outcome_review',
      runId: id,
      afterId: c.after!.id,
      verdict: 'worse',
      notes: 'Angka demo berubah; belum membuktikan dampak perangkat.',
      key: 'review-one',
      actor: 'Aldi',
    };
    s = run(s, a);
    s = run(s, a);
    expect(s.runs[0].evidence!.reviews).toHaveLength(1);
    expect(JSON.stringify(s.runs[0].evidence!.before)).toBe(before);
    expect(JSON.stringify(s.cases)).toBe(cases);
  });
  it('does not compute a delta from missing data or allow a conclusive review without comparable readings', () => {
    let s = finished();
    s.devices.find((d) => d.id === 'TH-A-01')!.connection = 'offline';
    s = run(s, { type: 'outcome_capture', runId: s.runs[0].id });
    const c = comparisonReadings(s.runs[0]);
    expect(c.rows.every((r) => r.delta === null)).toBe(true);
    expect(() =>
      run(s, {
        type: 'outcome_review',
        runId: s.runs[0].id,
        afterId: c.after!.id,
        verdict: 'improved',
        notes: 'Tidak ada data sensor tersedia.',
        key: 'bad',
      }),
    ).toThrow('Insufficient comparable data');
  });
  it('reload never fabricates a finish snapshot for an interrupted run', () => {
    let s = active();
    s = run(s, { type: 'run_once', id: 'RTN-003' });
    s = run(s, { type: 'tick', seconds: 15 });
    s = hydrate(JSON.stringify(s));
    expect(s.runs[0].status).toBe('Needs reconciliation');
    expect(s.runs[0].evidence?.before).toBeTruthy();
    expect(s.runs[0].evidence?.after).toBeUndefined();
    expect(() => run(s, { type: 'outcome_capture', runId: s.runs[0].id })).toThrow();
  });
});
describe('supplies remain a stock ledger with explicit financial links', () => {
  it('records intake/use/reversal and deduplicates submissions without creating payments or sensor readings', () => {
    const original = createFixture();
    let s = move(item(original), 'in', 10, 'intake');
    s = move(s, 'in', 10, 'intake');
    expect(supplyBalance(s, s.supplies!.items[0].id)).toBe(10);
    s = move(s, 'use', 3);
    const movement = s.supplies!.movements.at(-1)!;
    s = run(s, {
      type: 'supply_reverse',
      id: movement.id,
      notes: 'Pemakaian salah dicatat.',
      key: 'reverse',
    });
    expect(supplyBalance(s, movement.itemId)).toBe(10);
    expect(s.expenses).toEqual(original.expenses);
    expect(s.devices).toEqual(original.devices);
    expect(() =>
      run(s, { type: 'supply_reverse', id: movement.id, notes: 'Koreksi lagi.', key: 'reverse-2' }),
    ).toThrow('already reversed');
  });
  it('creates only one open restock task and does not complete physical work when stock arrives', () => {
    let s = item(createFixture(), true);
    const id = s.supplies!.items[0].id;
    expect(s.maintenance.filter((m) => m.supplyItemId === id)).toHaveLength(1);
    s = move(s, 'in', 10);
    s = move(s, 'use', 9);
    s = move(s, 'use', 1);
    expect(
      s.maintenance.filter((m) => m.supplyItemId === id && m.status !== 'completed'),
    ).toHaveLength(1);
    s = move(s, 'in', 10);
    expect(s.maintenance.find((m) => m.supplyItemId === id)!.status).toBe('open');
  });
  it.each([-1, 0, NaN, 11])('rejects unavailable or invalid use quantity %s', (quantity) => {
    const s = move(item(), 'in', 10);
    expect(() => move(s, 'use', quantity)).toThrow();
  });
  it('prevents negative historical balances and reversals of already-consumed receipts', () => {
    let s = move(item(), 'in', 10);
    const intake = s.supplies!.movements[0];
    s = move(s, 'use', 9);
    expect(() =>
      run(s, { type: 'supply_reverse', id: intake.id, notes: 'Koreksi barang masuk.', key: 'bad' }),
    ).toThrow('Insufficient stock');
    expect(() =>
      run(s, {
        type: 'supply_move',
        itemId: intake.itemId,
        kind: 'use',
        quantity: 1,
        date: '2026-10-12',
        notes: 'Tanggal lebih awal.',
        key: 'past',
      }),
    ).toThrow('negative historical');
  });
  it('preserves unit/category after movements and blocks nonempty archival', () => {
    const s = move(item(), 'in', 10),
      i = s.supplies!.items[0];
    expect(() => run(s, { type: 'supply_item', id: i.id, item: { ...i, unit: 'kg' } })).toThrow(
      'Unit and category',
    );
    expect(() => run(s, { type: 'supply_archive', id: i.id })).toThrow('Resolve remaining stock');
  });
  it('links an existing matching expense without double counting it', () => {
    let s = move(item(), 'in', 10);
    const m = s.supplies!.movements[0],
      e = s.expenses.find((e) => e.category === 'Nutrisi')!;
    s = run(s, { type: 'supply_link_expense', id: m.id, expenseId: e.id });
    expect(s.supplies!.movements[0].expenseId).toBe(e.id);
    expect(s.expenses).toHaveLength(7);
    expect(() =>
      run(s, {
        type: 'supply_link_expense',
        id: m.id,
        expenseId: s.expenses.find((e) => e.category === 'Listrik')!.id,
      }),
    ).toThrow('category');
    s.expenses.find((x) => x.id === e.id)!.status = 'void';
    expect(() => run(s, { type: 'supply_link_expense', id: m.id, expenseId: e.id })).toThrow(
      'active expense',
    );
  });
});
describe('cycle efficiency is a reconciled ratio rather than another expense', () => {
  it('keeps no harvest and unknown usage distinct from zero', () => {
    const r = efficiencySummary(createFixture());
    expect(r.kg).toBe(0);
    expect(r.waterPerKg).toBeNull();
    expect(r.energyPerKg).toBeNull();
    expect(r.costPerKg).toBeNull();
  });
  it('uses released grade A+B minus losses, retaining sold goods in the denominator', () => {
    let s = reviewedHarvest();
    expect(efficiencySummary(s).kg).toBe(47);
    s = run(s, {
      type: 'crop_loss',
      loss: {
        lotId: s.production!.lots[0].id,
        grade: 'B',
        kg: 2,
        date: '2026-10-13',
        reason: 'Susut sortasi lanjutan.',
        key: 'loss',
      },
    });
    expect(efficiencySummary(s).kg).toBe(45);
    expect(efficiencySummary(s).costPerKg).toBeCloseTo(productionSummary(s).charge / 45);
    s.production!.lots[0].status = 'held';
    expect(efficiencySummary(s).kg).toBe(0);
  });
  it('allocates new run usage by cycle and defaults unassigned legacy records to zero', () => {
    const s = finished();
    expect(
      resourceRows(s)
        .filter((r) => r.run?.id === s.runs[0].id)
        .every((r) => r.percent === 100),
    ).toBe(true);
    delete s.runs[0].cycleId;
    expect(resourceRows(s).every((r) => r.percent === 0 && r.legacy)).toBe(true);
  });
  it('combines non-run records once and keeps resource estimates out of the financial ledger', () => {
    let s = reviewedHarvest();
    const before = JSON.stringify(s.expenses),
      profit = productionSummary(s).profit;
    const a: Action = {
      type: 'resource_extra',
      date: '2026-10-13',
      waterLiters: 470,
      energyKwh: 4.7,
      basis: 'reading',
      notes: 'Catatan tambahan tanpa run automation.',
      key: 'meter',
      excludesRuns: true,
    };
    s = run(s, a);
    s = run(s, a);
    expect(s.resources!.extras).toHaveLength(1);
    expect(efficiencySummary(s).waterPerKg).toBe(10);
    expect(efficiencySummary(s).energyPerKg).toBeCloseTo(0.1);
    expect(JSON.stringify(s.expenses)).toBe(before);
    expect(productionSummary(s).profit).toBe(profit);
    s = run(s, {
      type: 'resource_review',
      shares: {},
      coverage: 'complete',
      notes: 'Air dan energi periode ini sudah dicatat.',
    });
    expect(efficiencySummary(s).complete).toBe(true);
    s = run(s, {
      type: 'resource_void',
      id: s.resources!.extras[0].id,
      notes: 'Pembacaan perlu dikoreksi.',
    });
    expect(efficiencySummary(s).reviewed).toBe(false);
    expect(efficiencySummary(s).waterPerKg).toBeNull();
  });
  it('invalidates usage review after new usage and financial review after ledger changes', () => {
    let s = reviewedHarvest(finished());
    s = run(s, {
      type: 'resource_review',
      shares: Object.fromEntries(resourceRows(s).map((r) => [r.usage.id, 50])),
      coverage: 'partial',
      notes: 'Hanya sebagian pemakaian yang tercakup.',
    });
    expect(efficiencySummary(s).reviewed).toBe(true);
    s.usages[0].energyKwh += 0.1;
    expect(efficiencySummary(s).reviewed).toBe(false);
    s.expenses[0].amount += 1000;
    expect(efficiencySummary(s).costPerKg).toBeNull();
  });
  it('requires known air/energy and resolved delivery before claiming complete coverage', () => {
    let s = finished();
    s.usages[0].deliveryConfirmed = false;
    expect(() =>
      run(s, {
        type: 'resource_review',
        shares: {},
        coverage: 'complete',
        notes: 'Review dengan data belum pasti.',
      }),
    ).toThrow('Complete coverage');
    expect(() =>
      run(s, {
        type: 'resource_extra',
        date: '2026-10-13',
        waterLiters: 10,
        energyKwh: null,
        basis: 'estimate',
        notes: 'Tanpa confirm pengecualian.',
        key: 'bad',
        excludesRuns: false,
      }),
    ).toThrow('confirm');
    expect(() =>
      run(s, {
        type: 'resource_review',
        shares: { [s.usages[0].id]: 110 },
        coverage: 'partial',
        notes: 'Porsi tidak valid.',
      }),
    ).toThrow('0–100');
  });
});
describe('optional storage and permissions', () => {
  it('preserves all extensions on reload and isolates them between greenhouses', () => {
    let s = move(item(active()), 'in', 10);
    s.resources = resources(s);
    const reloaded = hydrate(JSON.stringify(s));
    expect(reloaded.targets).toEqual(s.targets);
    expect(reloaded.supplies).toEqual(s.supplies);
    expect(reloaded.resources).toEqual(s.resources);
    const store = createDomainStore();
    store.setState({
      data: s,
      activeId: 'GH-01',
      greenhouses: {
        'GH-01': s,
        'GH-02': { ...createFixture(), greenhouse: { ...createFixture().greenhouse, id: 'GH-02' } },
      },
    });
    store.getState().switchGreenhouse('GH-02');
    expect(store.getState().data.targets).toBeUndefined();
    expect(store.getState().data.supplies).toBeUndefined();
    store.getState().switchGreenhouse('GH-01');
    expect(store.getState().data.supplies).toEqual(s.supplies);
  });
  it.each(['targets', 'supplies', 'resources'] as const)(
    'drops only a malformed %s extension while preserving the greenhouse and ledger',
    (key) => {
      const s = createFixture();
      s.greenhouse.name = 'Nama yang harus dipertahankan';
      s[key] = (
        key === 'targets'
          ? { version: 1, revisions: [null] }
          : key === 'supplies'
            ? { version: 1, items: [null], movements: [] }
            : { version: 1, cycleId: s.cycle.id, extras: null }
      ) as never;
      const reloaded = hydrate(JSON.stringify(s));
      expect(reloaded[key]).toBeUndefined();
      expect(reloaded.greenhouse.name).toBe(s.greenhouse.name);
      expect(reloaded.expenses).toEqual(s.expenses);
    },
  );
  it('does not grant new mutating operations to Viewer or financial review to Operator', () => {
    for (const type of [
      'target_save',
      'target_activate',
      'outcome_capture',
      'outcome_review',
      'supply_item',
      'supply_move',
      'supply_reverse',
      'supply_link_expense',
      'resource_extra',
      'resource_review',
    ])
      expect(can('Viewer', actionPermission({ type } as Action)!)).toBe(false);
    expect(can('Operator', actionPermission({ type: 'outcome_capture' } as Action)!)).toBe(true);
    expect(can('Operator', actionPermission({ type: 'supply_move' } as Action)!)).toBe(true);
    expect(can('Operator', actionPermission({ type: 'resource_review' } as Action)!)).toBe(false);
  });
});
