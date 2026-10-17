import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { Alert, Button, Icon, Select, SourceTag } from '../../components/ui';
import { energyConfig, energyModel, validEnergy, type EnergyConfig } from '../../domain/energy';
import { money, number } from '../../domain/format';

function EnergyChart({ model }: { model: ReturnType<typeof energyModel> }) {
  const max = Math.max(0.1, ...model.hours.flatMap((h) => [h.solar, h.demand]));
  const y = (v: number) => 176 - (v / max) * 138;
  return (
    <div className="energy-chart-scroll">
      <svg
        className="energy-chart"
        viewBox="0 0 640 212"
        role="img"
        aria-label={
          'Hourly projection of solar production and device demand in kWh. Details are available in the hourly table.'
        }
      >
        {[0, 0.5, 1].map((t) => (
          <g key={t}>
            <line x1="44" x2="620" y1={y(max * t)} y2={y(max * t)} className="energy-gridline" />
            <text x="36" y={y(max * t) + 4} textAnchor="end">
              {displayLabel(number(max * t, 2))}
            </text>
          </g>
        ))}
        {model.hours.map((h) => (
          <rect
            key={h.hour}
            x={46 + h.hour * 24}
            y={y(h.solar)}
            width="16"
            height={176 - y(h.solar)}
            rx="2"
            className="energy-solar-bar"
          />
        ))}
        <polyline
          points={model.hours.map((h) => `${54 + h.hour * 24},${y(h.demand)}`).join(' ')}
          fill="none"
          className="energy-demand-line"
          strokeWidth="2.5"
        />
        {[0, 6, 12, 18, 23].map((h) => (
          <text key={h} x={54 + h * 24} y="199" textAnchor="middle">
            {displayLabel(String(h).padStart(2, '0'))}:00
          </text>
        ))}
        <text x="44" y="18">
          kWh per hour
        </text>
      </svg>
    </div>
  );
}
export function Energy({ ctx }: { ctx: PageContext }) {
  const saved = energyConfig(ctx.s);
  const [draft, setDraft] = useState<EnergyConfig>(() => structuredClone(saved));
  const [days, setDays] = useState(30);
  const [notice, setNotice] = useState('');
  const valid = validEnergy(draft);
  const model = energyModel(ctx.s, valid ? draft : saved, days);
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const editable = ctx.can?.('finance') ?? true;
  const change = <K extends keyof EnergyConfig>(key: K, value: EnergyConfig[K]) => {
    setDraft((c) => ({ ...c, [key]: value }));
    setNotice('');
  };
  const field = (
    key: Exclude<keyof EnergyConfig, 'enabled' | 'loads'>,
    label: string,
    min: number,
    max: number,
    step = 1,
  ) => (
    <label className="energy-field">
      <span>{displayLabel(label)}</span>
      <input
        name={key}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        required={key !== 'investment'}
        disabled={!editable}
        value={draft[key] === null || !Number.isFinite(draft[key]) ? '' : draft[key]}
        onChange={(e) =>
          change(
            key,
            e.target.value === '' && key === 'investment'
              ? null
              : e.target.value === ''
                ? NaN
                : Number(e.target.value),
          )
        }
      />
    </label>
  );
  const runKwh = ctx.s.usages.reduce((sum, u) => sum + u.energyKwh, 0);
  return (
    <div className="energy-workspace">
      <div className="energy-heading">
        <div>
          <h2>Greenhouse energy</h2>
          <p>Measure device demand before adding panel capacity.</p>
        </div>
        <SourceTag>Simulation / no live meter</SourceTag>
      </div>
      <div className="energy-layout">
        <div className="energy-analysis">
          <section className="energy-balance" aria-label={'Daily energy balance'}>
            <div className="energy-section-heading">
              <h3>From sunlight to devices</h3>
              <span>One-day scenario</span>
            </div>
            <div className="energy-flow">
              <div>
                <Icon name="sun" size={24} />
                <span>Solar production</span>
                <strong>
                  {displayLabel(number(model.day.solar, 2))} <small>kWh</small>
                </strong>
                <small>
                  {displayLabel(
                    draft.enabled ? `${number(model.capacity, 2)} planned kWp` : 'Panels disabled',
                  )}
                </small>
              </div>
              <div className="energy-flow-link" aria-hidden="true">
                <Icon name="arrow" />
              </div>
              <div>
                <Icon name="devices" size={24} />
                <span>Used directly</span>
                <strong>
                  {displayLabel(number(model.day.used, 2))} <small>kWh</small>
                </strong>
                <small>
                  {displayLabel(
                    model.coverage === null
                      ? 'No loads yet'
                      : `${number(model.coverage, 1)}% of device demand`,
                  )}
                </small>
              </div>
              <div className="energy-flow-plus" aria-hidden="true">
                +
              </div>
              <div>
                <Icon name="bolt" size={24} />
                <span>Grid supply</span>
                <strong>
                  {displayLabel(number(model.day.grid, 2))} <small>kWh</small>
                </strong>
                <small>Demand {displayLabel(number(model.day.demand, 2))} kWh</small>
              </div>
            </div>
            <p className="energy-surplus">
              Surplus production <strong>{displayLabel(number(model.day.surplus, 2))} kWh</strong> /
              no battery storage or export revenue.
            </p>
            <div className="energy-chart-legend">
              <span>
                <i />
                Solar production
              </span>
              <span>
                <i />
                Device demand
              </span>
            </div>
            <EnergyChart model={model} />
            <p className="micro muted">
              Synthetic sunlight profile from 06:00–18:00. Load hours are assumptions, separate from
              automation schedules.
            </p>
            <details className="energy-hourly">
              <summary>Hourly energy details</summary>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Hours</th>
                      <th>Solar</th>
                      <th>Load</th>
                      <th>Used</th>
                      <th>PLN</th>
                      <th>Remaining</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.hours.map((h) => (
                      <tr key={h.hour}>
                        <td>{displayLabel(h.label)}</td>
                        {[h.solar, h.demand, h.used, h.grid, h.surplus].map((n, i) => (
                          <td key={i}>{displayLabel(number(n, 3))} kWh</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
          <section className="energy-economics" aria-label={'Projected energy costs'}>
            <div className="energy-section-heading">
              <h3>Are panels worth the investment?</h3>
              <Select
                label={'Energy projection period'}
                value={String(days)}
                onChange={(v) => setDays(Number(v))}
                options={[7, 30, 90].map((d) => ({ value: String(d), label: `${d} days` }))}
              />
            </div>
            <dl className="energy-cost-lines">
              <div>
                <dt>Without panels / device electricity</dt>
                <dd>{displayLabel(money(model.baselineCost))}</dd>
              </div>
              <div>
                <dt>With panels / purchased electricity</dt>
                <dd>{displayLabel(money(model.gridCost))}</dd>
              </div>
              <div>
                <dt>Solar maintenance / period assumption</dt>
                <dd>{displayLabel(money(model.maintenance))}</dd>
              </div>
              <div className="energy-net">
                <dt>
                  {displayLabel(
                    model.netSavings < 0 ? 'Net additional cost' : 'Potential net savings',
                  )}
                </dt>
                <dd>{displayLabel(money(Math.abs(model.netSavings)))}</dd>
              </div>
            </dl>
            <div className="energy-payback">
              <Icon name="coins" size={20} />
              <div>
                <strong>Simple payback</strong>
                <p>
                  {displayLabel(
                    !draft.enabled
                      ? 'Enable the panel scenario to calculate.'
                      : model.paybackMonths !== null
                        ? `${number(model.paybackMonths / 12, 1)} years, if daily assumptions remain constant.`
                        : draft.investment === null
                          ? 'Enter installation investment to calculate.'
                          : 'Not reached: net savings are not positive.',
                  )}
                </p>
              </div>
            </div>
            <p className="micro muted">
              Projection repeats the same day for {days} days. Excludes seasonality, degradation,
              financing, taxes, and inverter replacement. These savings are not recorded payments or
              cycle profit.
            </p>
            <div className="button-row">
              <Button
                small
                icon="wallet"
                onClick={() => ctx.nav('/biaya?tab=expenses&category=Listrik')}
              >
                View recorded bills
              </Button>
              <Button
                small
                icon="layers"
                onClick={() => ctx.nav('/greenhouse?tab=monitoring&view=3d')}
              >
                View service area
              </Button>
            </div>
          </section>
          <details className="energy-loads" open={!model.loads.length}>
            <summary>
              Loads from {model.loads.length} active devices{' '}
              <span>Review duration & start times</span>
            </summary>
            <p className="micro muted">
              Default assumptions: cameras, sensors, and controller run 24 hours; fans 8 hours;
              other actuators 1 hour. Adjust to planned usage. Connectivity does not prove
              electricity consumption.
            </p>
            {model.loads.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Devices</th>
                      <th>Power</th>
                      <th>Hours/day</th>
                      <th>Start (WIB)</th>
                      <th>kWh/day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.loads.map((l) => (
                      <tr key={l.device.id}>
                        <td>
                          <button
                            type="button"
                            className="text-link"
                            onClick={() =>
                              ctx.nav(`/perangkat?device=${encodeURIComponent(l.device.id)}`)
                            }
                          >
                            {displayLabel(l.device.label)}
                          </button>
                          <small className="cell-sub">{displayLabel(l.device.id)}</small>
                        </td>
                        <td>{displayLabel(number(l.watts))} W</td>
                        <td>
                          <input
                            aria-label={`Hours per day ${l.device.id}`}
                            type="number"
                            min="0"
                            max="24"
                            step="0.25"
                            disabled={!editable}
                            value={draft.loads[l.device.id]?.hours ?? l.hours}
                            onChange={(e) =>
                              change('loads', {
                                ...draft.loads,
                                [l.device.id]: {
                                  hours: Number(e.target.value),
                                  start: draft.loads[l.device.id]?.start ?? l.start,
                                },
                              })
                            }
                          />
                        </td>
                        <td>
                          <select
                            aria-label={`Start time ${l.device.id}`}
                            disabled={!editable}
                            value={draft.loads[l.device.id]?.start ?? l.start}
                            onChange={(e) =>
                              change('loads', {
                                ...draft.loads,
                                [l.device.id]: {
                                  hours: draft.loads[l.device.id]?.hours ?? l.hours,
                                  start: Number(e.target.value),
                                },
                              })
                            }
                          >
                            {Array.from({ length: 24 }, (_, h) => (
                              <option key={h} value={h}>
                                {displayLabel(String(h).padStart(2, '0'))}:00
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>{displayLabel(number((l.watts * l.hours) / 1000, 3))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Add devices and their power ratings in inventory to begin comparing.</p>
            )}
            <div className="energy-run-note">
              <span>
                Simulated execution records: <strong>{displayLabel(number(runKwh, 3))} kWh</strong>{' '}
                of {ctx.s.usages.length} usage records, separate from the daily plan.
              </span>
              <Button small onClick={() => ctx.nav('/otomasi?tab=executions')}>
                Review run
              </Button>
            </div>
          </details>
        </div>
        <form
          className="energy-config"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!editable || !valid) return;
            const result = await ctx.act({ type: 'energy_save', config: draft });
            setNotice(result.message);
          }}
        >
          <div className="energy-section-heading">
            <h3>Solar scenario</h3>
            <Icon name="sun" size={22} />
          </div>
          <label className="energy-enable">
            <input
              type="checkbox"
              checked={draft.enabled}
              disabled={!editable}
              onChange={(e) => change('enabled', e.target.checked)}
            />
            Use solar panels
          </label>
          <p className="micro muted">
            Panels on the service canopy, grid-connected without batteries. No backup power during
            grid outages.
          </p>
          <div className="energy-fields">
            {field('panelCount', 'Panel count', 1, 12)}
            {field('panelWatts', 'Capacity/panel (Wp)', 50, 700)}
            {field('inverterKw', 'Inverter capacity (kW)', 0.1, 20, 0.1)}
            {field('sunHours', 'Equivalent sun hours/day', 0, 8, 0.1)}
            {field('performanceRatio', 'System performance factor (0.5–1)', 0.5, 1, 0.01)}
            {field('tariff', 'Assumed rate (IDR/kWh)', 0, 10000)}
          </div>
          <p className="micro muted">
            Initial values are planning examples, not site survey results or official tariffs.
          </p>
          <div className="energy-investment">
            {field('investment', 'Installed investment (IDR)', 1, 1e12)}
            <small>
              Leave empty without a quotation. Include panels, inverter, structure, and
              installation.
            </small>
            {field('maintenanceMonthly', 'Monthly maintenance (IDR)', 0, 1e9)}
            <small>Zero assumes no maintenance cost. Review before assessing feasibility.</small>
          </div>
          {!valid && (
            <Alert tone="amber">
              Enter values within the allowed ranges. The chart currently uses the saved scenario.
            </Alert>
          )}
          <Button
            type="submit"
            permission="finance"
            tone="primary"
            icon="check"
            disabled={!valid || !editable}
          >
            Save scenario
          </Button>
          {dirty && <p className="micro muted">Unsaved changes.</p>}
          {displayLabel(
            notice && (
              <p className="energy-save-status" role="status">
                {notice}
              </p>
            ),
          )}
          {!editable && <p className="micro muted">Owners and Managers can edit the scenario.</p>}
          <details className="energy-method">
            <summary>Calculation basis</summary>
            <p>
              Production = kWp × equivalent sun hours × performance factor, capped by hourly
              inverter capacity. Direct solar use is limited to demand in the same hour.
            </p>
            <p>
              Surplus does not reduce the bill. Installation sizing still requires a survey of
              loads, sunlight, and the site.
            </p>
          </details>
        </form>
      </div>
    </div>
  );
}
