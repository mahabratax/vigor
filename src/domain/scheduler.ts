import { availableDevices, sensorValue } from './telemetry';
import { captureRunStart, captureRunFinish } from './outcomes';
export { availableDevices, sensorValue } from './telemetry';
import { activity, isActiveRun, iso, localDate, localTime, nextId } from './format';
import type {
  AutomationRoutine,
  AutomationRun,
  DomainState,
  RunStatus,
  Scenario,
  StepRun,
} from './types';
export function nextOccurrence(
  r: AutomationRoutine,
  now: number,
  includeCurrent = false,
): number | null {
  if (r.trigger.type !== 'schedule') return null;
  const schedule = r.trigger.schedule;
  const midnight = Date.parse(localDate(now) + 'T00:00:00+07:00') / 1000;
  for (let offset = 0; offset < 370; offset++) {
    const day = midnight + offset * 86400,
      date = localDate(day),
      weekday = new Date((day + 7 * 3600) * 1000).getUTCDay();
    if (date < schedule.validFrom || !schedule.weekdays.includes(weekday)) continue;
    if (schedule.validUntil && date > schedule.validUntil) return null;
    for (const time of [...schedule.times].sort()) {
      const [hours, minutes] = time.split(':').map(Number),
        slot = day + hours * 3600 + minutes * 60;
      if (slot > now || (includeCurrent && slot === now)) return slot;
    }
  }
  return null;
}
export function nextScheduled(s: DomainState) {
  return s.routines
    .filter((r) => r.status === 'Active')
    .map((r) => ({ routine: r, at: nextOccurrence(r, s.clock) }))
    .filter(
      (
        r,
      ): r is {
        routine: AutomationRoutine;
        at: number;
      } => r.at !== null,
    )
    .sort((a, b) => a.at - b.at);
}
export function validateRoutine(s: DomainState, r: AutomationRoutine): string[] {
  const e: string[] = [];
  const v = r.version;
  if (!r.name.trim()) e.push('Enter a routine name.');
  if (!v.zones.length) e.push('Select at least one zone.');
  if (v.zones.some((id) => !s.zones.some((z) => z.id === id && z.status !== 'inactive')))
    e.push('Routines must use available active zones.');
  if (v.steps.length === 0) e.push('Add at least one step.');
  if (v.steps.some((x) => x.action === 'task') && r.policy !== 'task')
    e.push(
      'Human work steps must use the Create task policy and cannot be completed automatically.',
    );
  if (v.steps.some((x) => !Number.isFinite(x.duration) || x.duration < 0))
    e.push('Invalid step duration.');
  if (v.maxDuration < v.steps.reduce((a, x) => a + x.duration, 0))
    e.push('The maximum duration must cover all steps.');
  if (v.maxCyclesPerDay < 1 || v.maxCyclesPerDay > 24 || !Number.isInteger(v.maxCyclesPerDay))
    e.push('Daily cycle limit must be 1–24.');
  if (
    v.maxWaterPerDay < 0 ||
    v.maxNutritionPerDay < 0 ||
    v.cooldownSeconds < 0 ||
    v.queueTimeout <= 0
  )
    e.push('Invalid usage or time limits.');
  const expected = v.steps
    .filter((x) => ['water', 'dose', 'flush'].includes(x.action))
    .reduce((a, x) => a + (x.duration * v.flowLpm) / 60, 0);
  if (v.maxWaterPerDay < expected && v.resource === 'PUMP-01')
    e.push('Daily water limit is below the target for one execution.');
  if (v.nutrientUnits > v.maxNutritionPerDay) e.push('Nutrient target exceeds the daily limit.');
  if (r.trigger.type === 'schedule') {
    if (
      r.trigger.schedule.timeZone !== 'Asia/Jakarta' ||
      !r.trigger.schedule.weekdays.length ||
      r.trigger.schedule.times.some((t) => !/^([01]\d|2[0-3]):[0-5]\d$/.test(t))
    )
      e.push('Invalid WIB schedule.');
  }
  if (r.trigger.type === 'sensor') {
    const t = r.trigger;
    if (!v.requiredDevices.includes(t.deviceId))
      e.push('The trigger sensor must be a required device.');
    if (
      (t.direction === 'below' && t.recover <= t.start) ||
      (t.direction === 'above' && t.recover >= t.start)
    )
      e.push('Start and recovery thresholds must provide hysteresis.');
    if (t.debounceSeconds < 1) e.push('Evaluation window must be at least 1 second.');
  }
  if (r.trigger.type === 'after_run') {
    let id = r.trigger.routineId;
    const visited = new Set([r.id]);
    while (id) {
      if (visited.has(id)) {
        e.push('Trigger chains cannot contain a cycle.');
        break;
      }
      visited.add(id);
      const parent = s.routines.find((x) => x.id === id);
      if (!parent) {
        e.push('Source routine not found.');
        break;
      }
      id = parent.trigger.type === 'after_run' ? parent.trigger.routineId : '';
    }
  }
  for (const id of v.requiredDevices) {
    if (!s.devices.find((d) => d.id === id)) e.push(`${id} not installed.`);
  }
  for (const z of v.zones) {
    if (
      (r.kind === 'irrigation' || r.kind === 'fertigation') &&
      !s.devices.find((d) => d.id === `VALVE-${z}`)
    )
      e.push(`Valve in Zone ${z} unavailable.`);
    if (r.kind === 'fertigation' && z !== 'A')
      e.push('The sample dosing device is installed only in Zone A.');
  }
  if (r.kind === 'fertigation') {
    const p = s.nutrientProfiles.find((p) => p.id === v.nutrientProfileId);
    if (!p?.reviewed || p.status !== 'active')
      e.push('Review and activate the nutrient profile first.');
    if (!v.requiredDevices.includes('FLOW-01')) e.push('Nutrient delivery requires a flow sensor.');
  }
  return e;
}
function todayUsage(s: DomainState, run: AutomationRun) {
  const day = localDate(s.clock);
  return s.usages.filter(
    (u) =>
      localDate(Date.parse(u.at) / 1000) === day &&
      (run.resource === 'PUMP-01'
        ? u.deviceId === 'PUMP-01'
        : u.deviceId === run.snapshot.requiredDevices.find((id) => id === 'FAN-01')),
  );
}
export function guardReason(s: DomainState, run: AutomationRun, during = false): string | null {
  if (run.snapshot.zones.some((id) => !s.zones.some((z) => z.id === id && z.status !== 'inactive')))
    return 'Zone unavailable or inactive.';
  if (!run.snapshot.reviewed) return 'Routine version has not been reviewed.';
  const devices = availableDevices(s);
  for (const id of run.snapshot.requiredDevices) {
    const d = devices.find((d) => d.id === id);
    if (!d)
      return `${id} not installed in profile ${s.profile === 'monitoring' ? 'Monitoring only' : 'this profile'}.`;
    if (!d.active) return `${id} dinonaktifkan.`;
    if (d.maintenance) return `${id} under maintenance.`;
    if (d.connection !== 'online')
      return `${id} ${d.connection === 'stale' ? 'has expired data' : 'offline'}; conditions cannot be evaluated.`;
    if (!d.calibrated) return `${id} not calibrated.`;
  }
  if (run.resource === 'PUMP-01') {
    const level = sensorValue(s, 'LEVEL-01');
    if (level === null) return 'LEVEL-01 cannot be evaluated.';
    if (level < 20) return 'Water tank level is below the sample threshold of 20%.';
    if (run.kind === 'fertigation' && (sensorValue(s, 'NUTRI-LEVEL-01') ?? 0) < 20)
      return 'Insufficient nutrient reservoir level.';
    if (run.snapshot.requiredDevices.includes('MEDIA-A') && sensorValue(s, 'MEDIA-A') === null)
      return 'MEDIA-A cannot be evaluated; no fallback is configured.';
  }
  if (!during) {
    const counts = s.runs.filter(
      (r) =>
        r.id !== run.id &&
        r.routineId === run.routineId &&
        r.startedAt !== undefined &&
        localDate(r.startedAt) === localDate(s.clock),
    );
    if (counts.length >= run.snapshot.maxCyclesPerDay)
      return 'Daily cycle limit reached. Manual and scheduled runs share this limit.';
    const last = counts.reduce((a, r) => Math.max(a, r.finishedAt ?? r.startedAt ?? 0), 0);
    if (last && s.clock - last < run.snapshot.cooldownSeconds)
      return `Required interval between cycles has not elapsed (${run.snapshot.cooldownSeconds} seconds).`;
  }
  const usage = todayUsage(s, run);
  if (
    run.resource === 'PUMP-01' &&
    usage.reduce((a, u) => a + u.waterLiters, 0) >= run.snapshot.maxWaterPerDay
  )
    return 'Shared pump resource has reached its daily water limit.';
  if (
    run.kind === 'fertigation' &&
    usage.reduce((a, u) => a + u.nutrientUnits, 0) >= run.snapshot.maxNutritionPerDay
  )
    return 'Daily nutrient limit reached.';
  return null;
}
export function createRun(
  s: DomainState,
  r: AutomationRoutine,
  source: AutomationRun['source'],
  key: string,
  planId?: string,
): AutomationRun | null {
  if (s.seenTriggers.includes(key)) return null;
  s.seenTriggers.push(key);
  s.seenTriggers = s.seenTriggers.slice(-5000);
  const run: AutomationRun = {
    id: nextId('RUN', s.runs),
    cycleId: s.cycle.id,
    routineId: r.id,
    routineName: r.name,
    kind: r.kind,
    routineVersionId: r.version.id,
    snapshot: structuredClone(r.version),
    triggerKey: key,
    source,
    policy: r.policy,
    planId,
    status: r.policy === 'approval' ? 'Scheduled' : 'Checking',
    createdAt: s.clock,
    steps: r.version.steps.map((x) => ({ ...structuredClone(x), status: 'pending' })),
    stepIndex: 0,
    resource: r.version.resource,
    reason:
      r.policy === 'approval' ? 'Awaiting operator approval.' : 'Checking operating conditions.',
    expiresAt: s.clock + r.version.queueTimeout,
  };
  s.runs.unshift(run);
  activity(
    s,
    'run',
    `${r.name} dijadwalkan`,
    `${run.id} , version ${r.version.number} · ${source === 'manual' ? 'started once' : source === 'sensor' ? 'sensor episode' : 'WIB occurrence'} · ${run.reason}`,
    run.id,
    r.version.zones[0],
    'Simulation scheduler',
  );
  return run;
}
function finish(s: DomainState, run: AutomationRun, status: RunStatus, reason: string) {
  run.status = status;
  run.reason = reason;
  run.finishedAt = s.clock;
  captureRunFinish(s, run);
  if (status === 'Needs reconciliation') {
    for (const lock of s.locks.filter((l) => l.runId === run.id)) lock.state = 'unknown';
    for (const u of s.usages.filter((u) => u.runId === run.id)) u.deliveryConfirmed = false;
  } else s.locks = s.locks.filter((l) => l.runId !== run.id);
  if (run.planId) {
    const plan = s.plans.find((p) => p.id === run.planId);
    if (plan)
      plan.status =
        status === 'Completed' ? 'monitoring' : status === 'Stopped' ? 'monitoring' : 'approved';
  }
  activity(
    s,
    'run',
    `${run.routineName}: ${status === 'Completed' ? 'completed' : status === 'Skipped' ? 'dilewati' : status === 'Needs reconciliation' ? 'state review needed' : status === 'Stopped' ? 'dihentikan' : status === 'Blocked' ? 'tertahan' : 'failed'}`,
    reason,
    run.id,
    run.currentZone,
    'Local simulator',
  );
}
function queueCommand(
  s: DomainState,
  run: AutomationRun,
  step: StepRun,
  kind: 'start' | 'stop' | 'test',
) {
  const id = nextId('CMD', s.commands);
  s.commands.push({
    id,
    runId: run.id,
    stepId: step.id,
    deviceIds: step.deviceIds,
    kind,
    status: 'queued',
    queuedAt: s.clock,
  });
  activity(
    s,
    'run',
    `${id} , command ${kind === 'stop' ? 'stop' : 'started'} dikirim`,
    `${step.label}; awaiting simulated device response.`,
    run.id,
    step.zoneId,
    'Local simulator',
  );
}
export function requestStop(
  s: DomainState,
  runId: string,
  reason = 'Stopped by operator.',
  asFailure = false,
) {
  const run = s.runs.find((r) => r.id === runId);
  if (!run || !isActiveRun(run.status) || run.stopRequestedAt !== undefined) return;
  if (run.status === 'Queued' || !run.startedAt) {
    finish(s, run, 'Stopped', reason);
    return;
  }
  run.stopRequestedAt = s.clock;
  run.stopResult = asFailure ? 'fail' : 'stop';
  run.reason = `Stop request: ${reason} Awaiting confirmation.`;
  queueCommand(
    s,
    run,
    {
      ...run.steps[run.stepIndex],
      id: 'operator-stop',
      label: 'Simulator shutdown',
      deviceIds: run.snapshot.requiredDevices,
    },
    'stop',
  );
  activity(s, 'run', 'Stop request', run.reason, run.id, run.currentZone);
}
function startStep(s: DomainState, run: AutomationRun) {
  while (run.stepIndex < run.steps.length) {
    const step = run.steps[run.stepIndex];
    if (
      step.zoneId &&
      step.action === 'start' &&
      run.kind === 'irrigation' &&
      run.snapshot.requiredDevices.includes(`MEDIA-${step.zoneId}`)
    ) {
      const media = sensorValue(s, `MEDIA-${step.zoneId}`);
      if (media === null) {
        requestStop(s, run.id, `MEDIA-${step.zoneId} cannot be evaluated.`, true);
        return;
      }
      if (media >= 65) {
        const zone = step.zoneId;
        for (const item of run.steps.filter((x) => x.zoneId === zone && x.status === 'pending')) {
          item.status = 'skipped';
          item.reason = 'Media is still sufficiently wet (sample threshold).';
          item.finishedAt = s.clock;
        }
        activity(
          s,
          'run',
          `Zone ${zone} dilewati`,
          'Media is already wet. The skipped step is not a failure.',
          run.id,
          zone,
          'Simulation scheduler',
        );
        while (run.steps[run.stepIndex]?.status === 'skipped') run.stepIndex++;
        continue;
      }
    }
    step.status = 'running';
    step.startedAt = s.clock;
    run.currentZone = step.zoneId;
    run.status = step.action === 'verify' ? 'Verifying' : 'Running';
    run.reason = step.label;
    if (['start', 'fan', 'dose', 'test', 'stop'].includes(step.action))
      queueCommand(
        s,
        run,
        step,
        step.action === 'stop' ? 'stop' : step.action === 'test' ? 'test' : 'start',
      );
    activity(
      s,
      'run',
      step.label,
      `${run.id} , step ${run.stepIndex + 1}/${run.steps.length}`,
      run.id,
      step.zoneId,
      'Local simulator',
    );
    return;
  }
  const delivered = run.steps.some(
    (x) => ['water', 'dose', 'fan', 'test'].includes(x.action) && x.status === 'completed',
  );
  finish(
    s,
    run,
    delivered ? 'Completed' : 'Skipped',
    delivered
      ? 'All steps and shutdown feedback completed. Biological effectiveness has not been evaluated.'
      : 'All zones skipped based on media conditions.',
  );
}
function addUsage(s: DomainState, run: AutomationRun, step: StepRun) {
  const deviceId =
    run.resource === 'PUMP-01' ? 'PUMP-01' : run.resource === 'FAN-01' ? 'FAN-01' : 'CTRL-01';
  let u = s.usages.find((u) => u.runId === run.id && u.deviceId === deviceId);
  if (!u) {
    u = {
      id: nextId('USE', s.usages),
      runId: run.id,
      routineVersionId: run.routineVersionId,
      deviceId,
      at: iso(s.clock),
      seconds: 0,
      waterLiters: 0,
      nutrientUnits: 0,
      energyKwh: 0,
      waterSource: run.snapshot.requiredDevices.includes('FLOW-01') ? 'measured_demo' : 'estimate',
      deliveryConfirmed: true,
    };
    s.usages.push(u);
  }
  u.seconds++;
  u.energyKwh += (s.devices.find((d) => d.id === deviceId)?.watts ?? 0) / 3600000;
  if (run.resource === 'PUMP-01') u.waterLiters += run.snapshot.flowLpm / 60;
  if (step.action === 'dose')
    u.nutrientUnits += run.snapshot.nutrientUnits / Math.max(1, step.duration);
}
function tickRun(s: DomainState, run: AutomationRun) {
  if (!isActiveRun(run.status)) return;
  if (run.stopRequestedAt !== undefined) {
    const elapsed = s.clock - run.stopRequestedAt,
      stop = s.commands.find((c) => c.runId === run.id && c.stepId === 'operator-stop');
    if (elapsed < 3) return;
    if (['flow_stuck', 'lost_connection', 'command_failed'].includes(s.scenario)) {
      if (stop) {
        stop.status = 'timed_out';
        stop.reason = 'Shutdown feedback was not received.';
      }
      finish(
        s,
        run,
        'Needs reconciliation',
        'Shutdown unconfirmed. Resource remains locked; do not repeat actuation.',
      );
      return;
    }
    if (stop) {
      stop.status = 'completed';
      stop.acknowledgedAt = s.clock;
      stop.finishedAt = s.clock;
    }
    for (const command of s.commands.filter(
      (c) => c.runId === run.id && ['queued', 'acknowledged', 'running'].includes(c.status),
    )) {
      command.status = 'stopped';
      command.finishedAt = s.clock;
    }
    const step = run.steps[run.stepIndex];
    if (step) step.status = 'stopped';
    finish(
      s,
      run,
      run.stopResult === 'fail' ? 'Failed' : 'Stopped',
      'Simulator shutdown confirmed. ' + run.reason.replace(' Awaiting confirmation.', ''),
    );
    return;
  }
  if (run.status === 'Checking' || run.status === 'Queued') {
    if (s.clock > run.expiresAt) {
      finish(
        s,
        run,
        'Blocked',
        'Queue timeout exceeded. Delayed schedules are not run indefinitely.',
      );
      return;
    }
    const reason = guardReason(s, run);
    if (reason) {
      finish(s, run, 'Blocked', reason);
      return;
    }
    const lock = run.resource
      ? s.locks.find((l) => l.id === run.resource && l.runId !== run.id)
      : null;
    if (lock) {
      if (run.status !== 'Queued')
        activity(
          s,
          'run',
          `${run.routineName} mengantre`,
          `${run.resource} is in use by ${lock.runId}.`,
          run.id,
          run.snapshot.zones[0],
          'Simulation scheduler',
        );
      run.status = 'Queued';
      run.reason =
        lock.state === 'unknown'
          ? `${run.resource}: state unconfirmed (${lock.runId}).`
          : `${run.resource} is in use by ${lock.runId}; queue limit ${Math.max(0, Math.round(run.expiresAt - s.clock))} seconds.`;
      return;
    }
    if (run.policy === 'task') {
      const id = nextId('MNT', s.maintenance);
      s.maintenance.push({
        id,
        deviceId: run.snapshot.steps[0]?.deviceIds[0] ?? 'PUMP-01',
        title: run.routineName,
        operator: 'Budi Santoso',
        status: 'open',
        createdAt: iso(s.clock),
        dueAt: localDate(s.clock),
        notes: `Created automatically from ${run.id}; awaiting operator work.`,
      });
      run.steps.forEach((step) => {
        step.status = 'completed';
        step.finishedAt = s.clock;
      });
      finish(s, run, 'Completed', `Task ${id} created. Physical work is not complete yet.`);
      return;
    }
    if (run.resource)
      s.locks.push({ id: run.resource, runId: run.id, state: 'locked', acquiredAt: s.clock });
    run.startedAt = s.clock;
    captureRunStart(s, run);
    startStep(s, run);
    return;
  }
  const reason = guardReason(s, run, true);
  if (reason) {
    requestStop(s, run.id, reason, true);
    return;
  }
  if (s.clock - (run.startedAt ?? s.clock) > run.snapshot.maxDuration) {
    requestStop(s, run.id, 'Maximum duration reached.', true);
    return;
  }
  const step = run.steps[run.stepIndex];
  if (!step) return;
  const elapsed = s.clock - (step.startedAt ?? s.clock);
  const command = s.commands.find((c) => c.runId === run.id && c.stepId === step.id);
  if (command && command.status === 'queued' && elapsed >= 1) {
    if (s.scenario === 'command_failed') {
      if (elapsed >= 5) {
        command.status = 'timed_out';
        command.reason = 'Acknowledgment not received.';
        step.status = 'failed';
        finish(
          s,
          run,
          'Needs reconciliation',
          'Command unacknowledged. Actuation outcome is uncertain and will not be retried automatically.',
        );
      }
      return;
    }
    command.status = 'acknowledged';
    command.acknowledgedAt = s.clock;
    activity(
      s,
      'run',
      `${command.id} acknowledged by device`,
      `${step.label}; simulated response received.`,
      run.id,
      step.zoneId,
      'Local simulator',
    );
  }
  if (command && command.status === 'acknowledged' && elapsed >= 2) command.status = 'running';
  if (
    s.scenario === 'lost_connection' &&
    elapsed >= 6 &&
    ['water', 'dose', 'test', 'fan'].includes(step.action)
  ) {
    requestStop(s, run.id, 'Connection lost during actuation; device state is uncertain.', true);
    return;
  }
  if (
    ['water', 'dose', 'flush', 'verify_flow'].includes(step.action) &&
    run.resource === 'PUMP-01' &&
    (sensorValue(s, 'FLOW-01') ?? 0) <= 0
  ) {
    step.reason = 'Flow not confirmed.';
    requestStop(s, run.id, 'FLOW-01 detected no flow; dosing was stopped.', true);
    return;
  }
  if (
    ['water', 'dose', 'flush', 'fan', 'test'].includes(step.action) &&
    elapsed > 0 &&
    elapsed <= step.duration
  )
    addUsage(s, run, step);
  if (elapsed < step.duration) return;
  if (
    (step.action === 'stop' || step.action === 'verify') &&
    s.scenario === 'flow_stuck' &&
    run.resource === 'PUMP-01'
  ) {
    step.status = 'failed';
    if (command) command.status = 'timed_out';
    finish(
      s,
      run,
      'Needs reconciliation',
      'FLOW-01 still shows flow after stop. Inspect the line manually in the simulator.',
    );
    return;
  }
  step.status = 'completed';
  step.finishedAt = s.clock;
  if (command) {
    command.status = 'completed';
    command.finishedAt = s.clock;
  }
  run.stepIndex++;
  startStep(s, run);
}
function scheduleTick(s: DomainState) {
  for (const r of s.routines) {
    if (r.trigger.type === 'schedule') {
      if (s.clock % 60 !== 0) continue;
      const slot = nextOccurrence(r, s.clock, true);
      if (slot !== s.clock) continue;
      const slotKey = localDate(s.clock) + 'T' + localTime(s.clock),
        key = r.version.id + '|' + slotKey + '|' + r.version.zones.join(',');
      if (s.seenTriggers.includes(key)) continue;
      if (r.status !== 'Active' || r.skippedSlots.includes(slotKey)) {
        s.seenTriggers.push(key);
        activity(
          s,
          'routine',
          `${r.name}: scheduled occurrence skipped`,
          r.skippedSlots.includes(slotKey)
            ? 'This occurrence was skipped once. Later schedules are unchanged.'
            : 'Routine inactive. Missed schedules will not be replayed when resumed.',
          r.id,
          r.version.zones[0],
          'Simulation scheduler',
        );
        continue;
      }
      createRun(s, r, 'schedule', key);
    } else if (r.trigger.type === 'sensor' && r.status === 'Active') {
      const t = r.trigger,
        time = localTime(s.clock);
      if (time < t.windowStart || time > t.windowEnd) continue;
      const value = sensorValue(s, t.deviceId);
      let ep = s.episodes[r.id];
      if (!ep) ep = s.episodes[r.id] = { activeSince: null, latched: false, sequence: 0 };
      if (value === null) {
        ep.activeSince = null;
        continue;
      }
      const breach = t.direction === 'below' ? value < t.start : value > t.start,
        recovered = t.direction === 'below' ? value >= t.recover : value <= t.recover;
      if (recovered) {
        ep.activeSince = null;
        ep.latched = false;
        continue;
      }
      if (!breach || ep.latched) continue;
      if (ep.activeSince === null) ep.activeSince = s.clock;
      if (s.clock - ep.activeSince >= t.debounceSeconds) {
        ep.latched = true;
        ep.sequence++;
        createRun(
          s,
          r,
          'sensor',
          r.version.id + '|episode-' + ep.sequence + '|' + localDate(s.clock),
        );
      }
    } else if (r.trigger.type === 'after_run' && r.status === 'Active') {
      const parentId = r.trigger.routineId;
      for (const parent of s.runs.filter(
        (x) => x.routineId === parentId && x.status === 'Completed' && x.finishedAt === s.clock - 1,
      ))
        createRun(s, r, 'after_run', r.version.id + '|after|' + parent.id);
    }
  }
}
/** Every crossed second is processed. No wall-clock catch-up, random telemetry, or external calls. */
export function advanceInPlace(s: DomainState, seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) throw new Error('Invalid clock duration.');
  const count = Math.min(Math.floor(seconds), 86400);
  for (let i = 0; i < count; i++) {
    s.clock++;
    scheduleTick(s);
    const ordered = [...s.runs].sort(
      (a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id),
    );
    for (const run of ordered) tickRun(s, run);
  }
  s.runs = s.runs
    .filter((r) => isActiveRun(r.status) || r.status === 'Needs reconciliation')
    .concat(
      s.runs
        .filter((r) => !isActiveRun(r.status) && r.status !== 'Needs reconciliation')
        .slice(0, 180),
    )
    .sort((a, b) => b.createdAt - a.createdAt);
  return s;
}
export function nextEventTime(s: DomainState): number {
  const possibilities = nextScheduled(s).map((x) => x.at);
  for (const r of s.runs.filter((r) => isActiveRun(r.status))) {
    if (r.stopRequestedAt !== undefined) possibilities.push(r.stopRequestedAt + 3);
    else if (r.status === 'Checking' || r.status === 'Queued') possibilities.push(s.clock + 3);
    else {
      const step = r.steps[r.stepIndex];
      if (step?.startedAt !== undefined)
        possibilities.push(step.startedAt + Math.max(1, step.duration));
    }
  }
  return Math.max(
    s.clock + 1,
    Math.min(...possibilities.filter((x) => x > s.clock), s.clock + 86400),
  );
}
export function setScenario(s: DomainState, scenario: Scenario) {
  s.scenario = scenario;
  for (const id of ['PUMP-01', 'CTRL-01', 'FLOW-01']) {
    const d = s.devices.find((d) => d.id === id);
    if (d)
      d.connection =
        scenario === 'device_offline' && (id === 'PUMP-01' || id === 'CTRL-01')
          ? 'offline'
          : scenario === 'sensor_stale' && id === 'FLOW-01'
            ? 'stale'
            : 'online';
  }
  if (scenario === 'interrupted') {
    s.playing = false;
    for (const r of s.runs.filter((r) => isActiveRun(r.status))) {
      r.status = 'Needs reconciliation';
      r.reason = 'Session interrupted. Confirm simulator state before continuing.';
      for (const l of s.locks.filter((l) => l.runId === r.id)) l.state = 'unknown';
    }
  }
  activity(s, 'system', 'Simulation scenario changed', scenario, 'demo');
}
export function reconcile(s: DomainState, id: string, notes: string) {
  const r = s.runs.find((r) => r.id === id);
  if (!r || r.status !== 'Needs reconciliation') return;
  if (notes.trim().length < 8)
    throw new Error('Enter inspection results of at least 8 characters.');
  for (const c of s.commands.filter((c) => c.runId === r.id && c.status !== 'completed')) {
    c.status = 'stopped';
    c.finishedAt = s.clock;
    c.reason = 'Shutdown state reviewed by the simulation operator.';
  }
  finish(s, r, 'Stopped', 'Operator confirmed the simulator has stopped. ' + notes);
  s.playing = false;
}
/** Evaluate guards without registering a run or issuing commands. */
export function checkRoutineGuards(s: DomainState, r: AutomationRoutine) {
  const run: AutomationRun = {
    id: 'PREVIEW',
    routineId: r.id,
    routineName: r.name,
    kind: r.kind,
    routineVersionId: r.version.id,
    snapshot: r.version,
    triggerKey: 'preview',
    source: 'manual',
    policy: r.policy,
    status: 'Checking',
    createdAt: s.clock,
    steps: r.version.steps.map((st) => ({ ...st, status: 'pending' })),
    stepIndex: 0,
    resource: r.version.resource,
    reason: 'Dry run',
    expiresAt: s.clock + r.version.queueTimeout,
  };
  return guardReason(s, run);
}
