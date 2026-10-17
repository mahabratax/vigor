import type { DomainState } from './types';
import type { SupplyAction, SupplyItem, SupplyMovement, SupplyState } from './supplyTypes';
import { activity, iso, localDate, nextId } from './format';
export const supplyState = (s: DomainState): SupplyState =>
  s.supplies ?? { version: 1, items: [], movements: [] };
const round = (n: number) => Math.round(n * 1000) / 1000;
export const supplyBalance = (s: DomainState, id: string) =>
  round(
    supplyState(s)
      .movements.filter((m) => m.itemId === id)
      .reduce((n, m) => n + m.quantity, 0),
  );
export function validSupplyItem(item: Omit<SupplyItem, 'id' | 'active'>) {
  return (
    !!item &&
    typeof item.name === 'string' &&
    !!item.name.trim() &&
    ['L', 'kg', 'pcs'].includes(item.unit) &&
    ['Air', 'Nutrisi', 'Perawatan'].includes(item.category) &&
    Number.isFinite(item.reorderAt) &&
    item.reorderAt >= 0 &&
    item.reorderAt <= 1e7 &&
    (item.unit !== 'pcs' || Number.isInteger(item.reorderAt)) &&
    typeof item.deviceId === 'string' &&
    typeof item.operator === 'string' &&
    typeof item.autoTask === 'boolean'
  );
}
export function validSupplies(value: unknown): value is SupplyState {
  const p = value as SupplyState;
  if (!p || p.version !== 1 || !Array.isArray(p.items) || !Array.isArray(p.movements)) return false;
  if (
    !p.items.every(
      (i) => !!i && typeof i.id === 'string' && typeof i.active === 'boolean' && validSupplyItem(i),
    ) ||
    new Set(p.items.map((i) => i.id)).size !== p.items.length
  )
    return false;
  if (
    !p.movements.every(
      (m) =>
        m &&
        [m.id, m.itemId, m.date, m.notes, m.actor, m.key].every((v) => typeof v === 'string') &&
        ['in', 'use', 'waste', 'reversal'].includes(m.kind) &&
        Number.isFinite(m.quantity) &&
        m.quantity !== 0 &&
        Number.isFinite(Date.parse(m.date)) &&
        p.items.some((i) => i.id === m.itemId),
    )
  )
    return false;
  return p.items.every(
    (i) =>
      round(p.movements.filter((m) => m.itemId === i.id).reduce((n, m) => n + m.quantity, 0)) >= 0,
  );
}
function ensureRefillTask(s: DomainState, item: SupplyItem) {
  if (
    !item.active ||
    !item.autoTask ||
    supplyBalance(s, item.id) > item.reorderAt ||
    s.maintenance.some((m) => m.supplyItemId === item.id && m.status !== 'completed')
  )
    return;
  const device = s.devices.find((d) => d.id === item.deviceId && d.active);
  if (!device) return;
  const id = nextId('MNT', s.maintenance);
  s.maintenance.push({
    id,
    supplyItemId: item.id,
    deviceId: device.id,
    title: `Check and replenish ${item.name}`,
    operator: item.operator,
    status: 'open',
    createdAt: iso(s.clock),
    dueAt: localDate(s.clock),
    notes: `Stock ${supplyBalance(s, item.id)} ${item.unit}, reminder threshold ${item.reorderAt} ${item.unit}. Confirm requirements and record incoming stock or usage. This task does not start devices.`,
  });
  activity(
    s,
    'maintenance',
    'Stock reminder created',
    `${item.name}: ${id}. Awaiting operator work.`,
    id,
    device.zones[0],
  );
}
function validateExpenseLink(s: DomainState, item: SupplyItem, expenseId?: string) {
  if (!expenseId) return;
  const e = s.expenses.find(
    (e) => e.id === expenseId && e.greenhouseId === s.greenhouse.id && e.status !== 'void',
  );
  if (!e || e.category !== item.category)
    throw new Error('Select an active expense in the same category.');
}
export function applySupply(s: DomainState, a: SupplyAction) {
  s.supplies = supplyState(s);
  const p = s.supplies;
  let id: string;
  if (a.type === 'supply_item') {
    if (!validSupplyItem(a.item))
      throw new Error('Review the item name, unit, category, and stock reminder threshold.');
    if (a.item.deviceId && !s.devices.some((d) => d.id === a.item.deviceId && d.active))
      throw new Error('Select an active device.');
    if (a.item.autoTask && (!a.item.deviceId || !a.item.operator.trim()))
      throw new Error('Select a device and assigned operator for automatic reminders.');
    const current = a.id ? p.items.find((i) => i.id === a.id) : undefined;
    if (a.id && !current) throw new Error('Item not found.');
    if (
      current &&
      p.movements.some((m) => m.itemId === current.id) &&
      (current.unit !== a.item.unit || current.category !== a.item.category)
    )
      throw new Error(
        'Unit and category cannot change after stock movements. Create a new item instead.',
      );
    if (
      p.items.some(
        (i) =>
          i.id !== a.id && i.active && i.name.toLowerCase() === a.item.name.trim().toLowerCase(),
      )
    )
      throw new Error('An active item already uses this name.');
    id = current?.id ?? nextId('SUP', p.items);
    const item = {
      ...structuredClone(a.item),
      name: a.item.name.trim(),
      id,
      active: current?.active ?? true,
    };
    if (current) Object.assign(current, item);
    else p.items.push(item);
    ensureRefillTask(s, item);
  } else if (a.type === 'supply_archive') {
    const item = p.items.find((i) => i.id === a.id);
    if (!item) throw new Error('Item not found.');
    if (
      item.active &&
      (supplyBalance(s, item.id) !== 0 ||
        s.maintenance.some((m) => m.supplyItemId === item.id && m.status !== 'completed'))
    )
      throw new Error('Resolve remaining stock and related tasks before archiving the item.');
    item.active = !item.active;
    ensureRefillTask(s, item);
    id = item.id;
  } else if (a.type === 'supply_link_expense') {
    const m = p.movements.find((m) => m.id === a.id && m.kind === 'in'),
      item = m ? p.items.find((i) => i.id === m.itemId) : null;
    if (!m || !item || p.movements.some((r) => r.reverses === m.id))
      throw new Error('Select an incoming stock record that has not been reversed.');
    validateExpenseLink(s, item, a.expenseId);
    m.expenseId = a.expenseId || undefined;
    id = m.id;
  } else {
    const duplicate = p.movements.find((m) => m.key === a.key);
    if (duplicate)
      return { ok: true, id: duplicate.id, message: 'This movement is already saved.' };
    if (!a.key || a.notes.trim().length < 5)
      throw new Error('Enter a movement reason of at least 5 characters.');
    let movement: Omit<SupplyMovement, 'id'>;
    if (a.type === 'supply_reverse') {
      const original = p.movements.find((m) => m.id === a.id);
      if (
        !original ||
        original.kind === 'reversal' ||
        p.movements.some((m) => m.reverses === original.id)
      )
        throw new Error('Movement not found or already reversed.');
      movement = {
        itemId: original.itemId,
        kind: 'reversal',
        quantity: -original.quantity,
        date: localDate(s.clock),
        notes: a.notes.trim(),
        actor: a.actor ?? 'Sample operator',
        key: a.key,
        reverses: original.id,
      };
    } else {
      const item = p.items.find((i) => i.id === a.itemId && i.active);
      if (!item) throw new Error('Select an active item.');
      if (
        !Number.isFinite(a.quantity) ||
        a.quantity <= 0 ||
        a.quantity > 1e7 ||
        (item.unit === 'pcs' && !Number.isInteger(a.quantity)) ||
        round(a.quantity) !== a.quantity
      )
        throw new Error(
          'Quantity must be positive, with up to 3 decimals. Piece quantities must be whole numbers.',
        );
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(a.date) ||
        !Number.isFinite(Date.parse(a.date)) ||
        new Date(a.date).toISOString().slice(0, 10) !== a.date ||
        a.date > localDate(s.clock)
      )
        throw new Error('Stock date must be valid and cannot be in the future.');
      if (!['in', 'use', 'waste'].includes(a.kind)) throw new Error('Invalid movement type.');
      if (a.expenseId && a.kind !== 'in') throw new Error('Expense linked to incoming stock.');
      validateExpenseLink(s, item, a.expenseId);
      if (
        a.runId &&
        !s.runs.some((r) => r.id === a.runId && r.snapshot.requiredDevices.includes(item.deviceId))
      )
        throw new Error("Execution must use the item's linked device.");
      if (
        a.maintenanceId &&
        !s.maintenance.some((m) => m.id === a.maintenanceId && m.deviceId === item.deviceId)
      )
        throw new Error('Select a task for the same device.');
      movement = {
        itemId: item.id,
        kind: a.kind,
        quantity: a.kind === 'in' ? a.quantity : -a.quantity,
        date: a.date,
        notes: a.notes.trim(),
        actor: a.actor ?? 'Sample operator',
        key: a.key,
        expenseId: a.expenseId || undefined,
        runId: a.runId || undefined,
        maintenanceId: a.maintenanceId || undefined,
      };
    }
    if (round(supplyBalance(s, movement.itemId) + movement.quantity) < 0)
      throw new Error('Insufficient stock. Check the quantity or record incoming stock first.');
    id = nextId('MOV', p.movements);
    p.movements.push({ ...movement, id });
    let balance = 0;
    for (const record of p.movements
      .filter((m) => m.itemId === movement.itemId)
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date))) {
      balance = round(balance + record.quantity);
      if (balance < 0)
        throw new Error(
          'This date would create a negative historical balance. Use a date after the relevant receipt of stock.',
        );
    }
    ensureRefillTask(
      s,
      p.items.find((i) => i.id === movement.itemId)!,
    );
  }
  activity(
    s,
    'maintenance',
    'Inventory updated',
    'Stock record saved. Sensor readings are unchanged and no payment was created automatically.',
    id,
    undefined,
    a.actor,
  );
  return {
    ok: true,
    id,
    message: 'Inventory saved. Expenses and physical work remain separate records.',
  };
}
