import type { DomainState, ZoneId } from './types';
import type { Grade, HarvestLot, ProductionAction, ProductionState } from './productionTypes';
import { activity, isActiveRun, localDate, nextId } from './format';
import { activeBatch, cultivation, syncPlantCounts, zoneName } from './zones';

export const kgRound = (n: number) => Math.round(n * 1000) / 1000;
const rupiah = (n: number) => Math.round(n);
export function validProduction(value: unknown, cycleId: string): boolean {
  if (!value || typeof value !== 'object') return false;
  const p = value as ProductionState;
  const str = (v: unknown) => typeof v === 'string';
  const nonnegative = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0;
  const optionalNumber = (v: unknown) => v === null || nonnegative(v);
  if (
    p.version !== 1 ||
    p.cycleId !== cycleId ||
    !['growing', 'harvesting', 'closed'].includes(p.stage) ||
    !str(p.targetOn) ||
    !str(p.operator) ||
    !optionalNumber(p.targetKg) ||
    !optionalNumber(p.targetPrice) ||
    !p.expenseShares ||
    typeof p.expenseShares !== 'object' ||
    !Object.values(p.expenseShares).every((n) => nonnegative(n) && n <= 100) ||
    !p.finance ||
    ![
      p.finance.depreciation,
      p.finance.unpaidLabor,
      p.finance.otherAccrued,
      p.finance.baselineCost,
    ].every(optionalNumber) ||
    !str(p.finance.notes) ||
    !(p.finance.reviewKey === null || str(p.finance.reviewKey)) ||
    (p.stage === 'closed' && (!str(p.closedOn) || !str(p.closingNotes)))
  )
    return false;
  return (
    Array.isArray(p.tasks) &&
    p.tasks.every(
      (t) =>
        t &&
        [t.id, t.title, t.zoneId, t.dueOn, t.operator, t.notes, t.key].every(str) &&
        ['pending', 'done'].includes(t.status),
    ) &&
    Array.isArray(p.lots) &&
    p.lots.every(
      (l) =>
        l &&
        [l.id, l.zoneId, l.date, l.notes, l.operator, l.key].every(str) &&
        ['held', 'released', 'void'].includes(l.status) &&
        [l.grossKg, l.aKg, l.bKg, l.rejectedKg].every(nonnegative),
    ) &&
    Array.isArray(p.sales) &&
    p.sales.every(
      (x) =>
        x &&
        [x.id, x.lotId, x.date, x.dueOn, x.buyer, x.key].every(str) &&
        ['A', 'B'].includes(x.grade) &&
        ['recorded', 'void'].includes(x.status) &&
        [x.kg, x.price].every(nonnegative),
    ) &&
    Array.isArray(p.receipts) &&
    p.receipts.every(
      (x) => x && [x.id, x.saleId, x.date, x.reference, x.key].every(str) && nonnegative(x.amount),
    ) &&
    Array.isArray(p.losses) &&
    p.losses.every(
      (x) =>
        x &&
        [x.id, x.lotId, x.date, x.reason, x.key].every(str) &&
        ['A', 'B'].includes(x.grade) &&
        nonnegative(x.kg),
    )
  );
}
export function production(s: DomainState): ProductionState {
  if (s.production?.version === 1 && s.production.cycleId === s.cycle.id) return s.production;
  return {
    version: 1,
    cycleId: s.cycle.id,
    stage: 'growing',
    targetOn: '',
    targetKg: null,
    targetPrice: null,
    operator: '',
    tasks: [],
    lots: [],
    sales: [],
    receipts: [],
    losses: [],
    expenseShares: {},
    finance: {
      depreciation: null,
      unpaidLabor: null,
      otherAccrued: null,
      baselineCost: null,
      notes: '',
      reviewKey: null,
    },
  };
}
export function zoneCases(s: DomainState, zoneId: ZoneId) {
  return s.cases.filter((c) => c.zoneId === zoneId && c.status !== 'closed');
}
export function lotStock(p: ProductionState, lot: HarvestLot, grade: Grade) {
  if (lot.status === 'void') return 0;
  return kgRound(
    (grade === 'A' ? lot.aKg : lot.bKg) -
      p.sales
        .filter((x) => x.lotId === lot.id && x.grade === grade && x.status === 'recorded')
        .reduce((n, x) => n + x.kg, 0) -
      p.losses.filter((x) => x.lotId === lot.id && x.grade === grade).reduce((n, x) => n + x.kg, 0),
  );
}
export function cycleExpenses(s: DomainState) {
  const p = production(s),
    end = p.closedOn ?? localDate(s.clock);
  return s.expenses.filter(
    (e) =>
      e.greenhouseId === s.greenhouse.id &&
      (e.paidAt <= end || Object.hasOwn(p.expenseShares, e.id)),
  );
}
export function financeKey(s: DomainState) {
  const p = production(s);
  return JSON.stringify([
    s.cycle.id,
    cycleExpenses(s).map((e) => [
      e.id,
      e.amount,
      e.status,
      e.category,
      e.paidAt,
      e.usageSlices,
      p.expenseShares[e.id] ?? null,
    ]),
    p.finance.depreciation,
    p.finance.unpaidLabor,
    p.finance.otherAccrued,
  ]);
}
export function productionSummary(s: DomainState) {
  const p = production(s),
    lots = p.lots.filter((l) => l.status !== 'void'),
    sales = p.sales.filter((x) => x.status === 'recorded');
  const revenue = sales.reduce((n, x) => n + rupiah(x.kg * x.price), 0);
  const received = p.receipts
    .filter((r) => sales.some((x) => x.id === r.saleId))
    .reduce((n, x) => n + x.amount, 0);
  const costs = cycleExpenses(s)
    .filter((e) => e.status === 'paid')
    .map((e) => ({
      record: e,
      percent: p.expenseShares[e.id] ?? 0,
      amount: rupiah((e.amount * (p.expenseShares[e.id] ?? 0)) / 100),
    }));
  const operating = costs
    .filter((e) => e.record.category !== 'Investasi')
    .reduce((n, x) => n + x.amount, 0);
  const investment = costs
    .filter((e) => e.record.category === 'Investasi')
    .reduce((n, x) => n + x.amount, 0);
  const charge = operating + (p.finance.depreciation ?? 0) + (p.finance.otherAccrued ?? 0);
  const profit = revenue - charge;
  const stock = kgRound(lots.reduce((n, l) => n + lotStock(p, l, 'A') + lotStock(p, l, 'B'), 0));
  const harvest = kgRound(lots.reduce((n, l) => n + l.grossKg, 0));
  const rejected = kgRound(lots.reduce((n, l) => n + l.rejectedKg, 0));
  const loss = kgRound(p.losses.reduce((n, l) => n + l.kg, 0));
  const sold = kgRound(sales.reduce((n, x) => n + x.kg, 0));
  const reviewed = !!p.finance.reviewKey && p.finance.reviewKey === financeKey(s);
  const saving =
    p.finance.baselineCost === null || !reviewed ? null : p.finance.baselineCost - charge;
  return {
    p,
    lots,
    sales,
    revenue,
    received,
    receivable: revenue - received,
    costs,
    operating,
    investment,
    charge,
    profit,
    economicProfit: profit - (p.finance.unpaidLabor ?? 0),
    cash: received - operating - investment,
    stock,
    harvest,
    rejected,
    loss,
    sold,
    reviewed,
    saving,
    margin: revenue > 0 ? (profit / revenue) * 100 : null,
    unassigned: costs.filter((x) => !Object.hasOwn(p.expenseShares, x.record.id)).length,
    heldKg: kgRound(
      lots
        .filter((l) => l.status === 'held' || zoneCases(s, l.zoneId).length > 0)
        .reduce((n, l) => n + lotStock(p, l, 'A') + lotStock(p, l, 'B'), 0),
    ),
  };
}
export function closingIssues(s: DomainState) {
  const r = productionSummary(s),
    issues: string[] = [];
  if (!r.lots.length) issues.push('No harvest recorded yet.');
  if (r.stock > 0) issues.push('Produce remains in stock. Record sales or losses with a reason.');
  if (r.receivable > 0) issues.push('Some sales payments remain outstanding.');
  if (s.cases.some((c) => c.status !== 'closed'))
    issues.push('Complete reviews and follow-up for open pest cases.');
  if (r.p.tasks.some((t) => t.status === 'pending')) issues.push('Some care tasks are incomplete.');
  if (s.runs.some((r) => isActiveRun(r.status) || r.status === 'Needs reconciliation'))
    issues.push('Complete or reconcile automation executions.');
  if (cultivation(s).batches.some((b) => b.status === 'active'))
    issues.push(
      'Close planting batches under Zones & crops after reconciling plant counts and work.',
    );
  if (!r.reviewed) issues.push('Review cycle costs, depreciation, and unpaid expenses.');
  return issues;
}
function check(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
function amount(n: number, positive = false, max = 1e12) {
  check(
    Number.isFinite(n) && n >= (positive ? 0.001 : 0) && n <= max,
    'Invalid amount or quantity.',
  );
}
function date(s: DomainState, d: string, min = s.cycle.plantedOn, future = false) {
  check(
    /^\d{4}-\d{2}-\d{2}$/.test(d) &&
      Number.isFinite(Date.parse(d)) &&
      new Date(d).toISOString().slice(0, 10) === d,
    'Invalid date.',
  );
  check(
    d >= min && (future || d <= localDate(s.clock)),
    'Date must fall within the cycle and cannot be in the future.',
  );
}
function textRequired(v: string, label: string, min = 3) {
  check(v.trim().length >= min && v.length <= 2000, `${label} minimal ${min} karakter.`);
}
function gradeCheck(g: Grade) {
  check(g === 'A' || g === 'B', 'Select grade A or B.');
}

/** Frontend-only crop records; no physical work, stock movement or payments are performed. */
export function applyProduction(
  s: DomainState,
  a: ProductionAction,
): { ok: true; message: string; id?: string } {
  const p = (s.production = production(s));
  let id: string | undefined,
    message = 'Cycle record saved.';
  if (p.stage === 'closed' && a.type !== 'crop_reopen')
    throw new Error('The cycle is closed. Reopen its review before editing records.');
  switch (a.type) {
    case 'crop_setup':
      if (a.targetOn) date(s, a.targetOn, s.cycle.plantedOn, true);
      if (a.targetKg !== null) amount(a.targetKg, true, 1000000);
      if (a.targetPrice !== null) {
        amount(a.targetPrice, true);
        check(Number.isInteger(a.targetPrice), 'Price must be a whole Rupiah amount.');
      }
      textRequired(a.operator, 'Assigned to');
      Object.assign(p, {
        targetOn: a.targetOn,
        targetKg: a.targetKg,
        targetPrice: a.targetPrice,
        operator: a.operator.trim(),
      });
      message = 'Cycle targets and assigned operator updated.';
      break;
    case 'crop_task': {
      const t = a.task;
      check(
        s.zones.some((z) => z.id === t.zoneId),
        'Zone not found.',
      );
      date(s, t.dueOn, s.cycle.plantedOn, true);
      check(
        s.zones.find((z) => z.id === t.zoneId)?.status !== 'inactive',
        'Activate the zone before creating care tasks.',
      );
      const batch = activeBatch(s, t.zoneId);
      check(
        !t.plantingId || t.plantingId === batch?.id,
        'This planting batch is no longer active. Reopen the care form.',
      );
      textRequired(t.title, 'Task name');
      textRequired(t.operator, 'Operator');
      textRequired(t.key, 'Record key');
      const old = p.tasks.find((x) => x.key === t.key);
      if (old) return { ok: true, message: 'Task already saved.', id: old.id };
      id = nextId('CARE', p.tasks);
      p.tasks.push({ ...t, plantingId: batch?.id, id, status: 'pending', notes: '' });
      message = `Maintenance ${t.title} scheduled for ${zoneName(s, t.zoneId)}.`;
      break;
    }
    case 'crop_task_done': {
      const t = p.tasks.find((x) => x.id === a.id);
      check(t, 'Task not found.');
      textRequired(a.notes, 'Work results', 5);
      if (t.status === 'done') return { ok: true, message: 'Task already completed.', id: t.id };
      t.status = 'done';
      t.notes = a.notes.trim();
      t.completedOn = localDate(s.clock);
      id = t.id;
      message = 'Care results recorded. No expense was created automatically.';
      break;
    }
    case 'crop_harvest': {
      const l = a.lot;
      const old = p.lots.find((x) => x.key === l.key);
      if (old) return { ok: true, message: 'Lot already saved.', id: old.id };
      date(s, l.date);
      check(
        s.zones.some((z) => z.id === l.zoneId),
        'Zone not found.',
      );
      const batch = activeBatch(s, l.zoneId);
      check(
        batch && s.zones.find((z) => z.id === l.zoneId)?.status !== 'inactive',
        'Create an active planting batch in the zone before recording a harvest.',
      );
      check(
        !l.plantingId || l.plantingId === batch.id,
        'The planting batch changed. Reopen the harvest form.',
      );
      check(l.date >= batch.plantedOn, 'Harvest date cannot precede the batch planting date.');
      [l.grossKg, l.aKg, l.bKg, l.rejectedKg].forEach((x) => {
        amount(x, false, 1000000);
        check(kgRound(x) === x, 'Weight supports up to three decimal places.');
      });
      check(
        l.grossKg > 0 && Math.abs(l.grossKg - l.aKg - l.bKg - l.rejectedKg) < 0.0001,
        'Total harvest must equal grade A + grade B + rejects.',
      );
      textRequired(l.operator, 'Operator');
      textRequired(l.notes, 'Sorting notes', 5);
      textRequired(l.key, 'Record key');
      id = nextId('LOT', p.lots);
      p.lots.push({
        ...l,
        id,
        plantingId: batch.id,
        crop: batch.crop,
        variety: batch.variety,
        status: 'held',
      });
      if (s.cultivation) {
        const current = s.cultivation.batches.find((b) => b.id === batch.id);
        if (current) current.stage = 'Panen';
        syncPlantCounts(s);
      }
      p.stage = 'harvesting';
      message = 'Harvest recorded. Review the lot before making it available for sale.';
      break;
    }
    case 'crop_release': {
      const l = p.lots.find((x) => x.id === a.id);
      check(l && l.status !== 'void', 'Lot not found.');
      check(
        !zoneCases(s, l.zoneId).length,
        'This zone has open pest cases. Complete follow-up before releasing the lot.',
      );
      textRequired(a.notes, 'Lot review findings', 10);
      l.status = 'released';
      l.reviewNotes = a.notes;
      l.reviewedOn = localDate(s.clock);
      id = l.id;
      message = 'Lot available for recording sales.';
      break;
    }
    case 'crop_lot_void': {
      const l = p.lots.find((x) => x.id === a.id);
      check(l, 'Lot not found.');
      textRequired(a.notes, 'Reason for voiding', 5);
      check(
        !p.sales.some((x) => x.lotId === l.id && x.status === 'recorded') &&
          !p.losses.some((x) => x.lotId === l.id),
        'This lot has sales or loss records and cannot be voided.',
      );
      l.status = 'void';
      id = l.id;
      message = `Harvest record ${l.id} voided.`;
      break;
    }
    case 'crop_sale': {
      const x = a.sale;
      const old = p.sales.find((y) => y.key === x.key);
      if (old) return { ok: true, message: 'Sale already saved.', id: old.id };
      const lot = p.lots.find((l) => l.id === x.lotId);
      check(lot && lot.status === 'released', 'Review the lot before recording a sale.');
      check(!zoneCases(s, lot.zoneId).length, 'This zone has an open case. Lot sales are on hold.');
      gradeCheck(x.grade);
      date(s, x.date, lot.date);
      date(s, x.dueOn, x.date, true);
      textRequired(x.buyer, 'Buyer');
      textRequired(x.key, 'Record key');
      amount(x.kg, true, 1000000);
      check(kgRound(x.kg) === x.kg, 'Weight supports up to three decimal places.');
      amount(x.price, true, 1e9);
      check(Number.isInteger(x.price), 'Price must be a whole Rupiah amount.');
      check(
        x.kg <= lotStock(p, lot, x.grade),
        'Sale quantity exceeds available stock for this grade.',
      );
      amount(rupiah(x.kg * x.price), true);
      id = nextId('SALE', p.sales);
      p.sales.push({ ...x, id, status: 'recorded' });
      message = 'Sale recorded as an invoice. Record cash received separately.';
      break;
    }
    case 'crop_sale_void': {
      const x = p.sales.find((x) => x.id === a.id);
      check(x, 'Sale not found.');
      textRequired(a.notes, 'Reason for voiding', 5);
      check(
        !p.receipts.some((r) => r.saleId === x.id),
        'This sale already has a payment receipt. Returns and refunds are not supported in this prototype.',
      );
      x.status = 'void';
      id = x.id;
      message = 'Sale voided and stock restored.';
      break;
    }
    case 'crop_receipt': {
      const r = a.receipt,
        old = p.receipts.find((x) => x.key === r.key);
      if (old) return { ok: true, message: 'Payment receipt already saved.', id: old.id };
      const sale = p.sales.find((x) => x.id === r.saleId && x.status === 'recorded');
      check(sale, 'Sale not found.');
      date(s, r.date, sale.date);
      amount(r.amount, true);
      check(Number.isInteger(r.amount), 'Receipt amount must be a whole Rupiah value.');
      textRequired(r.reference, 'Receipt reference');
      textRequired(r.key, 'Record key');
      const balance =
        rupiah(sale.kg * sale.price) -
        p.receipts.filter((x) => x.saleId === sale.id).reduce((n, x) => n + x.amount, 0);
      check(r.amount <= balance, 'Receipt amount exceeds the outstanding balance.');
      id = nextId('PAY', p.receipts);
      p.receipts.push({ ...r, id });
      message = 'Payment receipt recorded; receivables updated.';
      break;
    }
    case 'crop_loss': {
      const x = a.loss,
        old = p.losses.find((y) => y.key === x.key);
      if (old) return { ok: true, message: 'Loss already saved.', id: old.id };
      const lot = p.lots.find((l) => l.id === x.lotId && l.status !== 'void');
      check(lot, 'Lot not found.');
      gradeCheck(x.grade);
      date(s, x.date, lot.date);
      amount(x.kg, true, 1000000);
      check(
        kgRound(x.kg) === x.kg && x.kg <= lotStock(p, lot, x.grade),
        'Loss quantity cannot exceed available stock for this grade.',
      );
      textRequired(x.reason, 'Reason for loss', 5);
      textRequired(x.key, 'Record key');
      id = nextId('LOSS', p.losses);
      p.losses.push({ ...x, id });
      message = 'Loss recorded. Stock reduced without creating revenue.';
      break;
    }
    case 'crop_costs': {
      const eligible = cycleExpenses(s);
      for (const [eid, n] of Object.entries(a.shares)) {
        check(
          eligible.some((e) => e.id === eid && e.status === 'paid'),
          'Select a paid expense from this greenhouse.',
        );
        amount(n, false, 100);
      }
      for (const n of [a.depreciation, a.unpaidLabor, a.otherAccrued, a.baselineCost])
        if (n !== null) {
          amount(n);
          check(Number.isInteger(n), 'Cost must be a whole Rupiah amount.');
        }
      if (a.reviewed) {
        check(
          eligible.filter((e) => e.status === 'paid').every((e) => Object.hasOwn(a.shares, e.id)),
          'Allocate a share to each expense. Zero percent explicitly excludes it.',
        );
        check(
          [a.depreciation, a.unpaidLabor, a.otherAccrued].every((n) => n !== null),
          'Enter depreciation, unpaid owner labor, and unpaid costs. Enter zero only when none apply.',
        );
        textRequired(a.notes, 'Cost coverage notes', 10);
      }
      p.expenseShares = { ...a.shares };
      p.finance = {
        depreciation: a.depreciation,
        unpaidLabor: a.unpaidLabor,
        otherAccrued: a.otherAccrued,
        baselineCost: a.baselineCost,
        notes: a.notes,
        reviewKey: null,
      };
      if (a.reviewed) p.finance.reviewKey = financeKey(s);
      message = 'Cost shares saved. Original bills and device allocations are not duplicated.';
      break;
    }
    case 'crop_close': {
      textRequired(a.notes, 'Closing notes', 10);
      const issues = closingIssues(s);
      check(!issues.length, issues.join(' '));
      p.stage = 'closed';
      p.closedOn = localDate(s.clock);
      p.closingNotes = a.notes;
      s.playing = false;
      s.routines.forEach((r) => {
        if (r.status === 'Active') r.status = 'Paused';
      });
      message = 'Cycle closed. Active routines paused; history retained.';
      break;
    }
    case 'crop_reopen':
      textRequired(a.notes, 'Reason for reopening', 10);
      p.stage = p.lots.length ? 'harvesting' : 'growing';
      delete p.closedOn;
      p.finance.reviewKey = null;
      message =
        'Cycle reopened for corrections. Routines remain paused until manually reactivated.';
      break;
    case 'crop_sample': {
      check(
        !p.lots.length && !p.sales.length && !p.receipts.length,
        'Samples can only be loaded before any harvest or sale is recorded.',
      );
      const zone = activeBatch(s, 'D')
        ? 'D'
        : cultivation(s).batches.find((b) => b.status === 'active')?.zoneId;
      check(zone, 'Create planting batches before loading sample harvests.');
      const day = localDate(s.clock);
      date(s, day);
      p.operator = 'Budi Santoso';
      p.targetOn = day;
      p.targetKg = 120;
      p.targetPrice = 35000;
      applyProduction(s, {
        type: 'crop_harvest',
        lot: {
          date: day,
          zoneId: zone,
          grossKg: 50,
          aKg: 35,
          bKg: 12,
          rejectedKg: 3,
          notes: 'Sample sorting record; not an actual harvest.',
          operator: 'Budi Santoso',
          key: 'crop-sample-lot',
        },
      });
      const lot = p.lots.at(-1)!;
      if (!zoneCases(s, zone).length) {
        applyProduction(s, {
          type: 'crop_release',
          id: lot.id,
          notes: 'Sample review completed. No open cases in this zone.',
        });
        applyProduction(s, {
          type: 'crop_sale',
          sale: {
            lotId: lot.id,
            grade: 'A',
            kg: 25,
            price: 35000,
            date: day,
            dueOn: day,
            buyer: 'Sample produce shop',
            key: 'crop-sample-sale',
          },
        });
        applyProduction(s, {
          type: 'crop_receipt',
          receipt: {
            saleId: p.sales.at(-1)!.id,
            date: day,
            amount: 500000,
            reference: 'Sample receipt',
            key: 'crop-sample-receipt',
          },
        });
      }
      s.playing = false;
      message =
        'Sample harvest loaded. Values are synthetic; existing costs and cases are unchanged.';
      break;
    }
  }
  const sourceId =
    a.type === 'crop_receipt'
      ? a.receipt.saleId
      : a.type === 'crop_loss'
        ? a.loss.lotId
        : (id ?? 'CROP-' + s.cycle.id);
  activity(
    s,
    'system',
    message,
    a.type === 'crop_sample'
      ? 'Synthetic presentation data.'
      : 'notes' in a
        ? a.notes
        : 'Record linked to cycle ' + s.cycle.id,
    sourceId,
    undefined,
    p.operator || 'Sample operator',
  );
  s.notification = message;
  return { ok: true, message, id };
}
