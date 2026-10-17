import { displayLabel, matchesSearch } from '../../i18n/display';
import React from 'react';
import { CycleProfit } from '../cultivation/CycleProfit';
import { Energy } from '../greenhouse/Energy';
import { HarvestEfficiency } from './HarvestEfficiency';
import { PeriodFilter } from './PeriodFilter';
import { periodError, periodLabel, periodQuery, resolvePeriod } from '../../domain/periods';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { CostBars } from '../../components/charts';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Icon,
  Meta,
  Progress,
  SearchField,
  Select,
  SourceTag,
  Stat,
  Stats,
  Tabs,
} from '../../components/ui';
import {
  comparison,
  consumedCost,
  costSummary,
  expenseRows,
  OPERATING_CATEGORIES,
  ALL_EXPENSE_CATEGORIES,
  plannerItems,
  plannerTotal,
} from '../../domain/costs';
import {
  csv,
  dateLabel,
  downloadText,
  localDate,
  money,
  monthLabel,
  num,
} from '../../domain/format';
import type { CostScope, ExpenseCategory, ZoneId } from '../../domain/types';
export { ExpenseDetails } from './ExpenseDetails';
export function scopeFrom(ctx: PageContext): CostScope {
  return {
    ...resolvePeriod(
      ctx.s.clock,
      ctx.query.get('period'),
      ctx.query.get('from'),
      ctx.query.get('to'),
    ),
    deviceId: ctx.query.get('device') ?? undefined,
    zoneId: (ctx.query.get('zone') as ZoneId) || undefined,
    category: (ctx.query.get('category') as ExpenseCategory) || undefined,
  };
}
/** Table rows and CSV use the same search, status and relational filters. */
export function visibleExpenseRows(ctx: PageContext) {
  const scope = scopeFrom(ctx),
    status = ctx.query.get('status') ?? 'paid';
  const search = (ctx.query.get('search') ?? '').toLowerCase();
  return expenseRows(ctx.s, scope, status !== 'paid').filter(
    (r) =>
      (status === 'all' || r.record.status === status) &&
      matchesSearch(search, r.record.id, r.record.note, r.record.category, r.record.deviceId),
  );
}
export function exportCosts(ctx: PageContext) {
  const scope = scopeFrom(ctx),
    rows = visibleExpenseRows(ctx);
  const paid = rows.filter((r) => r.record.status === 'paid').reduce((t, r) => t + r.amount, 0);
  downloadText(
    `Vigor-expenses-${scope.period}.csv`,
    csv([
      ['Vigor sample records — not a report of verified payments'],
      [
        'Period',
        periodLabel(scope),
        'Devices',
        scope.deviceId ?? 'All',
        'Zone',
        scope.zoneId ?? 'All',
      ],
      [
        'ID',
        'Payment date',
        'Category',
        'Notes',
        'Devices',
        'Filtered amount (IDR)',
        'Source',
        'Status',
      ],
      ...rows.map((r) => [
        r.record.id,
        r.record.paidAt,
        r.record.category,
        r.record.note,
        r.record.deviceId ?? '',
        r.amount,
        r.source,
        r.record.status,
      ]),
      ['Recorded total — excludes drafts and voided records', '', '', '', '', paid],
    ]),
  );
}

export class Planner extends React.Component<
  {
    ctx: PageContext;
    onClose: () => void;
  },
  {
    zones: number;
    owned: boolean;
    saved: boolean;
  }
> {
  constructor(p: { ctx: PageContext; onClose: () => void }) {
    super(p);
    this.state = {
      zones: p.ctx.s.costs.plannerZones,
      owned: p.ctx.s.costs.ownedController,
      saved: false,
    };
  }
  render() {
    const { ctx } = this.props,
      items = plannerItems(this.state.zones, this.state.owned),
      total = plannerTotal(items, ctx.s.costs.contingencyPercent);
    return (
      <div className="detail-stack">
        <Alert tone="blue" title={'Additional monitoring plan'}>
          Assumes a greenhouse already exists. This is not a complete automation package or a
          verified market quotation.
        </Alert>
        <div className="form-grid">
          <label className="field">
            <span>Scope preset</span>
            <select
              value={this.state.zones}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                this.setState({ zones: Number(e.currentTarget.value), saved: false })
              }
            >
              <option value={2}>2-zone monitoring</option>
              <option value={6}>6-zone monitoring</option>
            </select>
          </label>
          <div className="field">
            <span>Existing inventory</span>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={this.state.owned}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  this.setState({ owned: e.currentTarget.checked, saved: false })
                }
              />
              Controller available (CTRL-01)
            </label>
          </div>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Component</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Plan</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td>{displayLabel(i.label)}</td>
                  <td>{i.quantity}</td>
                  <td>
                    <Badge tone={i.owned ? 'green' : 'gray'}>
                      {displayLabel(i.owned ? 'Available' : 'To purchase')}
                    </Badge>
                  </td>
                  <td>
                    {displayLabel(
                      i.owned ? 'Already owned' : money(i.quantity * (i.unitPrice ?? 0)),
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3}>Subtotal</td>
                <td>{displayLabel(money(total.subtotal))}</td>
              </tr>
              <tr>
                <td colSpan={3}>Reserve {ctx.s.costs.contingencyPercent}%</td>
                <td>{displayLabel(money(total.contingency))}</td>
              </tr>
              <tr>
                <td colSpan={3}>Planned total</td>
                <td>
                  <strong>{displayLabel(money(total.total))}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <SourceTag>Projected purchases; not recorded expenses</SourceTag>
        <Alert tone="gray" title={'Additional irrigation / fertigation'}>
          PUMP-01, DOSE-01, and automation sensors are already registered. Additional purchase
          prices are unavailable, not assumed to be zero, and excluded from monitoring presets.
        </Alert>
        <p>
          Recurring costs depend on usage and rates. This greenhouse's assumed electricity rate is{' '}
          {displayLabel(money(ctx.s.costs.electricityPerKwh))} per kWh. Device allocations are
          already included in the greenhouse bill.
        </p>
        {this.state.saved && (
          <Alert tone="green">Plan saved. Device counts and expenses are unchanged.</Alert>
        )}
        <div className="button-row">
          <Button
            permission="finance"
            tone="primary"
            onClick={async () => {
              await ctx.act({
                type: 'planner',
                zones: this.state.zones,
                ownedController: this.state.owned,
              });
              this.setState({ saved: true });
            }}
          >
            Save plan
          </Button>
          <Button
            permission="finance"
            icon="plus"
            onClick={() => ctx.open('expense', undefined, `purchase:${total.total}`)}
          >
            Record a paid purchase
          </Button>
        </div>
        <p className="micro muted">
          Recording a purchase is a separate step. Confirm the amount; no order or payment is made
          automatically.
        </p>
      </div>
    );
  }
}
export default function Costs({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    tab = ctx.query.get('tab') ?? 'summary',
    scope = scopeFrom(ctx),
    summary = costSummary(s, scope),
    comp = comparison(s, scope),
    search = ctx.query.get('search') ?? '',
    status = ctx.query.get('status') ?? 'paid',
    allRows = visibleExpenseRows(ctx),
    categories = OPERATING_CATEGORIES.map((c) => ({
      category: c,
      before: s.baseline?.categories[c] ?? null,
      after: consumedCost(s, scope, c),
    })),
    complete = comp.missing.length === 0;
  const deviceCosts = s.devices
    .filter(
      (d) =>
        (!scope.deviceId || d.id === scope.deviceId) &&
        (!scope.zoneId || d.zones.includes(scope.zoneId)),
    )
    .map((device) => {
      const rows = expenseRows(s, { ...scope, deviceId: device.id });
      return { device, rows, total: rows.reduce((sum, row) => sum + row.amount, 0) };
    })
    .filter(({ device, rows }) => device.active || rows.length)
    .sort((a, b) => b.total - a.total || a.device.label.localeCompare(b.device.label))
    .slice(0, 4);
  const pump = s.devices.find((d) => d.active && d.type === 'irrigation');
  const costTabs = (
    <Tabs
      label={'Cost sections'}
      value={tab}
      onChange={(v) => updateQuery(ctx, '/biaya', { tab: v })}
      items={[
        { id: 'summary', label: 'Overview' },
        { id: 'expenses', label: 'Expenses', count: summary.rows.length },
        { id: 'savings', label: 'Savings' },
        { id: 'energy', label: 'Energy & solar' },
        { id: 'profit', label: 'Cycle profit' },
        { id: 'efficiency', label: 'Harvest efficiency' },
      ]}
    />
  );
  if (tab === 'energy')
    return (
      <div className="page-stack">
        {costTabs}
        <Energy key={s.greenhouse.id} ctx={ctx} />
      </div>
    );
  if (tab === 'efficiency')
    return (
      <div className="page-stack">
        {costTabs}
        <HarvestEfficiency key={s.greenhouse.id} ctx={ctx} />
      </div>
    );
  if (tab === 'profit')
    return (
      <div className="page-stack">
        {costTabs}
        <CycleProfit key={s.greenhouse.id} ctx={ctx} />
      </div>
    );
  const filters = (
    <div className="filter-bar scope-filter">
      <span className="scope-label">
        <Icon name="greenhouse" size={16} />
        {displayLabel(s.greenhouse.name)}
      </span>
      <PeriodFilter ctx={ctx} scope={scope} path="/biaya" label="Expense period" />
      <Select
        label={'Cost zone scope'}
        value={scope.zoneId ?? ''}
        onChange={(v) => updateQuery(ctx, '/biaya', { zone: v, device: undefined })}
        options={[
          { value: '', label: 'All zones' },
          ...s.zones.map((z) => ({ value: z.id, label: z.name })),
        ]}
      />
      {displayLabel(
        scope.deviceId && (
          <button
            className="filter-chip"
            onClick={() => updateQuery(ctx, '/biaya', { device: undefined })}
          >
            {scope.deviceId}
            <Icon name="close" size={13} />
          </button>
        ),
      )}
      <span className="micro muted scope-description">
        {periodLabel(scope)}.{' '}
        {summary.partial ? 'Current period; records may be incomplete.' : 'Recorded costs only.'}
      </span>
    </div>
  );
  const scopeError = periodError(scope);
  if (scopeError)
    return (
      <div className="page-stack">
        {filters}
        {costTabs}
        <Alert
          title="Check the date range"
          action={
            <Button
              small
              onClick={() => updateQuery(ctx, '/biaya', { from: undefined, to: undefined })}
            >
              Use current month
            </Button>
          }
        >
          {scopeError}
        </Alert>
      </div>
    );
  return (
    <div className="page-stack">
      {filters}
      <Stats>
        <Stat
          icon="wallet"
          label={'Recorded operating costs'}
          value={summary.rows.length ? money(summary.operating) : 'Not recorded'}
          sub={`${summary.rows.filter((r) => r.record.category !== 'Investasi').length} records; excludes runtime estimates`}
        />
        <Stat
          icon="lower"
          label={
            comp.difference !== null && comp.difference < 0
              ? 'Costs increased'
              : 'Difference from baseline'
          }
          value={comp.difference !== null ? money(Math.abs(comp.difference)) : 'Not comparable yet'}
          sub={
            comp.percent !== null
              ? `${num(Math.abs(comp.percent), 1)}%, estimated against manual baseline`
              : comp.missing.length
                ? `${comp.missing.length} incomplete categories`
                : 'Baseline / scope not equivalent'
          }
          tone={comp.difference !== null && comp.difference < 0 ? 'amber' : 'green'}
          onClick={() => updateQuery(ctx, '/biaya', { tab: 'savings' })}
        />
        <Stat
          icon="coins"
          label={'Remaining period budget'}
          value={summary.remaining !== null ? money(summary.remaining) : 'Unavailable'}
          sub={
            summary.budget !== null
              ? `Budget of ${money(summary.budget)}`
              : 'Budget is not automatically split across assets'
          }
          onClick={() => ctx.open('budget', scope.period)}
        />
        <Stat
          icon="file"
          label={'Record completeness'}
          value={`${OPERATING_CATEGORIES.length - comp.missing.length}/${OPERATING_CATEGORIES.length} categories`}
          sub={
            complete
              ? 'All operating categories have records'
              : `${comp.missing.length} missing categories`
          }
          tone={complete ? 'green' : 'amber'}
        />
      </Stats>
      {(summary.partial || !complete) && (
        <Alert title={'Incomplete period or records'}>
          Unrecorded amounts are not assumed to be zero.{' '}
          {displayLabel(
            summary.partial ? 'Current-month spending is not compared against a full month. ' : '',
          )}
          {displayLabel(comp.missing.length ? `Unavailable: ${comp.missing.join(', ')}.` : '')}
        </Alert>
      )}
      {costTabs}
      {tab === 'summary' && (
        <>
          <div className="costs-layout">
            <div className="page-stack">
              <Card
                title={'Comparison of 6 operating categories'}
                subtitle={`${periodLabel(scope)}, expenses and baseline with matching scope`}
                tools={<SourceTag>Sample record</SourceTag>}
              >
                <div className="cost-chart-key">
                  <span>
                    <i className="sage" />
                    Manual baseline
                  </span>
                  <span>
                    <i className="green" />
                    After implementation
                  </span>
                </div>
                <CostBars
                  rows={categories.map((c) => ({
                    label: c.category,
                    before: c.before,
                    after: c.after,
                  }))}
                />
                <div className="table-scroll">
                  <table className="cost-comparison">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Manual baseline</th>
                        <th>Selected period</th>
                        <th>Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((c) => {
                        const delta =
                          c.before !== null && c.after !== null ? c.before - c.after : null;
                        return (
                          <tr key={c.category}>
                            <td>
                              <button
                                className="text-link"
                                onClick={() =>
                                  updateQuery(ctx, '/biaya', {
                                    tab: 'expenses',
                                    category: c.category,
                                  })
                                }
                              >
                                {displayLabel(c.category)}
                              </button>
                            </td>
                            <td>
                              {displayLabel(c.before !== null ? money(c.before) : 'Not entered')}
                            </td>
                            <td>
                              {displayLabel(c.after !== null ? money(c.after) : 'Not recorded')}
                            </td>
                            <td>
                              <span
                                className={
                                  delta !== null && delta < 0 ? 'text-amber' : 'text-green'
                                }
                              >
                                {displayLabel(
                                  delta === null
                                    ? '—'
                                    : `${money(Math.abs(delta))} ${delta >= 0 ? 'lower' : 'higher'}`,
                                )}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total operating costs</td>
                        <td>
                          {displayLabel(
                            comp.baseline !== null ? money(comp.baseline) : 'Not equivalent',
                          )}
                        </td>
                        <td>{displayLabel(money(summary.operating))}</td>
                        <td>
                          {displayLabel(
                            comp.difference === null ? 'Not compared' : money(comp.difference),
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                <Alert tone="gray">
                  Manual baseline is unvalidated. Before-and-after differences do not prove that
                  Vigor caused every change.
                </Alert>
              </Card>
              <Card
                title={'Devices & linked expenses'}
                variant="register"
                subtitle={'Shared assets are not charged in full to each zone.'}
                tools={
                  <Button
                    small
                    tone="ghost"
                    onClick={() => ctx.nav(`/perangkat?${periodQuery(scope)}`)}
                  >
                    View device
                  </Button>
                }
              >
                {!deviceCosts.length && (
                  <Empty
                    title="No devices in this selection"
                    detail="Add a device in Devices or select another zone to review linked costs."
                  />
                )}
                <div className="device-cost-strip">
                  {deviceCosts.map(({ device, rows, total }) => {
                    const id = device.id;
                    return (
                      <button
                        key={id}
                        onClick={() =>
                          ctx.nav(
                            `/perangkat?device=${encodeURIComponent(id)}&${periodQuery(scope)}&detailTab=cost`,
                          )
                        }
                      >
                        <span className="soft-icon">
                          <Icon
                            name={
                              device.type === 'irrigation'
                                ? 'drop'
                                : device.type === 'nutrition'
                                  ? 'flask'
                                  : 'devices'
                            }
                          />
                        </span>
                        <strong>{displayLabel(device.label)}</strong>
                        <span>{displayLabel(rows.length ? money(total) : 'Not recorded')}</span>
                        <small>{id}, recorded / allocated</small>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
            <div className="page-stack">
              <Card title={'What changed'} icon="wallet">
                <div className="change-item">
                  <Icon name="lower" />
                  <div>
                    <strong>Labor costs</strong>
                    <p>
                      {displayLabel(
                        money(
                          summary.rows
                            .filter((r) => r.record.category === 'Tenaga dibayar')
                            .reduce((sum, r) => sum + r.amount, 0),
                        ),
                      )}{' '}
                      recorded in this scope. Owner labor hours are not counted as payments.
                    </p>
                  </div>
                </div>
                <div className="change-item">
                  <Icon name="up" />
                  <div>
                    <strong>New operating costs are included</strong>
                    <p>Electricity, internet, and maintenance remain in the comparison.</p>
                  </div>
                </div>
                <Alert tone="gray">
                  These totals reflect your selected records. They do not establish why costs
                  changed.
                </Alert>
              </Card>
              <Card title={'Next actions'} icon="arrow">
                <div className="action-list">
                  <button
                    disabled={!pump}
                    title={!pump ? 'Register an irrigation device to review its usage.' : undefined}
                    onClick={() =>
                      ctx.nav(
                        `/perangkat?device=${encodeURIComponent(pump!.id)}&${periodQuery(scope)}&detailTab=usage`,
                      )
                    }
                  >
                    <span className="soft-icon">
                      <Icon name="drop" />
                    </span>
                    <span>
                      <strong>Review pump runtime</strong>
                      <small>Trace usage and electricity allocations</small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </button>
                  <button
                    disabled={ctx.can?.('finance') === false}
                    onClick={() => ctx.open('baseline')}
                  >
                    <span className="soft-icon amber">
                      <Icon name="file" />
                    </span>
                    <span>
                      <strong>Validate baseline costs</strong>
                      <small>Manual baseline is still an assumption</small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </button>
                  <button
                    onClick={() =>
                      ctx.nav(`/biaya?tab=expenses&${periodQuery(scope)}&category=Perawatan`)
                    }
                  >
                    <span className="soft-icon">
                      <Icon name="wrench" />
                    </span>
                    <span>
                      <strong>Review service records</strong>
                      <small>Work and payments are separate</small>
                    </span>
                    <Icon name="chevron" size={16} />
                  </button>
                </div>
              </Card>
              <Card
                title={'Period budget'}
                tools={
                  <Button
                    permission="finance"
                    small
                    tone="ghost"
                    icon="edit"
                    ariaLabel="Edit budget"
                    onClick={() => ctx.open('budget', scope.period)}
                  />
                }
              >
                {summary.budget !== null ? (
                  <>
                    <div className="budget-line">
                      <strong>{displayLabel(money(summary.operating))}</strong>
                      <span>of {displayLabel(money(summary.budget))}</span>
                    </div>
                    <Progress
                      value={summary.budget ? (summary.operating / summary.budget) * 100 : 0}
                    />
                    <p
                      className={
                        summary.remaining !== null && summary.remaining < 0
                          ? 'text-amber'
                          : 'text-green'
                      }
                    >
                      {displayLabel(
                        summary.remaining !== null && summary.remaining < 0
                          ? 'Over budget '
                          : 'Tersisa ',
                      )}
                      {displayLabel(money(Math.abs(summary.remaining ?? 0)))}
                    </p>
                    <small className="muted">
                      Unused budget is not savings against a baseline.
                    </small>
                  </>
                ) : (
                  <Empty title={'No budget recorded'} />
                )}
              </Card>
            </div>
          </div>
          {summary.investment > 0 && (
            <Alert tone="blue" title={`Additional investment: ${money(summary.investment)}`}>
              Total cash outflow {displayLabel(money(summary.total))}. Investment is separate from
              recurring operations and is counted once.
            </Alert>
          )}
        </>
      )}
      {tab === 'expenses' && (
        <>
          <div className="filter-bar">
            <SearchField
              value={search}
              onChange={(v) => updateQuery(ctx, '/biaya', { search: v })}
              placeholder={'Search notes, devices, or IDs…'}
            />
            <Select
              label={'Expense category'}
              value={scope.category ?? ''}
              onChange={(v) => updateQuery(ctx, '/biaya', { category: v })}
              options={[
                { value: '', label: 'All categories' },
                ...ALL_EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
              ]}
            />
            <Select
              label={'Record status'}
              value={status}
              onChange={(v) => updateQuery(ctx, '/biaya', { status: v })}
              options={[
                { value: 'paid', label: 'Recorded' },
                { value: 'draft', label: 'Draft' },
                { value: 'void', label: 'Voided' },
                { value: 'all', label: 'All statuses' },
              ]}
            />
            <Button small icon="download" onClick={() => exportCosts(ctx)}>
              Export CSV
            </Button>
          </div>
          <Card
            title={'Expense records'}
            data-tour="expenses"
            variant="register"
            subtitle={`${periodLabel(scope)}, amounts reflect the selected scope`}
            tools={
              <Button
                permission="finance"
                small
                icon="plus"
                tone="primary"
                onClick={() => ctx.open('expense', undefined, scope.deviceId)}
              >
                Record expense
              </Button>
            }
          >
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date / ID</th>
                    <th>Notes</th>
                    <th>Category</th>
                    <th>Linked to</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {allRows.map((r) => (
                    <tr key={r.record.id} className={r.record.status === 'void' ? 'void-row' : ''}>
                      <td>
                        {displayLabel(dateLabel(r.record.paidAt))}
                        <small className="cell-sub">{displayLabel(r.record.id)}</small>
                      </td>
                      <td>
                        <button
                          className="text-link"
                          onClick={() => ctx.open('expense-detail', r.record.id, scope.deviceId)}
                        >
                          {displayLabel(r.record.note)}
                        </button>
                        {r.record.usageSlices && (
                          <small className="cell-sub">Usage across months</small>
                        )}
                      </td>
                      <td>{displayLabel(r.record.category)}</td>
                      <td>
                        {displayLabel(
                          r.record.deviceId ? (
                            <button
                              className="asset-chip"
                              onClick={() =>
                                ctx.nav(
                                  `/perangkat?device=${encodeURIComponent(r.record.deviceId!)}&${periodQuery(scope)}&detailTab=cost`,
                                )
                              }
                            >
                              <Icon name="link" size={12} />
                              {r.record.deviceId}
                            </button>
                          ) : r.source === 'Alokasi' ? (
                            <SourceTag>Device allocation</SourceTag>
                          ) : (
                            s.greenhouse.name
                          ),
                        )}
                      </td>
                      <td>
                        <strong>
                          {displayLabel(
                            r.record.status === 'draft' && !r.amount
                              ? 'Not entered'
                              : money(r.amount),
                          )}
                        </strong>
                        <small className="cell-sub">{displayLabel(r.source)}</small>
                      </td>
                      <td>
                        <Badge
                          tone={
                            r.record.status === 'paid'
                              ? 'green'
                              : r.record.status === 'void'
                                ? 'red'
                                : 'amber'
                          }
                        >
                          {displayLabel(
                            r.record.status === 'paid'
                              ? 'Tercatat'
                              : r.record.status === 'void'
                                ? 'Voided'
                                : 'Draft',
                          )}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          small
                          tone="ghost"
                          icon="chevron"
                          ariaLabel={`Details ${r.record.id}`}
                          onClick={() => ctx.open('expense-detail', r.record.id, scope.deviceId)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={4}>Recorded total for displayed rows</td>
                    <td>
                      {displayLabel(
                        money(
                          allRows
                            .filter((r) => r.record.status === 'paid')
                            .reduce((t, r) => t + r.amount, 0),
                        ),
                      )}
                    </td>
                    <td colSpan={2}>
                      <SourceTag>Excludes estimates and projections</SourceTag>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {!allRows.length && (
              <Empty
                title={'No records match these filters'}
                detail={'Record confirmed payments. Unknown amounts are not treated as zero.'}
                action={
                  <Button
                    permission="finance"
                    onClick={() => ctx.open('expense', undefined, scope.deviceId)}
                  >
                    Record expense
                  </Button>
                }
              />
            )}
          </Card>
          <div className="button-row">
            <Button
              permission="finance"
              small
              icon="calendar"
              onClick={async () => {
                await ctx.act({ type: 'recurring_drafts' });
                updateQuery(ctx, '/biaya', {
                  period: localDate(s.clock).slice(0, 7),
                  status: 'draft',
                });
              }}
            >
              Create recurring expense drafts for this period
            </Button>
            <p className="micro muted">
              Drafts are not counted as payments. An attachment filename does not verify an amount.
            </p>
          </div>
        </>
      )}
      {tab === 'savings' && (
        <div className="savings-layout">
          <Card
            title={'Before & after implementation'}
            subtitle={'A traceable comparison, not a savings promise.'}
            tools={
              <Button permission="finance" small icon="edit" onClick={() => ctx.open('baseline')}>
                {displayLabel(s.baseline ? 'Edit baseline' : 'Enter baseline')}
              </Button>
            }
          >
            <div className="comparison-hero">
              <div>
                <span>Before automation</span>
                <strong>
                  {displayLabel(comp.baseline !== null ? money(comp.baseline) : 'Unavailable')}
                </strong>
                <SourceTag>Estimated baseline</SourceTag>
              </div>
              <Icon name="arrow" size={25} />
              <div>
                <span>Period operating costs</span>
                <strong>
                  {displayLabel(summary.rows.length ? money(comp.actual) : 'Not recorded')}
                </strong>
                <SourceTag>Sample record</SourceTag>
              </div>
            </div>
            {comp.canCompare ? (
              <div className={`saving-result ${comp.difference! < 0 ? 'increase' : ''}`}>
                <Icon name={comp.difference! < 0 ? 'up' : 'lower'} size={26} />
                <div>
                  <span>
                    {displayLabel(
                      comp.difference! < 0
                        ? 'Costs increased'
                        : 'Estimated net operating difference',
                    )}
                  </span>
                  <strong>
                    {displayLabel(money(Math.abs(comp.difference!)))}{' '}
                    <small>({displayLabel(num(Math.abs(comp.percent!), 1))}%)</small>
                  </strong>
                  <small>{displayLabel(comp.reason)}</small>
                </div>
              </div>
            ) : (
              <Alert title={'Not comparable yet'}>{displayLabel(comp.reason)}</Alert>
            )}
            <h3>Comparison basis</h3>
            <Meta
              items={[
                {
                  label: 'Baseline version / source',
                  value: s.baseline
                    ? `v${s.baseline.version}, ${s.baseline.source === 'assumption' ? 'Manual assumption (unvalidated)' : 'Pre-installation records'}`
                    : 'Unavailable',
                },
                {
                  label: 'Baseline period',
                  value: s.baseline
                    ? `${monthLabel(s.baseline.period)}, ${s.baseline.days} days`
                    : 'Unavailable',
                },
                {
                  label: 'Baseline scope',
                  value: s.baseline
                    ? `${s.baseline.zones.length} zones, ${s.baseline.area} m² planted, ${displayLabel(s.baseline.crop)}`
                    : 'Unavailable',
                },
                { label: 'Stage', value: s.baseline?.phase ?? 'Unavailable' },
                {
                  label: 'Normalization',
                  value: s.baseline?.normalizedDaily
                    ? 'Per day, explicitly selected by the operator'
                    : 'Not applied automatically',
                },
                {
                  label: 'Unrecorded categories',
                  value: comp.missing.length
                    ? comp.missing.join(', ')
                    : 'All categories recorded for this period',
                },
              ]}
            />
            <details open>
              <summary>Formula & comparison limits</summary>
              <div className="formula-box">
                <p>Net operating difference = equivalent baseline − comparable period costs.</p>
                <p>
                  Percentage = difference ÷ equivalent baseline × 100, only when baseline &gt; 0.
                </p>
                <p>
                  New electricity, internet, and maintenance costs are already included. Do not
                  subtract them again.
                </p>
              </div>
            </details>
            <Alert tone="gray">
              Dividing costs per day does not automatically make crop stages, seasons, areas, rates,
              or production comparable. Non-equivalent data shows spending differences only.
            </Alert>
          </Card>
          <div className="page-stack">
            <Card title={'Time benefit'} icon="clock">
              <Empty
                title={'Time saved has not been recorded'}
                detail={
                  'Owner labor hours are separate from cash savings. Do not count them again if already included in paid labor costs.'
                }
              />
            </Card>
            <Card title={'Investment & payback'} icon="coins">
              <Meta
                items={[
                  {
                    label: 'Recorded investment for period',
                    value: summary.investment ? money(summary.investment) : 'No purchases recorded',
                  },
                  { label: 'Payback scenario', value: 'Cannot estimate yet' },
                ]}
              />
              <p className="muted">
                The IDR 2,860,000 plan is not a paid investment. Payback requires confirmed
                additional investment and a suitable monthly savings basis.
              </p>
              <Button permission="finance" small icon="box" onClick={() => ctx.open('planner')}>
                Open device plan
              </Button>
            </Card>
            <Card title={'Manage baseline'}>
              <p>
                Expenses work without a baseline. Deleting it will show savings as unavailable, not
                0%.
              </p>
              <Button
                permission="finance"
                small
                tone="danger"
                icon="trash"
                disabled={!s.baseline}
                onClick={() => ctx.open('remove-baseline')}
              >
                Delete sample baseline
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
