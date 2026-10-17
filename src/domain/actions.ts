import { createFixture, makeVersion } from '../data/fixtures';
import type { GrowingAction } from './growingTypes';
import { applyAssistantTask, type AssistantTaskAction } from './assistantActions';
import type { SupplyAction } from './supplyTypes';
import { applyTarget } from './cropTargets';
import { applyOutcome } from './outcomes';
import { applySupply } from './supplies';
import { applyResource, type ResourceAction } from './efficiency';
import { validEnergy, type EnergyConfig } from './energy';
import { applyProduction } from './production';
import type { ProductionAction } from './productionTypes';
import type { ZoneAction } from './zoneTypes';
import { applyZoneAction } from './zones';
import { applyDetectionSample, evaluateDetections, type DetectionSample } from './detection';
import { possibleDuplicate, validateExpense } from './costs';
import { activity, isActiveRun, iso, localDate, localTime, nextId } from './format';
import {
  advanceInPlace,
  createRun,
  nextEventTime,
  nextOccurrence,
  reconcile,
  requestStop,
  setScenario,
  validateRoutine,
} from './scheduler';
import type {
  AutomationRoutine,
  ControlPlan,
  Device,
  DomainState,
  ExpenseRecord,
  Inspection,
  SavingsBaseline,
  Scenario,
  ZoneId,
} from './types';
export type ExpenseInput = Omit<ExpenseRecord, 'id' | 'createdAt' | 'source' | 'greenhouseId'> & {
  id?: string;
};
export type Action =
  | AssistantTaskAction
  | GrowingAction
  | SupplyAction
  | ResourceAction
  | { type: 'energy_save'; config: EnergyConfig }
  | ZoneAction
  | ProductionAction
  | { type: 'evaluate_detection'; zoneId?: ZoneId }
  | { type: 'detection_sample'; zoneId: ZoneId; sample: DetectionSample }
  | {
      type: 'tick';
      seconds: number;
    }
  | {
      type: 'next';
    }
  | {
      type: 'play';
      value: boolean;
    }
  | {
      type: 'speed';
      value: 1 | 10 | 60;
    }
  | {
      type: 'scenario';
      value: Scenario;
    }
  | {
      type: 'profile';
      value: 'automation' | 'monitoring';
    }
  | {
      type: 'reset';
    }
  | {
      type: 'clear_notice';
    }
  | {
      type: 'assign';
      caseId: string;
      operator: string;
    }
  | {
      type: 'inspection';
      inspection: Omit<Inspection, 'id'>;
    }
  | {
      type: 'plan';
      plan: Omit<ControlPlan, 'id' | 'createdAt' | 'tasks' | 'status'>;
    }
  | {
      type: 'approve_plan';
      id: string;
    }
  | {
      type: 'start_plan';
      id: string;
    }
  | {
      type: 'plan_task';
      id: string;
      taskId: string;
    }
  | {
      type: 'evaluate_plan';
      id: string;
      date: string;
      notes: string;
      close: boolean;
    }
  | {
      type: 'routine_toggle';
      id: string;
    }
  | {
      type: 'routine_activate';
      id: string;
    }
  | {
      type: 'routine_save';
      routine: AutomationRoutine;
      activate: boolean;
    }
  | {
      type: 'run_once';
      id: string;
    }
  | {
      type: 'skip_once';
      id: string;
    }
  | {
      type: 'approve_run';
      id: string;
    }
  | {
      type: 'stop';
      id: string;
    }
  | {
      type: 'stop_all';
    }
  | {
      type: 'reconcile';
      id: string;
      notes: string;
    }
  | {
      type: 'profile_review';
      id: string;
      demoUnits: number;
    }
  | {
      type: 'override';
      id: string;
      notes: string;
      minutes: number;
    }
  | {
      type: 'heal';
      id: string;
    }
  | {
      type: 'maintenance_mode';
      id: string;
      value: boolean;
      stopActive?: boolean;
    }
  | {
      type: 'deactivate_device';
      id: string;
    }
  | {
      type: 'validate_zone';
      id: ZoneId;
    }
  | {
      type: 'maintenance';
      id?: string;
      deviceId: string;
      title: string;
      operator: string;
      date: string;
      notes: string;
      completed: boolean;
      amount: number | null;
      paid: boolean;
      submissionKey: string;
    }
  | {
      type: 'maintenance_complete';
      id: string;
    }
  | {
      type: 'add_device';
      device: Device;
    }
  | {
      type: 'expense';
      record: ExpenseInput;
      allowDuplicate?: boolean;
    }
  | {
      type: 'void_expense';
      id: string;
      reason: string;
    }
  | {
      type: 'undo_void';
      id: string;
    }
  | {
      type: 'baseline';
      value: SavingsBaseline | null;
    }
  | {
      type: 'budget';
      period: string;
      amount: number;
    }
  | {
      type: 'planner';
      zones: number;
      ownedController: boolean;
    }
  | {
      type: 'recurring_drafts';
    };
export interface ActionResult {
  ok: boolean;
  message: string;
  id?: string;
}
export function applyAction(s: DomainState, a: Action): ActionResult {
  if (a.type === 'assistant_task') return applyAssistantTask(s, a);
  if (a.type === 'target_save' || a.type === 'target_activate') return applyTarget(s, a);
  if (a.type === 'outcome_capture' || a.type === 'outcome_review') return applyOutcome(s, a);
  if (a.type.startsWith('supply_')) return applySupply(s, a as SupplyAction);
  if (a.type.startsWith('resource_')) return applyResource(s, a as ResourceAction);
  if (
    [
      'zone_save',
      'zone_status',
      'zone_delete',
      'zone_devices',
      'planting_save',
      'planting_count',
      'planting_close',
    ].includes(a.type)
  )
    return applyZoneAction(s, a as ZoneAction);
  if (a.type.startsWith('crop_')) return applyProduction(s, a as ProductionAction);
  if (
    s.production?.stage === 'closed' &&
    (a.type === 'run_once' ||
      a.type === 'start_plan' ||
      a.type === 'routine_activate' ||
      (a.type === 'routine_toggle' && s.routines.find((r) => r.id === a.id)?.status !== 'Active') ||
      (a.type === 'routine_save' && a.activate))
  ) {
    throw new Error(
      'The cycle is closed. Reopen its review before activating routines or starting crop operations.',
    );
  }
  let message = '',
    id: string | undefined;
  switch (a.type) {
    case 'energy_save':
      if (!validEnergy(a.config))
        throw new Error('Check panel capacity, load duration, and cost assumptions.');
      s.energy = structuredClone(a.config);
      activity(
        s,
        'system',
        'Energy scenario saved',
        'Solar and load assumptions updated. Automation schedules and payments are managed separately.',
        s.greenhouse.id,
      );
      message = 'Energy scenario saved for this greenhouse.';
      break;
    case 'evaluate_detection': {
      const result = evaluateDetections(s);
      id = a.zoneId
        ? s.cases.find((c) => c.zoneId === a.zoneId && c.status !== 'closed')?.id
        : undefined;
      message = result.created
        ? `${result.created} inspection cases created from observation rules.`
        : result.linked
          ? `${result.linked} signals linked to existing cases.`
          : 'Review completed. No new signals require an inspection case.';
      break;
    }
    case 'detection_sample':
      applyDetectionSample(s, a.zoneId, a.sample);
      message = `Sample for Zone ${a.zoneId} loaded and evaluated. Simulation paused.`;
      break;
    case 'tick':
      advanceInPlace(s, a.seconds);
      break;
    case 'next':
      advanceInPlace(s, nextEventTime(s) - s.clock);
      break;
    case 'play':
      s.playing = a.value;
      message = a.value
        ? 'Simulation clock running. Active routines follow their schedules.'
        : 'Simulation clock paused. It does not catch up with real time.';
      break;
    case 'speed':
      s.speed = a.value;
      break;
    case 'clear_notice':
      s.notification = null;
      s.storageWarning = null;
      break;
    case 'scenario':
      setScenario(s, a.value);
      message = 'Simulation scenario updated. The same checks apply to scheduled runs.';
      break;
    case 'profile':
      if (s.runs.some((r) => isActiveRun(r.status) || r.status === 'Needs reconciliation'))
        throw new Error('Complete or review active runs before switching profiles.');
      s.profile = a.value;
      s.playing = false;
      activity(
        s,
        'system',
        'Sample profile changed',
        a.value === 'automation'
          ? 'Automated operations: 25 sample devices.'
          : 'Monitoring only: 12 observation devices. Cost history is retained.',
        'demo',
      );
      message = 'Simulation profile changed. No physical devices were connected.';
      break;
    case 'reset':
      Object.assign(s, createFixture());
      message = 'Simulation reset to 13 October 2026 at 09:42 WIB.';
      break;
    case 'assign': {
      const c = s.cases.find((c) => c.id === a.caseId);
      if (!c) throw new Error('Case not found.');
      if (!a.operator.trim()) throw new Error('Select an assigned operator.');
      c.assignedTo = a.operator;
      activity(s, 'inspection', `${c.id} ditugaskan`, a.operator, c.id, c.zoneId);
      message = `${c.id} assigned to ${a.operator}.`;
      break;
    }
    case 'inspection': {
      const i = a.inspection,
        c = s.cases.find((c) => c.id === i.caseId);
      if (!c) throw new Error('Case not found.');
      if (
        !Number.isInteger(i.examined) ||
        i.examined < 1 ||
        !Number.isInteger(i.affected) ||
        i.affected < 0 ||
        i.affected > i.examined
      )
        throw new Error('Affected plants must be between zero and the number inspected.');
      if (!i.operator.trim() || i.notes.trim().length < 5)
        throw new Error('Enter an operator and notes of at least 5 characters.');
      if (Date.parse(i.at) / 1000 > s.clock)
        throw new Error('The inspection date cannot be in the future.');
      id = nextId('CHK', s.inspections);
      s.inspections.unshift({ ...i, id });
      c.assignedTo = i.operator;
      c.verified = i.outcome !== 'inconclusive';
      activity(
        s,
        'inspection',
        `Inspection ${c.id} dicatat`,
        `${i.examined} plants inspected, ${i.affected} with symptoms. Case remains open.`,
        c.id,
        c.zoneId,
      );
      message = 'Inspection saved. The case was not closed automatically.';
      break;
    }
    case 'plan': {
      const c = s.cases.find((c) => c.id === a.plan.caseId);
      if (!c) throw new Error('Case not found.');
      if (!s.inspections.some((i) => i.caseId === c.id))
        throw new Error('Record a plant inspection before creating a plan.');
      if (!a.plan.title.trim() || !a.plan.operator.trim())
        throw new Error('Enter a title and assigned operator.');
      if (a.plan.durationSeconds < 10 || a.plan.durationSeconds > 300)
        throw new Error('Simulation duration must be 10–300 seconds.');
      if (a.plan.kind === 'simulator' && !c.verified)
        throw new Error('This case is not ready for review.');
      id = nextId('PLN', s.plans);
      s.plans.unshift({
        ...a.plan,
        id,
        createdAt: iso(s.clock),
        status: 'awaiting_approval',
        tasks: [
          { id: 'task-1', label: 'Inspect traps and affected plants', done: false },
          { id: 'task-2', label: 'Inspect screens and clean the area', done: false },
          { id: 'task-3', label: 'Record follow-up observations', done: false },
        ],
      });
      activity(s, 'plan', `${id} awaiting approval`, a.plan.title, id, c.zoneId);
      message = 'Plan created and linked to its source case.';
      break;
    }
    case 'approve_plan': {
      const p = s.plans.find((p) => p.id === a.id);
      if (!p) throw new Error('Plan not found.');
      if (p.kind === 'expert_review')
        throw new Error(
          'This plan requires expert review. The prototype does not apply chemicals.',
        );
      if (p.status !== 'awaiting_approval' && p.status !== 'draft')
        throw new Error('Plan review is already complete.');
      p.status = 'approved';
      activity(
        s,
        'plan',
        `${p.id} disetujui`,
        'Operator reviewed the zones, evidence, assigned person, and operating limits.',
        p.id,
        p.zoneId,
      );
      message = 'Plan approved. Execution is not complete yet.';
      break;
    }
    case 'start_plan': {
      const p = s.plans.find((p) => p.id === a.id);
      if (!p || p.status !== 'approved') throw new Error('Approve the plan first.');
      if (p.kind !== 'simulator')
        throw new Error('Nonchemical tasks are completed by an operator, not an actuator.');
      if (
        s.runs.some(
          (r) =>
            r.planId === p.id && (isActiveRun(r.status) || r.status === 'Needs reconciliation'),
        )
      )
        throw new Error('This plan already has an active or unconfirmed execution.');
      const version = makeVersion(
        p.id,
        [p.zoneId],
        [
          {
            id: 'check',
            label: 'Check virtual test module',
            action: 'check',
            duration: 3,
            deviceIds: ['CTRL-01'],
            zoneId: p.zoneId,
          },
          {
            id: 'test',
            label: 'Run test module',
            action: 'test',
            duration: p.durationSeconds,
            deviceIds: ['CTRL-01'],
            zoneId: p.zoneId,
          },
          {
            id: 'stop',
            label: 'Stop test module',
            action: 'stop',
            duration: 3,
            deviceIds: ['CTRL-01'],
            zoneId: p.zoneId,
          },
          {
            id: 'verify',
            label: 'Verify feedback',
            action: 'verify',
            duration: 3,
            deviceIds: ['CTRL-01'],
            zoneId: p.zoneId,
          },
        ],
        ['CTRL-01'],
        'TEST-MODULE',
      );
      const r: AutomationRoutine = {
        id: p.id,
        name: p.title,
        kind: 'pest',
        description: 'Test module simulation; effectiveness has not been evaluated.',
        status: 'Active',
        policy: 'automatic',
        trigger: {
          type: 'schedule',
          schedule: {
            times: [],
            weekdays: [],
            validFrom: localDate(s.clock),
            timeZone: 'Asia/Jakarta',
          },
        },
        version,
        skippedSlots: [],
      };
      const run = createRun(s, r, 'plan', `${p.id}|manual|${s.clock}|${s.runs.length}`, p.id);
      if (run) {
        p.runId = run.id;
        id = run.id;
        p.status = 'running';
        advanceInPlace(s, 1);
        s.playing = true;
      }
      message = 'Simulation command created. View its progress in Executions.';
      break;
    }
    case 'plan_task': {
      const p = s.plans.find((p) => p.id === a.id);
      if (!p || !['approved', 'running', 'monitoring'].includes(p.status))
        throw new Error('Approve the plan before recording execution.');
      const task = p.tasks.find((t) => t.id === a.taskId);
      if (task) {
        task.done = !task.done;
        activity(
          s,
          'plan',
          task.label,
          task.done ? 'Completed by operator.' : 'Reopened by operator.',
          p.id,
          p.zoneId,
        );
      }
      if (p.tasks.filter((t) => t.id !== 'task-3').every((t) => t.done)) {
        p.status = 'monitoring';
        const c = s.cases.find((c) => c.id === p.caseId);
        if (c) c.status = 'monitoring';
      }
      message = 'Execution checklist updated. Outcome review is a separate step.';
      break;
    }
    case 'evaluate_plan': {
      const p = s.plans.find((p) => p.id === a.id);
      if (!p) throw new Error('Plan not found.');
      if (!a.date || a.notes.trim().length < 10)
        throw new Error('Enter an evaluation date and notes of at least 10 characters.');
      if (a.close && a.date > localDate(s.clock))
        throw new Error(
          'Future observations cannot be reviewed as results. Record the review after the observation takes place.',
        );
      if (a.close && !['monitoring', 'completed'].includes(p.status))
        throw new Error('Execution has not reached follow-up monitoring yet.');
      p.evaluationAt = a.date;
      p.evaluationNotes = a.notes;
      p.status = a.close ? 'completed' : 'monitoring';
      const c = s.cases.find((c) => c.id === p.caseId);
      if (c) {
        c.followUpAt = a.date;
        c.status = a.close ? 'closed' : 'monitoring';
        if (a.close) c.closedAt = iso(s.clock);
      }
      activity(
        s,
        'plan',
        a.close ? 'Review completed; case closed' : 'Follow-up evaluation scheduled',
        a.notes,
        p.id,
        p.zoneId,
      );
      message = a.close
        ? 'Case closed after operator review.'
        : 'Evaluation scheduled. Case monitoring continues.';
      break;
    }
    case 'routine_toggle': {
      const r = s.routines.find((r) => r.id === a.id);
      if (!r) throw new Error('Routine not found.');
      if (r.status === 'Draft' || r.status === 'Needs review')
        throw new Error('Review this routine version before activation.');
      r.status = r.status === 'Active' ? 'Paused' : 'Active';
      activity(
        s,
        'routine',
        `${r.name} ${r.status === 'Paused' ? 'dijeda' : 'dilanjutkan'}`,
        'Changes apply to future schedules and do not stop active runs.',
        r.id,
        r.version.zones[0],
      );
      message = 'Schedule updated. Active runs were not stopped.';
      break;
    }
    case 'routine_activate': {
      const r = s.routines.find((r) => r.id === a.id);
      if (!r) throw new Error('Routine not found.');
      const errors = validateRoutine(s, r);
      if (errors.length) throw new Error(errors.join(' '));
      r.version.reviewed = true;
      r.status = 'Active';
      activity(
        s,
        'routine',
        `${r.name} v${r.version.number} diaktifkan`,
        'Review configuration once per version. Subsequent automatic runs do not require another approval.',
        r.id,
        r.version.zones[0],
      );
      message = 'Review complete. Routine version activated.';
      break;
    }
    case 'routine_save': {
      const incoming = structuredClone(a.routine),
        index = s.routines.findIndex((r) => r.id === incoming.id);
      if (index >= 0) {
        const current = s.routines[index],
          minor = Number(current.version.number.split('.')[1] ?? 0) + 1;
        incoming.version.number = `1.${minor}`;
        incoming.version.id = `${incoming.id}-v1.${minor}`;
      } else {
        incoming.id = nextId('RTN', s.routines);
        incoming.version.id = `${incoming.id}-v1.0`;
        incoming.version.number = '1.0';
      }
      incoming.version.createdAt = iso(s.clock);
      incoming.version.reviewed = a.activate;
      incoming.status = a.activate ? 'Active' : index >= 0 ? 'Needs review' : 'Draft';
      const errors = validateRoutine(s, incoming);
      if (errors.length) throw new Error(errors.join(' '));
      if (index >= 0) s.routines[index] = incoming;
      else s.routines.push(incoming);
      id = incoming.id;
      activity(
        s,
        'routine',
        `${incoming.name} v${incoming.version.number} saved`,
        a.activate
          ? 'Configuration reviewed and activated. Earlier runs retain their original version.'
          : 'New version awaiting review. Existing runs were not changed.',
        incoming.id,
        incoming.version.zones[0],
      );
      message = a.activate
        ? 'Routine saved and activated.'
        : 'New version saved. Review it before activation.';
      break;
    }
    case 'run_once': {
      const r = s.routines.find((r) => r.id === a.id);
      if (!r) throw new Error('Routine not found.');
      if (!r.version.reviewed) throw new Error('Review this routine version before running it.');
      const run = createRun(s, r, 'manual', `${r.version.id}|manual|${s.clock}|${s.runs.length}`);
      if (run) {
        id = run.id;
        advanceInPlace(s, 1);
        s.playing = true;
      }
      message = 'One-time run created with the same resource locks and daily limits.';
      break;
    }
    case 'skip_once': {
      const r = s.routines.find((r) => r.id === a.id);
      if (!r) throw new Error('Routine not found.');
      const at = nextOccurrence(r, s.clock);
      if (at === null) throw new Error('This routine does not use a time schedule.');
      const key = localDate(at) + 'T' + localTime(at);
      if (!r.skippedSlots.includes(key)) r.skippedSlots.push(key);
      activity(
        s,
        'routine',
        `${r.name}: skip once`,
        key + ' WIB. Later slots remain scheduled.',
        r.id,
        r.version.zones[0],
      );
      message = 'The next occurrence will be skipped once.';
      break;
    }
    case 'approve_run': {
      const r = s.runs.find((r) => r.id === a.id);
      if (!r || r.status !== 'Scheduled') throw new Error('This run is not awaiting approval.');
      r.status = 'Checking';
      r.reason = 'Operator approval received.';
      activity(s, 'run', 'Execution approved by operator', r.id, r.id);
      advanceInPlace(s, 1);
      break;
    }
    case 'stop':
      requestStop(s, a.id);
      message = 'Stop requested. Awaiting simulator acknowledgment.';
      break;
    case 'stop_all':
      for (const r of s.runs.filter((r) => isActiveRun(r.status)))
        requestStop(s, r.id, 'Operator stopped all active simulations.');
      s.playing = true;
      message = 'Stop requested for all active runs. This is not a physical emergency stop.';
      break;
    case 'reconcile':
      reconcile(s, a.id, a.notes);
      message =
        'Simulator state reviewed. Resource released; the run will not resume automatically.';
      break;
    case 'profile_review': {
      const p = s.nutrientProfiles.find((p) => p.id === a.id);
      if (!p) throw new Error('Profile not found.');
      if (!Number.isFinite(a.demoUnits) || a.demoUnits <= 0 || a.demoUnits > 10)
        throw new Error(
          'Simulation parameters must be greater than zero and no more than 10 units.',
        );
      p.demoUnits = a.demoUnits;
      p.version = `1.${Number(p.version.split('.')[1] ?? 0) + 1}`;
      p.reviewed = true;
      p.status = 'active';
      for (const r of s.routines.filter((r) => r.version.nutrientProfileId === p.id)) {
        r.version = {
          ...r.version,
          number: `1.${Number(r.version.number.split('.')[1] ?? 0) + 1}`,
          nutrientUnits: a.demoUnits,
          reviewed: false,
        };
        r.version.id = `${r.id}-v${r.version.number}`;
        r.status = 'Needs review';
      }
      activity(
        s,
        'routine',
        'Nutrient profile updated',
        `${p.name} v${p.version}; linked routines need review. Active execution snapshots are unchanged.`,
        p.id,
      );
      message = 'Profile saved. Review routines that use the new parameters.';
      break;
    }
    case 'override':
      if (a.notes.trim().length < 10 || a.minutes < 1 || a.minutes > 60)
        throw new Error('Enter a reason of at least 10 characters and a duration of 1–60 minutes.');
      s.overrides.push({
        id: nextId('OVR', s.overrides),
        routineId: a.id,
        reason: a.notes,
        createdAt: s.clock,
        expiresAt: s.clock + a.minutes * 60,
        scope: 'Run once at normal priority; all operating limits still apply.',
      });
      activity(s, 'routine', 'Temporary override recorded', a.notes, a.id);
      message =
        'Override recorded. Required sensors, resource locks, and operating limits remain enforced.';
      break;
    case 'add_device': {
      if (!a.device.id.trim() || !a.device.label.trim() || !a.device.zones.length)
        throw new Error('Enter a device ID, name, and zone.');
      if (a.device.zones.some((id) => !s.zones.some((z) => z.id === id && z.status !== 'inactive')))
        throw new Error('Select an available active zone.');
      if (s.devices.some((d) => d.id === a.device.id))
        throw new Error('Device ID already exists. Use the existing inventory record.');
      s.devices.push(a.device);
      id = a.device.id;
      activity(s, 'device', 'Device added', a.device.label, id, a.device.zones[0]);
      message = 'Device registered without recording a purchase or payment.';
      break;
    }
    case 'heal': {
      const d = s.devices.find((d) => d.id === a.id);
      if (!d) throw new Error('Device not found.');
      d.connection = 'online';
      d.lastSeen = iso(s.clock);
      activity(
        s,
        'device',
        `${d.label} simulated recovery`,
        'Incident history and tickets are retained. Record physical maintenance separately.',
        d.id,
        d.zones[0],
      );
      message = 'Simulated connection restored. Incident history retained.';
      break;
    }
    case 'maintenance_mode': {
      const d = s.devices.find((d) => d.id === a.id);
      if (!d) throw new Error('Device not found.');
      const active = s.runs.filter(
        (r) => isActiveRun(r.status) && r.snapshot.requiredDevices.includes(d.id),
      );
      if (active.length && a.value && !a.stopActive)
        throw new Error('An active run is using this device. Explicitly confirm the stop request.');
      if (a.value) active.forEach((r) => requestStop(s, r.id, `${d.id} entered maintenance.`));
      d.maintenance = a.value;
      activity(
        s,
        'maintenance',
        `${d.id}: maintenance mode ${a.value ? 'active' : 'completed'}`,
        'New runs check this condition; active stop requests still await feedback.',
        d.id,
        d.zones[0],
      );
      message = 'Maintenance mode updated.';
      break;
    }
    case 'deactivate_device': {
      const d = s.devices.find((d) => d.id === a.id);
      if (!d) throw new Error('Device not found.');
      if (
        s.runs.some(
          (r) =>
            (isActiveRun(r.status) || r.status === 'Needs reconciliation') &&
            r.snapshot.requiredDevices.includes(d.id),
        )
      )
        throw new Error('Review or stop related runs first.');
      d.active = !d.active;
      activity(
        s,
        'device',
        `${d.id} ${d.active ? 'diaktifkan' : 'dinonaktifkan'}`,
        'Historical expenses and their original period scopes are retained.',
        d.id,
        d.zones[0],
      );
      message = 'Asset status updated without changing historical costs.';
      break;
    }
    case 'validate_zone': {
      const z = s.zones.find((z) => z.id === a.id);
      if (!z) throw new Error('Zone not found.');
      if (z.status === 'inactive')
        throw new Error('Activate the zone before validating its installation.');
      const ds = s.devices.filter(
        (d) => d.active && d.zones.includes(z.id) && ['camera', 'sensor'].includes(d.type),
      );
      if (!['camera', 'sensor'].every((type) => ds.some((d) => d.type === type)))
        throw new Error('Add active cameras and sensors to this zone before validation.');
      if (ds.some((d) => d.connection !== 'online'))
        throw new Error('Cameras and sensors must be online before installation validation.');
      z.validated = true;
      ds.forEach((d) => (d.calibrated = true));
      activity(
        s,
        'device',
        `Installation in Zone ${z.id} divalidasi`,
        'Operator confirmed usable reference images and sensor inputs.',
        z.id,
        z.id,
      );
      message = `Zone ${z.id} validated for the prototype.`;
      break;
    }
    case 'maintenance': {
      if (!a.title.trim() || !a.deviceId || !a.operator.trim() || !a.date)
        throw new Error('Enter a device, title, operator, and date.');
      if (a.completed && a.date > localDate(s.clock))
        throw new Error('Future work cannot be marked completed.');
      if (a.amount !== null && (!Number.isFinite(a.amount) || a.amount <= 0))
        throw new Error('Optional cost must be greater than zero. Leave empty if unknown.');
      const ticketDupe = s.maintenance.find((m) => m.submissionKey === a.submissionKey);
      const dupe = s.expenses.find((e) => e.submissionKey === a.submissionKey);
      if (!a.id && (dupe || ticketDupe)) {
        id = dupe?.maintenanceId ?? ticketDupe?.id;
        message = 'This record is already saved. No duplicate was created.';
        break;
      }
      id = a.id ?? nextId('MNT', s.maintenance);
      let m = s.maintenance.find((m) => m.id === id);
      if (!m) {
        m = {
          id,
          submissionKey: a.submissionKey,
          deviceId: a.deviceId,
          title: a.title,
          operator: a.operator,
          status: a.completed ? 'completed' : 'scheduled',
          createdAt: iso(s.clock),
          dueAt: a.date,
          notes: a.notes,
        };
        s.maintenance.push(m);
      } else
        Object.assign(m, {
          title: a.title,
          operator: a.operator,
          status: a.completed ? 'completed' : 'scheduled',
          dueAt: a.date,
          notes: a.notes,
        });
      if (a.amount !== null && a.paid) {
        if (m.expenseId)
          throw new Error(
            'Maintenance already has a linked payment. Edit that expense instead of creating a duplicate.',
          );
        const expense: ExpenseRecord = {
          id: nextId('EXP', s.expenses),
          paidAt: localDate(s.clock),
          category: 'Perawatan',
          amount: a.amount,
          deviceId: a.deviceId,
          maintenanceId: id,
          greenhouseId: s.greenhouse.id,
          status: 'paid',
          source: 'operator',
          note: a.title,
          submissionKey: a.submissionKey,
          createdAt: iso(s.clock),
        };
        s.expenses.push(expense);
        m.expenseId = expense.id;
        activity(
          s,
          'expense',
          `${expense.id}: maintenance cost recorded`,
          'One expense record is shared between Devices and Costs.',
          expense.id,
        );
      }
      const device = s.devices.find((d) => d.id === a.deviceId);
      if (device) device.nextMaintenance = a.date;
      activity(
        s,
        'maintenance',
        a.title,
        a.completed
          ? 'Work marked completed by the operator.'
          : 'Work scheduled; not completed yet.',
        id,
        device?.zones[0],
      );
      message =
        a.amount !== null && a.paid
          ? 'Maintenance and one linked payment saved.'
          : 'Maintenance saved without adding a payment.';
      break;
    }
    case 'maintenance_complete': {
      const m = s.maintenance.find((m) => m.id === a.id);
      if (!m) throw new Error('Task not found.');
      m.status = 'completed';
      activity(
        s,
        'maintenance',
        `${m.title}: completed`,
        'Completed by operator. No new expense was created.',
        m.id,
      );
      message = 'Maintenance task completed. No automatic payment.';
      break;
    }
    case 'expense': {
      const prior = s.expenses.find((e) => e.submissionKey === a.record.submissionKey);
      if (prior && !a.record.id) {
        id = prior.id;
        message = 'Record already saved. No duplicate created.';
        break;
      }
      const e: ExpenseRecord = {
        ...a.record,
        id: a.record.id ?? nextId('EXP', s.expenses),
        greenhouseId: s.greenhouse.id,
        source: 'operator',
        createdAt: a.record.id
          ? (s.expenses.find((e) => e.id === a.record.id)?.createdAt ?? iso(s.clock))
          : iso(s.clock),
      };
      const errors = validateExpense(s, e, a.record.id);
      if (errors.length) throw new Error(errors.join(' '));
      const duplicate = possibleDuplicate(s, e);
      if (duplicate && !a.allowDuplicate)
        throw new Error(
          `Possible duplicate ${duplicate.id}. Review the match or confirm this is a separate record.`,
        );
      const index = s.expenses.findIndex((x) => x.id === e.id);
      if (index >= 0) s.expenses[index] = e;
      else s.expenses.push(e);
      id = e.id;
      activity(
        s,
        'expense',
        `${e.id} ${index >= 0 ? 'updated' : 'dicatat'}`,
        e.note,
        e.id,
        e.zoneId,
      );
      message = `${e.id} saved for ${e.paidAt.slice(0, 7)}. Estimated usage is excluded from this total.`;
      break;
    }
    case 'void_expense': {
      const e = s.expenses.find((e) => e.id === a.id);
      if (!e) throw new Error('Record not found.');
      if (a.reason.trim().length < 5)
        throw new Error('Enter a reason for voiding of at least 5 characters.');
      e.status = 'void';
      e.voidReason = a.reason;
      activity(s, 'expense', `${e.id} voided`, a.reason, e.id, e.zoneId);
      message = 'Record voided and retained. It can be restored.';
      break;
    }
    case 'undo_void': {
      const e = s.expenses.find((e) => e.id === a.id);
      if (e) {
        e.status = 'paid';
        e.voidReason = undefined;
        activity(
          s,
          'expense',
          `${e.id} dipulihkan`,
          'Voided record restored by operator.',
          e.id,
          e.zoneId,
        );
      }
      message = 'Record restored without creating a duplicate.';
      break;
    }
    case 'baseline':
      if (
        a.value &&
        (!Number.isInteger(a.value.days) ||
          a.value.days < 1 ||
          a.value.days > 31 ||
          !/^\d{4}-\d{2}$/.test(a.value.period))
      )
        throw new Error('Enter a valid baseline period and 1–31 operating days.');
      if (a.value && Object.values(a.value.categories).some((v) => !Number.isFinite(v) || v < 0))
        throw new Error('Baseline values cannot be negative.');
      s.baseline = a.value;
      activity(
        s,
        'expense',
        a.value ? 'Comparison baseline updated' : 'Comparison baseline deleted',
        'Expenses unchanged.',
        'baseline',
      );
      message = a.value
        ? 'Baseline saved with its source and scope.'
        : 'Baseline deleted. Savings will not be shown as 0%.';
      break;
    case 'budget':
      if (!Number.isFinite(a.amount) || a.amount < 0) throw new Error('Budget cannot be negative.');
      s.budgets = s.budgets
        .filter((b) => b.period !== a.period)
        .concat({ period: a.period, amount: a.amount, greenhouseId: s.greenhouse.id });
      message = 'Budget updated. The savings baseline is managed separately.';
      break;
    case 'planner':
      if (![2, 6].includes(a.zones)) throw new Error('Select the 2-zone or 6-zone preset.');
      s.costs.plannerZones = a.zones;
      s.costs.ownedController = a.ownedController;
      message = 'Plan saved without adding inventory or expenses.';
      break;
    case 'recurring_drafts': {
      const period = localDate(s.clock).slice(0, 7);
      for (const r of s.recurring) {
        const key = `recurring|${r.id}|${period}`;
        if (s.expenses.some((e) => e.submissionKey === key)) continue;
        s.expenses.push({
          id: nextId('EXP', s.expenses),
          paidAt: period + '-' + String(r.day).padStart(2, '0'),
          category: r.category,
          amount: 0,
          greenhouseId: s.greenhouse.id,
          source: 'operator',
          status: 'draft',
          note: r.title,
          deviceId: r.deviceId,
          createdAt: iso(s.clock),
          submissionKey: key,
        });
      }
      message = 'Recurring expense reminders created as drafts. Enter and confirm payment amounts.';
      break;
    }
  }
  if (['tick', 'next', 'scenario', 'detection_sample'].includes(a.type)) evaluateDetections(s);
  if (message) s.notification = message;
  return { ok: true, message, id };
}
export function transition(input: DomainState, action: Action) {
  const data = structuredClone(input);
  const result = applyAction(data, action);
  return { data, result };
}
