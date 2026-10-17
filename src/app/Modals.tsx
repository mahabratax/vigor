import { shiftMonth, validMonth } from '../domain/periods';
import { displayLabel } from '../i18n/display';
import React from 'react';
import { Alert, Button, Empty, Field, FormBox, Meta, Modal, SourceTag } from '../components/ui';
import type { Action, ActionResult, ExpenseInput } from '../domain/actions';
import { ALL_EXPENSE_CATEGORIES, OPERATING_CATEGORIES } from '../domain/costs';
import { clockTime, dateLabel, iso, localDate, localTime, scenarioLabels } from '../domain/format';
import { checkRoutineGuards, nextOccurrence, validateRoutine } from '../domain/scheduler';
import type { Device, ExpenseCategory, Scenario, ZoneId } from '../domain/types';
import { RoutineDetails } from '../features/automation/Automation';
import { ExpenseDetails, Planner } from '../features/costs/Costs';
import { DeviceDetails } from '../features/devices/Devices';
import { ZoneDetails } from '../features/greenhouse/Greenhouse';
import { EventDetails, Report } from '../features/history/History';
import { CaseDetails } from '../features/pests/Pests';
import type { ModalSpec, PageContext } from './context';
import { checked, numeric, value } from './context';
import { usePreferences } from '../store/usePreferences';
const requiredCheck = (text: string) => (
  <label className="checkbox">
    <input type="checkbox" required />
    {displayLabel(text)}
  </label>
);
export default function Modals({
  ctx,
  spec,
  onClose,
}: {
  ctx: PageContext;
  spec: ModalSpec;
  onClose: () => void;
}) {
  const { s } = ctx,
    { kind, id, extra } = spec;
  const preferences = usePreferences();
  const operatorOptions = (assigned?: string | null) =>
    [
      ...new Set(
        [
          assigned,
          ctx.actor ?? 'Budi Santoso',
          ...preferences.members
            .filter(
              (m) =>
                m.active &&
                m.role !== 'Viewer' &&
                m.greenhouseIds.some((id) => id === s.greenhouse.id),
            )
            .map((m) => m.name),
          'Sample technician',
        ].filter((name): name is string => Boolean(name)),
      ),
    ].map((name) => (
      <option key={name} value={name}>
        {displayLabel(name)}
      </option>
    ));
  let title = '',
    description = '',
    content: React.ReactNode = null,
    wide = false,
    drawer = false;
  const save = async (a: Action): Promise<ActionResult> => {
    const r = await ctx.act(a);
    if (r.ok) onClose();
    return r;
  };
  const foot = (label = 'Save') => (
    <div className="form-footer">
      <Button onClick={onClose}>Cancel</Button>
      <Button type="submit" tone="primary">
        {displayLabel(label)}
      </Button>
    </div>
  );
  const deviceOptions = (
    <>
      <option value="">Greenhouse / no linked device</option>
      {s.devices.map((d) => (
        <option key={d.id} value={d.id}>
          {displayLabel(d.id)}, {displayLabel(d.label)}
        </option>
      ))}
    </>
  );
  if (kind === 'case-detail') {
    title = id ?? 'Case details';
    drawer = true;
    content = <CaseDetails ctx={ctx} id={id ?? 'INS-024'} />;
  } else if (kind === 'zone-detail') {
    title = `Zone details ${id}`;
    drawer = true;
    content = <ZoneDetails ctx={ctx} id={id as ZoneId} />;
  } else if (kind === 'device-detail') {
    title = 'Device details';
    drawer = true;
    content = <DeviceDetails ctx={ctx} id={id ?? 'PUMP-01'} />;
  } else if (kind === 'expense-detail') {
    title = 'Expense details';
    drawer = true;
    content = <ExpenseDetails ctx={ctx} id={id ?? ''} deviceId={extra} />;
  } else if (kind === 'event') {
    title = 'Activity details';
    drawer = true;
    content = <EventDetails ctx={ctx} id={id ?? ''} />;
  } else if (kind === 'routine') {
    title = 'Routine details';
    drawer = true;
    content = <RoutineDetails ctx={ctx} id={id ?? 'RTN-001'} />;
  } else if (kind === 'planner') {
    title = 'Device plan';
    description = 'Planned purchases. These are not recorded expenses.';
    wide = true;
    content = <Planner ctx={ctx} onClose={onClose} />;
  } else if (kind === 'report') {
    title = 'Operations report';
    wide = true;
    content = <Report ctx={ctx} />;
  } else if (kind === 'inspection') {
    const c = s.cases.find((c) => c.id === id);
    title = `Record inspection, ${id}`;
    description = 'Plant inspections complement trap observations.';
    content = (
      <FormBox
        onSubmit={(f) =>
          save({
            type: 'inspection',
            inspection: {
              caseId: id!,
              at: value(f, 'at') + ':00+07:00',
              operator: value(f, 'operator'),
              examined: numeric(f, 'examined'),
              affected: numeric(f, 'affected'),
              outcome: value(f, 'outcome') as 'indication' | 'not_found' | 'inconclusive',
              notes: value(f, 'notes'),
              attachmentName: (f.get('attachment') as File)?.name || undefined,
            },
          })
        }
      >
        <Alert tone="blue">
          Zone {displayLabel(c?.zoneId)}, source {displayLabel(c?.sourceDeviceId)}. Saving an
          inspection does not automatically close the case.
        </Alert>
        <div className="form-grid">
          <Field label={'Operator'}>
            <select name="operator" defaultValue={c?.assignedTo ?? ctx.actor ?? 'Budi Santoso'}>
              {operatorOptions(c?.assignedTo)}
            </select>
          </Field>
          <Field label={'Inspection time (WIB)'}>
            <input
              name="at"
              type="datetime-local"
              defaultValue={localDate(s.clock) + 'T' + localTime(s.clock)}
              required
            />
          </Field>
          <Field label={'Plants inspected'}>
            <input
              name="examined"
              type="number"
              min="1"
              max={s.cycle.plants}
              defaultValue="12"
              required
            />
          </Field>
          <Field label={'Plants with symptoms'}>
            <input name="affected" type="number" min="0" defaultValue="2" required />
          </Field>
        </div>
        <Field label={'Inspection findings'}>
          <select name="outcome">
            <option value="indication">Signs found</option>
            <option value="not_found">Not found</option>
            <option value="inconclusive">Inconclusive</option>
          </select>
        </Field>
        <Field label={'Inspection notes'}>
          <textarea
            name="notes"
            rows={3}
            minLength={5}
            required
            placeholder={'Describe plant findings, location, and follow-up…'}
          />
        </Field>
        <Field
          label={'Local photo (optional)'}
          hint={
            'Only the attachment name is saved. File contents are not stored, uploaded, or analyzed.'
          }
        >
          <input type="file" accept="image/*" name="attachment" />
        </Field>
        {foot('Save inspection')}
      </FormBox>
    );
  } else if (kind === 'plan') {
    const c = s.cases.find((c) => c.id === id) ?? s.cases.find((c) => c.id === 'INS-024')!;
    title = 'Create control plan';
    content = (
      <FormBox
        onSubmit={async (f) => {
          const result = await ctx.act({
            type: 'plan',
            plan: {
              caseId: c.id,
              zoneId: c.zoneId,
              title: value(f, 'title'),
              operator: value(f, 'operator'),
              kind: value(f, 'kind') as 'manual' | 'simulator' | 'expert_review',
              notes: value(f, 'notes'),
              durationSeconds: numeric(f, 'duration'),
            },
          });
          if (result.ok) {
            onClose();
            ctx.nav(`/pengendalian?plan=${result.id}`);
          }
          return result;
        }}
      >
        <Alert tone="blue" title={`${c.id}, Zone ${c.zoneId}`}>
          Evidence, inspection findings, and the assigned operator are linked to the same case.
        </Alert>
        <Field label={'Plan title'}>
          <input name="title" defaultValue={`Follow up on findings in Zone ${c.zoneId}`} required />
        </Field>
        <Field label={'Action type'}>
          <select name="kind">
            <option value="manual">Manual nonchemical task</option>
            <option value="simulator">Virtual device test</option>
            <option value="expert_review">Plan requiring expert review</option>
          </select>
        </Field>
        <div className="form-grid">
          <Field label={'Assigned to'}>
            <select name="operator" defaultValue={c.assignedTo ?? ctx.actor ?? 'Budi Santoso'}>
              {operatorOptions(c.assignedTo)}
            </select>
          </Field>
          <Field label={'Simulation duration (seconds)'} hint={'Test module only; 10–300 seconds.'}>
            <input name="duration" type="number" min="10" max="300" defaultValue="90" required />
          </Field>
        </div>
        <Field label={'Reason and notes'}>
          <textarea
            name="notes"
            rows={3}
            required
            minLength={5}
            defaultValue="Review inspection findings and choose a nonchemical follow-up based on the evidence."
          />
        </Field>
        <Alert tone="gray">
          No pesticide dosing, mixing, or automatic spraying. The virtual test module does not
          demonstrate pest deterrence effectiveness.
        </Alert>
        {foot('Create plan for review')}
      </FormBox>
    );
  } else if (kind === 'approve-plan' || kind === 'start-plan') {
    const p = s.plans.find((p) => p.id === id);
    title = kind === 'approve-plan' ? 'Review and approve plan' : 'Start control simulation';
    content = p ? (
      <FormBox
        onSubmit={async () => {
          const r = await ctx.act({
            type: kind === 'approve-plan' ? 'approve_plan' : 'start_plan',
            id: p.id,
          });
          if (r.ok) {
            onClose();
            if (kind === 'start-plan') ctx.nav(`/otomasi?tab=executions&run=${r.id}`);
          }
          return r;
        }}
      >
        <Meta
          items={[
            { label: 'Plan / case', value: `${p.id} / ${p.caseId}` },
            { label: 'Zone', value: p.zoneId },
            {
              label: 'Devices',
              value:
                p.kind === 'simulator'
                  ? 'Virtual test module on CTRL-01'
                  : 'Operator task; no actuator',
            },
            { label: 'Simulation duration', value: `${p.durationSeconds} seconds` },
            {
              label: 'Estimated module energy',
              value: `${((5 * p.durationSeconds) / 3600 / 1000).toFixed(5)} kWh (assumed power: 5 W)`,
            },
            { label: 'Operator', value: p.operator },
          ]}
        />
        <Alert title={'No physical device control'}>
          Command sent, device acknowledgment, and execution completed are separate states.
        </Alert>
        {requiredCheck(
          'I have reviewed the evidence, zones, devices, assigned operator, and simulation limits.',
        )}
        {foot(kind === 'approve-plan' ? 'Approve plan' : 'Start simulation')}
      </FormBox>
    ) : (
      <Empty title={'Plan not found'} />
    );
  } else if (kind === 'evaluate') {
    const p = s.plans.find((p) => p.id === id);
    title = 'Schedule / record evaluation';
    content = p ? (
      <FormBox
        onSubmit={(f) =>
          save({
            type: 'evaluate_plan',
            id: p.id,
            date: value(f, 'date'),
            notes: value(f, 'notes'),
            close: checked(f, 'close'),
          })
        }
      >
        <Alert tone="blue">
          {displayLabel(p.id)}, {displayLabel(p.caseId)}. A completed action does not confirm pest
          removal. Before-and-after observations must cover equal intervals.
        </Alert>
        <Field label={'Evaluation date'}>
          <input
            name="date"
            type="date"
            defaultValue={p.evaluationAt?.slice(0, 10) ?? localDate(s.clock)}
            required
          />
        </Field>
        <Field label={'Notes / follow-up observations'}>
          <textarea
            name="notes"
            rows={4}
            minLength={10}
            required
            defaultValue={p.evaluationNotes ?? ''}
          />
        </Field>
        <label className="checkbox">
          <input name="close" type="checkbox" />
          The operator has reviewed the results and the case can be closed. Do not select this for a
          future review date.
        </label>
        {foot('Save evaluation')}
      </FormBox>
    ) : (
      <Empty title={'Plan not found'} />
    );
  } else if (kind === 'run-once' && s.readings) {
    title = 'Preview routine';
    content = (
      <>
        <Alert>
          Check current inputs and resource limits in the read-only preview. No controller is
          connected.
        </Alert>
        <Button
          onClick={() => {
            onClose();
            ctx.nav(`/otomasi?tab=preview&routine=${id ?? ''}`);
          }}
        >
          Open routine preview
        </Button>
      </>
    );
  } else if (['activate-routine', 'run-once', 'dry-run'].includes(kind)) {
    const r = s.routines.find((r) => r.id === id);
    title =
      kind === 'dry-run'
        ? 'Check saved inputs'
        : kind === 'run-once'
          ? 'Run once'
          : 'Review routine activation';
    if (r) {
      const errors = validateRoutine(s, r),
        guard = checkRoutineGuards(s, r),
        at = nextOccurrence(r, s.clock);
      content = (
        <FormBox
          onSubmit={() =>
            kind === 'dry-run'
              ? {
                  ok: false,
                  message:
                    'This check evaluates saved inputs only. It creates no execution or command. Close the dialog to return.',
                }
              : save({
                  type: kind === 'activate-routine' ? 'routine_activate' : 'run_once',
                  id: r.id,
                })
          }
        >
          <Meta
            items={[
              { label: 'Routine', value: `${displayLabel(r.name)}, v${r.version.number}` },
              { label: 'Zone', value: r.version.zones.join(', ') },
              { label: 'Required devices', value: r.version.requiredDevices.join(', ') },
              { label: 'Shared resource', value: r.version.resource ?? 'Independent' },
              {
                label: 'Next occurrence',
                value: at
                  ? dateLabel(at) + ' ' + clockTime(at) + ' WIB'
                  : 'Triggered by a condition / execution',
              },
              {
                label: 'Time limit',
                value: `${r.version.maxDuration} seconds; ${r.version.maxCyclesPerDay} cycles / day`,
              },
            ]}
          />
          {errors.length || guard ? (
            <Alert title={'Inspection findings'}>{displayLabel(errors.join(' ') || guard)}</Alert>
          ) : (
            <Alert tone="green" title={'Configuration and input checks passed'}>
              Conditions must still be checked before and during execution. This preview has sent no
              commands.
            </Alert>
          )}
          {kind === 'dry-run' ? (
            <>
              <SourceTag>Dry run: no commands or inventory changes</SourceTag>
              <Button onClick={onClose}>Close results</Button>
            </>
          ) : (
            <>
              {requiredCheck(
                'I have reviewed the zones, parameter version, devices, and simulation limits.',
              )}
              <Alert tone="gray">
                Manual runs share resource locks and cumulative limits with scheduled runs. An
                activated schedule does not need approval for every run.
              </Alert>
              {foot(kind === 'activate-routine' ? 'Activate this version' : 'Create manual run')}
            </>
          )}
        </FormBox>
      );
    } else content = <Empty title={'Routine not found'} />;
  } else if (kind === 'reconcile') {
    title = 'Review simulator state';
    content = (
      <FormBox onSubmit={(f) => save({ type: 'reconcile', id: id!, notes: value(f, 'notes') })}>
        <Alert tone="red" title={'Previous stop is unconfirmed'}>
          A timer ending or a tab closing does not confirm that a device has stopped. This records a
          manual simulator state check, not a physical inspection.
        </Alert>
        <Field label={'Review notes'}>
          <textarea
            name="notes"
            required
            minLength={8}
            rows={3}
            placeholder={'Describe the check and confirmed simulator state…'}
          />
        </Field>
        {requiredCheck(
          'I confirm the simulator state can be reset and its resource released without resuming the previous dose.',
        )}
        {foot('Confirm simulator review')}
      </FormBox>
    );
  } else if (kind === 'override') {
    title = 'Record temporary override';
    content = (
      <FormBox
        onSubmit={(f) =>
          save({
            type: 'override',
            id: id!,
            notes: value(f, 'notes'),
            minutes: numeric(f, 'minutes'),
          })
        }
      >
        <Alert tone="blue">
          Scope: one run at normal priority. This override cannot bypass required sensors, operating
          limits, or resource locks.
        </Alert>
        <Field label={'Reason'}>
          <textarea name="notes" minLength={10} required rows={3} />
        </Field>
        <Field label={'Valid for (minutes)'}>
          <input type="number" name="minutes" min="1" max="60" defaultValue="15" required />
        </Field>
        {foot('Record override')}
      </FormBox>
    );
  } else if (kind === 'nutrition-profile') {
    const p = s.nutrientProfiles.find((p) => p.id === id);
    title = 'Edit sample nutrient profile';
    content = p ? (
      <FormBox
        onSubmit={(f) => save({ type: 'profile_review', id: p.id, demoUnits: numeric(f, 'units') })}
      >
        <Alert title={'Simulation parameters, not a growing recipe'}>
          No field fertilizer formulation or dose is provided. Material changes require review of
          linked routines. Active runs retain their previous version.
        </Alert>
        <Meta
          items={[
            { label: 'Profile', value: p.name },
            { label: 'Current version', value: p.version },
            { label: 'Crop', value: p.crop },
            { label: 'Devices', value: p.deviceIds.join(', ') },
          ]}
        />
        <Field
          label={'Simulation units'}
          hint={'Abstract workflow units, not mL, grams, or fertilizer concentration.'}
        >
          <input
            type="number"
            name="units"
            min="0.1"
            max="10"
            step="0.1"
            defaultValue={p.demoUnits}
            required
          />
        </Field>
        {requiredCheck('I have reviewed these simulation parameter changes.')}
        {foot('Save profile version')}
      </FormBox>
    ) : (
      <Empty title={'Profile not found'} />
    );
  } else if (kind === 'validate-zone') {
    title = `Validate installation in Zone ${id}`;
    content = (
      <FormBox onSubmit={() => save({ type: 'validate_zone', id: id as ZoneId })}>
        <Alert tone="blue">
          Review installation, trap camera coverage, frame quality, and temperature/RH readings. An
          online device alone does not confirm complete coverage.
        </Alert>
        {requiredCheck(
          'Cameras and sensors are assigned to the correct zones, and their sample data is usable.',
        )}
        {foot('Validate zone')}
      </FormBox>
    );
  } else if (kind === 'maintenance') {
    const m = s.maintenance.find((m) => m.id === extra),
      device = id ?? m?.deviceId ?? 'PUMP-01';
    title = m ? 'Maintenance follow-up' : 'Record maintenance';
    description = 'Work completion and payment are recorded separately.';
    content = (
      <FormBox
        onSubmit={(f) =>
          save({
            type: 'maintenance',
            id: m?.id,
            deviceId: value(f, 'device'),
            title: value(f, 'title'),
            operator: value(f, 'operator'),
            date: value(f, 'date'),
            notes: value(f, 'notes'),
            completed: checked(f, 'completed'),
            amount: value(f, 'amount') ? numeric(f, 'amount') : null,
            paid: checked(f, 'paid'),
            submissionKey: `maintenance|${m?.id ?? id}|${s.clock}|${s.maintenance.length}`,
          })
        }
      >
        <div className="form-grid">
          <Field label={'Devices'}>
            <select name="device" defaultValue={device} required>
              {deviceOptions}
            </select>
          </Field>
          <Field label={'Work schedule'}>
            <input
              type="date"
              name="date"
              defaultValue={m?.dueAt.slice(0, 10) ?? localDate(s.clock)}
              required
            />
          </Field>
        </div>
        <Field label={'Task title'}>
          <input name="title" defaultValue={m?.title ?? 'Pump service / inspection'} required />
        </Field>
        <Field label={'Operator'}>
          <select name="operator" defaultValue={m?.operator ?? ctx.actor ?? 'Budi Santoso'}>
            {operatorOptions(m?.operator)}
          </select>
        </Field>
        <Field label={'Notes'}>
          <textarea name="notes" rows={3} defaultValue={m?.notes ?? ''} />
        </Field>
        <label className="checkbox">
          <input name="completed" type="checkbox" defaultChecked={m?.status === 'completed'} />
          The operator has completed the physical work.
        </label>
        <details open>
          <summary>Optional cost</summary>
          {m?.expenseId ? (
            <Alert tone="gray" title={`Linked payment: ${m.expenseId}`}>
              Edit the existing payment in Expenses. Do not record the same payment again.
            </Alert>
          ) : null}
          <Field
            label={'Amount (IDR)'}
            hint={'Leave empty if the amount is unknown or no cost applies.'}
          >
            <input
              type="number"
              name="amount"
              min="1"
              step="1"
              placeholder={'Example: 50000'}
              disabled={Boolean(m?.expenseId) || ctx.can?.('finance') === false}
            />
          </Field>
          <label className="checkbox">
            <input
              type="checkbox"
              name="paid"
              disabled={Boolean(m?.expenseId) || ctx.can?.('finance') === false}
            />
            Payment confirmed on the recorded date {displayLabel(dateLabel(s.clock))}.
          </label>
        </details>
        {ctx.can?.('finance') === false && (
          <p className="micro muted">Recording a payment requires Manager or Owner access.</p>
        )}
        <Alert tone="gray">
          A confirmed payment appears under the device and Costs in its payment period. A service
          paid in October does not change September's cash expenses.
        </Alert>
        {foot('Save maintenance record')}
      </FormBox>
    );
  } else if (kind === 'maintenance-mode' || kind === 'deactivate') {
    const d = s.devices.find((d) => d.id === id);
    title = kind === 'deactivate' ? 'Change asset status' : 'Maintenance mode';
    content = d ? (
      <FormBox
        onSubmit={(f) =>
          save(
            kind === 'deactivate'
              ? { type: 'deactivate_device', id: d.id }
              : {
                  type: 'maintenance_mode',
                  id: d.id,
                  value: !d.maintenance,
                  stopActive: checked(f, 'stop'),
                },
          )
        }
      >
        <p>
          <strong>
            {displayLabel(d.label)}, {displayLabel(d.id)}
          </strong>
        </p>
        <Alert title={'Check device usage'}>
          Maintenance mode blocks new runs. It does not silently stop active runs. Deactivation
          retains historical costs.
        </Alert>
        {kind === 'maintenance-mode' && !d.maintenance && (
          <label className="checkbox">
            <input name="stop" type="checkbox" />
            Explicitly request a stop for active runs using this device.
          </label>
        )}
        {foot(
          kind === 'deactivate'
            ? d.active
              ? 'Deactivate asset'
              : 'Activate asset'
            : d.maintenance
              ? 'End maintenance'
              : 'Start maintenance',
        )}
      </FormBox>
    ) : (
      <Empty title={'Device not found'} />
    );
  } else if (kind === 'device-create') {
    title = 'Add device';
    content = (
      <FormBox
        onSubmit={(f) => {
          const type = value(f, 'type') as Device['type'];
          const cap =
            type === 'camera'
              ? (['camera'] as const)
              : type === 'sensor'
                ? (['temperature', 'humidity'] as const)
                : (['gateway'] as const);
          return save({
            type: 'add_device',
            device: {
              id: value(f, 'id').toUpperCase().trim(),
              label: value(f, 'name'),
              type,
              zones: [value(f, 'zone') as ZoneId],
              capabilities: [...cap],
              connection: 'offline',
              maintenance: false,
              calibrated: false,
              watts: 0,
              lastSeen: iso(s.clock),
              nextMaintenance: localDate(s.clock),
              active: true,
            },
          });
        }}
      >
        <Alert tone="blue">
          New devices start offline and unvalidated. Registration does not create expenses or sensor
          readings.
        </Alert>
        <div className="form-grid">
          <Field label={'Unique ID'}>
            <input name="id" required placeholder="CAM-G-01" />
          </Field>
          <Field label={'Device name'}>
            <input name="name" required />
          </Field>
          <Field label={'Type'}>
            <select name="type">
              <option value="camera">Camera</option>
              <option value="sensor">Temperature/RH sensor</option>
              <option value="controller">Controller</option>
            </select>
          </Field>
          <Field label={'Zone'}>
            <select name="zone" defaultValue={id ?? s.zones[0].id}>
              {s.zones
                .filter((z) => z.status !== 'inactive')
                .map((z) => (
                  <option key={z.id} value={z.id}>
                    {displayLabel(z.name)}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        {foot('Add to inventory')}
      </FormBox>
    );
  } else if (kind === 'expense') {
    const e = s.expenses.find((e) => e.id === id),
      purchase = extra?.startsWith('purchase:');
    title = e ? 'Edit / confirm expense' : 'Record expense';
    description =
      'Confirm the amount before saving. This records a payment; it does not transfer money.';
    content = (
      <FormBox
        onSubmit={(f) => {
          let slices: ExpenseInput['usageSlices'];
          if (checked(f, 'split')) {
            slices = [
              { period: value(f, 'period1'), amount: numeric(f, 'slice1') },
              { period: value(f, 'period2'), amount: numeric(f, 'slice2') },
            ];
          }
          const record: ExpenseInput = {
            id: e?.id,
            paidAt: value(f, 'date'),
            category: value(f, 'category') as ExpenseCategory,
            amount: numeric(f, 'amount'),
            status: 'paid',
            note: value(f, 'note'),
            deviceId: value(f, 'device') || undefined,
            zoneId: (value(f, 'zone') as ZoneId) || undefined,
            reference: value(f, 'reference') || undefined,
            attachmentName: (f.get('attachment') as File)?.name || e?.attachmentName,
            maintenanceId: e?.maintenanceId,
            usageSlices: slices,
            submissionKey:
              e?.submissionKey ?? `expense|${s.clock}|${s.expenses.length}|${extra ?? ''}`,
          };
          return save({ type: 'expense', record, allowDuplicate: checked(f, 'duplicate') });
        }}
      >
        <div className="form-grid">
          <Field label={'Payment date'}>
            <input
              name="date"
              type="date"
              defaultValue={e?.paidAt ?? localDate(s.clock)}
              required
            />
          </Field>
          <Field label={'Category'}>
            <select
              name="category"
              defaultValue={e?.category ?? (purchase ? 'Investasi' : 'Perawatan')}
            >
              {ALL_EXPENSE_CATEGORIES.map((c) => (
                <option key={c}>{displayLabel(c)}</option>
              ))}
            </select>
          </Field>
          <Field label={'Amount in Rupiah'}>
            <input
              name="amount"
              type="number"
              min="1"
              step="1"
              required
              placeholder={
                purchase ? `Plan ${extra?.split(':')[1]} — confirm amount` : 'Payment amount'
              }
              defaultValue={e?.amount || undefined}
            />
          </Field>
          <Field label={'Linked device'}>
            <select name="device" defaultValue={e?.deviceId ?? (purchase ? '' : (extra ?? ''))}>
              {deviceOptions}
            </select>
          </Field>
        </div>
        <Field label={'Notes'}>
          <input
            name="note"
            defaultValue={e?.note ?? (purchase ? 'Additional device purchase' : '')}
            required
            placeholder={'Pump service, electricity bill, nutrient purchase…'}
          />
        </Field>
        <Field
          label={'Local receipt (optional)'}
          hint={
            'Only the attachment name is saved. An attachment does not automatically verify the payment amount.'
          }
        >
          <input name="attachment" type="file" accept="image/*,.pdf" />
        </Field>
        <details open={Boolean(e?.usageSlices)}>
          <summary>Allocation and usage period</summary>
          <div className="form-grid">
            <Field label={'Zone (optional)'}>
              <select name="zone" defaultValue={e?.zoneId ?? ctx.query.get('zone') ?? ''}>
                <option value="">Greenhouse / shared asset</option>
                {s.zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {displayLabel(z.name)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={'Bill reference'}>
              <input name="reference" defaultValue={e?.reference ?? ''} />
            </Field>
          </div>
          <label className="checkbox">
            <input type="checkbox" name="split" defaultChecked={Boolean(e?.usageSlices)} />
            Allocate operating costs across two months.
          </label>
          <div className="form-grid">
            <Field label={'Usage period 1'}>
              <input
                name="period1"
                type="month"
                defaultValue={e?.usageSlices?.[0]?.period ?? localDate(s.clock).slice(0, 7)}
              />
            </Field>
            <Field label={'Allocated amount 1 (IDR)'}>
              <input
                name="slice1"
                type="number"
                min="0"
                defaultValue={e?.usageSlices?.[0]?.amount ?? ''}
              />
            </Field>
            <Field label={'Usage period 2'}>
              <input
                name="period2"
                type="month"
                defaultValue={
                  e?.usageSlices?.[1]?.period ?? shiftMonth(localDate(s.clock).slice(0, 7), 1)
                }
              />
            </Field>
            <Field label={'Allocated amount 2 (IDR)'}>
              <input
                name="slice2"
                type="number"
                min="0"
                defaultValue={e?.usageSlices?.[1]?.amount ?? ''}
              />
            </Field>
          </div>
          <p className="micro muted">
            Allocated amounts must equal the payment. Cash flow records the full amount on the
            payment date.
          </p>
          <label className="checkbox">
            <input name="duplicate" type="checkbox" />I have checked for duplicates and confirmed
            this is a separate payment.
          </label>
        </details>
        {requiredCheck(
          'I have confirmed the payment details. This action only records the payment.',
        )}
        {foot(e ? 'Save changes' : 'Record expense')}
      </FormBox>
    );
  } else if (kind === 'void-expense') {
    title = 'Void expense';
    content = (
      <FormBox
        onSubmit={(f) => save({ type: 'void_expense', id: id!, reason: value(f, 'reason') })}
      >
        <Alert title={id}>
          The record is retained as Voided. Totals include active payments only. Voided records can
          be restored.
        </Alert>
        <Field label={'Reason for voiding'}>
          <textarea name="reason" required minLength={5} rows={3} />
        </Field>
        {foot('Void record')}
      </FormBox>
    );
  } else if (kind === 'baseline') {
    title = 'Cost baseline before automation';
    const b = s.baseline;
    content = (
      <FormBox
        onSubmit={(f) => {
          const categories: Partial<Record<ExpenseCategory, number>> = {};
          OPERATING_CATEGORIES.forEach((c) => {
            if (value(f, c) !== '') categories[c] = numeric(f, c);
          });
          return save({
            type: 'baseline',
            value: {
              id: 'BASE-001',
              version: (b?.version ?? 0) + 1,
              source: value(f, 'source') as 'assumption' | 'records',
              period: value(f, 'period'),
              days: numeric(f, 'days'),
              zones: s.zones.map((z) => z.id),
              area: s.greenhouse.plantedArea,
              crop: s.cycle.crop,
              phase: s.cycle.phase,
              categories,
              normalizedDaily: checked(f, 'normalized'),
              appliedOn: localDate(s.clock),
            },
          });
        }}
      >
        <Alert title={'Compare equivalent scopes'}>
          {s.zones.length} zones, {s.greenhouse.plantedArea} m² planted,{' '}
          {displayLabel(s.cycle.crop)}, {displayLabel(s.cycle.phase.toLowerCase())}. Leave unknown
          categories empty; do not use zero for missing data.
        </Alert>
        <div className="form-grid">
          <Field label={'Baseline source'}>
            <select name="source" defaultValue={b?.source ?? 'assumption'}>
              <option value="assumption">Manual assumption (unvalidated)</option>
              <option value="records">Pre-installation records reviewed by an operator</option>
            </select>
          </Field>
          <Field label={'Baseline period'}>
            <input
              name="period"
              type="month"
              defaultValue={b?.period ?? shiftMonth(localDate(s.clock).slice(0, 7), -1)}
              required
            />
          </Field>
          <Field label={'Operating days'}>
            <input
              name="days"
              type="number"
              min="1"
              max="31"
              defaultValue={b?.days ?? 30}
              required
            />
          </Field>
        </div>
        <div className="form-grid">
          {OPERATING_CATEGORIES.map((c) => (
            <Field key={c} label={`${c} (Rp)`}>
              <input
                name={c}
                type="number"
                min="0"
                defaultValue={b?.categories[c] ?? ''}
                placeholder={'Unknown'}
              />
            </Field>
          ))}
        </div>
        <label className="checkbox">
          <input name="normalized" type="checkbox" defaultChecked={b?.normalizedDaily} />
          Allow daily normalization for the current month. I have reviewed scope, crop phase, rates,
          and the assumption of linear daily costs.
        </label>
        <Alert tone="gray">
          This baseline is not field-validated. A change after automation does not prove that Vigor
          caused it.
        </Alert>
        {foot('Save baseline')}
      </FormBox>
    );
  } else if (kind === 'remove-baseline') {
    title = 'Delete sample baseline?';
    content = (
      <>
        <p>Expenses will remain saved. Savings will show “Not comparable yet” rather than 0%.</p>
        <div className="form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            permission="finance"
            tone="danger"
            onClick={() => save({ type: 'baseline', value: null })}
          >
            Delete baseline
          </Button>
        </div>
      </>
    );
  } else if (kind === 'budget') {
    title = 'Period budget';
    const period = id ?? ctx.query.get('period') ?? localDate(s.clock).slice(0, 7);
    content = (
      <FormBox
        onSubmit={(f) =>
          save({ type: 'budget', period: value(f, 'period'), amount: numeric(f, 'amount') })
        }
      >
        <Alert tone="blue">
          A budget is a planned spending limit, not a pre-automation baseline.
        </Alert>
        <Field label={'Period'}>
          <input
            name="period"
            type="month"
            defaultValue={validMonth(period) ? period : localDate(s.clock).slice(0, 7)}
            required
          />
        </Field>
        <Field label={'Operating budget (IDR)'}>
          <input
            type="number"
            name="amount"
            min="0"
            defaultValue={s.budgets.find((b) => b.period === period)?.amount ?? ''}
            required
          />
        </Field>
        {foot('Save budget')}
      </FormBox>
    );
  } else if (kind === 'scenario') {
    title = 'Simulation settings';
    content = (
      <div className="detail-stack">
        <Alert tone="blue" title={'Local simulator; no physical devices'}>
          The simulation starts on 13 October 2026 at 09:42 WIB. Its clock pauses when the tab is
          hidden and does not catch up on missed schedules.
        </Alert>
        <Field label={'Capability profile'}>
          <select
            value={s.profile}
            onChange={async (e: React.ChangeEvent<HTMLSelectElement>) =>
              await ctx.act({
                type: 'profile',
                value: e.currentTarget.value as 'automation' | 'monitoring',
              })
            }
          >
            <option value="automation">Automated operations — 25 devices</option>
            <option value="monitoring">Monitoring only — 12 devices</option>
          </select>
        </Field>
        <Field label={'Deterministic scenario'}>
          <select
            value={s.scenario}
            onChange={async (e: React.ChangeEvent<HTMLSelectElement>) =>
              await ctx.act({ type: 'scenario', value: e.currentTarget.value as Scenario })
            }
          >
            {Object.entries(scenarioLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {displayLabel(label)}
              </option>
            ))}
          </select>
        </Field>
        <p>
          Conditions can be changed before or during a simulated run. Starting still checks resource
          locks, sensor data, and cumulative limits.
        </p>
        <div className="button-row">
          <Button tone="primary" onClick={onClose}>
            Return to simulation
          </Button>
          <Button permission="automation" onClick={() => ctx.open('reset')}>
            Reset all sample records
          </Button>
        </div>
      </div>
    );
  } else if (kind === 'reset') {
    title = 'Reset all sample records?';
    content = (
      <>
        <Alert title={'Local changes will be deleted'}>
          Inspections, plans, expenses, routines, and history in the selected sample greenhouse will
          return to their initial state. Other greenhouses are retained. No physical devices are
          affected.
        </Alert>
        <div className="form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            permission="automation"
            tone="danger"
            icon="refresh"
            onClick={() => {
              save({ type: 'reset' });
              ctx.nav('/ringkasan');
            }}
          >
            Reset samples
          </Button>
        </div>
      </>
    );
  } else if (kind === 'stop-all') {
    title = 'Stop all active simulations';
    content = (
      <>
        <Alert tone="red">
          All active runs receive a stop request. Final command status depends on feedback. This is
          not a certified physical emergency stop.
        </Alert>
        <div className="form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button
            permission="run"
            tone="danger"
            icon="stop"
            onClick={() => save({ type: 'stop_all' })}
          >
            Request all runs to stop
          </Button>
        </div>
      </>
    );
  } else {
    title = 'Section unavailable';
    content = (
      <Empty
        title={'Close these details and open them from the relevant page'}
        detail={'This record or action is unavailable on the current page.'}
      />
    );
  }
  return (
    <Modal
      key={kind + '-' + id + '-' + extra}
      title={title}
      description={description}
      onClose={onClose}
      wide={wide}
      drawer={drawer}
    >
      {content}
    </Modal>
  );
}
