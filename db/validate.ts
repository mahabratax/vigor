import type { DomainState } from '../src/domain/types';
import { validCultivation, cultivation } from '../src/domain/zones';
import { validProduction, lotStock } from '../src/domain/production';
import { validResources } from '../src/domain/efficiency';
import { validSupplies, supplyBalance } from '../src/domain/supplies';
import { validTargets } from '../src/domain/cropTargets';
import { validEnergy } from '../src/domain/energy';
const check = (value: unknown, message: string) => {
  if (!value) throw new Error(message + ' Records are unchanged.');
};
/** Validate BEFORE supplying defaults or removing derived fields. Never silently reset an import. */
export function validateModules(s: DomainState) {
  check(s.schemaVersion === 3, 'Greenhouse data version not supported.');
  if (s.production !== undefined)
    check(
      validProduction(s.production, s.cycle.id),
      'Production records are invalid or linked to another cycle.',
    );
  if (s.resources !== undefined)
    check(
      validResources(s.resources, s.cycle.id),
      'Usage records are invalid or linked to another cycle.',
    );
  if (s.energy !== undefined) check(validEnergy(s.energy), 'Invalid energy configuration.');
  if (s.targets !== undefined) check(validTargets(s.targets), 'Invalid crop targets.');
  if (s.supplies !== undefined) check(validSupplies(s.supplies), 'Invalid inventory records.');
  if (s.cultivation !== undefined) {
    check(validCultivation(s), 'Inconsistent batch, capacity, or plant counts.');
    for (const b of s.cultivation.batches) {
      let balance = b.initialPlants;
      for (const m of s.cultivation.movements.filter((m) => m.batchId === b.id)) {
        check(
          ['add', 'loss', 'remove'].includes(m.kind) &&
            Number.isSafeInteger(m.quantity) &&
            m.quantity > 0,
          'Invalid plant movement.',
        );
        balance += m.kind === 'add' ? m.quantity : -m.quantity;
        check(
          balance >= 0 && m.balance === balance,
          'Historical plant balance does not match movements.',
        );
      }
      check(balance === b.currentPlants, 'Plant count does not match movement history.');
      if (b.status === 'active')
        check(
          balance <= (s.zones.find((z) => z.id === b.zoneId)?.capacity ?? Infinity),
          'Plant count exceeds zone capacity.',
        );
    }
  }
  check(
    s.cycle.plants === s.zones.reduce((n, z) => n + z.plants, 0),
    'Cycle plant total differs from zone totals.',
  );
  for (const plan of s.plans)
    check(
      s.cases.find((c) => c.id === plan.caseId)?.zoneId === plan.zoneId,
      'Control plan zone differs from its pest case zone.',
    );
  for (const record of [
    ...(s.production?.tasks ?? []),
    ...(s.production?.lots ?? []),
    ...(s.targets?.revisions ?? []),
  ]) {
    const id = 'batchId' in record ? record.batchId : record.plantingId;
    if (id)
      check(
        cultivation(s).batches.find((b) => b.id === id)?.zoneId === record.zoneId,
        'Crop record is linked to a batch in another zone.',
      );
  }
  const billed = new Set<string>();
  for (const expense of s.expenses) {
    check(Number.isFinite(expense.amount) && expense.amount >= 0, 'Invalid expense amount.');
    if (expense.maintenanceId) {
      const ticket = s.maintenance.find((m) => m.id === expense.maintenanceId);
      check(
        ticket && ticket.deviceId === expense.deviceId,
        'Expense device differs from its maintenance ticket.',
      );
      check(!billed.has(expense.maintenanceId), 'One maintenance ticket has more than one bill.');
      billed.add(expense.maintenanceId);
    }
  }
  for (const ticket of s.maintenance)
    if (ticket.expenseId)
      check(
        s.expenses.some((e) => e.id === ticket.expenseId && e.maintenanceId === ticket.id),
        'Inconsistent maintenance expense links.',
      );
  if (s.production) {
    const p = s.production;
    for (const lot of p.lots) {
      check(
        Math.abs(lot.grossKg - lot.aKg - lot.bKg - lot.rejectedKg) < 0.002,
        'Harvest grades do not match total weight.',
      );
      for (const grade of ['A', 'B'] as const)
        check(lotStock(p, lot, grade) >= 0, 'Sales or losses exceed harvest lot stock.');
    }
    for (const sale of p.sales)
      check(
        p.receipts.filter((r) => r.saleId === sale.id).reduce((n, r) => n + r.amount, 0) <=
          Math.round(sale.kg * sale.price),
        'Receipts exceed the sales amount.',
      );
  }
  for (const item of s.supplies?.items ?? [])
    check(supplyBalance(s, item.id) >= 0, 'Inventory balance cannot be negative.');
}
