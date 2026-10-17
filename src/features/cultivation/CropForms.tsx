import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { numeric, value } from '../../app/context';
import { Alert, Button, Field, FormBox, Modal } from '../../components/ui';
import { closingIssues, lotStock, production, zoneCases } from '../../domain/production';
import type { Grade, ProductionAction } from '../../domain/productionTypes';
import { localDate, money, num } from '../../domain/format';
import type { ZoneId } from '../../domain/types';
import { activeBatch } from '../../domain/zones';
export type CropFormKind =
  | 'setup'
  | 'task'
  | 'done'
  | 'harvest'
  | 'release'
  | 'void_lot'
  | 'sale'
  | 'payment'
  | 'loss'
  | 'void_sale'
  | 'close'
  | 'reopen';
export type CropFormSpec = { kind: CropFormKind; id?: string; zoneId?: string };
const titles: Record<CropFormKind, string> = {
  setup: 'Cycle targets',
  task: 'Add care task',
  done: 'Record care results',
  harvest: 'Record harvest',
  release: 'Review harvest lot',
  void_lot: 'Void harvest record',
  sale: 'Record sale',
  payment: 'Record receipt',
  loss: 'Record produce loss',
  void_sale: 'Void sale',
  close: 'Review cycle closure',
  reopen: 'Reopen review',
};
export const nullableNumber = (f: FormData, k: string) =>
  value(f, k).trim() === '' ? null : numeric(f, k);
export function CropForms({
  ctx,
  spec,
  onClose,
}: {
  ctx: PageContext;
  spec: CropFormSpec;
  onClose: () => void;
}) {
  const { s } = ctx,
    p = production(s),
    today = localDate(s.clock),
    { kind, id } = spec;
  const [key] = useState(() => `crop-${kind}-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const [lotId, setLotId] = useState(
    id ??
      p.lots.find((l) => l.status === 'released' && !zoneCases(s, l.zoneId).length)?.id ??
      p.lots[0]?.id ??
      '',
  );
  const [grade, setGrade] = useState<Grade>('A');
  const [zoneId, setZoneId] = useState(
    spec.zoneId ??
      (s.zones.some((z) => z.id === ctx.query.get('zone'))
        ? ctx.query.get('zone')!
        : (s.zones.find((z) => z.id === 'D')?.id ?? s.zones[0].id)),
  );
  const planting = activeBatch(s, zoneId);
  const lot = p.lots.find((l) => l.id === lotId),
    sale = p.sales.find((x) => x.id === id);
  const balance = sale
    ? Math.round(sale.kg * sale.price) -
      p.receipts.filter((r) => r.saleId === id).reduce((n, r) => n + r.amount, 0)
    : 0;
  const save = async (a: ProductionAction) => {
    const r = await ctx.act(a);
    if (r.ok) onClose();
    return r;
  };
  const notes = (
    <Field label={kind === 'release' ? 'Review findings and release reason' : 'Notes'}>
      <textarea
        name="notes"
        required
        minLength={['release', 'close', 'reopen'].includes(kind) ? 10 : 5}
        rows={3}
      />
    </Field>
  );
  const zone = (
    <Field label={'Zone'}>
      <select name="zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
        {s.zones
          .filter((z) => z.status !== 'inactive')
          .map((z) => (
            <option key={z.id} value={z.id}>
              {displayLabel(z.name)}
            </option>
          ))}
      </select>
      <small>
        {displayLabel(
          planting
            ? `${displayLabel(planting.crop)}${planting.variety ? ` / ${planting.variety}` : ''}, ${planting.id}`
            : 'No active planting batch',
        )}
      </small>
    </Field>
  );
  const dateField = (
    <Field label={'Date'}>
      <input
        name="date"
        type="date"
        min={s.cycle.plantedOn}
        max={today}
        defaultValue={today}
        required
      />
    </Field>
  );
  const operator = (
    <Field label={'Operator'}>
      <input name="operator" defaultValue={ctx.actor ?? p.operator} required />
    </Field>
  );
  const submit = (f: FormData) => {
    switch (kind) {
      case 'setup':
        return save({
          type: 'crop_setup',
          targetOn: value(f, 'targetOn'),
          targetKg: nullableNumber(f, 'targetKg'),
          targetPrice: nullableNumber(f, 'targetPrice'),
          operator: value(f, 'operator'),
        });
      case 'task':
        return save({
          type: 'crop_task',
          task: {
            title: value(f, 'title'),
            dueOn: value(f, 'due'),
            zoneId: value(f, 'zone') as ZoneId,
            plantingId: planting?.id,
            operator: value(f, 'operator'),
            key,
          },
        });
      case 'done':
        return save({ type: 'crop_task_done', id: id!, notes: value(f, 'notes') });
      case 'harvest':
        return save({
          type: 'crop_harvest',
          lot: {
            date: value(f, 'date'),
            zoneId: value(f, 'zone') as ZoneId,
            plantingId: planting?.id,
            grossKg: numeric(f, 'gross'),
            aKg: numeric(f, 'a'),
            bKg: numeric(f, 'b'),
            rejectedKg: numeric(f, 'reject'),
            operator: value(f, 'operator'),
            notes: value(f, 'notes'),
            key,
          },
        });
      case 'release':
        return save({ type: 'crop_release', id: id!, notes: value(f, 'notes') });
      case 'void_lot':
        return save({ type: 'crop_lot_void', id: id!, notes: value(f, 'notes') });
      case 'sale':
        return save({
          type: 'crop_sale',
          sale: {
            lotId,
            grade,
            kg: numeric(f, 'kg'),
            price: numeric(f, 'price'),
            date: value(f, 'date'),
            dueOn: value(f, 'due'),
            buyer: value(f, 'buyer'),
            key,
          },
        });
      case 'payment':
        return save({
          type: 'crop_receipt',
          receipt: {
            saleId: id!,
            date: value(f, 'date'),
            amount: numeric(f, 'amount'),
            reference: value(f, 'reference'),
            key,
          },
        });
      case 'loss':
        return save({
          type: 'crop_loss',
          loss: {
            lotId,
            grade,
            kg: numeric(f, 'kg'),
            date: value(f, 'date'),
            reason: value(f, 'notes'),
            key,
          },
        });
      case 'void_sale':
        return save({ type: 'crop_sale_void', id: id!, notes: value(f, 'notes') });
      case 'close':
        return save({ type: 'crop_close', notes: value(f, 'notes') });
      case 'reopen':
        return save({ type: 'crop_reopen', notes: value(f, 'notes') });
    }
  };
  return (
    <Modal
      title={titles[kind]}
      onClose={onClose}
      description={`${s.cycle.id} — sample records for the selected greenhouse.`}
    >
      <FormBox onSubmit={submit}>
        {kind === 'setup' && (
          <>
            <p>
              Recorded planting {displayLabel(s.cycle.plantedOn)}, {s.cycle.plants} plants. These
              targets are planning assumptions and do not create stock or revenue.
            </p>
            <div className="form-grid">
              <Field label={'Planned first harvest'}>
                <input
                  name="targetOn"
                  type="date"
                  min={s.cycle.plantedOn}
                  defaultValue={p.targetOn}
                />
              </Field>
              <Field label={'Target saleable output (kg)'}>
                <input
                  name="targetKg"
                  type="number"
                  min="0.001"
                  step="0.001"
                  defaultValue={p.targetKg ?? ''}
                />
              </Field>
              <Field label={'Assumed price per kg (IDR)'}>
                <input
                  name="targetPrice"
                  type="number"
                  min="1"
                  step="1"
                  defaultValue={p.targetPrice ?? ''}
                />
              </Field>
              {operator}
            </div>
          </>
        )}
        {kind === 'task' && (
          <>
            <Field label={'Care task'}>
              <input
                name="title"
                placeholder={'Example: inspect supports and bed cleanliness'}
                required
              />
            </Field>
            <div className="form-grid">
              {zone}
              <Field label={'Work schedule'}>
                <input
                  name="due"
                  type="date"
                  min={s.cycle.plantedOn}
                  defaultValue={today}
                  required
                />
              </Field>
              {operator}
            </div>
            <p className="muted">
              Operators complete field tasks. Scheduled irrigation and fertigation are managed in
              Automation.
            </p>
          </>
        )}
        {kind === 'harvest' && (
          <>
            <Alert tone="blue" title={'Staged harvests by zone'}>
              All lots require review. Open pest cases hold lot release for sale.
            </Alert>
            <div className="form-grid">
              {dateField}
              {zone}
              {operator}
              <Field label={'Total harvest (kg)'}>
                <input name="gross" type="number" min="0.001" step="0.001" required />
              </Field>
              <Field label="Grade A (kg)">
                <input name="a" type="number" min="0" step="0.001" defaultValue="0" required />
              </Field>
              <Field label="Grade B (kg)">
                <input name="b" type="number" min="0" step="0.001" defaultValue="0" required />
              </Field>
              <Field label={'Sorting rejects (kg)'}>
                <input name="reject" type="number" min="0" step="0.001" defaultValue="0" required />
              </Field>
            </div>
            <p>Total must equal A + B + rejects. Explain rejects in the notes.</p>
          </>
        )}
        {kind === 'release' && (
          <>
            <p>
              {displayLabel(id)}, Zone {displayLabel(p.lots.find((l) => l.id === id)?.zoneId)}.
              Review quality and field notes before releasing the lot. Closing a case is not a
              produce safety certification.
            </p>
            {zoneCases(s, p.lots.find((l) => l.id === id)!.zoneId).length > 0 && (
              <Alert title={'Zone cases remain open'}>
                Complete inspections and evaluations in Pests & inspections before releasing this
                lot.
              </Alert>
            )}
          </>
        )}
        {(kind === 'sale' || kind === 'loss') && (
          <>
            <div className="form-grid">
              <Field label={'Harvest lot'}>
                <select value={lotId} onChange={(e) => setLotId(e.target.value)} required>
                  {p.lots
                    .filter((l) => l.status !== 'void')
                    .map((l) => (
                      <option value={l.id} key={l.id}>
                        {displayLabel(l.id)}, Zone {displayLabel(l.zoneId)}
                        {displayLabel(
                          l.crop
                            ? ` / ${displayLabel(l.crop)}${l.variety ? ` ${l.variety}` : ''}`
                            : '',
                        )}
                        {displayLabel(l.status === 'held' ? ' — on hold' : '')}
                      </option>
                    ))}
                </select>
              </Field>
              <Field label="Grade">
                <select value={grade} onChange={(e) => setGrade(e.target.value as Grade)}>
                  <option>A</option>
                  <option>B</option>
                </select>
              </Field>
              {dateField}
              <Field label={kind === 'sale' ? 'Weight sold (kg)' : 'Loss weight (kg)'}>
                <input
                  name="kg"
                  type="number"
                  min="0.001"
                  step="0.001"
                  max={lot ? lotStock(p, lot, grade) : 0}
                  required
                />
              </Field>
            </div>
            <p>
              Grade stock {displayLabel(grade)}:{' '}
              <strong>{displayLabel(num(lot ? lotStock(p, lot, grade) : 0, 3))} kg</strong>.
            </p>
          </>
        )}
        {kind === 'sale' && (
          <>
            <p>
              Record produce already delivered to the buyer. Undelivered orders are not counted as
              sales.
            </p>
            <div className="form-grid">
              <Field label={'Buyer'}>
                <input name="buyer" required placeholder={'Buyer / outlet name'} />
              </Field>
              <Field label={'Price per kg (IDR)'}>
                <input
                  name="price"
                  type="number"
                  min="1"
                  step="1"
                  required
                  defaultValue={p.targetPrice ?? ''}
                />
              </Field>
              <Field label={'Due date'}>
                <input
                  name="due"
                  type="date"
                  min={lot?.date ?? s.cycle.plantedOn}
                  defaultValue={today}
                  required
                />
              </Field>
            </div>
          </>
        )}
        {kind === 'payment' && (
          <>
            <p>
              {displayLabel(id)}, {displayLabel(sale?.buyer)}. Outstanding balance{' '}
              <strong>{displayLabel(money(balance))}</strong>. This records a payment; no money is
              transferred.
            </p>
            <div className="form-grid">
              {dateField}
              <Field label={'Amount received (IDR)'}>
                <input
                  name="amount"
                  type="number"
                  min="1"
                  max={balance}
                  step="1"
                  required
                  defaultValue={balance}
                />
              </Field>
            </div>
            <Field label={'Receipt reference'}>
              <input
                name="reference"
                required
                placeholder={'Receipt number or payment reference'}
              />
            </Field>
          </>
        )}
        {kind === 'close' && (
          <>
            <p>
              Closing pauses active routines. Review final harvests, stock, invoices, and all costs
              first.
            </p>
            {closingIssues(s).length > 0 ? (
              <Alert title={'Still to resolve'}>
                <ul>
                  {closingIssues(s).map((x) => (
                    <li key={x}>{displayLabel(x)}</li>
                  ))}
                </ul>
              </Alert>
            ) : (
              <Alert tone="green" title={'Records ready for review'}>
                No stock, receivables, or open cases remain. Confirm field conditions in the closing
                notes.
              </Alert>
            )}
          </>
        )}
        {kind === 'reopen' && (
          <p>
            Previous records are retained. Costs need another review; automation is not reactivated
            automatically.
          </p>
        )}
        {[
          'done',
          'harvest',
          'release',
          'void_lot',
          'loss',
          'void_sale',
          'close',
          'reopen',
        ].includes(kind) && notes}
        <div className="form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            tone="primary"
            disabled={kind === 'close' && closingIssues(s).length > 0}
          >
            {displayLabel(
              kind === 'setup'
                ? 'Save targets'
                : kind === 'payment'
                  ? 'Save receipt'
                  : kind === 'sale'
                    ? 'Save sale'
                    : kind === 'release'
                      ? 'Release lot'
                      : kind === 'close'
                        ? 'Close cycle'
                        : kind === 'reopen'
                          ? 'Reopen review'
                          : 'Save record',
            )}
          </Button>
        </div>
      </FormBox>
    </Modal>
  );
}
