import type { DomainState, ExpenseRecord } from '../domain/types';
import type { SupplyItem } from '../domain/supplyTypes';
import { activity, localDate, nextId } from '../domain/format';
import { activeBatch, initializeCultivation } from '../domain/zones';
import { applySupply, supplyState } from '../domain/supplies';
import {
  applyProduction,
  cycleExpenses,
  kgRound,
  production,
  zoneCases,
} from '../domain/production';
import { applyResource, resources } from '../domain/efficiency';
import { validateExpense } from '../domain/costs';

export const STARTER_RECORDS_VERSION = 'starter_records_v1';
const prefix = 'starter-2026-10-v1';
const note = 'Presentation sample; not an actual transaction or completed field task.';
const seededExpense = (e: ExpenseRecord) =>
  e.source === 'demo_ledger' &&
  (e.submissionKey.startsWith('fixture-') || e.submissionKey.startsWith(prefix));

/** Enrich only recognized starter crops, and only untouched modules. User rows,
 * custom greenhouses, closed cycles, active devices and run history stay intact. */
export function addStarterRecords(bank: Record<string, DomainState>): string[] {
  const changed: string[] = [];
  for (const s of Object.values(bank)) {
    const expectedCycle = { 'GH-01': 'PAP-2026-08', 'GH-02': 'PAP-CW-2026-08' }[s.greenhouse.id];
    if (
      !expectedCycle ||
      s.cycle.id !== expectedCycle ||
      s.cycle.plantedOn !== '2026-08-10' ||
      !s.expenses.some(seededExpense) ||
      s.production?.stage === 'closed' ||
      localDate(s.clock) < '2026-10-13'
    )
      continue;
    const before = JSON.stringify(s);
    const previousNotice = s.notification;
    const operator = s.greenhouse.id === 'GH-02' ? 'Mira Lestari' : 'Budi Santoso';
    const scale = s.greenhouse.id === 'GH-02' ? 0.8 : 1;
    const key = (id: string) => `${prefix}:${s.greenhouse.id}:${id}`;
    const device = (id: string) => (s.devices.some((d) => d.id === id && d.active) ? id : '');
    initializeCultivation(s);
    const supplies = supplyState(s);
    if (!supplies.items.length && !supplies.movements.length) {
      const items: [
        string,
        SupplyItem['unit'],
        SupplyItem['category'],
        string,
        number,
        number,
        number,
        number,
      ][] = [
        ['AB mix nutrient A', 'L', 'Nutrisi', 'DOSE-01', 5, 20, 12, 320000],
        ['AB mix nutrient B', 'L', 'Nutrisi', 'DOSE-01', 5, 20, 14, 320000],
        ['Yellow sticky trap', 'pcs', 'Perawatan', 'CAM-B-02', 8, 30, 26, 90000],
        ['Irrigation filter', 'pcs', 'Perawatan', 'PUMP-01', 2, 6, 2, 120000],
        ['Reserve water', 'L', 'Air', 'LEVEL-01', 250, 1000, 650, 30000],
      ];
      for (const [name, unit, category, deviceId, reorderAt, incoming, used, cost] of items) {
        const item = {
          name,
          unit,
          category,
          deviceId: device(deviceId),
          reorderAt,
          operator,
          autoTask: false,
        };
        const id = applySupply(s, { type: 'supply_item', item, actor: operator }).id;
        const expense: ExpenseRecord = {
          id: nextId('EXP', s.expenses),
          greenhouseId: s.greenhouse.id,
          paidAt: '2026-10-02',
          category,
          amount: Math.round(cost * scale),
          source: 'demo_ledger',
          status: 'paid',
          deviceId: item.deviceId || undefined,
          note: `${name}, ${incoming} ${unit}. ${note}`,
          reference: `AWAL-OKT-${id}`,
          submissionKey: key(`purchase-${id}`),
          createdAt: '2026-10-02T09:00:00+07:00',
        };
        const errors = validateExpense(s, expense);
        if (errors.length) throw new Error(errors.join(' '));
        s.expenses.push(expense);
        applySupply(s, {
          type: 'supply_move',
          itemId: id,
          kind: 'in',
          quantity: incoming,
          date: '2026-10-02',
          notes: `Early October purchase. ${note}`,
          key: key(`in-${id}`),
          expenseId: expense.id,
          actor: operator,
        });
        applySupply(s, {
          type: 'supply_move',
          itemId: id,
          kind: 'use',
          quantity: used,
          date: '2026-10-12',
          notes: `Inventory usage from 2–12 October. ${note}`,
          key: key(`use-${id}`),
          actor: operator,
        });
        // Enable the stock reminder after opening balance, so a transient zero
        // does not create a spurious refill task for every new item.
        if (item.deviceId)
          applySupply(s, {
            type: 'supply_item',
            id,
            item: { ...item, autoTask: true },
            actor: operator,
          });
      }
    }

    const p = (s.production = production(s));
    if (!p.tasks.length) {
      for (const [zoneId, title, done] of [
        ['D', 'Check ripeness and harvest container cleanliness', true],
        ['A', 'Sort fruit and inspect plant supports', true],
        ['B', 'Review traps and pest inspection findings', false],
        ['D', 'Prepare packaging for the next delivery', false],
      ] as const) {
        if (!activeBatch(s, zoneId) || s.zones.find((z) => z.id === zoneId)?.status === 'inactive')
          continue;
        const id = applyProduction(s, {
          type: 'crop_task',
          task: {
            zoneId,
            title,
            dueOn: done ? '2026-10-13' : '2026-10-18',
            operator,
            key: key(`task-${zoneId}-${done}`),
          },
        }).id!;
        if (done)
          applyProduction(s, {
            type: 'crop_task_done',
            id,
            notes: `Inspection recorded for the sample workflow. ${note}`,
          });
      }
    }

    // Never fabricate sales against a user's harvest, or mix sample lots into
    // an existing production ledger. Seed the complete chain together.
    if (!p.lots.length && !p.sales.length && !p.receipts.length && !p.losses.length) {
      const specs = [
        { zone: 'D', gross: 72, a: 52, b: 17, reject: 3 },
        { zone: 'A', gross: 50, a: 34, b: 14, reject: 2 },
        { zone: 'B', gross: 18, a: 12, b: 4, reject: 2 },
      ];
      for (const spec of specs) {
        const batch = activeBatch(s, spec.zone);
        if (
          !batch ||
          batch.plantedOn > '2026-10-13' ||
          s.zones.find((z) => z.id === spec.zone)?.status === 'inactive'
        )
          continue;
        const lotId = applyProduction(s, {
          type: 'crop_harvest',
          lot: {
            zoneId: spec.zone,
            date: '2026-10-13',
            grossKg: kgRound(spec.gross * scale),
            aKg: kgRound(spec.a * scale),
            bKg: kgRound(spec.b * scale),
            rejectedKg: kgRound(spec.reject * scale),
            operator,
            notes: `Sort peppers into grades A, B, and reject. ${note}`,
            key: key(`lot-${spec.zone}`),
          },
        }).id!;
        if (zoneCases(s, spec.zone).length) continue;
        applyProduction(s, {
          type: 'crop_release',
          id: lotId,
          notes: `Sample quality review: sorting completed and no open cases in the zone. ${note}`,
        });
        const sales =
          spec.zone === 'D'
            ? [
                {
                  grade: 'A' as const,
                  kg: 40,
                  price: 38000,
                  buyer: 'Toko Sayur Cemerlang',
                  paid: 1,
                },
                { grade: 'B' as const, kg: 10, price: 24000, buyer: 'Dapur Kebun', paid: 0.5 },
              ]
            : spec.zone === 'A'
              ? [
                  {
                    grade: 'A' as const,
                    kg: 20,
                    price: 38000,
                    buyer: 'Koperasi Pangan Bogor',
                    paid: 0,
                  },
                ]
              : [];
        for (const sale of sales) {
          const saleId = applyProduction(s, {
            type: 'crop_sale',
            sale: {
              lotId,
              grade: sale.grade,
              kg: sale.kg * scale,
              price: sale.price,
              buyer: sale.buyer,
              date: '2026-10-13',
              dueOn: '2026-10-20',
              key: key(`sale-${spec.zone}-${sale.grade}`),
            },
          }).id!;
          if (sale.paid)
            applyProduction(s, {
              type: 'crop_receipt',
              receipt: {
                saleId,
                date: '2026-10-13',
                amount: Math.round(sale.kg * scale * sale.price * sale.paid),
                reference: `Sample payment receipt ${saleId}`,
                key: key(`receipt-${saleId}`),
              },
            });
        }
        if (spec.zone === 'D')
          applyProduction(s, {
            type: 'crop_loss',
            loss: {
              lotId,
              grade: 'B',
              kg: scale,
              date: '2026-10-13',
              reason: `Fruit bruised during handling; removed from saleable stock. ${note}`,
              key: key('loss-D'),
            },
          });
      }
      if (
        p.lots.length &&
        !p.targetOn &&
        p.targetKg === null &&
        p.targetPrice === null &&
        !p.operator
      )
        applyProduction(s, {
          type: 'crop_setup',
          targetOn: '2026-10-20',
          targetKg: 200 * scale,
          targetPrice: 38000,
          operator,
        });
    }

    if (
      !Object.keys(p.expenseShares).length &&
      !p.finance.notes &&
      !p.finance.reviewKey &&
      [
        p.finance.depreciation,
        p.finance.unpaidLabor,
        p.finance.otherAccrued,
        p.finance.baselineCost,
      ].every((n) => n === null) &&
      s.expenses.every(seededExpense) &&
      p.lots.some((l) => l.key.startsWith(prefix))
    ) {
      const expenses = cycleExpenses(s).filter((e) => e.status === 'paid');
      const operating = expenses
        .filter((e) => e.category !== 'Investasi')
        .reduce((n, e) => n + e.amount, 0);
      applyProduction(s, {
        type: 'crop_costs',
        shares: Object.fromEntries(expenses.map((e) => [e.id, 100])),
        depreciation: Math.round(120000 * scale),
        unpaidLabor: Math.round(150000 * scale),
        otherAccrued: 0,
        baselineCost: operating + Math.round(420000 * scale),
        reviewed: true,
        notes: `Sample cycle calculation: each purchase is recorded once, with depreciation of IDR${Math.round(120000 * scale)}. The comparison baseline is a presentation assumption, not measured savings. ${note}`,
      });
    }
    const r = resources(s);
    if (
      !r.extras.length &&
      !Object.keys(r.shares).length &&
      !r.notes &&
      !r.reviewKey &&
      !s.usages.some((u) => u.at >= '2026-10-01')
    ) {
      applyResource(s, {
        type: 'resource_extra',
        date: '2026-10-13',
        waterLiters: 1650 * scale,
        energyKwh: 12 * scale,
        basis: 'estimate',
        excludesRuns: true,
        notes: `Sample usage estimate for 1–13 October. Excludes September history and separately recorded executions. ${note}`,
        key: key('resources-october'),
      });
      // Coverage deliberately stays partial; no fabricated sensor reading or
      // device acknowledgement is needed to show the efficiency worksheet.
    }
    s.notification = previousNotice;
    if (JSON.stringify(s) !== before) {
      activity(
        s,
        'system',
        'Initial inventory and production records added',
        `Empty modules populated once. ${note} Existing records retained.`,
        STARTER_RECORDS_VERSION,
        undefined,
        'Vigor',
      );
      changed.push(s.greenhouse.id);
    }
  }
  return changed;
}
