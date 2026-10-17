import { describe, expect, it } from 'vitest';
import { cultivation } from '../src/domain/zones';
import { createFixture } from '../src/data/fixtures';
import { transition, type Action } from '../src/domain/actions';
import {
  cycleExpenses,
  financeKey,
  lotStock,
  production,
  productionSummary,
  closingIssues,
} from '../src/domain/production';
import type { DomainState } from '../src/domain/types';
import type { ProductionAction } from '../src/domain/productionTypes';
import { hydrate } from '../src/domain/storage';
import { createDomainStore } from '../src/store/store';
import { actionPermission, can } from '../src/features/access/permissions';
import { costSummary, validateExpense } from '../src/domain/costs';
import { relatedUrl } from '../src/features/history/presentation';
const day = '2026-10-13';
const run = (s: DomainState, a: Action) => transition(s, a).data;
const harvest = (zone: 'A' | 'B' | 'D' = 'D'): ProductionAction => ({
  type: 'crop_harvest',
  lot: {
    date: day,
    zoneId: zone,
    grossKg: 50,
    aKg: 35,
    bKg: 12,
    rejectedKg: 3,
    notes: 'Hasil timbang dan sortasi manual demo.',
    operator: 'Aldi',
    key: 'harvest-1',
  },
});
function reviewedLot() {
  let s = run(createFixture(), harvest());
  return run(s, {
    type: 'crop_release',
    id: s.production!.lots[0].id,
    notes: 'Review mutu selesai, hasil sesuai catatan petugas.',
  });
}
function sample() {
  return run(createFixture(), { type: 'crop_sample' });
}
function costs(
  s: DomainState,
  extras: Partial<Extract<ProductionAction, { type: 'crop_costs' }>> = {},
) {
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
    notes: 'Seluruh biaya contoh satu siklus sudah diperiksa.',
    reviewed: true,
    ...extras,
  });
}
describe('crop workflow and stock integrity', () => {
  it('migrates existing state lazily without inventing harvest or sales', () => {
    const s = hydrate(JSON.stringify(createFixture()));
    expect(production(s).lots).toEqual([]);
    expect(productionSummary(s).revenue).toBe(0);
    expect(productionSummary(s).reviewed).toBe(false);
    expect(s.expenses).toHaveLength(7);
  });
  it('rejects malformed crop storage without discarding existing costs and cases', () => {
    const s = createFixture();
    s.production = { ...production(s), lots: null } as never;
    const next = hydrate(JSON.stringify(s));
    expect(next.production).toBeUndefined();
    expect(next.expenses).toHaveLength(7);
    expect(next.cases).toEqual(s.cases);
    expect(next.storageWarning).toContain('Cycle');
  });
  it('preserves a valid recorded crop workflow on hydration', () => {
    const s = sample(),
      reloaded = hydrate(JSON.stringify(s));
    expect(reloaded.production).toEqual(s.production);
    expect(productionSummary(reloaded).receivable).toBe(375000);
  });
  it('records care completion without physical automation or payments', () => {
    let s = run(createFixture(), {
      type: 'crop_task',
      task: { title: 'Cek penyangga', zoneId: 'D', dueOn: day, operator: 'Aldi', key: 'care-1' },
    });
    s = run(s, {
      type: 'crop_task_done',
      id: s.production!.tasks[0].id,
      notes: 'Penyangga dicek dan catatan diperbarui.',
    });
    expect(s.production!.tasks[0].status).toBe('done');
    expect(s.expenses).toHaveLength(7);
    expect(s.commands).toEqual(createFixture().commands);
  });
  it('keeps targets separate from actual yields and revenue', () => {
    const s = run(createFixture(), {
      type: 'crop_setup',
      targetOn: '2026-11-20',
      targetKg: 500,
      targetPrice: 30000,
      operator: 'Aldi',
    });
    expect(productionSummary(s).revenue).toBe(0);
    expect(productionSummary(s).harvest).toBe(0);
  });
  it('creates a held lot and preserves source data immutably', () => {
    const original = createFixture(),
      s = run(original, harvest());
    expect(original.production).toBeUndefined();
    expect(s.production!.lots[0].status).toBe('held');
    expect(productionSummary(s).stock).toBe(47);
    expect(productionSummary(s).heldKg).toBe(47);
  });
  it('rejects mismatched gross and sortation weights', () => {
    const a = harvest();
    if (a.type === 'crop_harvest') a.lot.grossKg = 55;
    expect(() => run(createFixture(), a)).toThrow('Total harvest');
  });
  it.each([-1, NaN, Infinity, 2.1234])('rejects invalid harvest weight %s', (value) => {
    const a = harvest();
    if (a.type === 'crop_harvest') a.lot.aKg = value;
    expect(() => run(createFixture(), a)).toThrow();
  });
  it('rejects future and invalid harvest dates', () => {
    for (const d of ['2026-10-14', '2026-02-30']) {
      const a = harvest();
      if (a.type === 'crop_harvest') a.lot.date = d;
      expect(() => run(createFixture(), a)).toThrow();
    }
  });
  it('deduplicates a repeated harvest submission', () => {
    let s = run(createFixture(), harvest());
    s = run(s, harvest());
    expect(s.production!.lots).toHaveLength(1);
  });
  it('blocks lot release and sales while a source-zone case is open', () => {
    const s = run(createFixture(), harvest('B'));
    expect(() =>
      run(s, {
        type: 'crop_release',
        id: s.production!.lots[0].id,
        notes: 'Percobaan review lot dengan kasus terbuka.',
      }),
    ).toThrow('open pest cases');
  });
  it('rechecks pest cases at sale time after a previous release', () => {
    let s = reviewedLot();
    s = run(s, { type: 'detection_sample', zoneId: 'D', sample: 'rising' });
    expect(() =>
      run(s, {
        type: 'crop_sale',
        sale: {
          lotId: s.production!.lots[0].id,
          grade: 'A',
          kg: 1,
          price: 30000,
          date: day,
          dueOn: day,
          buyer: 'Pembeli demo',
          key: 'sale-1',
        },
      }),
    ).toThrow('open case');
    expect(productionSummary(s).heldKg).toBe(47);
  });
  it('keeps harvested goods out of revenue until a sale is recorded', () => {
    const s = reviewedLot();
    expect(productionSummary(s).revenue).toBe(0);
    expect(productionSummary(s).stock).toBe(47);
  });
  it('sample connects harvest, partial sale, receipts and stock without paid expense creation', () => {
    const s = sample(),
      r = productionSummary(s);
    expect([r.harvest, r.rejected, r.sold, r.stock]).toEqual([50, 3, 25, 22]);
    expect([r.revenue, r.received, r.receivable]).toEqual([875000, 500000, 375000]);
    expect(s.expenses).toEqual(createFixture().expenses);
    expect(() => run(s, { type: 'crop_sample' })).toThrow('Samples can only');
  });
  it('sample respects an existing open Zone D case rather than silently releasing it', () => {
    let s = run(createFixture(), { type: 'detection_sample', zoneId: 'D', sample: 'rising' });
    s = run(s, { type: 'crop_sample' });
    expect(s.production!.lots[0].status).toBe('held');
    expect(s.production!.sales).toHaveLength(0);
    expect(s.cases.some((c) => c.zoneId === 'D' && c.status !== 'closed')).toBe(true);
  });
  it('prevents overselling either grade independently', () => {
    const s = sample();
    expect(() =>
      run(s, {
        type: 'crop_sale',
        sale: {
          lotId: s.production!.lots[0].id,
          grade: 'A',
          kg: 11,
          price: 30000,
          date: day,
          dueOn: day,
          buyer: 'Pembeli demo',
          key: 'oversell',
        },
      }),
    ).toThrow('exceeds available stock');
    expect(lotStock(s.production!, s.production!.lots[0], 'B')).toBe(12);
  });
  it('prevents payment beyond invoice balance', () => {
    const s = sample();
    expect(() =>
      run(s, {
        type: 'crop_receipt',
        receipt: {
          saleId: s.production!.sales[0].id,
          date: day,
          amount: 375001,
          reference: 'Transfer demo',
          key: 'overpayment',
        },
      }),
    ).toThrow('exceeds the outstanding');
  });
  it('records partial payments once without increasing sales revenue', () => {
    let s = sample();
    const a: ProductionAction = {
      type: 'crop_receipt',
      receipt: {
        saleId: s.production!.sales[0].id,
        date: day,
        amount: 100000,
        reference: 'Angsuran demo',
        key: 'payment-2',
      },
    };
    s = run(run(s, a), a);
    expect(productionSummary(s).received).toBe(600000);
    expect(productionSummary(s).revenue).toBe(875000);
    expect(relatedUrl(s.events[0].objectId)).toContain(s.production!.sales[0].id);
  });
  it('does not allow voiding a sale with receipts', () => {
    const s = sample();
    expect(() =>
      run(s, { type: 'crop_sale_void', id: s.production!.sales[0].id, notes: 'Pembatalan contoh' }),
    ).toThrow('payment receipt');
  });
  it('voiding an unpaid sale restores its exact grade stock', () => {
    let s = reviewedLot();
    s = run(s, {
      type: 'crop_sale',
      sale: {
        lotId: s.production!.lots[0].id,
        grade: 'B',
        kg: 4,
        price: 25000,
        date: day,
        dueOn: day,
        buyer: 'Pembeli demo',
        key: 'sale-1',
      },
    });
    s = run(s, {
      type: 'crop_sale_void',
      id: s.production!.sales[0].id,
      notes: 'Pembatalan pencatatan salah.',
    });
    expect(productionSummary(s).revenue).toBe(0);
    expect(lotStock(s.production!, s.production!.lots[0], 'B')).toBe(12);
  });
  it('records stock loss without creating a fictional expense or revenue', () => {
    let s = sample();
    const a: ProductionAction = {
      type: 'crop_loss',
      loss: {
        lotId: s.production!.lots[0].id,
        grade: 'B',
        kg: 2,
        date: day,
        reason: 'Rusak saat penyimpanan contoh.',
        key: 'loss-1',
      },
    };
    s = run(run(s, a), a);
    const r = productionSummary(s);
    expect(r.stock).toBe(20);
    expect(r.loss).toBe(2);
    expect(r.harvest).toBe(r.rejected + r.loss + r.sold + r.stock);
    expect(r.revenue).toBe(875000);
  });
});
describe('cycle profit, cash and expense provenance', () => {
  it('allows preparation expenses paid before planting and explicit exclusion of unrelated history', () => {
    let s = sample();
    s.expenses.push({
      ...s.expenses[0],
      id: 'EXP-PREP',
      paidAt: '2026-08-01',
      category: 'Benih & media',
      amount: 200000,
      submissionKey: 'seed-preparation',
    });
    s.expenses.push({
      ...s.expenses[0],
      id: 'EXP-OLD',
      paidAt: '2026-07-01',
      amount: 300000,
      submissionKey: 'previous-cycle',
    });
    s = costs(s, {
      shares: Object.fromEntries(cycleExpenses(s).map((e) => [e.id, e.id === 'EXP-OLD' ? 0 : 100])),
    });
    expect(productionSummary(s).operating).toBe(1280000);
    expect(productionSummary(s).reviewed).toBe(true);
  });
  it('starts without automatically claiming ledger costs are allocated or complete', () => {
    const s = sample(),
      r = productionSummary(s);
    expect(r.operating).toBe(0);
    expect(r.reviewed).toBe(false);
    expect(r.unassigned).toBe(7);
    expect(r.saving).toBeNull();
  });
  it('counts a paid bill once and never sums its device allocations again', () => {
    const s = costs(sample()),
      r = productionSummary(s);
    expect(r.operating).toBe(1080000);
    expect(r.reviewed).toBe(true);
    expect(costSummary(s, { period: '2026-09', deviceId: 'PUMP-01' }).total).toBe(85500);
    expect(s.expenses).toEqual(createFixture().expenses);
    expect(s.allocations).toEqual(createFixture().allocations);
  });
  it('separates profit, cash, receivables and noncash own labor; never adds savings twice', () => {
    const r = productionSummary(costs(sample()));
    expect(r.charge).toBe(1250000);
    expect(r.profit).toBe(-375000);
    expect(r.saving).toBe(350000);
    expect(r.cash).toBe(-580000);
    expect(r.receivable).toBe(375000);
    expect(r.economicProfit).toBe(-475000);
  });
  it('keeps capex out of operating profit while including it in cash', () => {
    let s = sample();
    s.expenses.push({
      ...s.expenses[0],
      id: 'EXP-008',
      category: 'Investasi',
      amount: 200000,
      paidAt: day,
      submissionKey: 'invest',
    });
    s = costs(s);
    const r = productionSummary(s);
    expect(r.operating).toBe(1080000);
    expect(r.investment).toBe(200000);
    expect(r.profit).toBe(-375000);
    expect(r.cash).toBe(-780000);
  });
  it('uses reviewed shares for shared bills without altering bill totals', () => {
    const s = costs(sample(), {
      shares: Object.fromEntries(
        createFixture().expenses.map((e) => [e.id, e.id === 'EXP-003' ? 50 : 100]),
      ),
    });
    expect(productionSummary(s).operating).toBe(1012500);
    expect(s.expenses.find((e) => e.id === 'EXP-003')!.amount).toBe(135000);
  });
  it('invalidates review when an expense is edited, voided or a new paid cost appears', () => {
    const base = costs(sample());
    for (const op of ['edit', 'void', 'add']) {
      const s = structuredClone(base);
      if (op === 'edit') s.expenses[0].amount += 1000;
      else if (op === 'void') s.expenses[0].status = 'void';
      else s.expenses.push({ ...s.expenses[0], id: 'EXP-009', submissionKey: 'new' });
      expect(productionSummary(s).reviewed).toBe(false);
      expect(productionSummary(s).saving).toBeNull();
    }
  });
  it('excludes void or draft records from charged costs', () => {
    const s = costs(sample());
    s.expenses[0].status = 'void';
    s.expenses[1].status = 'draft';
    expect(productionSummary(s).operating).toBe(390000);
  });
  it('does not equate unknown noncash costs with a confirmed zero', () => {
    expect(() => costs(sample(), { depreciation: null })).toThrow('Enter depreciation');
    const s = costs(sample(), { depreciation: 0, unpaidLabor: 0, otherAccrued: 0 });
    expect(productionSummary(s).reviewed).toBe(true);
  });
  it('requires an explicit share or exclusion for each bill before final review', () => {
    expect(() => costs(sample(), { shares: { 'EXP-001': 100 } })).toThrow('Allocate a share');
    expect(() => costs(sample(), { shares: { 'EXP-001': 101 } })).toThrow();
  });
  it('allows missing baseline and zero revenue without fabricated percentages', () => {
    const s = costs(createFixture(), { baselineCost: null });
    expect(productionSummary(s).saving).toBeNull();
    expect(productionSummary(s).margin).toBeNull();
  });
  it('accepts seed, packing and other costs in the existing shared ledger', () => {
    const s = createFixture();
    for (const category of ['Benih & media', 'Kemasan & distribusi', 'Sewa & lainnya'] as const)
      expect(validateExpense(s, { ...s.expenses[0], category })).toEqual([]);
  });
});
describe('closure, greenhouse scope and permissions', () => {
  it('lists unfinished inventory, receivables, cases and finance before closure', () => {
    const s = sample();
    expect(closingIssues(s).join(' ')).toMatch(/stock.*outstanding.*pest.*cost/i);
    expect(() => run(s, { type: 'crop_close', notes: 'Review akhir siklus selesai.' })).toThrow();
  });
  it('closes only after reconciliation, pauses routines and preserves historical relationships', () => {
    let s = sample();
    s.cases.forEach((c) => (c.status = 'closed'));
    for (const grade of ['A', 'B'] as const) {
      s = run(s, {
        type: 'crop_sale',
        sale: {
          lotId: s.production!.lots[0].id,
          grade,
          kg: lotStock(s.production!, s.production!.lots[0], grade),
          price: 30000,
          date: day,
          dueOn: day,
          buyer: 'Pembeli akhir demo',
          key: 'final-' + grade,
        },
      });
    }
    for (const x of s.production!.sales) {
      const balance =
        Math.round(x.kg * x.price) -
        s.production!.receipts.filter((r) => r.saleId === x.id).reduce((n, r) => n + r.amount, 0);
      if (balance)
        s = run(s, {
          type: 'crop_receipt',
          receipt: {
            saleId: x.id,
            date: day,
            amount: balance,
            reference: 'Pelunasan demo',
            key: 'final-' + x.id,
          },
        });
    }
    s.routines.forEach((r) => {
      r.status = 'Paused';
    });
    for (const b of cultivation(s).batches.filter((b) => b.status === 'active')) {
      s = run(s, {
        type: 'planting_count',
        id: b.id,
        kind: 'remove',
        quantity: b.currentPlants,
        reason: 'Tanaman selesai dipanen dan dicabut.',
        key: 'close-' + b.id,
      });
      s = run(s, {
        type: 'planting_close',
        id: b.id,
        notes: 'Pekerjaan batch selesai dan lahan dibersihkan.',
      });
    }
    s = costs(s);
    expect(closingIssues(s)).toEqual([]);
    s = run(s, {
      type: 'crop_close',
      notes: 'Semua tanaman, biaya, hasil dan pekerjaan sudah direview.',
    });
    expect(s.production!.stage).toBe('closed');
    expect(productionSummary(s).reviewed).toBe(true);
    expect(s.routines.some((r) => r.status === 'Active')).toBe(false);
    expect(() => run(s, harvest())).toThrow('cycle is closed');
    expect(() => run(s, { type: 'run_once', id: 'RTN-001' })).toThrow('cycle is closed');
    s = run(s, { type: 'crop_reopen', notes: 'Perlu koreksi catatan hasil pada siklus.' });
    expect(productionSummary(s).reviewed).toBe(false);
    expect(s.routines.some((r) => r.status === 'Active')).toBe(false);
    expect(s.production!.lots).toHaveLength(1);
  });
  it('keeps cycle records isolated per greenhouse and persists them', () => {
    const memory = new Map<string, string>(),
      storage = {
        getItem: (k: string) => memory.get(k) ?? null,
        setItem: (k: string, v: string) => {
          memory.set(k, v);
        },
      };
    const store = createDomainStore(storage);
    store.getState().dispatch({ type: 'crop_sample' });
    store.getState().switchGreenhouse('GH-02');
    expect(productionSummary(store.getState().data).revenue).toBe(0);
    const restored = createDomainStore(storage);
    restored.getState().switchGreenhouse('GH-01');
    expect(productionSummary(restored.getState().data).revenue).toBe(875000);
  });
  it('splits fieldwork, review and finance permissions', () => {
    expect(actionPermission(harvest())).toBe('cultivation');
    expect(can('Operator', 'cultivation')).toBe(true);
    expect(can('Operator', 'finance')).toBe(false);
    expect(actionPermission({ type: 'crop_release', id: 'LOT-001', notes: 'Review catatan' })).toBe(
      'crop_review',
    );
    expect(can('Viewer', 'cultivation')).toBe(false);
    expect(can('Viewer', 'crop_review')).toBe(false);
  });
});
