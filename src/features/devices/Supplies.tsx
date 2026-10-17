import { displayLabel, matchesSearch } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { numeric, updateQuery, value } from '../../app/context';
import {
  Alert,
  Badge,
  Button,
  Empty,
  Field,
  FormBox,
  Modal,
  SearchField,
} from '../../components/ui';
import { supplyBalance, supplyState } from '../../domain/supplies';
import type { SupplyAction, SupplyItem } from '../../domain/supplyTypes';
import { dateLabel, localDate, money, number } from '../../domain/format';
type Editor = { kind: 'new' | 'edit' | 'move' | 'reverse' | 'link'; id?: string };
export function Supplies({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    p = supplyState(s),
    [search, setSearch] = useState(''),
    [archived, setArchived] = useState(false),
    [editor, setEditor] = useState<Editor | null>(null),
    [key, setKey] = useState('');
  const [moveKind, setMoveKind] = useState<'in' | 'use' | 'waste'>('in');
  const rows = p.items.filter((i) => (archived || i.active) && matchesSearch(search, i.name));
  const item = rows.find((i) => i.id === ctx.query.get('supply')) ?? rows[0];
  const movements = item
    ? p.movements
        .filter((m) => m.itemId === item.id)
        .slice()
        .reverse()
    : [];
  const target = editor?.id ? p.movements.find((m) => m.id === editor.id) : undefined;
  const open = (kind: Editor['kind'], id?: string) => {
    setKey(`stock-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setMoveKind('in');
    setEditor({ kind, id });
  };
  const save = async (action: SupplyAction) => {
    const result = await ctx.act({ ...action, actor: ctx.actor });
    if (result.ok) {
      setEditor(null);
      if (action.type === 'supply_item')
        updateQuery(ctx, '/perangkat', { tab: 'supplies', supply: result.id });
    }
    return result;
  };
  const blank: Omit<SupplyItem, 'id' | 'active'> = {
    name: '',
    unit: 'L',
    category: 'Nutrisi',
    deviceId: '',
    reorderAt: 0,
    operator: ctx.actor ?? '',
    autoTask: false,
  };
  const draft = editor?.kind === 'new' ? blank : (item ?? blank);
  return (
    <div className="supplies-workspace" data-tour="supplies">
      <header className="growing-heading">
        <div>
          <h2>Supplies</h2>
          <p>Record incoming stock, usage/refills, and service needs.</p>
        </div>
        <Button permission="devices" icon="plus" tone="primary" onClick={() => open('new')}>
          Add item
        </Button>
      </header>
      <div className="growing-toolbar">
        <SearchField value={search} onChange={setSearch} placeholder={'Search supplies…'} />
        <label className="growing-checkbox">
          <input
            type="checkbox"
            checked={archived}
            onChange={(e) => setArchived(e.target.checked)}
          />
          Show archived
        </label>
        <span>
          {p.items.filter((i) => i.active && supplyBalance(s, i.id) <= i.reorderAt).length} items
          reached their reminder threshold
        </span>
      </div>
      {!item ? (
        <Empty
          title={p.items.length ? 'Item not found' : 'Start recording supplies'}
          illustration={!p.items.length ? 'harvest' : undefined}
          detail={
            'Add reserve water, nutrients, filters, or service supplies. Record opening balances as incoming stock to retain their source.'
          }
        />
      ) : (
        <div className="supplies-layout">
          <nav className="supplies-register" aria-label={'Supply inventory'}>
            {rows.map((i) => (
              <button
                type="button"
                key={i.id}
                aria-current={i.id === item.id ? 'true' : undefined}
                onClick={() => {
                  setEditor(null);
                  updateQuery(ctx, '/perangkat', { supply: i.id });
                }}
              >
                <strong>{displayLabel(i.name)}</strong>
                <span>
                  {displayLabel(number(supplyBalance(s, i.id), 3))} {displayLabel(i.unit)}
                </span>
                <small>
                  {displayLabel(
                    !i.active
                      ? 'Diarsipkan'
                      : supplyBalance(s, i.id) <= i.reorderAt
                        ? 'Restock needed'
                        : `Reminder threshold ${number(i.reorderAt, 3)} ${i.unit}`,
                  )}
                </small>
              </button>
            ))}
          </nav>
          <section className="growing-panel" aria-label={`Supplies ${displayLabel(item.name)}`}>
            <header className="growing-heading">
              <div>
                <h3>{displayLabel(item.name)}</h3>
                <p>
                  {displayLabel(item.category)} / {displayLabel(item.id)}
                </p>
              </div>
              <Badge
                tone={
                  !item.active
                    ? 'gray'
                    : supplyBalance(s, item.id) <= item.reorderAt
                      ? 'amber'
                      : 'green'
                }
              >
                {displayLabel(
                  !item.active
                    ? 'Archived'
                    : supplyBalance(s, item.id) <= item.reorderAt
                      ? 'Restock needed'
                      : 'Available',
                )}
              </Badge>
            </header>
            <div className="supply-balance">
              <strong>
                {displayLabel(number(supplyBalance(s, item.id), 3))}{' '}
                <small>{displayLabel(item.unit)}</small>
              </strong>
              <span>
                Recorded balance
                <br />
                Reminder threshold {displayLabel(number(item.reorderAt, 3))}{' '}
                {displayLabel(item.unit)}
              </span>
            </div>
            <div className="button-row">
              <Button
                permission="maintenance"
                icon="plus"
                disabled={!item.active}
                onClick={() => open('move')}
              >
                Record movement
              </Button>
              <Button permission="devices" small onClick={() => open('edit')}>
                Edit item
              </Button>
              <Button
                permission="devices"
                small
                onClick={async () =>
                  await ctx.act({ type: 'supply_archive', id: item.id, actor: ctx.actor })
                }
              >
                {displayLabel(item.active ? 'Archive item' : 'Activate item')}
              </Button>
            </div>
            <p className="growing-explanation">
              {displayLabel(item.deviceId ? `Linked to ${item.deviceId}. ` : '')}
              {displayLabel(
                item.autoTask
                  ? `One reminder task is created when stock ≤ ${item.reorderAt} ${item.unit}; assigned to ${item.operator}.`
                  : 'Automatic task reminders are not enabled.',
              )}{' '}
              Warehouse stock is separate from sensor tank levels.
            </p>
            <div className="growing-table-scroll">
              <table className="growing-table">
                <thead>
                  <tr>
                    <th>Movement</th>
                    <th>Quantity</th>
                    <th>Links</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => {
                    const reversed = p.movements.some((r) => r.reverses === m.id),
                      expense = s.expenses.find((e) => e.id === m.expenseId);
                    return (
                      <tr key={m.id}>
                        <th>
                          {displayLabel(
                            {
                              in: 'Incoming stock',
                              use: 'Usage / refill',
                              waste: 'Damage / loss',
                              reversal: 'Reversal',
                            }[m.kind],
                          )}
                          <small>
                            {displayLabel(dateLabel(m.date))} / {displayLabel(m.id)}
                            {displayLabel(reversed ? ' / dikoreksi' : '')}
                          </small>
                          <small>{displayLabel(m.notes)}</small>
                        </th>
                        <td>
                          {displayLabel(m.quantity > 0 ? '+' : '')}
                          {displayLabel(number(m.quantity, 3))} {displayLabel(item.unit)}
                        </td>
                        <td>
                          {displayLabel(
                            expense ? (
                              <button
                                className="text-link"
                                onClick={() =>
                                  ctx.nav(
                                    `/biaya?tab=expenses&expense=${expense.id}&period=${expense.paidAt.slice(0, 7)}`,
                                  )
                                }
                              >
                                {expense.id} /{' '}
                                {expense.status === 'paid'
                                  ? money(expense.amount)
                                  : expense.status === 'void'
                                    ? 'Voided'
                                    : 'Draft'}
                              </button>
                            ) : m.expenseId ? (
                              'Expense unavailable'
                            ) : (
                              '—'
                            ),
                          )}
                          {displayLabel(
                            m.runId && (
                              <button
                                className="text-link"
                                onClick={() => ctx.nav(`/otomasi?tab=executions&run=${m.runId}`)}
                              >
                                {m.runId}
                              </button>
                            ),
                          )}
                          {displayLabel(m.maintenanceId && <small>{m.maintenanceId}</small>)}
                        </td>
                        <td>
                          <div className="button-row">
                            {m.kind === 'in' && !reversed && (
                              <Button small permission="finance" onClick={() => open('link', m.id)}>
                                Link expense
                              </Button>
                            )}
                            {m.kind !== 'reversal' && !reversed && (
                              <Button
                                small
                                permission="maintenance"
                                onClick={() => open('reverse', m.id)}
                              >
                                Reverse
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!movements.length && (
              <p className="growing-explanation">
                No movements yet. Record incoming stock to establish the opening balance.
              </p>
            )}
            <div className="growing-links">
              <Button small permission="finance" onClick={() => ctx.open('expense')}>
                Record expense
              </Button>
              {displayLabel(
                item.deviceId && (
                  <Button small onClick={() => ctx.nav(`/perangkat?device=${item.deviceId}`)}>
                    Device details
                  </Button>
                ),
              )}
              <Button small onClick={() => ctx.nav('/biaya?tab=efficiency')}>
                Review harvest efficiency
              </Button>
            </div>
            <div className="supply-tasks">
              <h4>Related tasks</h4>
              {s.maintenance
                .filter((m) => m.supplyItemId === item.id)
                .map((m) => (
                  <div key={m.id}>
                    <span>
                      <strong>{displayLabel(m.title)}</strong>
                      <small>
                        {displayLabel(m.id)} / {displayLabel(m.operator)} /{' '}
                        {displayLabel(m.status === 'completed' ? 'Completed' : 'Awaiting operator')}
                      </small>
                    </span>
                    <Button
                      small
                      permission="maintenance"
                      onClick={() => ctx.open('maintenance', m.deviceId, m.id)}
                    >
                      Review task
                    </Button>
                  </div>
                ))}
              {!s.maintenance.some((m) => m.supplyItemId === item.id) && (
                <p>No automatic restock tasks for this item yet.</p>
              )}
            </div>
          </section>
        </div>
      )}
      <p className="growing-explanation">
        Record a refill after completing the work. Stock records do not change sensor readings,
        automation doses, or payments. Simulation nutrient units are not automatically converted to
        stock liters.
      </p>
      {editor && (
        <Modal
          title={
            {
              new: 'Add item',
              edit: 'Edit item',
              move: 'Record stock movement',
              reverse: 'Reverse movement',
              link: 'Link expense',
            }[editor.kind]
          }
          description={editor.kind === 'new' ? s.greenhouse.name : item?.name}
          onClose={() => setEditor(null)}
        >
          <FormBox
            onSubmit={(f) => {
              if (editor.kind === 'new' || editor.kind === 'edit')
                return save({
                  type: 'supply_item',
                  id: editor.kind === 'edit' ? item!.id : undefined,
                  item: {
                    name: value(f, 'name'),
                    unit: value(f, 'unit') as SupplyItem['unit'],
                    category: value(f, 'category') as SupplyItem['category'],
                    reorderAt: numeric(f, 'reorderAt'),
                    deviceId: value(f, 'deviceId'),
                    autoTask: f.get('autoTask') === 'on',
                    operator: value(f, 'operator'),
                  },
                });
              if (editor.kind === 'reverse')
                return save({
                  type: 'supply_reverse',
                  id: target!.id,
                  notes: value(f, 'notes'),
                  key,
                });
              if (editor.kind === 'link')
                return save({
                  type: 'supply_link_expense',
                  id: target!.id,
                  expenseId: value(f, 'expenseId'),
                });
              return save({
                type: 'supply_move',
                itemId: item!.id,
                kind: moveKind,
                quantity: numeric(f, 'quantity'),
                date: value(f, 'date'),
                notes: value(f, 'notes'),
                key,
                expenseId: value(f, 'expenseId'),
                runId: value(f, 'runId'),
                maintenanceId: value(f, 'maintenanceId'),
              });
            }}
          >
            {editor.kind === 'new' || editor.kind === 'edit' ? (
              <>
                <Field label={'Item name'}>
                  <input
                    name="name"
                    required
                    defaultValue={draft.name}
                    placeholder={'Example: Nutrient A, spare filter'}
                  />
                </Field>
                <div className="form-grid">
                  <Field label={'Stock unit'}>
                    <select name="unit" defaultValue={draft.unit}>
                      <option value="L">Liter</option>
                      <option value="kg">Kilogram</option>
                      <option value="pcs">Pcs</option>
                    </select>
                  </Field>
                  <Field label={'Cost category'}>
                    <select name="category" defaultValue={draft.category}>
                      {['Air', 'Nutrisi', 'Perawatan'].map((c) => (
                        <option key={c} value={c}>
                          {displayLabel(c)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label={'Reminder threshold'}>
                    <input
                      name="reorderAt"
                      type="number"
                      min="0"
                      step="0.001"
                      required
                      defaultValue={draft.reorderAt}
                    />
                  </Field>
                  <Field label={'Linked device'}>
                    <select name="deviceId" defaultValue={draft.deviceId}>
                      <option value="">Not linked</option>
                      {s.devices
                        .filter((d) => d.active)
                        .map((d) => (
                          <option key={d.id} value={d.id}>
                            {displayLabel(d.id)} / {displayLabel(d.label)}
                          </option>
                        ))}
                    </select>
                  </Field>
                </div>
                <label className="growing-checkbox">
                  <input type="checkbox" name="autoTask" defaultChecked={draft.autoTask} />
                  Create a task automatically at the reminder threshold
                </label>
                <Field label={'Reminder owner'}>
                  <input name="operator" defaultValue={draft.operator} />
                </Field>
              </>
            ) : editor.kind === 'move' ? (
              <>
                <Field label={'Movement type'}>
                  <select
                    name="kind"
                    value={moveKind}
                    onChange={(e) => setMoveKind(e.target.value as typeof moveKind)}
                  >
                    <option value="in">Incoming stock</option>
                    <option value="use">Usage / refill</option>
                    <option value="waste">Damage / loss</option>
                  </select>
                </Field>
                <div className="form-grid">
                  <Field label={`Quantity (${item!.unit})`}>
                    <input
                      name="quantity"
                      type="number"
                      min={item!.unit === 'pcs' ? 1 : 0.001}
                      step={item!.unit === 'pcs' ? 1 : 0.001}
                      required
                    />
                  </Field>
                  <Field label={'Movement date'}>
                    <input
                      name="date"
                      type="date"
                      defaultValue={localDate(s.clock)}
                      max={localDate(s.clock)}
                      required
                    />
                  </Field>
                </div>
                {moveKind !== 'in' && (
                  <>
                    <Field label={'Related execution (optional)'}>
                      <select name="runId">
                        <option value="">No related execution</option>
                        {s.runs
                          .filter((r) => r.snapshot.requiredDevices.includes(item!.deviceId))
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {displayLabel(r.id)} / {displayLabel(r.routineName)}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <Field label={'Related task (optional)'}>
                      <select name="maintenanceId">
                        <option value="">No related task</option>
                        {s.maintenance
                          .filter((m) => m.deviceId === item!.deviceId)
                          .map((m) => (
                            <option key={m.id} value={m.id}>
                              {displayLabel(m.id)} / {displayLabel(m.title)}
                            </option>
                          ))}
                      </select>
                    </Field>
                  </>
                )}
                <Field label={'Notes & source'}>
                  <textarea
                    name="notes"
                    minLength={5}
                    required
                    placeholder={'Stock source or completed refill work'}
                  />
                </Field>
              </>
            ) : editor.kind === 'reverse' ? (
              <>
                <Alert tone="blue">
                  A correction adds a reversing movement. The original record and linked expense are
                  retained. Void payments in Costs separately.
                </Alert>
                <Field label={'Reason for correction'}>
                  <textarea name="notes" minLength={5} required />
                </Field>
              </>
            ) : null}
            {(editor.kind === 'link' || (editor.kind === 'move' && moveKind === 'in')) && (
              <>
                <Field label={'Linked expense (optional)'}>
                  <select name="expenseId" defaultValue={target?.expenseId ?? ''}>
                    <option value="">Not linked</option>
                    {s.expenses
                      .filter((e) => e.category === item!.category && e.status !== 'void')
                      .map((e) => (
                        <option key={e.id} value={e.id}>
                          {displayLabel(e.id)} / {displayLabel(money(e.amount))} /{' '}
                          {displayLabel(e.note)}
                        </option>
                      ))}
                  </select>
                </Field>
                <p className="growing-explanation">
                  Uses the existing expense record. If none exists, save the stock movement, record
                  an expense, then link it here.
                </p>
              </>
            )}
            <div className="form-actions">
              <Button onClick={() => setEditor(null)}>Cancel</Button>
              <Button
                type="submit"
                tone="primary"
                permission={
                  editor.kind === 'new' || editor.kind === 'edit'
                    ? 'devices'
                    : editor.kind === 'link'
                      ? 'finance'
                      : 'maintenance'
                }
              >
                Save{' '}
                {displayLabel(
                  editor.kind === 'new' || editor.kind === 'edit'
                    ? 'item'
                    : editor.kind === 'link'
                      ? 'expense link'
                      : editor.kind === 'reverse'
                        ? 'correction'
                        : 'movement',
                )}
              </Button>
            </div>
          </FormBox>
        </Modal>
      )}
    </div>
  );
}
