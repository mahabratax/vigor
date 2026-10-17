import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { value } from '../../app/context';
import { Alert, Badge, Button, Field, FormBox, Modal } from '../../components/ui';
import { efficiencySummary, type ResourceAction } from '../../domain/efficiency';
import { clockTime, dateLabel, downloadCsv, localDate, money, number } from '../../domain/format';
export function HarvestEfficiency({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    r = efficiencySummary(s),
    [editor, setEditor] = useState<'extra' | 'review' | 'void' | null>(null),
    [key, setKey] = useState(''),
    [voidId, setVoidId] = useState(''),
    [shares, setShares] = useState<Record<string, number>>({}),
    [page, setPage] = useState(0);
  const shown = r.rows.slice(page * 20, (page + 1) * 20),
    pages = Math.ceil(r.rows.length / 20),
    closed = s.production?.stage === 'closed';
  const open = (mode: 'extra' | 'review' | 'void', id = '') => {
    setKey(`resource-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setVoidId(id);
    setShares(Object.fromEntries(r.rows.map((x) => [x.usage.id, x.percent])));
    setPage(0);
    setEditor(mode);
  };
  const save = async (a: ResourceAction) => {
    const result = await ctx.act(a);
    if (result.ok) setEditor(null);
    return result;
  };
  const optional = (f: FormData, name: string) =>
    value(f, name) === '' ? null : Number(value(f, name));
  const exportData = () =>
    downloadCsv(
      `Vigor-efisiensi-${s.cycle.id}.csv`,
      ['Metrik', 'Total', 'Unit', 'Per kg', 'Status'],
      [
        ['Cycle', s.cycle.id, '', '', 'Sample / whole greenhouse'],
        ['Reviewed produce', r.kg, 'kg', '', 'Released grade A+B output minus losses'],
        [
          'Recorded water',
          r.hasWater ? r.water : '',
          'L',
          r.waterPerKg ?? '',
          r.complete ? 'Coverage reviewed' : 'Incomplete coverage',
        ],
        [
          'Recorded energy',
          r.hasEnergy ? r.energy : '',
          'kWh',
          r.energyPerKg ?? '',
          r.complete ? 'Coverage reviewed' : 'Incomplete coverage',
        ],
        [
          'Cycle expenses',
          r.p.charge,
          'IDR',
          r.costPerKg ?? '',
          r.p.reviewed ? 'Cost allocation reviewed' : 'Cost allocation not reviewed',
        ],
        [
          'Cycle profit',
          r.p.reviewed ? r.p.profit : '',
          'IDR',
          '',
          'Savings are not added to profit',
        ],
      ],
    );
  return (
    <div className="efficiency-workspace">
      <header className="growing-heading">
        <div>
          <h2>Harvest efficiency</h2>
          <p>
            {displayLabel(s.cycle.id)} / seluruh {displayLabel(s.greenhouse.name)}
          </p>
        </div>
        <Button icon="download" permission="export" onClick={exportData}>
          Export efficiency
        </Button>
      </header>
      <div className="efficiency-scope">
        <div>
          <span>Cycle period</span>
          <strong>
            {displayLabel(dateLabel(s.cycle.plantedOn))} –{' '}
            {displayLabel(dateLabel(s.production?.closedOn ?? s.clock))}
          </strong>
        </div>
        <div>
          <span>Reviewed produce</span>
          <strong>
            {displayLabel(number(r.kg, 3))} <small>kg</small>
          </strong>
        </div>
        <Badge tone={r.complete ? 'green' : 'amber'}>
          {displayLabel(
            r.complete
              ? 'Coverage reviewed'
              : r.reviewed
                ? 'Partial coverage'
                : 'Usage needs review',
          )}
        </Badge>
      </div>
      <p className="growing-explanation">
        The denominator is released grade A+B produce minus losses, including sold produce. Held
        lots and rejects are excluded. Usage, costs, and output share the same cycle.
      </p>
      {r.kg === 0 && (
        <Alert tone="blue" title={'No reviewed output to divide by'}>
          Record a harvest and review the lot in Crop cycle. Per-kg values become available after
          release.
          <Button small onClick={() => ctx.nav('/siklus?tab=harvest')}>
            Review harvest output
          </Button>
        </Alert>
      )}
      {!!r.uncertain.length && (
        <Alert tone="amber">
          {r.uncertain.length} usage records have uncertain delivery status. Values are shown as
          records, not verified totals.
        </Alert>
      )}
      <div className="growing-table-scroll" data-tour="harvest-efficiency">
        <table className="growing-table efficiency-metrics">
          <thead>
            <tr>
              <th>Measure</th>
              <th>Cycle total</th>
              <th>Per kg of output</th>
              <th>Calculation basis</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th>Water</th>
              <td>{displayLabel(r.hasWater ? `${number(r.water, 2)} L` : 'No records yet')}</td>
              <td>
                {displayLabel(r.waterPerKg === null ? '—' : `${number(r.waterPerKg, 2)} L/kg`)}
              </td>
              <td>
                Allocated runs + additional records
                <small>
                  {displayLabel(
                    r.complete
                      ? 'Coverage marked complete by the user'
                      : 'Provisional ratio from recorded usage',
                  )}
                </small>
              </td>
            </tr>
            <tr>
              <th>Energy</th>
              <td>{displayLabel(r.hasEnergy ? `${number(r.energy, 3)} kWh` : 'No records yet')}</td>
              <td>
                {displayLabel(r.energyPerKg === null ? '—' : `${number(r.energyPerKg, 3)} kWh/kg`)}
              </td>
              <td>
                Run estimates + additional records
                <small>Solar projections are not added to actual usage</small>
              </td>
            </tr>
            <tr>
              <th>Production expenses</th>
              <td>{displayLabel(money(r.p.charge))}</td>
              <td>{displayLabel(r.costPerKg === null ? '—' : `${money(r.costPerKg)}/kg`)}</td>
              <td>
                {displayLabel(
                  r.p.reviewed ? 'Expense allocation reviewed' : 'Expense allocation not reviewed',
                )}
                <small>Operating costs + depreciation + unpaid expenses</small>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="efficiency-finance">
        <span>
          Recorded revenue <strong>{displayLabel(money(r.p.revenue))}</strong>
        </span>
        <span>
          Cycle profit{' '}
          {r.p.reviewed ? (
            <strong>{displayLabel(money(r.p.profit))}</strong>
          ) : (
            <strong>Awaiting cost review</strong>
          )}
        </span>
        <Button small onClick={() => ctx.nav('/biaya?tab=profit')}>
          Review profit & cost allocation
        </Button>
      </div>
      <p className="growing-explanation">
        Savings are a cost comparison, not extra revenue. Inventory purchases follow expense
        allocations; stock usage is not charged twice. This is not an accounting inventory
        valuation.
      </p>
      <section className="growing-panel">
        <header className="growing-heading">
          <div>
            <h3>Automation usage</h3>
            <p>Review the share of each record allocated to this cycle.</p>
          </div>
          <Button small permission="finance" disabled={closed} onClick={() => open('review')}>
            Review usage allocation
          </Button>
        </header>
        <div className="growing-table-scroll">
          <table className="growing-table">
            <thead>
              <tr>
                <th>Run / device</th>
                <th>Water</th>
                <th>Energy</th>
                <th>Cycle share</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((x) => (
                <tr key={x.usage.id}>
                  <th>
                    <button
                      className="text-link"
                      onClick={() => ctx.nav(`/otomasi?tab=executions&run=${x.usage.runId}`)}
                    >
                      {displayLabel(x.usage.runId)}
                    </button>
                    <small>
                      {displayLabel(x.usage.deviceId)} / {displayLabel(dateLabel(x.usage.at))},{' '}
                      {displayLabel(clockTime(x.usage.at))}
                    </small>
                  </th>
                  <td>{displayLabel(number(x.water, 2))} L</td>
                  <td>{displayLabel(number(x.energy, 3))} kWh</td>
                  <td>
                    {displayLabel(number(x.percent))}%
                    <small>
                      {displayLabel(
                        x.legacy
                          ? 'Historical record without cycle ID; explicitly allocated'
                          : 'Execution cycle recorded',
                      )}
                    </small>
                  </td>
                  <td>
                    {displayLabel(
                      x.usage.deliveryConfirmed ? 'Simulation feedback recorded' : 'Uncertain',
                    )}
                    <small>
                      {displayLabel(
                        x.usage.waterSource === 'estimate' ? 'Estimated water' : 'Simulated flow',
                      )}
                    </small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!r.rows.length && (
          <p className="growing-explanation">
            No executions with usage exist in this cycle period. Add a separate usage record if
            applicable.
          </p>
        )}
        {pages > 1 && (
          <div className="button-row">
            <Button small disabled={page === 0} onClick={() => setPage((n) => n - 1)}>
              Previous
            </Button>
            <span>
              {page + 1}/{pages}
            </span>
            <Button small disabled={page + 1 >= pages} onClick={() => setPage((n) => n + 1)}>
              Next
            </Button>
          </div>
        )}
      </section>
      <section className="growing-panel">
        <header className="growing-heading">
          <div>
            <h3>Usage outside executions</h3>
            <p>For example, continuous sensor power or cleaning water.</p>
          </div>
          <Button
            small
            permission="finance"
            icon="plus"
            disabled={closed}
            onClick={() => open('extra')}
          >
            Record additional usage
          </Button>
        </header>
        <div className="growing-table-scroll">
          <table className="growing-table">
            <thead>
              <tr>
                <th>Notes</th>
                <th>Water</th>
                <th>Energy</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {r.r.extras
                .slice()
                .reverse()
                .map((e) => (
                  <tr key={e.id}>
                    <th>
                      {displayLabel(e.notes)}
                      <small>
                        {displayLabel(dateLabel(e.date))} /{' '}
                        {displayLabel(
                          e.basis === 'reading' ? 'Operator-recorded reading' : 'User estimate',
                        )}
                        {displayLabel(e.void ? ' / dibatalkan' : '')}
                      </small>
                      {displayLabel(e.voidReason && <small>{e.voidReason}</small>)}
                    </th>
                    <td>
                      {displayLabel(e.waterLiters === null ? '—' : `${number(e.waterLiters, 2)} L`)}
                    </td>
                    <td>
                      {displayLabel(e.energyKwh === null ? '—' : `${number(e.energyKwh, 3)} kWh`)}
                    </td>
                    <td>
                      {!e.void && (
                        <Button
                          permission="finance"
                          small
                          disabled={closed}
                          onClick={() => open('void', e.id)}
                        >
                          Void record
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!r.r.extras.length && (
          <p className="growing-explanation">
            No additional records yet. Unknown values remain empty.
          </p>
        )}
      </section>
      <p className="growing-explanation">
        {displayLabel(r.r.notes ? `Review notes: ${r.r.notes}. ` : '')}Record changes or a later
        cycle date invalidate the previous usage review. Simulator values do not prove field
        savings.
      </p>
      {editor && (
        <Modal
          title={
            editor === 'extra'
              ? 'Usage outside executions'
              : editor === 'review'
                ? 'Review usage allocation'
                : 'Void usage record'
          }
          onClose={() => setEditor(null)}
          description={`${s.cycle.id} / ${displayLabel(s.greenhouse.name)}`}
        >
          <FormBox
            onSubmit={(f) =>
              editor === 'extra'
                ? save({
                    type: 'resource_extra',
                    date: value(f, 'date'),
                    waterLiters: optional(f, 'waterLiters'),
                    energyKwh: optional(f, 'energyKwh'),
                    basis: value(f, 'basis') as 'reading' | 'estimate',
                    notes: value(f, 'notes'),
                    key,
                    excludesRuns: f.get('excludesRuns') === 'on',
                  })
                : editor === 'void'
                  ? save({ type: 'resource_void', id: voidId, notes: value(f, 'notes') })
                  : save({
                      type: 'resource_review',
                      shares: Object.fromEntries(
                        r.rows.map((x) => [x.usage.id, shares[x.usage.id] ?? x.percent]),
                      ),
                      coverage: value(f, 'coverage') as 'partial' | 'complete',
                      notes: value(f, 'notes'),
                    })
            }
          >
            {editor === 'extra' ? (
              <>
                <Field label={'Usage date'}>
                  <input
                    name="date"
                    type="date"
                    min={s.cycle.plantedOn}
                    max={localDate(s.clock)}
                    defaultValue={localDate(s.clock)}
                    required
                  />
                </Field>
                <div className="form-grid">
                  <Field label={'Water (liters)'}>
                    <input
                      name="waterLiters"
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder={'Leave empty if unknown'}
                    />
                  </Field>
                  <Field label={'Energy (kWh)'}>
                    <input
                      name="energyKwh"
                      type="number"
                      min="0"
                      step="0.001"
                      placeholder={'Leave empty if unknown'}
                    />
                  </Field>
                </div>
                <Field label={'Value source'}>
                  <select name="basis">
                    <option value="reading">Reading recorded by operator</option>
                    <option value="estimate">User estimate</option>
                  </select>
                </Field>
                <label className="growing-checkbox">
                  <input type="checkbox" name="excludesRuns" required />
                  These values exclude usage already recorded by executions
                </label>
              </>
            ) : editor === 'review' ? (
              <>
                <Alert tone="blue">
                  A 0% share excludes the record. Shares allocate usage to this cycle; they do not
                  reduce device consumption.
                </Alert>
                <div className="resource-allocation-fields">
                  {r.rows.map((x) => (
                    <Field key={x.usage.id} label={`${x.usage.runId} / ${x.usage.deviceId} (%)`}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                        value={
                          Number.isNaN(shares[x.usage.id]) ? '' : (shares[x.usage.id] ?? x.percent)
                        }
                        onChange={(e) =>
                          setShares((prev) => ({
                            ...prev,
                            [x.usage.id]: e.target.value === '' ? NaN : Number(e.target.value),
                          }))
                        }
                      />
                    </Field>
                  ))}
                </div>
                <Field label={'Record coverage'}>
                  <select name="coverage" defaultValue={r.r.coverage}>
                    <option value="partial">Partial / some usage is unrecorded</option>
                    <option value="complete">Complete for the reviewed period</option>
                  </select>
                </Field>
              </>
            ) : null}
            <Field label={editor === 'void' ? 'Reason for voiding' : 'Review notes and basis'}>
              <textarea
                name="notes"
                minLength={8}
                required
                defaultValue={editor === 'review' ? r.r.notes : ''}
              />
            </Field>
            <div className="form-actions">
              <Button onClick={() => setEditor(null)}>Cancel</Button>
              <Button type="submit" permission="finance" tone="primary">
                {displayLabel(
                  editor === 'extra'
                    ? 'Save usage'
                    : editor === 'review'
                      ? 'Save usage review'
                      : 'Void usage',
                )}
              </Button>
            </div>
          </FormBox>
        </Modal>
      )}
    </div>
  );
}
