import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { checked, value } from '../../app/context';
import { Alert, Badge, Button, Card, Field, FormBox, Meta, Modal } from '../../components/ui';
import { cycleExpenses, productionSummary } from '../../domain/production';
import { csv, dateLabel, downloadText, localDate, money, num } from '../../domain/format';
import { CropForms, nullableNumber, type CropFormSpec } from './CropForms';

function ReviewCosts({ ctx, onClose }: { ctx: PageContext; onClose: () => void }) {
  const { s } = ctx,
    { p } = productionSummary(s),
    expenses = cycleExpenses(s).filter((e) => e.status === 'paid');
  const [shares, setShares] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      expenses.map((e) => [
        e.id,
        p.expenseShares[e.id] === undefined ? '' : String(p.expenseShares[e.id]),
      ]),
    ),
  );
  return (
    <Modal
      title={'Review cycle costs'}
      wide
      onClose={onClose}
      description={'These shares allocate existing expenses. They do not create new bills.'}
    >
      <FormBox
        onSubmit={async (f) => {
          const selected = Object.fromEntries(
            Object.entries(shares)
              .filter(([, v]) => v.trim() !== '')
              .map(([k, v]) => [k, Number(v)]),
          );
          const result = await ctx.act({
            type: 'crop_costs',
            shares: selected,
            depreciation: nullableNumber(f, 'depreciation'),
            unpaidLabor: nullableNumber(f, 'labor'),
            otherAccrued: nullableNumber(f, 'accrued'),
            baselineCost: nullableNumber(f, 'baseline'),
            notes: value(f, 'notes'),
            reviewed: checked(f, 'reviewed'),
          });
          if (result.ok) onClose();
          return result;
        }}
      >
        <Alert tone="blue" title={'Costs across the cycle, not just one month'}>
          Period {displayLabel(dateLabel(s.cycle.plantedOn))} to{' '}
          {displayLabel(dateLabel(p.closedOn ?? localDate(s.clock)))}. Review planting, care, labor,
          packaging, and distribution costs. Add missing payments in Expenses.
        </Alert>
        <p className="micro muted">
          Pre-planting records are available for seeds and preparation. Set the share to 0% to
          exclude payments for other cycles.
        </p>
        <div className="button-row">
          <Button
            small
            onClick={() => setShares(Object.fromEntries(expenses.map((e) => [e.id, '100'])))}
          >
            Use 100% of displayed records
          </Button>
          <span className="micro muted">
            Adjust shares for shared costs. Enter 0% to exclude a record.
          </span>
        </div>
        <div className="table-scroll">
          <table className="crop-cost-table">
            <thead>
              <tr>
                <th>Original bill</th>
                <th>Amount</th>
                <th>Cycle share</th>
                <th>Allocated</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id}>
                  <td>
                    <strong>{displayLabel(e.note)}</strong>
                    <small>
                      {displayLabel(e.id)}, {displayLabel(e.category)},{' '}
                      {displayLabel(dateLabel(e.paidAt))}
                    </small>
                  </td>
                  <td>{displayLabel(money(e.amount))}</td>
                  <td>
                    <label>
                      <span className="sr-only">Share {displayLabel(e.id)} (%)</span>
                      <input
                        aria-label={`Share ${e.id} (%)`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        value={shares[e.id] ?? ''}
                        onChange={(ev) => setShares({ ...shares, [e.id]: ev.target.value })}
                      />
                    </label>
                  </td>
                  <td>
                    {displayLabel(
                      shares[e.id] === ''
                        ? 'Unallocated'
                        : money(Math.round((e.amount * Number(shares[e.id])) / 100)),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!expenses.length && (
          <p>
            No payments recorded in the cycle period. Check all costs before confirming
            completeness.
          </p>
        )}
        <p className="micro muted">
          Investment is a cash outflow, not entirely a profit expense. Enter the cycle's
          depreciation share. Monthly expense allocations are not added again; these shares must
          reflect the reviewed cycle's usage.
        </p>
        <div className="form-grid">
          <Field label={'Asset depreciation for cycle (IDR)'}>
            <input
              name="depreciation"
              type="number"
              min="0"
              step="1"
              defaultValue={p.finance.depreciation ?? ''}
            />
          </Field>
          <Field
            label={'Incurred but unpaid costs (IDR)'}
            hint={
              'Additional expenses outside payment records. Update them when paid to avoid double counting.'
            }
          >
            <input
              name="accrued"
              type="number"
              min="0"
              step="1"
              defaultValue={p.finance.otherAccrued ?? ''}
            />
          </Field>
          <Field
            label={'Estimated owner labor (IDR)'}
            hint={'Shown separately as an economic adjustment, not cash outflow.'}
          >
            <input
              name="labor"
              type="number"
              min="0"
              step="1"
              defaultValue={p.finance.unpaidLabor ?? ''}
            />
          </Field>
          <Field
            label={'Cycle cost baseline without system (IDR)'}
            hint={
              'Optional. Match crop, duration, area, and expense scope. An assumed baseline is not evidence of savings.'
            }
          >
            <input
              name="baseline"
              type="number"
              min="0"
              step="1"
              defaultValue={p.finance.baselineCost ?? ''}
            />
          </Field>
        </div>
        <Field label={'Coverage and assumption notes'}>
          <textarea
            name="notes"
            rows={3}
            defaultValue={p.finance.notes}
            placeholder={
              'Document planting costs, shared cost allocations, depreciation basis, and comparison baseline.'
            }
          />
        </Field>
        <label className="checkbox">
          <input type="checkbox" name="reviewed" defaultChecked={!!p.finance.reviewKey} />
          <span>
            I have reviewed costs across the cycle, including missing records, exclusions, and
            unpaid expenses.
          </span>
        </label>
        <p className="micro muted">
          Empty means unknown. Enter zero only when no cost applies. Changes to bills or allocations
          invalidate the previous review.
        </p>
        <div className="form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" tone="primary">
            Save cost review
          </Button>
        </div>
      </FormBox>
    </Modal>
  );
}
export function profitCsv(ctx: PageContext) {
  const r = productionSummary(ctx.s);
  return csv([
    ['Vigor — sample business results, not an official financial statement'],
    ['Greenhouse', ctx.s.greenhouse.id],
    ['Cycle', ctx.s.cycle.id],
    ['Start', ctx.s.cycle.plantedOn],
    ['Sampai', r.p.closedOn ?? localDate(ctx.s.clock)],
    ['Cost status', r.reviewed ? 'Reviewed by user' : 'Incomplete / needs another review'],
    ['Sales', r.revenue],
    ['Cash received', r.received],
    ['Receivables', r.receivable],
    ['Allocated paid costs', r.operating],
    ['Depreciation', r.p.finance.depreciation ?? 'Not entered'],
    ['Incurred but unpaid costs', r.p.finance.otherAccrued ?? 'Not entered'],
    ['Provisional result', r.profit],
    ['Estimated owner labor', r.p.finance.unpaidLabor ?? 'Not entered'],
    ['Cash investment', r.investment],
    ['Allocated cycle cash flow', r.cash],
    ['Remaining stock, kg', r.stock],
    ['Assumed cost baseline', r.p.finance.baselineCost ?? 'Not entered'],
    ['Cost difference from baseline', r.saving ?? 'Not comparable yet'],
    ['Savings are not added to profit'],
    [],
    ['Tagihan', 'Category', 'Share %', 'Allocated IDR'],
    ...r.costs.map((x) => [x.record.id, x.record.category, x.percent, x.amount]),
    [],
    ['Sales', 'Lot', 'Buyer', 'Kg', 'Price per kg', 'Amount'],
    ...r.sales.map((x) => [x.id, x.lotId, x.buyer, x.kg, x.price, Math.round(x.kg * x.price)]),
  ]);
}
export function CycleProfit({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    r = productionSummary(s),
    { p } = r,
    [review, setReview] = useState(false),
    [form, setForm] = useState<CropFormSpec | null>(null);
  const final = p.stage === 'closed' && r.reviewed;
  return (
    <div className="page-stack crop-profit">
      <section className="crop-heading">
        <div>
          <span className="muted">{displayLabel(s.cycle.id)}</span>
          <h2>Business results for one cycle</h2>
          <p>
            {displayLabel(s.cycle.crop)}, {displayLabel(dateLabel(s.cycle.plantedOn))}–
            {displayLabel(dateLabel(p.closedOn ?? localDate(s.clock)))}. All zones{' '}
            {displayLabel(s.greenhouse.name)}.
          </p>
        </div>
        <Button icon="leaf" onClick={() => ctx.nav('/siklus')}>
          Open crop cycle
        </Button>
      </section>
      {!r.reviewed && (
        <Alert title={'Provisional result; costs need review'}>
          {r.unassigned} payments have no cycle allocation. Include planting-to-sale costs,
          depreciation, and unpaid expenses before evaluating profit.
        </Alert>
      )}
      <div className="crop-profit-layout">
        <section
          className="crop-statement"
          data-tour="cycle-profit"
          aria-label={'Business result calculation'}
        >
          <header>
            <h3>Sales less cycle costs</h3>
            <Badge tone={final ? 'green' : 'amber'}>
              {displayLabel(final ? 'Cycle completed' : 'Provisional')}
            </Badge>
          </header>
          <dl>
            <div>
              <dt>Sales of delivered produce</dt>
              <dd>{displayLabel(money(r.revenue))}</dd>
            </div>
            <div>
              <dt>Paid costs allocated to cycle</dt>
              <dd>− {displayLabel(money(r.operating))}</dd>
            </div>
            <div>
              <dt>Asset depreciation</dt>
              <dd>
                {displayLabel(
                  p.finance.depreciation === null
                    ? 'Not entered'
                    : `− ${money(p.finance.depreciation)}`,
                )}
              </dd>
            </div>
            <div>
              <dt>Incurred costs, not yet paid</dt>
              <dd>
                {displayLabel(
                  p.finance.otherAccrued === null
                    ? 'Not entered'
                    : `− ${money(p.finance.otherAccrued)}`,
                )}
              </dd>
            </div>
            <div className="crop-profit-total">
              <dt>
                {displayLabel(
                  final
                    ? r.profit < 0
                      ? 'Cycle loss (sample)'
                      : 'Cycle profit (sample)'
                    : 'Provisional result from records',
                )}
                <small>
                  {displayLabel(
                    r.margin === null
                      ? 'Margin unavailable'
                      : `Margin ${num(r.margin, 1)}% of sales`,
                  )}
                </small>
              </dt>
              <dd className={r.profit < 0 ? 'crop-negative' : ''}>
                {displayLabel(money(r.profit))}
              </dd>
            </div>
          </dl>
          <p>
            All allocated cycle expenses are deducted now. Unsold stock is not recognized as revenue
            or valued as inventory in this calculation.
          </p>
          <div className="crop-economic">
            <span>After estimated owner labor</span>
            <strong>
              {displayLabel(
                p.finance.unpaidLabor === null ? 'Cannot calculate yet' : money(r.economicProfit),
              )}
            </strong>
            <small>
              Economic adjustment{' '}
              {displayLabel(
                p.finance.unpaidLabor === null ? 'not entered' : money(p.finance.unpaidLabor),
              )}
              ; not an additional payment.
            </small>
          </div>
          <footer>
            <Button
              permission="finance"
              icon="edit"
              disabled={p.stage === 'closed'}
              onClick={() => setReview(true)}
            >
              Review cycle costs
            </Button>
            <Button
              permission="export"
              icon="download"
              onClick={() => downloadText(`Vigor-cycle-results-${s.cycle.id}.csv`, profitCsv(ctx))}
            >
              Export results
            </Button>
          </footer>
        </section>
        <div className="page-stack">
          <Card title={'Cash inflows and outflows'} variant="plain">
            <Meta
              items={[
                { label: 'Cash received', value: money(r.received) },
                { label: 'Sales receivables', value: money(r.receivable) },
                { label: 'Paid operating costs', value: money(r.operating) },
                { label: 'Paid investment', value: money(r.investment) },
                { label: 'Allocated cycle cash flow', value: money(r.cash) },
              ]}
            />
            <p className="micro muted">
              Receipts − paid costs − investment. Depreciation and unpaid expenses do not reduce
              cash. This is not a bank balance.
            </p>
            <Button small onClick={() => ctx.nav('/siklus?tab=sales')}>
              View sales & receipts
            </Button>
          </Card>
          <Card title={'Harvest output'} variant="plain">
            <Meta
              items={[
                { label: 'Harvested', value: `${num(r.harvest, 1)} kg` },
                { label: 'Sold', value: `${num(r.sold, 1)} kg` },
                { label: 'Remaining stock', value: `${num(r.stock, 1)} kg` },
                { label: 'Held stock', value: `${num(r.heldKg, 1)} kg` },
                { label: 'Rejects & losses', value: `${num(r.rejected + r.loss, 1)} kg` },
              ]}
            />
            <Button small onClick={() => ctx.nav('/siklus?tab=harvest')}>
              Trace harvest origin
            </Button>
          </Card>
        </div>
      </div>
      <section className="crop-comparison">
        <div>
          <h3>Savings are already reflected in costs</h3>
          <p>
            Use a baseline for the same cycle and scope. Revenue remains equal in both columns; the
            difference is not added to profit again.
          </p>
          <Badge>Assumed baseline, not validated</Badge>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Calculation</th>
                <th>Baseline without system</th>
                <th>This cycle's records</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Same sales</td>
                <td>{displayLabel(money(r.revenue))}</td>
                <td>{displayLabel(money(r.revenue))}</td>
              </tr>
              <tr>
                <td>Cycle costs</td>
                <td>
                  {displayLabel(
                    p.finance.baselineCost === null ? 'Not entered' : money(p.finance.baselineCost),
                  )}
                </td>
                <td>
                  {displayLabel(money(r.charge))}
                  {displayLabel(!r.reviewed ? ' (incomplete)' : '')}
                </td>
              </tr>
              <tr>
                <td>Sales − costs</td>
                <td>
                  {displayLabel(
                    p.finance.baselineCost === null
                      ? 'Unavailable'
                      : money(r.revenue - p.finance.baselineCost),
                  )}
                </td>
                <td>{displayLabel(money(r.profit))}</td>
              </tr>
              <tr>
                <td colSpan={2}>
                  {displayLabel(
                    r.saving !== null && r.saving < 0
                      ? 'Costs exceed baseline'
                      : 'Cost difference from baseline',
                  )}
                </td>
                <td>
                  {displayLabel(
                    r.saving === null ? 'Review costs & baseline' : money(Math.abs(r.saving)),
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <Card
        title={'Allocated expense sources'}
        variant="register"
        subtitle={'Device allocations are not added to the original bill again.'}
        tools={
          <Button
            onClick={() =>
              ctx.nav(
                '/biaya?tab=expenses&period=custom&from=' +
                  (r.costs.map((x) => x.record.paidAt).sort()[0] ?? s.cycle.plantedOn) +
                  '&to=' +
                  (p.closedOn ?? localDate(s.clock)),
              )
            }
          >
            Open expenses
          </Button>
        }
      >
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Notes</th>
                <th>Category</th>
                <th>Share</th>
                <th>Cycle costs</th>
              </tr>
            </thead>
            <tbody>
              {r.costs.map((x) => (
                <tr key={x.record.id}>
                  <td>
                    <button
                      className="text-link"
                      onClick={() => ctx.open('expense-detail', x.record.id)}
                    >
                      {displayLabel(x.record.note)}
                    </button>
                    <small>{displayLabel(x.record.id)}</small>
                  </td>
                  <td>{displayLabel(x.record.category)}</td>
                  <td>
                    {displayLabel(
                      Object.hasOwn(p.expenseShares, x.record.id)
                        ? `${x.percent}%`
                        : 'Not configured',
                    )}
                  </td>
                  <td>{displayLabel(money(x.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="crop-next">
        <div>
          <strong>
            {displayLabel(p.stage === 'closed' ? 'Cycle has been closed' : 'End-of-cycle review')}
          </strong>
          <p>
            Resolve stock, receivables, cases, tasks, and cost reviews. Closing pauses routines.
          </p>
        </div>
        <Button
          permission="crop_review"
          onClick={() => setForm({ kind: p.stage === 'closed' ? 'reopen' : 'close' })}
        >
          {displayLabel(p.stage === 'closed' ? 'Reopen review' : 'Review closure')}
        </Button>
      </div>
      <p className="micro muted">
        Sample data. Excludes accounting inventory valuation, tax, interest, returns/refunds, and
        bank integration. Include relevant costs in the review; provisional results are not final
        net profit.
      </p>
      {review && <ReviewCosts ctx={ctx} onClose={() => setReview(false)} />}
      {form && <CropForms ctx={ctx} spec={form} onClose={() => setForm(null)} />}
    </div>
  );
}
