import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Icon,
  Meta,
  SearchField,
  Tabs,
} from '../../components/ui';
import { dateLabel, localDate, number } from '../../domain/format';
import { activeBatch, cultivation, zoneCapacity } from '../../domain/zones';
import type { ZoneAction } from '../../domain/zoneTypes';
import { ZoneForms, type ZoneEditor } from './ZoneForms';
import { lotStock, production, zoneCases } from '../../domain/production';
import { CropForms, type CropFormSpec } from '../cultivation/CropForms';
import { CropTargets } from './CropTargets';

export function ZoneManagement({ ctx }: { ctx: PageContext }) {
  const { s } = ctx;
  const state = cultivation(s),
    p = production(s);
  const z = s.zones.find((z) => z.id === ctx.query.get('zone')) ?? s.zones[0];
  const batch = activeBatch(s, z.id);
  const [editor, setEditor] = useState<ZoneEditor | null>(null),
    [cropForm, setCropForm] = useState<CropFormSpec | null>(null);
  const [search, setSearch] = useState('');
  const panel = ctx.query.get('panel') ?? 'plants',
    inactive = z.status === 'inactive',
    closed = p.stage === 'closed';
  const allocated = s.zones.reduce((n, z) => n + z.area, 0),
    freeArea = Math.max(0, s.greenhouse.plantedArea - allocated);
  const rows = s.zones.filter((zone) =>
    `${displayLabel(zone.name)} ${activeBatch(s, zone.id)?.crop ?? ''}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const devices = s.devices.filter((d) => d.zones.includes(z.id));
  const routines = s.routines.filter((r) => r.version.zones.includes(z.id));
  const tasks = p.tasks.filter((t) => t.zoneId === z.id),
    lots = p.lots.filter((l) => l.zoneId === z.id && l.status !== 'void');
  const cases = zoneCases(s, z.id);
  const movementLabels = {
    add: 'Add plants',
    loss: 'Dead / failed plants',
    remove: 'Plants removed',
  };
  const close = () => {
    setEditor(null);
  };
  const open = (next: ZoneEditor) => {
    setEditor(next);
  };
  const select = (id: string) => {
    close();
    setCropForm(null);
    updateQuery(ctx, '/greenhouse', { zone: id });
  };
  const save = async (action: ZoneAction) => {
    const result = await ctx.act({ ...action, actor: ctx.actor });
    if (result.ok) {
      close();
      if (action.type === 'zone_save' && !action.id && result.id)
        updateQuery(ctx, '/greenhouse', { zone: result.id });
      if (action.type === 'zone_delete') updateQuery(ctx, '/greenhouse', { zone: undefined });
    }
    return result;
  };
  return (
    <div className="page-stack zone-management">
      <section className="zone-workspace-heading">
        <div>
          <h2>Zones & crops</h2>
          <p>Manage growing space, record populations, and continue work by zone.</p>
        </div>
        <Button
          permission="greenhouse_edit"
          icon="plus"
          tone="primary"
          disabled={closed}
          onClick={() => open('zone-new')}
        >
          Add zone
        </Button>
        <dl>
          <div>
            <dt>Allocated area</dt>
            <dd>
              {displayLabel(number(allocated, 2))} /{' '}
              {displayLabel(number(s.greenhouse.plantedArea, 2))} m²
            </dd>
          </div>
          <div>
            <dt>Active plants</dt>
            <dd>{displayLabel(number(s.cycle.plants))} plants</dd>
          </div>
          <div>
            <dt>Active batches</dt>
            <dd>{state.batches.filter((b) => b.status === 'active').length} batch</dd>
          </div>
        </dl>
      </section>
      {closed && (
        <Alert title={'Cycle closed'}>
          Records can be reviewed. Reopen the cycle in Crop cycle before changing configuration.
        </Alert>
      )}
      <div className="zone-workspace">
        <aside className="zone-register" aria-label={'Zone list'}>
          <SearchField value={search} onChange={setSearch} placeholder={'Search zones or crops'} />
          <div className="zone-register-list">
            {rows.map((zone) => {
              const planting = activeBatch(s, zone.id);
              return (
                <button
                  key={zone.id}
                  className={`zone-register-item ${zone.id === z.id ? 'selected' : ''}`}
                  aria-pressed={zone.id === z.id}
                  onClick={() => select(zone.id)}
                >
                  <span className="zone-register-code">{displayLabel(zone.id)}</span>
                  <span>
                    <strong>{displayLabel(zone.name)}</strong>
                    <small>
                      {displayLabel(
                        zone.status === 'inactive'
                          ? 'Inactive'
                          : planting
                            ? `${displayLabel(planting.crop)}${planting.variety ? ` / ${planting.variety}` : ''}`
                            : 'No planting batch yet',
                      )}
                    </small>
                    <small>
                      {displayLabel(number(zone.plants))} /{' '}
                      {displayLabel(number(zoneCapacity(zone)))} plants,{' '}
                      {displayLabel(number(zone.area, 2))} m²
                    </small>
                  </span>
                </button>
              );
            })}
          </div>
          {!rows.length && (
            <Empty
              title={'Zone not found'}
              action={<Button onClick={() => setSearch('')}>Clear search</Button>}
            />
          )}
          <p className="micro muted">
            {displayLabel(number(freeArea, 2))} m² unallocated.{' '}
            <button className="text-link" onClick={() => ctx.nav('/greenhouse?tab=manage')}>
              Edit greenhouse profile
            </button>
          </p>
        </aside>
        <div className="zone-workspace-detail" key={z.id}>
          <section className="zone-detail-heading">
            <div>
              <span className="zone-detail-code">Zone {displayLabel(z.id)}</span>
              <h2>{displayLabel(z.name)}</h2>
              <p>
                {displayLabel(z.method ?? 'Growing method not specified')}
                {displayLabel(z.beds ? `, ${z.beds} bed` : '')}
              </p>
            </div>
            <Badge tone={inactive ? 'gray' : 'green'}>
              {displayLabel(inactive ? 'Inactive' : 'Active')}
            </Badge>
            <div className="button-row">
              <Button
                permission="greenhouse_edit"
                small
                icon="edit"
                disabled={closed}
                onClick={() => open('zone-edit')}
              >
                Edit zone
              </Button>
              <Button small icon="eye" onClick={() => ctx.nav(`/greenhouse?view=2d&zone=${z.id}`)}>
                View plan
              </Button>
            </div>
          </section>
          <Tabs
            label={'Zone details'}
            value={panel}
            onChange={(panel) => updateQuery(ctx, '/greenhouse', { panel })}
            items={[
              { id: 'plants', label: 'Crop' },
              { id: 'targets', label: 'Crop targets' },
              { id: 'devices', label: 'Devices', count: devices.length },
              { id: 'activity', label: 'Work & history' },
            ]}
          />
          {panel === 'plants' && (
            <div className="page-stack">
              <Card
                data-tour="zone-plants"
                title={
                  batch
                    ? `${displayLabel(batch.crop)}${batch.variety ? ` / ${batch.variety}` : ''}`
                    : 'Zone crops'
                }
                subtitle={batch ? `${batch.id} / ${s.cycle.id}` : undefined}
                tools={
                  batch ? (
                    <Button
                      permission="crop_review"
                      small
                      icon="edit"
                      disabled={closed}
                      onClick={() => open('batch-edit')}
                    >
                      Edit crop
                    </Button>
                  ) : undefined
                }
              >
                {batch ? (
                  <>
                    <div className="plant-population">
                      <div>
                        <span>Active population</span>
                        <strong>
                          {displayLabel(number(batch.currentPlants))}{' '}
                          <small>/ {displayLabel(number(zoneCapacity(z)))} capacity</small>
                        </strong>
                      </div>
                      <Badge tone="green">{displayLabel(batch.stage)}</Badge>
                    </div>
                    <Meta
                      items={[
                        { label: 'Planting start', value: dateLabel(batch.plantedOn) },
                        {
                          label: 'Days since planting',
                          value: `${Math.max(0, Math.floor((Date.parse(localDate(s.clock)) - Date.parse(batch.plantedOn)) / 86400000))} days`,
                        },
                        {
                          label: 'Target harvest',
                          value: batch.targetHarvestOn
                            ? dateLabel(batch.targetHarvestOn)
                            : 'Not set',
                        },
                        { label: 'Initial plants', value: `${number(batch.initialPlants)} plants` },
                        {
                          label: 'Seed / seedling source',
                          value: batch.seedSource || 'Not recorded',
                        },
                      ]}
                    />
                    {displayLabel(batch.notes && <p className="zone-notes">{batch.notes}</p>)}
                    <div className="button-row">
                      <Button
                        permission="cultivation"
                        icon="leaf"
                        disabled={closed}
                        onClick={() => open('count')}
                      >
                        Record population change
                      </Button>
                      <Button
                        permission="crop_review"
                        disabled={closed}
                        onClick={() => open('finish')}
                      >
                        Close batch
                      </Button>
                    </div>
                    <p className="micro muted">
                      Stages and targets are updated from user records. Harvesting does not
                      automatically reduce living plant counts.
                    </p>
                  </>
                ) : (
                  <Empty
                    icon="leaf"
                    title={inactive ? 'Zone inactive' : 'Start planting batch'}
                    detail={
                      inactive
                        ? 'Activate the zone to plant again.'
                        : zoneCapacity(z)
                          ? 'Record crop, variety, date, and initial plant count.'
                          : 'Set area and capacity in Edit zone, then record a planting batch.'
                    }
                    action={
                      <Button
                        permission="crop_review"
                        tone="primary"
                        disabled={inactive || closed || !zoneCapacity(z)}
                        onClick={() => open('batch-new')}
                      >
                        Record planting batch
                      </Button>
                    }
                  />
                )}
              </Card>
              <div className="zone-next-actions" aria-label={'Zone work'}>
                <button
                  disabled={closed || inactive || ctx.can?.('cultivation') === false}
                  onClick={() => setCropForm({ kind: 'task', zoneId: z.id })}
                >
                  <Icon name="calendar" />
                  <span>
                    <strong>Schedule care</strong>
                    <small>
                      {tasks.filter((t) => t.status === 'pending').length} incomplete tasks
                    </small>
                  </span>
                  <Icon name="chevron" />
                </button>
                <button
                  disabled={closed || inactive || !batch || ctx.can?.('cultivation') === false}
                  onClick={() => setCropForm({ kind: 'harvest', zoneId: z.id })}
                >
                  <Icon name="box" />
                  <span>
                    <strong>Record harvest</strong>
                    <small>
                      {displayLabel(
                        number(
                          lots.reduce((n, l) => n + l.grossKg, 0),
                          1,
                        ),
                      )}{' '}
                      kg from this zone
                    </small>
                  </span>
                  <Icon name="chevron" />
                </button>
                <button
                  onClick={() =>
                    ctx.nav(
                      `/biaya?tab=expenses&zone=${z.id}&period=${localDate(s.clock).slice(0, 7)}`,
                    )
                  }
                >
                  <Icon name="wallet" />
                  <span>
                    <strong>Zone costs</strong>
                    <small>Linked expenses and devices</small>
                  </span>
                  <Icon name="chevron" />
                </button>
              </div>
              {displayLabel(
                z.notes && (
                  <Card title={'Zone records'}>
                    <p>{z.notes}</p>
                  </Card>
                ),
              )}
              <details className="zone-lifecycle">
                <summary>Zone status settings</summary>
                <p>Deactivate unused zones. Zones with history are retained.</p>
                <div className="button-row">
                  <Button
                    permission="greenhouse_edit"
                    disabled={closed}
                    onClick={() => open('zone-status')}
                  >
                    {displayLabel(inactive ? 'Activate zone' : 'Deactivate zone')}
                  </Button>
                  <Button
                    permission="greenhouse_edit"
                    tone="danger"
                    disabled={closed}
                    onClick={() => open('zone-delete')}
                  >
                    Delete empty zone
                  </Button>
                </div>
              </details>
            </div>
          )}
          {panel === 'targets' && (
            <div data-tour="crop-targets">
              <CropTargets key={z.id} ctx={ctx} zoneId={z.id} />
            </div>
          )}
          {panel === 'devices' && (
            <Card
              title={'Zone devices'}
              subtitle={'Placement links monitoring, maintenance, and device costs.'}
              tools={
                <Button
                  permission="devices"
                  small
                  disabled={closed || inactive}
                  onClick={() => open('devices')}
                >
                  Manage placement
                </Button>
              }
            >
              {devices.length ? (
                devices.map((d) => (
                  <div key={d.id} className="zone-device-row">
                    <Icon name={d.type === 'camera' ? 'camera' : 'devices'} />
                    <span>
                      <strong>{displayLabel(d.label)}</strong>
                      <small>
                        {displayLabel(d.id)},{' '}
                        {displayLabel(
                          d.calibrated
                            ? 'Installation validated'
                            : 'Installation validation needed',
                        )}
                      </small>
                    </span>
                    <Badge tone={d.connection === 'online' ? 'green' : 'gray'}>
                      {displayLabel(d.connection)}
                    </Badge>
                    <Button
                      small
                      onClick={() => ctx.nav(`/perangkat?device=${d.id}&detailTab=condition`)}
                    >
                      Details
                    </Button>
                  </div>
                ))
              ) : (
                <Empty
                  icon="devices"
                  title={'No devices yet'}
                  detail={'Add devices or assign existing inventory.'}
                />
              )}
              <div className="button-row">
                <Button
                  permission="devices"
                  icon="plus"
                  disabled={closed || inactive}
                  onClick={() => ctx.open('device-create', z.id)}
                >
                  Add device
                </Button>
                <Button
                  permission="devices"
                  disabled={
                    closed ||
                    inactive ||
                    !devices.some((d) => d.type === 'camera') ||
                    !devices.some((d) => d.type === 'sensor')
                  }
                  onClick={() => ctx.open('validate-zone', z.id)}
                >
                  Validate installation
                </Button>
              </div>
              <p className="micro muted">
                Devices are local records. Placement does not create purchases, payments, or sensor
                readings.
              </p>
            </Card>
          )}
          {panel === 'activity' && (
            <div className="page-stack">
              <Card
                title={'Zone work'}
                tools={
                  <Button small onClick={() => ctx.nav(`/siklus?tab=care&zone=${z.id}`)}>
                    Open care tasks
                  </Button>
                }
              >
                <Meta
                  items={[
                    {
                      label: 'Pending care',
                      value: tasks.filter((t) => t.status === 'pending').length,
                    },
                    { label: 'Open pest cases', value: cases.length },
                    {
                      label: 'Zone produce stock',
                      value: `${number(
                        lots.reduce((n, l) => n + lotStock(p, l, 'A') + lotStock(p, l, 'B'), 0),
                        1,
                      )} kg`,
                    },
                  ]}
                />
                <div className="button-row">
                  <Button small onClick={() => ctx.nav(`/hama?tab=detection&reviewZone=${z.id}`)}>
                    Review monitoring
                  </Button>
                  <Button small onClick={() => ctx.nav(`/siklus?tab=harvest&zone=${z.id}`)}>
                    Harvests & sales
                  </Button>
                  <Button small onClick={() => ctx.nav('/biaya?tab=profit')}>
                    Greenhouse cycle profit
                  </Button>
                </div>
              </Card>
              <Card
                title={'Zone automation'}
                subtitle={'Saved schedules require a connected controller and scheduler to run.'}
                tools={
                  <Button
                    small
                    permission="automation"
                    disabled={closed || inactive}
                    onClick={() => ctx.nav(`/otomasi?tab=builder&zone=${z.id}`)}
                  >
                    Create zone routine
                  </Button>
                }
              >
                {routines.length ? (
                  routines.map((r) => (
                    <div className="zone-device-row" key={r.id}>
                      <Icon name="workflow" />
                      <span>
                        <strong>{displayLabel(r.name)}</strong>
                        <small>
                          {displayLabel(
                            r.status === 'Active'
                              ? 'Active'
                              : r.status === 'Paused'
                                ? 'Paused'
                                : r.status,
                          )}
                          , {r.version.steps.length} steps
                        </small>
                      </span>
                      <Button
                        small
                        onClick={() => ctx.nav(`/otomasi?tab=routines&routine=${r.id}`)}
                      >
                        Routine details
                      </Button>
                    </div>
                  ))
                ) : (
                  <Empty
                    title={'No zone routines yet'}
                    detail={
                      'Start with an inspection reminder. Irrigation and fertigation require suitable devices and profiles.'
                    }
                  />
                )}
              </Card>
              <Card
                title={'Population history'}
                subtitle={
                  'Additions, failures, and removals are recorded separately from harvests.'
                }
              >
                {state.movements.filter((m) =>
                  state.batches.some((b) => b.id === m.batchId && b.zoneId === z.id),
                ).length ? (
                  <div className="zone-history">
                    {state.movements
                      .filter((m) =>
                        state.batches.some((b) => b.id === m.batchId && b.zoneId === z.id),
                      )
                      .slice()
                      .reverse()
                      .map((m) => (
                        <article key={m.id}>
                          <strong>
                            {displayLabel(movementLabels[m.kind])}:{' '}
                            {displayLabel(number(m.quantity))}
                          </strong>
                          <p>{displayLabel(m.reason)}</p>
                          <small>
                            {displayLabel(dateLabel(m.at))}, {displayLabel(m.batchId)}. Remaining{' '}
                            {displayLabel(number(m.balance))} plants.
                          </small>
                        </article>
                      ))}
                  </div>
                ) : (
                  <Empty
                    title={'No population changes yet'}
                    detail={'The initial count is stored in planting batch details.'}
                  />
                )}
              </Card>
              <Card title={'Planting batch history'}>
                {state.batches.filter((b) => b.zoneId === z.id).length ? (
                  <div className="zone-history">
                    {state.batches
                      .filter((b) => b.zoneId === z.id)
                      .slice()
                      .reverse()
                      .map((b) => (
                        <article key={b.id}>
                          <div className="button-row">
                            <strong>
                              {displayLabel(b.crop)}
                              {displayLabel(b.variety ? ` / ${b.variety}` : '')}
                            </strong>
                            <Badge tone={b.status === 'active' ? 'green' : 'gray'}>
                              {displayLabel(b.status === 'active' ? 'Active' : 'Completed')}
                            </Badge>
                          </div>
                          <small>
                            {displayLabel(b.id)}, planted {displayLabel(dateLabel(b.plantedOn))},{' '}
                            {displayLabel(number(b.initialPlants))} initial plants
                            {displayLabel(b.closedOn ? `, completed ${dateLabel(b.closedOn)}` : '')}
                          </small>
                          {displayLabel(b.closingNotes && <p>{b.closingNotes}</p>)}
                        </article>
                      ))}
                  </div>
                ) : (
                  <Empty title={'No planting batch yet'} />
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
      {editor && (
        <ZoneForms
          key={`${editor}-${z.id}`}
          ctx={ctx}
          zone={z}
          editor={editor}
          onClose={close}
          onSave={save}
        />
      )}
      {cropForm && <CropForms ctx={ctx} spec={cropForm} onClose={() => setCropForm(null)} />}
    </div>
  );
}
