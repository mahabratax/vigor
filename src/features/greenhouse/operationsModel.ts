import type { AutomationRoutine, DomainState } from '../../domain/types';
import {
  availableDevices,
  checkRoutineGuards,
  nextOccurrence,
  sensorValue,
  validateRoutine,
} from '../../domain/scheduler';
import {
  clockTime,
  dateLabel,
  isActiveRun,
  localTime,
  number,
  runLabels,
} from '../../domain/format';

export function operationReview(s: DomainState, routine: AutomationRoutine) {
  const devices = availableDevices(s);
  const required = routine.version.requiredDevices.map((id) => ({
    id,
    device: devices.find((d) => d.id === id),
  }));
  const readings = required.flatMap(({ id, device }) => {
    if (!device) return [];
    const capability = ['temperature', 'media', 'level', 'flow', 'ec', 'ph'].find((c) =>
      device.capabilities.includes(c as (typeof device.capabilities)[number]),
    );
    if (!capability) return [];
    const value = device.maintenance ? null : sensorValue(s, id);
    const unit = (
      { temperature: '°C', media: '%', level: '%', flow: 'L/min', ec: 'mS/cm', ph: '' } as Record<
        string,
        string
      >
    )[capability];
    return [
      {
        id,
        label: device.label,
        value,
        unit,
        quality: device.maintenance
          ? 'Under maintenance'
          : device.connection === 'offline'
            ? 'Offline'
            : device.connection === 'stale'
              ? 'Expired data'
              : !device.calibrated
                ? 'Not calibrated'
                : value === null
                  ? 'No data yet'
                  : 'Sample inputs',
      },
    ];
  });
  const issues = validateRoutine(s, routine);
  const guard = issues[0] ?? checkRoutineGuards(s, routine);
  const next = routine.trigger.type === 'schedule' ? nextOccurrence(routine, s.clock) : null;
  const latest =
    s.runs.filter((r) => r.routineId === routine.id).sort((a, b) => b.createdAt - a.createdAt)[0] ??
    null;
  const lock = routine.version.resource
    ? s.locks.find((l) => l.id === routine.version.resource)
    : undefined;
  let trigger = '',
    rule = '',
    triggerWaiting = true;
  const t = routine.trigger;
  if (t.type === 'schedule') {
    trigger = next
      ? `Next occurrence ${dateLabel(next)}, ${clockTime(next)} WIB.`
      : 'No occurrences remain within the schedule period.';
    rule = `Schedule ${t.schedule.times.join(', ')} WIB. ${routine.policy === 'automatic' ? 'Configured to run automatically when conditions are met.' : routine.policy === 'task' ? 'Creates an operator task.' : 'Requires approval for each occurrence.'}`;
  } else if (t.type === 'sensor') {
    const value = sensorValue(s, t.deviceId),
      episode = s.episodes[routine.id],
      time = localTime(s.clock);
    const breach = value !== null && (t.direction === 'above' ? value > t.start : value < t.start);
    const recovered =
      value !== null && (t.direction === 'above' ? value <= t.recover : value >= t.recover);
    rule = `${t.deviceId} ${t.direction === 'above' ? '>' : '<'} ${number(t.start)} selama ${t.debounceSeconds} seconds; reset ${t.direction === 'above' ? '≤' : '≥'} ${number(t.recover)}. Window ${t.windowStart}–${t.windowEnd} WIB. Sample threshold.`;
    trigger =
      value === null
        ? 'Trigger reading unavailable.'
        : time < t.windowStart || time > t.windowEnd
          ? 'Outside the automation window.'
          : episode?.latched && !recovered
            ? 'This episode was processed. Waiting for recovery before another trigger.'
            : breach
              ? `Threshold crossed; ${episode?.activeSince != null ? Math.max(0, t.debounceSeconds - (s.clock - episode.activeSince)) : t.debounceSeconds} seconds of confirmation remain on the simulation clock.`
              : 'Trigger threshold not crossed.';
    triggerWaiting =
      !breach || !!episode?.latched || time < t.windowStart || time > t.windowEnd || value === null;
  } else {
    rule = `After ${s.routines.find((r) => r.id === t.routineId)?.name ?? t.routineId} completed.`;
    trigger = 'Awaiting parent-run completion; earlier history is not replayed.';
  }
  const current =
    latest &&
    (isActiveRun(latest.status) ||
      latest.status === 'Scheduled' ||
      latest.status === 'Needs reconciliation');
  const status = current
    ? runLabels[latest.status]
    : routine.status !== 'Active'
      ? routine.status === 'Paused'
        ? 'Paused'
        : 'Needs review'
      : guard
        ? 'Conditions not met'
        : lock
          ? 'Resource in use'
          : triggerWaiting
            ? 'Awaiting trigger'
            : 'Confirming condition';
  const attention =
    !!guard ||
    !!lock ||
    !!(latest && ['Blocked', 'Failed', 'Needs reconciliation'].includes(latest.status));
  const usage = latest ? s.usages.filter((u) => u.runId === latest.id) : [];
  const maintenance =
    latest?.policy === 'task'
      ? s.maintenance.find((m) => m.notes.includes(` ${latest.id};`))
      : undefined;
  const outcome = !latest
    ? 'No outcome yet. Review becomes available after execution.'
    : latest.status === 'Completed'
      ? latest.policy === 'task'
        ? maintenance?.status === 'completed'
          ? 'Maintenance work marked completed by the operator.'
          : 'Task created. The operator still needs to complete the physical work.'
        : routine.kind === 'environment'
          ? 'Fan execution completed. Before-and-after sensor history has not confirmed temperature recovery.'
          : 'Execution completed. Review plant condition and usage before assessing care outcomes.'
      : latest.status === 'Needs reconciliation'
        ? 'Shutdown state unconfirmed. Review the execution before releasing its resource.'
        : ['Blocked', 'Failed', 'Stopped', 'Skipped'].includes(latest.status)
          ? latest.reason
          : 'Execution is running or waiting. No outcome is available yet.';
  const followUp =
    latest?.policy === 'task'
      ? '/perangkat?tab=maintenance'
      : routine.kind === 'environment'
        ? `/perangkat?device=${encodeURIComponent(routine.version.requiredDevices.find((id) => devices.find((d) => d.id === id)?.capabilities.includes('temperature')) ?? routine.version.requiredDevices[0] ?? '')}`
        : routine.kind === 'pest'
          ? '/hama?tab=detection'
          : '/siklus?tab=care';
  return {
    required,
    readings,
    guard,
    next,
    latest,
    lock,
    trigger,
    rule,
    status,
    attention,
    outcome,
    followUp,
    usage,
    maintenance,
  };
}
