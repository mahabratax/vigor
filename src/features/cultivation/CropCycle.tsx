import { displayLabel } from '../../i18n/display';
import React, { useEffect, useRef, useState } from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { Alert, Badge, Button, Card, Empty, Icon, Meta, Tabs, Select } from '../../components/ui';
import { dateLabel, localDate, money, num, runLabels } from '../../domain/format';
import { lotStock, productionSummary, zoneCases } from '../../domain/production';
import { cultivation, zoneName } from '../../domain/zones';
import { CropForms, type CropFormSpec } from './CropForms';

export function CropCycle({ ctx }: { ctx: PageContext }) {
  const { s } = ctx,
    r = productionSummary(s),
    zoneId = s.zones.some((z) => z.id === ctx.query.get('zone')) ? ctx.query.get('zone') : null,
    p = zoneId
      ? {
          ...r.p,
          tasks: r.p.tasks.filter((t) => t.zoneId === zoneId),
          lots: r.p.lots.filter((l) => l.zoneId === zoneId),
          losses: r.p.losses.filter((loss) =>
            r.p.lots.some((l) => l.id === loss.lotId && l.zoneId === zoneId),
          ),
          receipts: r.p.receipts.filter((receipt) =>
            r.p.sales.some(
              (sale) =>
                sale.id === receipt.saleId &&
                r.p.lots.some((l) => l.id === sale.lotId && l.zoneId === zoneId),
            ),
          ),
          sales: r.p.sales.filter((sale) =>
            r.p.lots.some((l) => l.id === sale.lotId && l.zoneId === zoneId),
          ),
        }
      : r.p,
    tab = ctx.query.get('tab') ?? 'care';
  const selectionKey = tab === 'care' ? 'task' : tab === 'harvest' ? 'lot' : 'sale';
  const requested = ctx.query.get(selectionKey);
  const records = tab === 'care' ? p.tasks : tab === 'harvest' ? p.lots : p.sales;
  const allRecords = tab === 'care' ? r.p.tasks : tab === 'harvest' ? r.p.lots : r.p.sales;
  const found = records.some((record) => record.id === requested);
  const hiddenByZone = !found && allRecords.some((record) => record.id === requested);
  const selectedRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!requested || !found) return;
    let cancelled = false;
    // Wait until the parent route effect has reset page scroll.
    queueMicrotask(() => {
      if (cancelled) return;
      const element = selectedRef.current;
      element?.scrollIntoView?.({ block: 'center', behavior: 'auto' });
      element?.focus({ preventScroll: true });
    });
    return () => {
      cancelled = true;
    };
  }, [requested, found, tab, s.greenhouse.id]);
  const cyclePath = (nextTab: string) =>
    `/siklus?tab=${nextTab}${zoneId ? `&zone=${encodeURIComponent(zoneId)}` : ''}`;
  const [form, setForm] = useState<CropFormSpec | null>(null);
  const closed = p.stage === 'closed',
    today = localDate(s.clock),
    openCases = s.cases.filter((c) => c.status !== 'closed' && (!zoneId || c.zoneId === zoneId));
  const phases = [
    {
      label: 'Planting',
      detail: dateLabel(s.cycle.plantedOn),
      icon: 'leaf' as const,
      to: `/greenhouse?tab=zones${zoneId ? `&zone=${encodeURIComponent(zoneId)}` : ''}`,
    },
    {
      label: 'Maintenance',
      detail: `${p.tasks.filter((t) => t.status === 'pending').length} tasks, ${openCases.length} open cases`,
      icon: 'shield' as const,
      to: cyclePath('care'),
    },
    {
      label: 'Harvest',
      detail: `${num(r.harvest, 1)} kg recorded`,
      icon: 'box' as const,
      to: cyclePath('harvest'),
    },
    {
      label: 'Sales',
      detail: `${num(r.sold, 1)} kg sold`,
      icon: 'coins' as const,
      to: cyclePath('sales'),
    },
    {
      label: 'Business results',
      detail: closed ? 'Cycle closed' : 'Review costs & profit',
      icon: 'wallet' as const,
      to: '/biaya?tab=profit',
    },
  ];
  return (
    <div className="page-stack crop-page">
      <section className="crop-heading" aria-label={'Active cycle'}>
        <div>
          <span className="muted">{displayLabel(s.cycle.id)}</span>
          <h2>{displayLabel(s.cycle.crop)}</h2>
          <p>
            {s.cycle.plants} plants across {s.zones.length} zones.{' '}
            {displayLabel(
              p.operator
                ? `Assigned to: ${p.operator}.`
                : 'Set cycle targets and an assigned operator.',
            )}
          </p>
        </div>
        <div className="button-row">
          <Badge tone={closed ? 'gray' : 'green'}>
            {displayLabel(
              closed ? 'Cycle closed' : p.stage === 'harvesting' ? 'Staged harvest' : s.cycle.phase,
            )}
          </Badge>
          <Button
            permission="crop_review"
            icon="edit"
            disabled={closed}
            onClick={() => setForm({ kind: 'setup' })}
          >
            Set targets
          </Button>
        </div>
      </section>
      <details className="workflow-map">
        <summary>View the full workflow from planting to business results</summary>
        <nav className="crop-journey" aria-label={'Crop cycle workflow'}>
          {phases.map((x) => (
            <button
              key={x.label}
              onClick={() => ctx.nav(x.to)}
              aria-current={
                (tab === 'care' && x.label === 'Maintenance') ||
                (tab === 'harvest' && x.label === 'Harvest') ||
                (tab === 'sales' && x.label === 'Sales')
                  ? 'step'
                  : undefined
              }
            >
              <Icon name={x.icon} />
              <strong>{displayLabel(x.label)}</strong>
              <small>{displayLabel(x.detail)}</small>
            </button>
          ))}
        </nav>
      </details>
      <Tabs
        label={'Crop cycle sections'}
        value={tab}
        onChange={(v) => {
          setForm(null);
          updateQuery(ctx, '/siklus', { tab: v, task: undefined, lot: undefined, sale: undefined });
        }}
        items={[
          { id: 'care', label: 'Care & pests' },
          { id: 'harvest', label: 'Harvest & stock', count: r.lots.length },
          { id: 'sales', label: 'Sales', count: r.sales.length },
        ]}
      />
      <div className="filter-bar">
        <Select
          label={'Zone records'}
          value={zoneId ?? 'all'}
          onChange={(id) =>
            updateQuery(ctx, '/siklus', {
              zone: id === 'all' ? undefined : id,
              task: undefined,
              lot: undefined,
              sale: undefined,
            })
          }
          options={[
            { value: 'all', label: 'All zones' },
            ...s.zones.map((z) => ({ value: z.id, label: z.name })),
          ]}
        />
        {displayLabel(
          zoneId && (
            <Button small onClick={() => ctx.nav(`/greenhouse?tab=zones&zone=${zoneId}`)}>
              Zone & crop details
            </Button>
          ),
        )}
        <span className="micro muted">
          Output and profit summaries cover the entire greenhouse cycle.
        </span>
      </div>
      {requested && !found && (
        <Alert
          title={hiddenByZone ? 'Record hidden by zone filter' : 'Record not found'}
          action={
            <Button
              small
              onClick={() =>
                updateQuery(
                  ctx,
                  '/siklus',
                  hiddenByZone ? { zone: undefined } : { [selectionKey]: undefined },
                )
              }
            >
              {hiddenByZone ? 'Show all zones' : 'Clear record selection'}
            </Button>
          }
        >
          {hiddenByZone
            ? `${requested} belongs to another zone. Show all zones to view it.`
            : `${requested} is not available in this greenhouse cycle. Check the greenhouse selection or choose another record.`}
        </Alert>
      )}
      {tab === 'care' && (
        <div className="crop-columns">
          <div className="page-stack">
            <Card
              variant="register"
              title={'Field work'}
              data-tour="plant-care"
              subtitle={'Recorded field work complements automated routines.'}
              tools={
                <Button
                  permission="cultivation"
                  small
                  icon="plus"
                  disabled={closed}
                  onClick={() => setForm({ kind: 'task' })}
                >
                  Add care task
                </Button>
              }
            >
              {!p.tasks.length ? (
                <Empty
                  title={'Start with the work you need to record'}
                  illustration={!r.p.tasks.length ? 'inspection' : undefined}
                  detail={'Add support checks, bed sanitation, or other tasks your farm needs.'}
                  icon="leaf"
                />
              ) : (
                <div className="crop-records">
                  {p.tasks.map((t) => (
                    <div
                      className={`crop-record ${ctx.query.get('task') === t.id ? 'selected' : ''}`}
                      ref={
                        requested === t.id
                          ? (node) => {
                              selectedRef.current = node;
                            }
                          : undefined
                      }
                      tabIndex={requested === t.id ? -1 : undefined}
                      data-linked-record={requested === t.id ? t.id : undefined}
                      aria-label={`Care task ${t.id}`}
                      key={t.id}
                    >
                      <div>
                        <strong>{displayLabel(t.title)}</strong>
                        <span>
                          {displayLabel(zoneName(s, t.zoneId))}, {displayLabel(t.operator)}
                        </span>
                        <small>
                          {displayLabel(
                            t.status === 'done'
                              ? `Completed ${dateLabel(t.completedOn!)}: ${t.notes}`
                              : `Schedule ${dateLabel(t.dueOn)}`,
                          )}
                        </small>
                      </div>
                      <Badge
                        tone={t.status === 'done' ? 'green' : t.dueOn < today ? 'amber' : 'gray'}
                      >
                        {displayLabel(
                          t.status === 'done'
                            ? 'Completed'
                            : t.dueOn < today
                              ? 'Overdue'
                              : 'Scheduled',
                        )}
                      </Badge>
                      {t.status === 'pending' && (
                        <Button
                          permission="cultivation"
                          small
                          disabled={closed}
                          onClick={() => setForm({ kind: 'done', id: t.id })}
                        >
                          Record outcome
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
            <Card
              variant="register"
              title={'Cases affecting this cycle'}
              subtitle={'Open cases hold lot release and sales in the affected zone.'}
              tools={
                <Button small onClick={() => ctx.nav('/hama?tab=detection')}>
                  Detection review
                </Button>
              }
            >
              {openCases.length ? (
                <div className="crop-records">
                  {openCases.map((c) => (
                    <button
                      className="crop-case-link"
                      key={c.id}
                      onClick={() => ctx.nav(`/hama?case=${c.id}`)}
                    >
                      <Icon name="bug" />
                      <span>
                        <strong>
                          {displayLabel(zoneName(s, c.zoneId))}: {displayLabel(c.title)}
                        </strong>
                        <small>
                          {displayLabel(c.id)}, {displayLabel(c.assignedTo ?? 'Unassigned')}
                        </small>
                      </span>
                      <Badge tone="amber">
                        {displayLabel(
                          c.status === 'inspection' ? 'Inspection needed' : 'Follow up',
                        )}
                      </Badge>
                      <Icon name="chevron" />
                    </button>
                  ))}
                </div>
              ) : (
                <Empty
                  title={'No open cases'}
                  detail={'Continue monitoring. This does not confirm that plants are pest-free.'}
                />
              )}
            </Card>
          </div>
          <div className="page-stack">
            <Card title={'Cycle plan'} variant="plain">
              <Meta
                items={[
                  { label: 'Planting', value: dateLabel(s.cycle.plantedOn) },
                  {
                    label: 'Planned first harvest',
                    value: p.targetOn ? dateLabel(p.targetOn) : 'Not set',
                  },
                  {
                    label: 'Saleable output target',
                    value: p.targetKg === null ? 'Not set' : `${num(p.targetKg, 1)} kg`,
                  },
                  {
                    label: 'Assumed price / kg',
                    value: p.targetPrice === null ? 'Not set' : money(p.targetPrice),
                  },
                ]}
              />
              <p className="micro muted">
                Targets can be updated. Harvest dates and quantities come from operator records, not
                predictions from reference images.
              </p>
            </Card>
            <Card
              title={'Automatic routines'}
              variant="plain"
              tools={
                <Button small onClick={() => ctx.nav('/otomasi')}>
                  Automation
                </Button>
              }
            >
              <p>
                {s.routines.filter((x) => x.status === 'Active').length} active routines.
                Irrigation, fertigation, and safeguards share the same simulation engine.
              </p>
              <div className="crop-mini-list">
                {s.routines.slice(0, 3).map((x) => (
                  <button
                    key={x.id}
                    onClick={() => ctx.nav(`/otomasi?tab=routines&routine=${x.id}`)}
                  >
                    <span>{displayLabel(x.name)}</span>
                    <Badge>{displayLabel(x.status)}</Badge>
                  </button>
                ))}
              </div>
              {s.runs.slice(0, 2).map((x) => (
                <button
                  className="text-link"
                  key={x.id}
                  onClick={() => ctx.nav(`/otomasi?tab=executions&run=${x.id}`)}
                >
                  {displayLabel(x.routineName)}: {displayLabel(runLabels[x.status])}
                </button>
              ))}
            </Card>
            <Card title={'Continue to harvest'} variant="plain">
              <p>Record output by zone, sort the produce, then review each lot before selling.</p>
              <Button tone="primary" onClick={() => ctx.nav(cyclePath('harvest'))}>
                Open harvest & stock
              </Button>
            </Card>
          </div>
        </div>
      )}
      {tab === 'harvest' && (
        <>
          <div className="crop-totals" aria-label={'Harvest balance'}>
            <div>
              <span>Total harvested</span>
              <strong>
                {displayLabel(num(r.harvest, 1))} <small>kg</small>
              </strong>
            </div>
            <div>
              <span>Sorting rejects</span>
              <strong>
                {displayLabel(num(r.rejected, 1))} <small>kg</small>
              </strong>
            </div>
            <div>
              <span>Loss after sorting</span>
              <strong>
                {displayLabel(num(r.loss, 1))} <small>kg</small>
              </strong>
            </div>
            <div>
              <span>Sold</span>
              <strong>
                {displayLabel(num(r.sold, 1))} <small>kg</small>
              </strong>
            </div>
            <div>
              <span>Remaining stock</span>
              <strong>
                {displayLabel(num(r.stock, 1))} <small>kg</small>
              </strong>
            </div>
          </div>
          <Card
            variant="register"
            title={'Harvest lots & stock'}
            data-tour="harvest-lots"
            subtitle={'Each lot records its source zone, date, grades, and review outcome.'}
            tools={
              <Button
                permission="cultivation"
                icon="plus"
                tone="primary"
                disabled={closed}
                onClick={() => setForm({ kind: 'harvest' })}
              >
                Record harvest
              </Button>
            }
          >
            {!p.lots.length ? (
              <Empty
                icon="box"
                title={'First harvest not recorded yet'}
                illustration={!r.p.lots.length ? 'harvest' : undefined}
                detail={
                  'Add a planting batch in Zones & crops, then record weighed and sorted output for this zone.'
                }
              />
            ) : (
              <div className="crop-lot-list">
                {p.lots.map((l) => {
                  const blocked = zoneCases(s, l.zoneId),
                    a = lotStock(p, l, 'A'),
                    b = lotStock(p, l, 'B');
                  return (
                    <article
                      className={`crop-lot ${ctx.query.get('lot') === l.id ? 'selected' : ''}`}
                      ref={
                        requested === l.id
                          ? (node) => {
                              selectedRef.current = node;
                            }
                          : undefined
                      }
                      tabIndex={requested === l.id ? -1 : undefined}
                      data-linked-record={requested === l.id ? l.id : undefined}
                      aria-label={`Harvest lot ${l.id}`}
                      key={l.id}
                    >
                      <header>
                        <div>
                          <strong>{displayLabel(l.id)}</strong>
                          <span>
                            {displayLabel(zoneName(s, l.zoneId))}, {displayLabel(dateLabel(l.date))}
                            {displayLabel(
                              l.crop
                                ? ` / ${displayLabel(l.crop)}${l.variety ? ` ${l.variety}` : ''}, ${l.plantingId}`
                                : '',
                            )}
                          </span>
                        </div>
                        <Badge
                          tone={
                            l.status === 'void'
                              ? 'gray'
                              : blocked.length || l.status === 'held'
                                ? 'amber'
                                : 'green'
                          }
                        >
                          {displayLabel(
                            l.status === 'void'
                              ? 'Voided'
                              : blocked.length
                                ? 'Case unresolved'
                                : l.status === 'held'
                                  ? 'Awaiting review'
                                  : 'Reviewed',
                          )}
                        </Badge>
                      </header>
                      <div className="crop-lot-data">
                        <div>
                          <span>Harvest</span>
                          <strong>{displayLabel(num(l.grossKg, 1))} kg</strong>
                        </div>
                        <div>
                          <span>Remaining grade A</span>
                          <strong>{displayLabel(num(a, 1))} kg</strong>
                        </div>
                        <div>
                          <span>Remaining grade B</span>
                          <strong>{displayLabel(num(b, 1))} kg</strong>
                        </div>
                        <div>
                          <span>Sorting rejects</span>
                          <strong>{displayLabel(num(l.rejectedKg, 1))} kg</strong>
                        </div>
                      </div>
                      <p>{displayLabel(l.notes)}</p>
                      {displayLabel(
                        l.reviewNotes && (
                          <p className="micro muted">
                            Review {dateLabel(l.reviewedOn!)}: {l.reviewNotes}
                          </p>
                        ),
                      )}
                      {blocked.length > 0 && (
                        <div className="crop-hold">
                          <Icon name="alert" size={16} />
                          <span>
                            Stock held while {displayLabel(blocked.map((c) => c.id).join(', '))}{' '}
                            remain open.
                          </span>
                          <Button small onClick={() => ctx.nav(`/hama?case=${blocked[0].id}`)}>
                            View case
                          </Button>
                        </div>
                      )}
                      {l.status !== 'void' && (
                        <footer>
                          <Button
                            permission="crop_review"
                            small
                            disabled={closed || !!blocked.length}
                            onClick={() => setForm({ kind: 'release', id: l.id })}
                          >
                            {displayLabel(l.status === 'released' ? 'Review again' : 'Review lot')}
                          </Button>
                          <Button
                            permission="finance"
                            small
                            disabled={
                              closed || l.status !== 'released' || !!blocked.length || a + b <= 0
                            }
                            onClick={() => setForm({ kind: 'sale', id: l.id })}
                          >
                            Record sale
                          </Button>
                          <Button
                            permission="cultivation"
                            small
                            disabled={closed || a + b <= 0}
                            onClick={() => setForm({ kind: 'loss', id: l.id })}
                          >
                            Record loss
                          </Button>
                          <Button
                            permission="crop_review"
                            small
                            tone="ghost"
                            disabled={
                              closed ||
                              p.sales.some((x) => x.lotId === l.id && x.status === 'recorded') ||
                              p.losses.some((x) => x.lotId === l.id)
                            }
                            onClick={() => setForm({ kind: 'void_lot', id: l.id })}
                          >
                            Void record
                          </Button>
                        </footer>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </Card>
          <p className="micro muted">
            Balance: harvest = sorting rejects + losses + sold + stock. Grades and reviews are
            entered by operators. No AI grading or quality certification is claimed.
          </p>
          {p.losses.length > 0 && (
            <Card title={'Loss records'} variant="plain">
              <div className="crop-records">
                {p.losses.map((x) => (
                  <div className="crop-record" key={x.id}>
                    <div>
                      <strong>
                        {displayLabel(x.lotId)}, grade {displayLabel(x.grade)}:{' '}
                        {displayLabel(num(x.kg, 3))} kg
                      </strong>
                      <small>
                        {displayLabel(dateLabel(x.date))}, {displayLabel(x.reason)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
      {tab === 'sales' && (
        <>
          <div className="crop-totals">
            <div>
              <span>Recorded sales</span>
              <strong>{displayLabel(money(r.revenue))}</strong>
            </div>
            <div>
              <span>Cash received</span>
              <strong>{displayLabel(money(r.received))}</strong>
            </div>
            <div>
              <span>Receivables</span>
              <strong>{displayLabel(money(r.receivable))}</strong>
            </div>
          </div>
          <Card
            variant="register"
            title={'Produce sales'}
            data-tour="harvest-sales"
            subtitle={
              'Delivered produce. Payment receipts are recorded separately from sales value.'
            }
            tools={
              <Button
                permission="finance"
                icon="plus"
                disabled={
                  closed ||
                  !r.lots.some(
                    (l) =>
                      l.status === 'released' &&
                      !zoneCases(s, l.zoneId).length &&
                      lotStock(p, l, 'A') + lotStock(p, l, 'B') > 0,
                  )
                }
                onClick={() => setForm({ kind: 'sale' })}
              >
                Record sale
              </Button>
            }
          >
            {!p.sales.length ? (
              <Empty
                title={'No sales yet'}
                illustration={!r.p.sales.length ? 'harvest' : undefined}
                detail={
                  'Record and review a lot in Harvest & stock, then select the buyer, grade, weight, and price.'
                }
                action={
                  <Button onClick={() => ctx.nav(cyclePath('harvest'))}>
                    Open harvest & stock
                  </Button>
                }
              />
            ) : (
              <div className="crop-records">
                {p.sales.map((x) => {
                  const paid = p.receipts
                      .filter((y) => y.saleId === x.id)
                      .reduce((n, y) => n + y.amount, 0),
                    total = Math.round(x.kg * x.price),
                    remaining = total - paid;
                  return (
                    <article
                      className={`crop-sale ${ctx.query.get('sale') === x.id ? 'selected' : ''}`}
                      ref={
                        requested === x.id
                          ? (node) => {
                              selectedRef.current = node;
                            }
                          : undefined
                      }
                      tabIndex={requested === x.id ? -1 : undefined}
                      data-linked-record={requested === x.id ? x.id : undefined}
                      aria-label={`Sale ${x.id}`}
                      key={x.id}
                    >
                      <header>
                        <div>
                          <strong>{displayLabel(x.buyer)}</strong>
                          <span>
                            {displayLabel(x.id)}, {displayLabel(dateLabel(x.date))}
                          </span>
                        </div>
                        <Badge
                          tone={
                            x.status === 'void'
                              ? 'gray'
                              : remaining === 0
                                ? 'green'
                                : x.dueOn < today
                                  ? 'amber'
                                  : 'blue'
                          }
                        >
                          {displayLabel(
                            x.status === 'void'
                              ? 'Voided'
                              : remaining === 0
                                ? 'Paid'
                                : x.dueOn < today
                                  ? 'Overdue'
                                  : 'Payment outstanding',
                          )}
                        </Badge>
                      </header>
                      <div className="crop-sale-body">
                        <div>
                          <button
                            className="text-link"
                            onClick={() => ctx.nav(`/siklus?tab=harvest&lot=${x.lotId}`)}
                          >
                            {displayLabel(x.lotId)}, grade {displayLabel(x.grade)}
                          </button>
                          <p>
                            {displayLabel(num(x.kg, 3))} kg × {displayLabel(money(x.price))} / kg
                          </p>
                          <small>Due date {displayLabel(dateLabel(x.dueOn))}</small>
                        </div>
                        <dl>
                          <div>
                            <dt>Sales value</dt>
                            <dd>{displayLabel(money(total))}</dd>
                          </div>
                          <div>
                            <dt>Received</dt>
                            <dd>{displayLabel(money(paid))}</dd>
                          </div>
                          <div>
                            <dt>Outstanding balance</dt>
                            <dd>{displayLabel(money(x.status === 'void' ? 0 : remaining))}</dd>
                          </div>
                        </dl>
                      </div>
                      {x.status !== 'void' && (
                        <footer>
                          <Button
                            permission="finance"
                            small
                            disabled={closed || remaining <= 0}
                            onClick={() => setForm({ kind: 'payment', id: x.id })}
                          >
                            Record receipt
                          </Button>
                          <Button
                            permission="finance"
                            small
                            tone="ghost"
                            disabled={closed || paid > 0}
                            onClick={() => setForm({ kind: 'void_sale', id: x.id })}
                          >
                            Void sale
                          </Button>
                        </footer>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </Card>
          {p.receipts.length > 0 && (
            <Card title={'Payment receipt history'} variant="plain">
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sales</th>
                      <th>Reference</th>
                      <th>Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.receipts.map((x) => (
                      <tr key={x.id}>
                        <td>{displayLabel(dateLabel(x.date))}</td>
                        <td>{displayLabel(x.saleId)}</td>
                        <td>{displayLabel(x.reference)}</td>
                        <td>{displayLabel(money(x.amount))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
          <div className="crop-next">
            <span>Costs and sales are linked to this cycle's business results.</span>
            <Button icon="wallet" onClick={() => ctx.nav('/biaya?tab=profit')}>
              Review cycle profit
            </Button>
          </div>
        </>
      )}
      {closed && (
        <Alert tone="blue" title={`Cycle closed ${dateLabel(p.closedOn!)}`}>
          {displayLabel(p.closingNotes)}{' '}
          <Button permission="crop_review" small onClick={() => setForm({ kind: 'reopen' })}>
            Reopen review
          </Button>
        </Alert>
      )}
      {form && (
        <CropForms
          key={`${s.greenhouse.id}-${form.kind}-${form.id ?? ''}`}
          ctx={ctx}
          spec={form}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}
