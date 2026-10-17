import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { Alert, Badge, Button, Empty, Icon, Select, SourceTag } from '../../components/ui';
import { clockTime, dateLabel, money, number, runLabels } from '../../domain/format';
import { productionSummary } from '../../domain/production';
import { kindIcons, kindLabels } from '../automation/presentation';
import { operationReview } from './operationsModel';
import { RunOutcome } from './RunOutcome';
import { activeTarget } from '../../domain/cropTargets';

export function Operations({ ctx }: { ctx: PageContext }) {
  const s = ctx.s,
    zone = ctx.query.get('zone') ?? '';
  const routines = s.routines.filter((r) => !zone || r.version.zones.includes(zone));
  const selected = routines.find((r) => r.id === ctx.query.get('routine')) ?? routines[0];
  const review = selected ? operationReview(s, selected) : null;
  const choose = (id: string) =>
    updateQuery(ctx, '/greenhouse', { tab: 'operations', routine: id });
  const production = productionSummary(s);
  const unresolved = s.cases.filter((c) => c.status !== 'closed').length;
  return (
    <div className="operations-workspace" data-tour="operations-review">
      <header className="operations-heading">
        <div>
          <h2>Operations</h2>
          <p>Review action reasons, blocking conditions, and outcomes needing follow-up.</p>
        </div>
        <div>
          <SourceTag>Browser simulation</SourceTag>
          <small>
            {displayLabel(dateLabel(s.clock))}, {displayLabel(clockTime(s.clock))} WIB /{' '}
            {displayLabel(s.playing ? 'Clock running' : 'Clock paused')}
          </small>
        </div>
      </header>
      <div className="operations-controls">
        <Select
          label={'Operations zone filter'}
          value={zone}
          onChange={(v) => updateQuery(ctx, '/greenhouse', { zone: v, routine: undefined })}
          options={[
            { value: '', label: 'All zones' },
            ...s.zones.map((z) => ({ value: z.id, label: z.name })),
          ]}
        />
        <span className="micro muted">Gateway and scheduler are not connected.</span>
      </div>
      {!selected || !review ? (
        <Empty
          title={'No automation in this scope'}
          detail={
            'Add devices and routines to review their conditions, requirements, and results here.'
          }
          action={
            <Button permission="automation" onClick={() => ctx.nav('/otomasi?tab=builder')}>
              Create routine
            </Button>
          }
        />
      ) : (
        <div className="operations-layout">
          <nav className="operations-routines" aria-label={'Operations routines'}>
            {routines.map((r) => {
              const item = operationReview(s, r);
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-current={r.id === selected.id ? 'true' : undefined}
                  onClick={() => choose(r.id)}
                >
                  <Icon name={kindIcons[r.kind]} size={19} />
                  <span>
                    <strong>{displayLabel(r.name)}</strong>
                    <small>
                      {displayLabel(
                        r.version.zones
                          .map((id) => s.zones.find((z) => z.id === id)?.name ?? id)
                          .join(', '),
                      )}
                    </small>
                    <em data-attention={item.attention}>{displayLabel(item.status)}</em>
                  </span>
                  <Icon name="chevron" size={14} />
                </button>
              );
            })}
          </nav>
          <section
            className="operations-detail"
            aria-label={`Execution ${displayLabel(selected.name)}`}
          >
            <div className="operations-mobile-picker">
              <Select
                label={'Select an operations routine'}
                value={selected.id}
                onChange={choose}
                options={routines.map((r) => ({ value: r.id, label: r.name }))}
              />
            </div>
            <div className="operations-detail-title">
              <div>
                <span>{displayLabel(kindLabels[selected.kind])}</span>
                <h3>{displayLabel(selected.name)}</h3>
              </div>
              <Badge tone={review.attention ? 'amber' : 'blue'}>
                {displayLabel(review.status)}
              </Badge>
            </div>
            {s.production?.stage === 'closed' && (
              <Alert tone="gray">
                The cycle is closed. Reopen its review before starting crop operations.
              </Alert>
            )}
            <ol className="operations-sequence">
              <li>
                <span className="operations-step-icon">
                  <Icon name="eye" />
                </span>
                <div>
                  <h4>Input conditions</h4>
                  <div className="operations-target-links">
                    {selected.version.zones.map((id) => (
                      <Button
                        key={id}
                        small
                        onClick={() => ctx.nav(`/greenhouse?tab=zones&zone=${id}&panel=targets`)}
                      >
                        Zone targets {displayLabel(id)}
                        {displayLabel(
                          activeTarget(s, id)
                            ? ` / v${activeTarget(s, id)!.version}`
                            : ' / not reviewed',
                        )}
                      </Button>
                    ))}
                  </div>
                  {review.readings.length ? (
                    <dl className="operations-readings">
                      {review.readings.map((r) => (
                        <div key={r.id}>
                          <dt>
                            <button
                              type="button"
                              onClick={() =>
                                ctx.nav(`/perangkat?device=${encodeURIComponent(r.id)}`)
                              }
                            >
                              {displayLabel(r.label)}
                            </button>
                            <small>{displayLabel(r.id)}</small>
                          </dt>
                          <dd>
                            {displayLabel(
                              r.value === null ? '—' : `${number(r.value, 1)} ${r.unit}`,
                            )}
                            <small>{displayLabel(r.quality)}</small>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p>This operation has no available numeric sensor readings.</p>
                  )}
                </div>
              </li>
              <li>
                <span className="operations-step-icon">
                  <Icon name="workflow" />
                </span>
                <div>
                  <h4>Trigger rules</h4>
                  <p>{displayLabel(review.rule)}</p>
                  <p className="operations-state">{displayLabel(review.trigger)}</p>
                  {selected.status !== 'Active' && (
                    <p>Routine inactive; its trigger cannot start an execution.</p>
                  )}
                </div>
              </li>
              <li>
                <span className="operations-step-icon">
                  <Icon name="shield" />
                </span>
                <div>
                  <h4>Conditions for next run</h4>
                  <p className={review.guard ? 'operations-warning' : ''}>
                    {displayLabel(
                      review.guard ??
                        'Initial checks available. Limits and feedback must still be checked during execution.',
                    )}
                  </p>
                  {review.lock && (
                    <p className="operations-warning">
                      {displayLabel(review.lock.id)}{' '}
                      {displayLabel(review.lock.state === 'unknown' ? 'unconfirmed' : 'in use')} by{' '}
                      {displayLabel(review.lock.runId)}.
                    </p>
                  )}
                  <div className="operations-device-links">
                    {review.required.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => ctx.nav(`/perangkat?device=${encodeURIComponent(r.id)}`)}
                        data-attention={
                          !r.device ||
                          r.device.connection !== 'online' ||
                          !r.device.calibrated ||
                          r.device.maintenance
                        }
                      >
                        {displayLabel(r.id)}
                        <Icon name="external" size={11} />
                      </button>
                    ))}
                  </div>
                  <Button small onClick={() => ctx.open('dry-run', selected.id)}>
                    Check rules
                  </Button>
                </div>
              </li>
              <li>
                <span className="operations-step-icon">
                  <Icon name="play" />
                </span>
                <div>
                  <h4>Latest execution</h4>
                  {review.latest ? (
                    <>
                      <p>
                        <strong>{displayLabel(runLabels[review.latest.status])}</strong> /{' '}
                        {displayLabel(review.latest.id)},{' '}
                        {displayLabel(
                          clockTime(review.latest.finishedAt ?? review.latest.createdAt),
                        )}{' '}
                        WIB
                      </p>
                      <p>{displayLabel(review.latest.reason)}</p>
                      <Button
                        small
                        onClick={() =>
                          ctx.nav(
                            `/otomasi?tab=executions&run=${encodeURIComponent(review.latest!.id)}`,
                          )
                        }
                      >
                        View execution steps
                      </Button>
                    </>
                  ) : (
                    <p>No execution for this routine yet.</p>
                  )}
                  <div className="button-row">
                    <Button
                      small
                      onClick={() =>
                        ctx.nav(`/otomasi?tab=routines&routine=${encodeURIComponent(selected.id)}`)
                      }
                    >
                      Review routine
                    </Button>
                  </div>
                </div>
              </li>
              <li>
                <span className="operations-step-icon">
                  <Icon name="checkcircle" />
                </span>
                <div>
                  <h4>Outcomes & follow-up</h4>
                  <p>{displayLabel(review.outcome)}</p>
                  {!!review.usage.length && (
                    <p className="operations-usage">
                      {displayLabel(
                        number(
                          review.usage.reduce((n, u) => n + u.waterLiters, 0),
                          1,
                        ),
                      )}{' '}
                      L of water /{' '}
                      {displayLabel(
                        number(
                          review.usage.reduce((n, u) => n + u.energyKwh, 0),
                          3,
                        ),
                      )}{' '}
                      kWh estimated energy
                      {displayLabel(
                        review.usage.some((u) => !u.deliveryConfirmed)
                          ? ' / delivery unconfirmed'
                          : ' / catatan simulator',
                      )}
                    </p>
                  )}
                  {review.latest && (
                    <Button small onClick={() => ctx.nav(review.followUp)}>
                      {displayLabel(
                        selected.policy === 'task'
                          ? 'Review operator work'
                          : selected.kind === 'environment'
                            ? 'Review temperature sensor'
                            : 'Review crop condition',
                      )}
                    </Button>
                  )}
                </div>
              </li>
            </ol>
            {review.latest && (
              <RunOutcome key={review.latest.id} ctx={ctx} runId={review.latest.id} />
            )}
          </section>
        </div>
      )}
      <section className="operations-handoffs" aria-label={'Greenhouse follow-up workflow'}>
        <div className="operations-section-heading">
          <h3>Continue to business results</h3>
          <span>Whole greenhouse / shared records</span>
        </div>
        <div>
          <button type="button" onClick={() => ctx.nav('/hama')}>
            <Icon name="bug" />
            <span>
              Pests & inspections<small>{unresolved} open cases</small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          <button type="button" onClick={() => ctx.nav('/siklus?tab=care')}>
            <Icon name="leaf" />
            <span>
              Maintenance
              <small>
                {production.p.tasks.filter((t) => t.status === 'pending').length} incomplete tasks
              </small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          <button type="button" onClick={() => ctx.nav('/siklus?tab=harvest')}>
            <Icon name="box" />
            <span>
              Harvest & lot review
              <small>
                {displayLabel(number(production.harvest, 1))} kg recorded /{' '}
                {displayLabel(number(production.heldKg, 1))} kg held
              </small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          <button type="button" onClick={() => ctx.nav('/siklus?tab=sales')}>
            <Icon name="wallet" />
            <span>
              Sales & receipts
              <small>{displayLabel(money(production.receivable))} not yet received</small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          <button type="button" onClick={() => ctx.nav('/biaya?tab=profit')}>
            <Icon name="coins" />
            <span>
              Review cycle profit
              <small>
                {displayLabel(
                  production.reviewed ? 'Cost allocation reviewed' : 'Cost allocation needs review',
                )}
              </small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
        </div>
      </section>
      <p className="operations-footnote">
        <Button small onClick={() => ctx.nav('/perangkat?tab=supplies')}>
          Review supplies
        </Button>{' '}
        <Button small onClick={() => ctx.nav('/biaya?tab=efficiency')}>
          Harvest efficiency
        </Button>{' '}
        A completed device command does not prove crop recovery. The prototype has no connected
        devices or background scheduler.
      </p>
    </div>
  );
}
