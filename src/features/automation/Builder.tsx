import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { PageContext } from '../../app/context';
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  FormError,
  Icon,
  Meta,
  SourceTag,
} from '../../components/ui';
import { irrigationSteps, makeVersion } from '../../data/fixtures';
import { clockTime, dateLabel, duration, localDate, iso } from '../../domain/format';
import { availableDevices, nextOccurrence, validateRoutine } from '../../domain/scheduler';
import type { AutomationRoutine, RoutineKind, Trigger } from '../../domain/types';
interface State {
  draft: AutomationRoutine;
  step: number;
  error: string;
  review: boolean;
}
const titles = [
  'Identitas',
  'Trigger',
  'Conditions',
  'Steps',
  'Operating limits',
  'Review & activate',
];
export class RoutineBuilder extends React.Component<
  {
    ctx: PageContext;
  },
  State
> {
  constructor(props: { ctx: PageContext }) {
    super(props);
    const existing = props.ctx.s.routines.find((r) => r.id === props.ctx.query.get('routine'));
    const requestedZone = props.ctx.s.zones.find(
      (z) => z.id === props.ctx.query.get('zone') && z.status !== 'inactive',
    );
    const initialZone =
      requestedZone ??
      props.ctx.s.zones.find((z) => z.status !== 'inactive') ??
      props.ctx.s.zones[0];
    const fallback: AutomationRoutine = {
      id: '',
      name: 'Plant inspection',
      kind: 'preventive',
      description: 'Inspection task for an operator.',
      status: 'Draft',
      policy: 'task',
      trigger: {
        type: 'schedule',
        schedule: {
          times: ['10:00'],
          weekdays: [0, 1, 2, 3, 4, 5, 6],
          validFrom: localDate(props.ctx.s.clock),
          timeZone: 'Asia/Jakarta',
        },
      },
      version: {
        ...makeVersion(
          'new',
          [initialZone.id],
          [
            {
              id: 'manual',
              label: 'Inspect plant condition',
              action: 'task',
              duration: 0,
              deviceIds: [],
            },
          ],
          [],
          null,
        ),
        createdAt: iso(props.ctx.s.clock),
        reviewed: false,
        maxWaterPerDay: 0,
        maxNutritionPerDay: 0,
        flowLpm: 0,
        nutrientUnits: 0,
      },
      skippedSlots: [],
    };
    const draft = structuredClone(
      existing ?? (requestedZone ? fallback : (props.ctx.s.routines[0] ?? fallback)),
    );
    if (!existing) {
      draft.id = '';
      draft.name = requestedZone
        ? `Inspection ${displayLabel(requestedZone.name)}`
        : props.ctx.s.routines.length
          ? 'New scheduled irrigation'
          : fallback.name;
      draft.status = 'Draft';
      draft.version.reviewed = false;
    }
    this.state = { draft, step: 0, error: '', review: false };
  }
  update(patch: Partial<AutomationRoutine>) {
    this.setState({ draft: { ...this.state.draft, ...patch }, review: false, error: '' });
  }
  version(patch: Partial<AutomationRoutine['version']>) {
    this.update({ version: { ...this.state.draft.version, ...patch } });
  }
  changeTemplate(kind: RoutineKind) {
    const source = this.props.ctx.s.routines.find((r) => r.kind === kind);
    if (!source) return;
    const template = structuredClone(source);
    template.id = this.state.draft.id;
    template.name = source.name;
    template.status = 'Draft';
    template.version.reviewed = false;
    this.setState({ draft: template, error: '', review: false });
  }
  changeTrigger(type: Trigger['type']) {
    const r = this.state.draft;
    if (type === 'schedule')
      this.update({
        trigger: {
          type,
          schedule: {
            times: ['10:00'],
            weekdays: [0, 1, 2, 3, 4, 5, 6],
            validFrom: '2026-10-13',
            timeZone: 'Asia/Jakarta',
          },
        },
      });
    else if (type === 'sensor') {
      const deviceId = r.kind === 'environment' ? 'TH-A-01' : 'MEDIA-A';
      this.update({
        trigger: {
          type,
          deviceId,
          direction: r.kind === 'environment' ? 'above' : 'below',
          start: r.kind === 'environment' ? 29 : 30,
          recover: r.kind === 'environment' ? 28 : 45,
          debounceSeconds: 60,
          windowStart: '08:00',
          windowEnd: '17:00',
        },
        version: {
          ...r.version,
          requiredDevices: Array.from(new Set([...r.version.requiredDevices, deviceId])),
        },
      });
    } else
      this.update({
        trigger: {
          type,
          routineId: this.props.ctx.s.routines.find((x) => x.id !== r.id)?.id ?? 'RTN-001',
        },
      });
  }
  async save(activate: boolean) {
    const result = await this.props.ctx.act({
      type: 'routine_save',
      routine: this.state.draft,
      activate,
    });
    if (result.ok) this.props.ctx.nav(`/otomasi?tab=routines&routine=${result.id}`);
    else this.setState({ error: result.message });
  }
  render() {
    const { ctx } = this.props,
      { s } = ctx,
      { draft: r, step, error } = this.state,
      v = r.version,
      t = r.trigger,
      next = nextOccurrence(r, s.clock),
      devices = availableDevices(s),
      errors = validateRoutine(s, r);
    return (
      <div className="page-stack builder-page">
        <div className="builder-heading">
          <Button small icon="back" onClick={() => ctx.nav('/otomasi?tab=routines')}>
            Back
          </Button>
          <div>
            <h2>{displayLabel(r.id ? 'Edit routine' : 'Create routine')}</h2>
            <p>Configure once; scheduled execution must follow operating limits.</p>
          </div>
          <SourceTag>
            {displayLabel(r.id ? `${r.id}, new version after saving` : 'New draft')}
          </SourceTag>
        </div>
        <div className="builder-rail card">
          {titles.map((title, i) => (
            <button
              key={title}
              className={i === step ? 'active' : i < step ? 'done' : ''}
              onClick={() => this.setState({ step: i, error: '' })}
            >
              <span>{i < step ? <Icon name="check" size={14} /> : i + 1}</span>
              <div>
                {displayLabel(title)}
                <small>
                  {displayLabel(
                    [
                      'Name, type, zones',
                      'Time / condition',
                      'Devices & data',
                      'Step sequence',
                      'Limits & response',
                      'Review version',
                    ][i],
                  )}
                </small>
              </div>
            </button>
          ))}
        </div>
        <FormError message={error} />
        <div className="builder-layout">
          <Card title={titles[step]} subtitle={`Steps ${step + 1} of 6`}>
            {step === 0 && (
              <div className="form-stack">
                <Field label={'Routine name'}>
                  <input
                    value={r.name}
                    onInput={(e: React.FormEvent<HTMLInputElement>) =>
                      this.update({ name: e.currentTarget.value })
                    }
                  />
                </Field>
                <div className="form-grid">
                  <Field label={'Routine template'}>
                    <select
                      value={r.kind}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        this.changeTemplate(e.currentTarget.value as RoutineKind)
                      }
                    >
                      <option
                        value="irrigation"
                        disabled={!s.routines.some((r) => r.kind === 'irrigation')}
                      >
                        Scheduled irrigation
                      </option>
                      <option
                        value="fertigation"
                        disabled={!s.routines.some((r) => r.kind === 'fertigation')}
                      >
                        Nutrient delivery / fertigation
                      </option>
                      <option
                        value="environment"
                        disabled={!s.routines.some((r) => r.kind === 'environment')}
                      >
                        Environment control
                      </option>
                      <option value="preventive">Preventive operator inspection</option>
                      <option value="pest" disabled={!s.routines.some((r) => r.kind === 'pest')}>
                        Preventive test module
                      </option>
                    </select>
                  </Field>
                  <Field label={'Crop cycle'}>
                    <input readOnly value={`${s.cycle.id}, ${displayLabel(s.cycle.crop)}`} />
                  </Field>
                </div>
                <Field
                  label={'Target zone'}
                  hint={'Actuation options depend on registered devices.'}
                >
                  <div className="zone-checkboxes">
                    {s.zones.map((z) => {
                      const disabled =
                        z.status === 'inactive' ||
                        (r.kind === 'irrigation' && !['A', 'B'].includes(z.id)) ||
                        (r.kind === 'fertigation' && z.id !== 'A') ||
                        (r.kind === 'environment' && !['A', 'B'].includes(z.id));
                      return (
                        <label key={z.id} className={disabled ? 'disabled' : ''}>
                          <input
                            type="checkbox"
                            checked={v.zones.includes(z.id)}
                            disabled={disabled}
                            onChange={() => {
                              const zones = v.zones.includes(z.id)
                                ? v.zones.filter((x) => x !== z.id)
                                : [...v.zones, z.id];
                              this.version({
                                zones,
                                ...(r.kind === 'irrigation'
                                  ? {
                                      steps: irrigationSteps(zones),
                                      requiredDevices: [
                                        'CTRL-01',
                                        'PUMP-01',
                                        'LEVEL-01',
                                        'FLOW-01',
                                        ...zones.flatMap((z) => [`VALVE-${z}`, `MEDIA-${z}`]),
                                      ],
                                    }
                                  : {}),
                              });
                            }}
                          />
                          <span>
                            Zone {displayLabel(z.id)}
                            <small>
                              {displayLabel(disabled ? 'Actuator unavailable' : `${z.area} m²`)}
                            </small>
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </Field>
                <Field label={'Execution policy'}>
                  <select
                    value={r.policy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      this.update({ policy: e.currentTarget.value as AutomationRoutine['policy'] })
                    }
                  >
                    <option value="automatic">Automatic after configuration is activated</option>
                    <option value="approval">Request approval per occurrence</option>
                    <option value="task">Create operator task</option>
                  </select>
                </Field>
                <Alert tone="blue">
                  Configured irrigation and fertigation do not need approval for each run. Human
                  tasks are never marked completed automatically.
                </Alert>
              </div>
            )}
            {step === 1 && (
              <div className="form-stack">
                <Field label={'Trigger type'}>
                  <select
                    value={t.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      this.changeTrigger(e.currentTarget.value as Trigger['type'])
                    }
                  >
                    <option value="schedule">Daily / weekly schedule</option>
                    <option value="sensor" disabled={!devices.some((d) => d.type === 'sensor')}>
                      Sensor condition
                    </option>
                    <option
                      value="after_run"
                      disabled={!s.routines.some((other) => other.id !== r.id)}
                    >
                      After another run completes
                    </option>
                  </select>
                </Field>
                {t.type === 'schedule' && (
                  <>
                    <div className="form-grid">
                      <Field
                        label={'Scheduled times (WIB)'}
                        hint={'Separate times with commas. Example: 10:00, 15:00'}
                      >
                        <input
                          value={t.schedule.times.join(', ')}
                          onInput={(e: React.FormEvent<HTMLInputElement>) =>
                            this.update({
                              trigger: {
                                ...t,
                                schedule: {
                                  ...t.schedule,
                                  times: e.currentTarget.value.split(',').map((x) => x.trim()),
                                },
                              },
                            })
                          }
                        />
                      </Field>
                      <Field label={'Valid from'}>
                        <input
                          type="date"
                          value={t.schedule.validFrom}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            this.update({
                              trigger: {
                                ...t,
                                schedule: { ...t.schedule, validFrom: e.currentTarget.value },
                              },
                            })
                          }
                        />
                      </Field>
                    </div>
                    <Field label={'Active days'}>
                      <div className="weekdays">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                          <button
                            key={day}
                            className={t.schedule.weekdays.includes(i) ? 'active' : ''}
                            onClick={() =>
                              this.update({
                                trigger: {
                                  ...t,
                                  schedule: {
                                    ...t.schedule,
                                    weekdays: t.schedule.weekdays.includes(i)
                                      ? t.schedule.weekdays.filter((x) => x !== i)
                                      : [...t.schedule.weekdays, i],
                                  },
                                },
                              })
                            }
                          >
                            {displayLabel(day)}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <Alert tone="blue">
                      Schedules use Asia/Jakarta, regardless of the browser's local time zone.
                    </Alert>
                  </>
                )}
                {t.type === 'sensor' && (
                  <>
                    <Field label={'Trigger sensor'}>
                      <select
                        value={t.deviceId}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          this.update({
                            trigger: { ...t, deviceId: e.currentTarget.value },
                            version: {
                              ...v,
                              requiredDevices: Array.from(
                                new Set([...v.requiredDevices, e.currentTarget.value]),
                              ),
                            },
                          })
                        }
                      >
                        {devices
                          .filter((d) =>
                            r.kind === 'environment'
                              ? d.capabilities.includes('temperature')
                              : d.capabilities.includes('media'),
                          )
                          .map((d) => (
                            <option key={d.id} value={d.id}>
                              {displayLabel(d.label)}, {displayLabel(d.id)}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <div className="form-grid">
                      <Field label={'Start below / above'}>
                        <input
                          type="number"
                          value={t.start}
                          onInput={(e: React.FormEvent<HTMLInputElement>) =>
                            this.update({ trigger: { ...t, start: Number(e.currentTarget.value) } })
                          }
                        />
                      </Field>
                      <Field label={'Recovery threshold (hysteresis)'}>
                        <input
                          type="number"
                          value={t.recover}
                          onInput={(e: React.FormEvent<HTMLInputElement>) =>
                            this.update({
                              trigger: { ...t, recover: Number(e.currentTarget.value) },
                            })
                          }
                        />
                      </Field>
                      <Field label={'Debounce (seconds)'}>
                        <input
                          type="number"
                          min="1"
                          value={t.debounceSeconds}
                          onInput={(e: React.FormEvent<HTMLInputElement>) =>
                            this.update({
                              trigger: { ...t, debounceSeconds: Number(e.currentTarget.value) },
                            })
                          }
                        />
                      </Field>
                      <Field label={'Window start'}>
                        <input
                          type="time"
                          value={t.windowStart}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            this.update({ trigger: { ...t, windowStart: e.currentTarget.value } })
                          }
                        />
                      </Field>
                      <Field label={'Window end'}>
                        <input
                          type="time"
                          value={t.windowEnd}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            this.update({ trigger: { ...t, windowEnd: e.currentTarget.value } })
                          }
                        />
                      </Field>
                    </div>
                    <Alert title={'Sensor units must be explicit'}>
                      Media moisture uses a relative sample index, not a universal water-content
                      percentage. Air humidity is not used as root-zone water demand.
                    </Alert>
                  </>
                )}
                {t.type === 'after_run' && (
                  <Field label={'Source routine'}>
                    <select
                      value={t.routineId}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        this.update({ trigger: { ...t, routineId: e.currentTarget.value } })
                      }
                    >
                      {s.routines
                        .filter((x) => x.id !== r.id)
                        .map((x) => (
                          <option key={x.id} value={x.id}>
                            {displayLabel(x.name)}
                          </option>
                        ))}
                    </select>
                  </Field>
                )}
              </div>
            )}
            {step === 2 && (
              <div className="page-stack">
                <Alert tone="green" title={'Check before and during execution'}>
                  Required readings must be online, fresh, and calibrated. No sensor fallback is
                  assumed.
                </Alert>
                <div className="guard-grid">
                  {v.requiredDevices.map((id) => {
                    const d = devices.find((d) => d.id === id),
                      ok = d?.connection === 'online' && d.calibrated && !d.maintenance;
                    return (
                      <div className="guard-card" key={id}>
                        <Icon name={ok ? 'checkcircle' : 'alert'} size={21} />
                        <div>
                          <strong>{displayLabel(id)}</strong>
                          <small>{displayLabel(d?.label ?? 'Not installed')}</small>
                        </div>
                        <Badge tone={ok ? 'green' : 'amber'}>
                          {displayLabel(ok ? 'Siap' : 'Cannot evaluate')}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <label className="check-row">
                  <input type="checkbox" checked readOnly /> Hold if reservoir level is
                  insufficient.
                </label>
                <label className="check-row">
                  <input type="checkbox" checked readOnly /> Do not use devices under maintenance.
                </label>
                <label className="check-row">
                  <input type="checkbox" checked readOnly /> Enforce shared resource locks and
                  cumulative limits.
                </label>
              </div>
            )}
            {step === 3 && (
              <div className="page-stack">
                <p className="muted">This sequence is saved as a snapshot when a run starts.</p>
                <div className="builder-step-list">
                  {v.steps.map((item, i) => (
                    <div key={item.id}>
                      <span className="step-index">{i + 1}</span>
                      <span className="soft-icon">
                        <Icon
                          name={
                            item.action === 'dose'
                              ? 'flask'
                              : item.action === 'water'
                                ? 'drop'
                                : item.action === 'stop'
                                  ? 'stop'
                                  : 'checkcircle'
                          }
                        />
                      </span>
                      <div className="grow">
                        <strong>{displayLabel(item.label)}</strong>
                        <small>{displayLabel(item.deviceIds.join(', ') || 'Local check')}</small>
                      </div>
                      <label>
                        <input
                          type="number"
                          min="0"
                          max="900"
                          value={item.duration}
                          aria-label={`Durasi ${displayLabel(item.label)}`}
                          onInput={(e: React.FormEvent<HTMLInputElement>) =>
                            this.version({
                              steps: v.steps.map((x) =>
                                x.id === item.id
                                  ? { ...x, duration: Number(e.currentTarget.value) }
                                  : x,
                              ),
                            })
                          }
                        />
                        <small>seconds</small>
                      </label>
                    </div>
                  ))}
                </div>
                <Button
                  small
                  icon="plus"
                  onClick={() =>
                    this.version({
                      steps: [
                        ...v.steps,
                        {
                          id: `wait-${v.steps.length}`,
                          label: 'Wait while checking limits',
                          action: 'check',
                          duration: 10,
                          deviceIds: [],
                        },
                      ],
                    })
                  }
                >
                  Add waiting step
                </Button>
                {r.kind === 'fertigation' && (
                  <Alert title={'No automatic fertilizer formulation'}>
                    Nutrients follow a reviewed sample profile. Dosing starts only after flow is
                    confirmed.
                  </Alert>
                )}
              </div>
            )}
            {step === 4 && (
              <div className="form-stack">
                <div className="form-grid">
                  {[
                    { key: 'maxDuration', label: 'Maximum run duration (seconds)' },
                    { key: 'maxCyclesPerDay', label: 'Maximum cycles per day' },
                    { key: 'cooldownSeconds', label: 'Interval between cycles (seconds)' },
                    { key: 'queueTimeout', label: 'Maximum queue time (seconds)' },
                    { key: 'maxWaterPerDay', label: 'Daily resource water limit (L)' },
                    { key: 'maxNutritionPerDay', label: 'Daily nutrient limit (simulation units)' },
                  ].map((field) => (
                    <Field key={field.key} label={field.label}>
                      <input
                        type="number"
                        min="0"
                        value={v[field.key as keyof typeof v] as number}
                        onInput={(e: React.FormEvent<HTMLInputElement>) =>
                          this.version({ [field.key]: Number(e.currentTarget.value) })
                        }
                      />
                    </Field>
                  ))}
                </div>
                <Alert title={'Response to changing conditions'}>
                  Faults request a stop according to the profile. If stop is unconfirmed, the
                  resource stays locked until an operator reviews its state.
                </Alert>
                <Meta
                  items={[
                    {
                      label: 'Priority',
                      value: 'Stop / operating limit, active run, then FIFO queue.',
                    },
                    {
                      label: 'Manual run',
                      value: 'The same limits and locks apply; active runs are not interrupted.',
                    },
                    {
                      label: 'Missed schedules',
                      value: 'Skipped. Missed runs are not replayed in a batch.',
                    },
                  ]}
                />
              </div>
            )}
            {step === 5 && (
              <div className="page-stack">
                <div className="review-heading">
                  <span className="big-soft-icon">
                    <Icon name="shield" size={31} />
                  </span>
                  <div>
                    <h2>{displayLabel(r.name)}</h2>
                    <p>Review applies to the version being saved.</p>
                  </div>
                </div>
                <Meta
                  items={[
                    { label: 'Zone', value: v.zones.map((z) => 'Zone ' + z).join(', ') },
                    {
                      label: 'Next trigger',
                      value: next
                        ? `${dateLabel(next)}, ${clockTime(next)} WIB`
                        : 'Sensor condition / run completion',
                    },
                    {
                      label: 'Sequence',
                      value: `${v.steps.length} steps, ${duration(v.steps.reduce((a, x) => a + x.duration, 0))} minutes`,
                    },
                    {
                      label: 'Policy',
                      value:
                        r.policy === 'automatic'
                          ? 'Automatic'
                          : r.policy === 'task'
                            ? 'Create task'
                            : 'Request approval per occurrence',
                    },
                    { label: 'Resource', value: v.resource ?? 'Operator task' },
                  ]}
                />
                {errors.length ? (
                  <Alert tone="red" title={'Configuration needs changes'}>
                    {errors.map((e) => (
                      <p key={e}>{displayLabel(e)}</p>
                    ))}
                  </Alert>
                ) : (
                  <Alert tone="green" title={'Structure checks passed'}>
                    Device feedback and cumulative limits must still be checked during execution.
                  </Alert>
                )}
                <label className="check-row review-check">
                  <input
                    type="checkbox"
                    checked={this.state.review}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      this.setState({ review: e.currentTarget.checked })
                    }
                  />
                  <span>
                    I have reviewed the schedule, zones, devices, sample parameters, and operating
                    limits. No physical devices are controlled.
                  </span>
                </label>
              </div>
            )}
          </Card>
          <div className="page-stack">
            <Card title={'Routine summary'} icon="file">
              <Meta
                items={[
                  { label: 'Name', value: r.name },
                  { label: 'Zone', value: v.zones.join(', ') || 'Not selected' },
                  { label: 'Steps', value: `${v.steps.length} steps` },
                  {
                    label: 'Target duration',
                    value: duration(v.steps.reduce((a, x) => a + x.duration, 0)),
                  },
                  { label: 'Maximum limit', value: duration(v.maxDuration) },
                ]}
              />
              <SourceTag>Simulation parameters</SourceTag>
            </Card>
            <Card title={'Next schedule'} icon="calendar">
              <h3>{displayLabel(next ? clockTime(next) + ' WIB' : 'Trigger-based')}</h3>
              <p>
                {displayLabel(
                  next ? dateLabel(next) : 'Evaluated against a single simulation clock.',
                )}
              </p>
            </Card>
            <Alert tone="blue">
              Material changes create a new version. Active runs retain their previous snapshot.
            </Alert>
          </div>
        </div>
        <div className="builder-footer card">
          <Button
            icon="back"
            disabled={step === 0}
            onClick={() => this.setState({ step: Math.max(0, step - 1) })}
          >
            Previous
          </Button>
          <span className="grow" />
          <Button onClick={() => this.save(false)}>Save draft</Button>
          {step < 5 ? (
            <Button tone="primary" onClick={() => this.setState({ step: step + 1, error: '' })}>
              Next <Icon name="arrow" size={15} />
            </Button>
          ) : (
            <Button
              tone="primary"
              icon="check"
              disabled={!this.state.review || errors.length > 0}
              onClick={() => this.save(true)}
            >
              Save & activate
            </Button>
          )}
        </div>
      </div>
    );
  }
}
