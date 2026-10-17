/* Executed with Node's built-in test runner after scripts/check-domain.cjs.
   These checks do not require or claim a Vitest installation. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const dir = process.env.VIGOR_DOMAIN_BUILD || path.resolve(__dirname, '../.checks/domain');
const { createFixture } = require(path.join(dir, 'data/fixtures.js'));
const { applyAction, transition } = require(path.join(dir, 'domain/actions.js'));
const sch = require(path.join(dir, 'domain/scheduler.js'));
const cost = require(path.join(dir, 'domain/costs.js'));
const fmt = require(path.join(dir, 'domain/format.js'));
const { hydrate } = require(path.join(dir, 'domain/storage.js'));
const { kpis } = require(path.join(dir, 'domain/selectors.js'));
const sep = { period: '2026-09' },
  oct = { period: '2026-10' },
  near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} ≠ ${b}`);
const go = (s, t) => sch.advanceInPlace(s, Date.parse(`2026-10-13T${t}+07:00`) / 1000 - s.clock);
const routine = (s, id = 'RTN-001') => s.routines.find((r) => r.id === id);
const run = (s, id = 'RTN-001') => s.runs.find((r) => r.routineId === id);
const sumUsage = (s, field) =>
  s.usages.filter((u) => u.runId.startsWith('RUN')).reduce((t, u) => t + u[field], 0);
const expenseInput = (s, overrides = {}) => ({
  paidAt: '2026-10-13',
  category: 'Perawatan',
  amount: 50000,
  status: 'paid',
  note: 'Servis pompa tambahan',
  deviceId: 'PUMP-01',
  submissionKey: 'new-payment',
  ...overrides,
});
test('Fixture counts: 6 zones, 432 plants, 25 devices, 24 online, 4/6 coverage', () => {
  const s = createFixture(),
    k = kpis(s);
  assert.equal(s.zones.length, 6);
  assert.equal(
    s.zones.reduce((t, z) => t + z.plants, 0),
    432,
  );
  assert.equal(k.devices, 25);
  assert.equal(k.online, 24);
  assert.equal(k.observationsOnline, 11);
  assert.equal(k.observationsTotal, 12);
  assert.equal(k.coverage, 4);
  assert.equal(k.inspection, 1);
  assert.equal(k.closed, 4);
});
test('Fixtures do not share mutable state', () => {
  const a = createFixture();
  a.zones[0].validated = false;
  assert.equal(createFixture().zones[0].validated, true);
});
test('Seven September records reconcile to 1,080,000; budget remainder 120,000', () => {
  const s = createFixture(),
    c = cost.costSummary(s, sep);
  assert.equal(c.rows.length, 7);
  assert.equal(c.operating, 1080000);
  assert.equal(c.total, 1080000);
  assert.equal(c.remaining, 120000);
});
test('Baseline 1.4m gives 320,000 difference / 22.857142%', () => {
  const c = cost.comparison(createFixture(), sep);
  assert.equal(c.canCompare, true);
  assert.equal(c.baseline, 1400000);
  assert.equal(c.difference, 320000);
  near(c.percent, (320000 / 1400000) * 100);
});
test('Planner 2-zone total 2.86m never changes ledger or assets', () => {
  const s = createFixture();
  assert.equal(cost.plannerTotal(cost.plannerItems(2, false)).total, 2860000);
  applyAction(s, { type: 'planner', zones: 6, ownedController: true });
  assert.equal(s.expenses.length, 7);
  assert.equal(s.devices.length, 25);
  assert.equal(cost.plannerTotal(cost.plannerItems(2, true)).total, 2090000);
});
test('Pump 85,500 = 40,500 allocation + 45,000 service; power bill counted once', () => {
  const s = createFixture(),
    c = cost.costSummary(s, { ...sep, deviceId: 'PUMP-01' });
  assert.equal(c.total, 85500);
  assert.equal(c.rows.length, 2);
  assert.equal(
    s.expenses.filter((e) => e.category === 'Listrik').reduce((t, e) => t + e.amount, 0),
    135000,
  );
  assert.equal(cost.costSummary(s, sep).total, 1080000);
});
test('Allocation targets reconcile including other devices; above-bill allocations rejected', () => {
  const s = createFixture(),
    e = s.expenses.find((e) => e.id === 'EXP-003'),
    a = s.allocations.filter((a) => a.expenseId === e.id);
  assert.equal(
    a.reduce((t, r) => t + r.amount, 0),
    135000,
  );
  assert.deepEqual(cost.validateAllocations(e, a), []);
  assert.ok(cost.validateAllocations(e, [...a, { ...a[0], id: 'over', amount: 1 }]).length);
});
test('Pump September history reconciles 30 h and 27 kWh without water measurement claim', () => {
  const u = cost.deviceUsage(createFixture(), 'PUMP-01', '2026-09');
  assert.equal(u.rows.length, 30);
  assert.equal(u.seconds, 108000);
  near(u.kwh, 27);
  assert.equal(u.water, 0);
  assert.ok(u.rows.every((r) => r.routineVersionId.includes('0.8')));
});
test('Other exact device costs: dose27k CTRL49.5k EC65k cameraE4.5k', () => {
  const s = createFixture();
  for (const [id, n] of [
    ['DOSE-01', 27000],
    ['CTRL-01', 49500],
    ['EC-01', 65000],
    ['CAM-E-01', 4500],
  ])
    assert.equal(cost.costSummary(s, { ...sep, deviceId: id }).total, n);
});
test('Missing baseline is unavailable, not 0%', () => {
  const s = createFixture();
  applyAction(s, { type: 'baseline', value: null });
  const c = cost.comparison(s, sep);
  assert.equal(c.canCompare, false);
  assert.equal(c.percent, null);
  assert.equal(cost.costSummary(s, sep).total, 1080000);
});
test('Missing mandatory category produces partial comparison, not zero', () => {
  const s = createFixture();
  s.expenses = s.expenses.filter((e) => e.category !== 'Air');
  const c = cost.comparison(s, sep);
  assert.equal(c.canCompare, false);
  assert.equal(c.partial, true);
  assert.ok(c.missing.includes('Air'));
  assert.equal(cost.consumedCost(s, sep, 'Air'), null);
});
test('Zero baseline suppresses percentages', () => {
  const s = createFixture();
  for (const k in s.baseline.categories) s.baseline.categories[k] = 0;
  const c = cost.comparison(s, sep);
  assert.equal(c.percent, null);
  assert.equal(c.canCompare, false);
});
test('Cost increases stay negative, not forced into savings', () => {
  const s = createFixture();
  s.expenses[0].amount += 500000;
  const c = cost.comparison(s, sep);
  assert.equal(c.canCompare, true);
  assert.equal(c.difference, -180000);
  assert.ok(c.percent < 0);
});
test('Changed area and device scope not silently normalized', () => {
  const s = createFixture();
  assert.equal(cost.comparison(s, { ...sep, deviceId: 'PUMP-01' }).canCompare, false);
  s.baseline.area = 100;
  assert.equal(cost.comparison(s, sep).canCompare, false);
});
test('Current month is marked unfinished and not compared against full baseline', () => {
  const s = createFixture();
  assert.equal(cost.costSummary(s, oct).partial, true);
  assert.equal(cost.comparison(s, oct).canCompare, false);
  assert.equal(cost.comparison(s, oct).percent, null);
});
test('Explicit daily normalization only after all October categories recorded', () => {
  const s = createFixture();
  for (const cat of cost.OPERATING_CATEGORIES)
    applyAction(s, {
      type: 'expense',
      record: expenseInput(s, {
        category: cat,
        deviceId: undefined,
        amount: 10000,
        submissionKey: cat,
      }),
    });
  assert.equal(cost.comparison(s, oct).canCompare, false);
  s.baseline.normalizedDaily = true;
  const c = cost.comparison(s, oct);
  assert.equal(c.canCompare, true);
  near(c.baseline, (1400000 / 30) * 13);
  assert.equal(c.actual, 60000);
});
test('Maintenance October 50k adds one shared expense and leaves September unchanged', () => {
  const s = createFixture(),
    a = {
      type: 'maintenance',
      deviceId: 'PUMP-01',
      title: 'Servis tambahan',
      operator: 'Budi',
      date: '2026-10-13',
      notes: 'Pemeriksaan',
      completed: false,
      amount: 50000,
      paid: true,
      submissionKey: 'maint-new',
    };
  applyAction(s, a);
  applyAction(s, a);
  assert.equal(s.expenses.length, 8);
  assert.equal(cost.costSummary(s, sep).total, 1080000);
  assert.equal(cost.costSummary(s, oct).total, 50000);
  const m = s.maintenance.find((m) => m.submissionKey === 'maint-new');
  assert.equal(m.status, 'scheduled');
  assert.equal(s.expenses.find((e) => e.id === m.expenseId).maintenanceId, m.id);
});
test('Free maintenance deduplicates and does not create a payment', () => {
  const s = createFixture(),
    n = s.maintenance.length,
    a = {
      type: 'maintenance',
      deviceId: 'PUMP-01',
      title: 'Cek tanpa biaya',
      operator: 'Budi',
      date: '2026-10-13',
      notes: 'Cek',
      completed: true,
      amount: null,
      paid: false,
      submissionKey: 'free-check',
    };
  applyAction(s, a);
  applyAction(s, a);
  assert.equal(s.maintenance.length, n + 1);
  assert.equal(s.expenses.length, 7);
});
test('Completing maintenance does not imply new payment', () => {
  const s = createFixture();
  applyAction(s, { type: 'maintenance_complete', id: 'DEV-008' });
  assert.equal(s.maintenance.find((m) => m.id === 'DEV-008').status, 'completed');
  assert.equal(s.expenses.length, 7);
});
test('Expense duplicate submission is idempotent; similar payments require review', () => {
  const s = createFixture(),
    record = expenseInput(s);
  applyAction(s, { type: 'expense', record });
  applyAction(s, { type: 'expense', record });
  assert.equal(s.expenses.length, 8);
  assert.throws(
    () => applyAction(s, { type: 'expense', record: { ...record, submissionKey: 'other' } }),
    /duplikat/,
  );
});
test('Edit, void, undo reuse original ID and reconcile totals', () => {
  const s = createFixture();
  let result = applyAction(s, { type: 'expense', record: expenseInput(s) });
  const id = result.id;
  applyAction(s, { type: 'expense', record: { ...expenseInput(s), id, amount: 75000 } });
  assert.equal(s.expenses.length, 8);
  assert.equal(cost.costSummary(s, oct).total, 75000);
  applyAction(s, { type: 'void_expense', id, reason: 'Salah pencatatan' });
  assert.equal(cost.costSummary(s, oct).total, 0);
  applyAction(s, { type: 'undo_void', id });
  assert.equal(cost.costSummary(s, oct).total, 75000);
  assert.equal(s.expenses.length, 8);
});
test('Cross-month nutrition: full cash on payment date; split comparison not doubled', () => {
  const s = createFixture(),
    e = s.expenses.find((e) => e.id === 'EXP-002');
  applyAction(s, {
    type: 'expense',
    record: {
      ...e,
      usageSlices: [
        { period: '2026-09', amount: 240000 },
        { period: '2026-10', amount: 240000 },
      ],
    },
  });
  assert.equal(cost.costSummary(s, sep).total, 1080000);
  assert.equal(cost.costSummary(s, oct).total, 0);
  assert.equal(cost.consumedCost(s, sep, 'Nutrisi'), 240000);
  assert.equal(cost.consumedCost(s, oct, 'Nutrisi'), 240000);
});
test('Invalid consumption allocations and edits below existing allocations rejected', () => {
  const s = createFixture(),
    e = s.expenses.find((e) => e.id === 'EXP-003');
  assert.ok(cost.validateExpense(s, { ...e, amount: 100000 }, e.id).length);
  assert.ok(
    cost.validateExpense(s, { ...e, usageSlices: [{ period: '2026-09', amount: 10 }] }).length,
  );
});
test('Deactivated device retains historical expenses and original scope', () => {
  const s = createFixture();
  applyAction(s, { type: 'deactivate_device', id: 'PUMP-01' });
  assert.equal(cost.costSummary(s, { ...sep, deviceId: 'PUMP-01' }).total, 85500);
  assert.equal(s.devices.find((d) => d.id === 'PUMP-01').active, false);
});
test('Recurring reminders are drafts and never add paid nominal', () => {
  const s = createFixture();
  applyAction(s, { type: 'recurring_drafts' });
  const count = s.expenses.length;
  applyAction(s, { type: 'recurring_drafts' });
  assert.equal(s.expenses.length, count);
  assert.ok(s.expenses.some((e) => e.status === 'draft'));
  assert.equal(cost.costSummary(s, oct).total, 0);
});
test('CSV user strings neutralize spreadsheet formula injection', () => {
  for (const str of ['=HYPERLINK("bad")', ' +SUM(A1)', '-1+2', '@SUM(1)', '\tformula'])
    assert.ok(fmt.safeCsvCell(str).startsWith('"\''));
  assert.equal(fmt.safeCsvCell('normal'), '"normal"');
});
test('WIB next occurrence independent of host timezone: 10:00', () => {
  const s = createFixture();
  assert.equal(
    new Date(sch.nextOccurrence(routine(s), s.clock) * 1000).toISOString(),
    '2026-10-13T03:00:00.000Z',
  );
});
test('Automatic irrigation completes A before B, pump resource exclusive', () => {
  const s = createFixture();
  go(s, '10:06:00');
  const r = run(s);
  assert.equal(r.status, 'Completed');
  const wa = r.steps.find((x) => x.action === 'water' && x.zoneId === 'A'),
    wb = r.steps.find((x) => x.action === 'water' && x.zoneId === 'B');
  assert.ok(wa.finishedAt <= wb.startedAt);
  assert.equal(s.locks.length, 0);
  near(sumUsage(s, 'waterLiters'), 64);
  assert.ok(s.commands.some((c) => c.acknowledgedAt));
  assert.ok(s.commands.every((c) => ['completed', 'stopped'].includes(c.status)));
});
test('Automatic fertigation completes flow → dosing → flush → stop; no approval per run', () => {
  const s = createFixture();
  go(s, '10:33:00');
  const r = run(s, 'RTN-002');
  assert.equal(r.status, 'Completed');
  assert.equal(r.source, 'schedule');
  assert.equal(r.policy, 'automatic');
  const dose = r.steps.find((x) => x.action === 'dose'),
    flow = r.steps.find((x) => x.action === 'verify_flow');
  assert.ok(flow.finishedAt <= dose.startedAt);
  near(sumUsage(s, 'nutrientUnits'), 2);
  assert.equal(s.expenses.length, 7);
});
test('60x advancement processes all deadlines once, matching one-second clock', () => {
  const a = createFixture(),
    b = createFixture();
  sch.advanceInPlace(a, 51 * 60);
  for (let i = 0; i < 51; i++) sch.advanceInPlace(b, 60);
  assert.deepEqual(
    a.runs.map((r) => [r.id, r.status, r.startedAt, r.finishedAt]),
    b.runs.map((r) => [r.id, r.status, r.startedAt, r.finishedAt]),
  );
  assert.equal(a.commands.length, b.commands.length);
  assert.equal(a.runs.length, 2);
});
test('Wet media B skipped with reason, not false failure', () => {
  const s = createFixture();
  sch.setScenario(s, 'wet_media');
  go(s, '10:06:00');
  const r = run(s);
  assert.equal(r.status, 'Completed');
  assert.ok(r.steps.filter((st) => st.zoneId === 'B').every((st) => st.status === 'skipped'));
  near(sumUsage(s, 'waterLiters'), 32);
});
test('Low tank and required stale sensor block start; no commands issued', () => {
  for (const scenario of ['low_tank', 'sensor_stale', 'device_offline']) {
    const s = createFixture();
    sch.setScenario(s, scenario);
    go(s, '10:01:00');
    assert.equal(run(s).status, 'Blocked');
    assert.equal(s.commands.length, 0);
  }
});
test('Camera E offline does not independently block irrigation', () => {
  const s = createFixture();
  assert.equal(s.devices.find((d) => d.id === 'CAM-E-01').connection, 'offline');
  go(s, '10:06:00');
  assert.equal(run(s).status, 'Completed');
});
test('No flow does not deliver nutrients and runs stop procedure', () => {
  const s = createFixture();
  sch.setScenario(s, 'no_flow');
  go(s, '10:33:00');
  const r = run(s, 'RTN-002');
  assert.equal(r.status, 'Failed');
  near(sumUsage(s, 'nutrientUnits'), 0);
  assert.ok(s.commands.some((c) => c.runId === r.id && c.kind === 'stop'));
});
test('Lost flow mid-dose stops dosing without automatic retries', () => {
  const s = createFixture();
  go(s, '10:30:35');
  const before = sumUsage(s, 'nutrientUnits');
  assert.ok(before > 0 && before < 2);
  sch.setScenario(s, 'no_flow');
  sch.advanceInPlace(s, 90);
  near(sumUsage(s, 'nutrientUnits'), before);
  assert.equal(run(s, 'RTN-002').status, 'Failed');
});
test('Failure to stop retains unknown lock and requires reconciliation', () => {
  const s = createFixture();
  sch.setScenario(s, 'flow_stuck');
  go(s, '10:06:00');
  const r = run(s);
  assert.equal(r.status, 'Needs reconciliation');
  assert.equal(s.locks[0].state, 'unknown');
  assert.ok(s.usages.filter((u) => u.runId === r.id).every((u) => !u.deliveryConfirmed));
  applyAction(s, { type: 'run_once', id: 'RTN-002' });
  sch.advanceInPlace(s, 1);
  assert.notEqual(run(s, 'RTN-002').status, 'Running');
  sch.reconcile(s, r.id, 'Pemeriksaan simulator: penghentian dikonfirmasi.');
  assert.equal(r.status, 'Stopped');
  assert.ok(!s.locks.some((l) => l.runId === r.id));
});
test('Failed start acknowledgment does not retry actuation', () => {
  const s = createFixture();
  sch.setScenario(s, 'command_failed');
  go(s, '10:02:00');
  assert.equal(run(s).status, 'Needs reconciliation');
  assert.equal(s.commands.length, 1);
  sch.advanceInPlace(s, 60);
  assert.equal(s.commands.length, 1);
});
test('Shared pump queues manual and scheduled work; no overlap', () => {
  const s = createFixture();
  go(s, '10:00:20');
  applyAction(s, { type: 'run_once', id: 'RTN-002' });
  sch.advanceInPlace(s, 1);
  assert.equal(run(s, 'RTN-002').status, 'Queued');
  assert.equal(s.locks.filter((l) => l.id === 'PUMP-01').length, 1);
  go(s, '10:08:00');
  const ir = run(s),
    fer = run(s, 'RTN-002');
  assert.equal(fer.status, 'Completed');
  assert.ok(fer.startedAt >= ir.finishedAt);
});
test('Queue expiry skips late execution rather than unlimited backlog', () => {
  const s = createFixture();
  go(s, '10:00:15');
  routine(s, 'RTN-002').version.queueTimeout = 5;
  applyAction(s, { type: 'run_once', id: 'RTN-002' });
  sch.advanceInPlace(s, 10);
  assert.ok(['Skipped', 'Blocked'].includes(run(s, 'RTN-002').status));
});
test('Pause routine does not stop active execution', () => {
  const s = createFixture();
  go(s, '10:00:20');
  applyAction(s, { type: 'routine_toggle', id: 'RTN-001' });
  assert.equal(routine(s).status, 'Paused');
  assert.equal(run(s).status, 'Running');
  go(s, '10:06:00');
  assert.equal(run(s).status, 'Completed');
});
test('Skip once leaves future schedule intact, creates no run for selected slot', () => {
  const s = createFixture();
  applyAction(s, { type: 'skip_once', id: 'RTN-001' });
  go(s, '10:06:00');
  assert.equal(run(s), undefined);
  assert.ok(sch.nextOccurrence(routine(s), s.clock) > s.clock);
  assert.equal(routine(s).status, 'Active');
});
test('Manual stop waits for simulator feedback, then releases lock', () => {
  const s = createFixture();
  go(s, '10:00:20');
  const r = run(s);
  applyAction(s, { type: 'stop', id: r.id });
  assert.equal(r.status, 'Running');
  assert.ok(r.stopRequestedAt);
  sch.advanceInPlace(s, 6);
  assert.equal(r.status, 'Stopped');
  assert.equal(s.locks.length, 0);
});
test('Daily cycle guard includes manual runs', () => {
  const s = createFixture();
  routine(s).version.maxCyclesPerDay = 1;
  go(s, '10:06:00');
  applyAction(s, { type: 'run_once', id: 'RTN-001' });
  sch.advanceInPlace(s, 2);
  assert.equal(run(s).status, 'Blocked');
  assert.match(run(s).reason, /siklus harian/);
});
test('Condition trigger debounces and creates only one run for one episode', () => {
  const s = createFixture();
  const r = routine(s, 'RTN-006');
  r.status = 'Active';
  r.version.reviewed = true;
  sch.setScenario(s, 'increasing');
  sch.advanceInPlace(s, 45);
  assert.equal(s.runs.filter((x) => x.routineId === r.id).length, 0);
  sch.advanceInPlace(s, 500);
  assert.equal(s.runs.filter((x) => x.routineId === r.id).length, 1);
  sch.advanceInPlace(s, 100);
  assert.equal(s.runs.filter((x) => x.routineId === r.id).length, 1);
});
test('Version mutation cannot change active run snapshot', () => {
  const s = createFixture();
  go(s, '10:30:25');
  const r = run(s, 'RTN-002'),
    before = r.snapshot.nutrientUnits;
  applyAction(s, { type: 'profile_review', id: 'NP-001', demoUnits: 3 });
  assert.equal(r.snapshot.nutrientUnits, before);
  assert.equal(routine(s, 'RTN-002').status, 'Needs review');
  assert.equal(routine(s, 'RTN-002').version.reviewed, false);
});
test('Human preventive task created automatically but not completed physically', () => {
  const s = createFixture();
  go(s, '13:01:00');
  const r = run(s, 'RTN-004');
  assert.equal(r.status, 'Completed');
  assert.ok(s.maintenance.some((m) => m.title.includes('filter') && m.status !== 'completed'));
});
test('Human task cannot masquerade as automatically completed machine step', () => {
  const s = createFixture(),
    r = routine(s, 'RTN-004');
  r.policy = 'automatic';
  assert.ok(sch.validateRoutine(s, r).some((e) => e.includes('tugas manusia')));
});
test('Monitoring-only capability hides automation hardware and blocks irrigation', () => {
  const s = createFixture();
  applyAction(s, { type: 'profile', value: 'monitoring' });
  assert.equal(sch.availableDevices(s).length, 12);
  go(s, '10:01:00');
  assert.equal(run(s).status, 'Blocked');
  assert.equal(sch.sensorValue(s, 'MEDIA-A'), null);
});
test('Dry-run guard evaluation leaves commands, cases, and runs untouched', () => {
  const s = createFixture(),
    copy = JSON.stringify(s);
  sch.checkRoutineGuards(s, routine(s));
  sch.validateRoutine(s, routine(s));
  assert.equal(JSON.stringify(s), copy);
});
test('Reload active run pauses and retains unknown resource; no dose resumed', () => {
  const s = createFixture();
  go(s, '10:30:25');
  const loaded = hydrate(JSON.stringify(s));
  assert.equal(loaded.playing, false);
  assert.equal(run(loaded, 'RTN-002').status, 'Needs reconciliation');
  assert.ok(loaded.locks.some((l) => l.state === 'unknown'));
  const before = sumUsage(loaded, 'nutrientUnits');
  sch.advanceInPlace(loaded, 100);
  near(sumUsage(loaded, 'nutrientUnits'), before);
});
test('Malformed storage safely restores fixture', () => {
  for (const value of ['bad JSON', '{}', JSON.stringify({ schemaVersion: 3, devices: null })]) {
    const s = hydrate(value);
    assert.equal(s.devices.length, 25);
    assert.ok(s.storageWarning);
  }
});
test('Inspection rejects affected > examined; valid inspection does not close case', () => {
  const s = createFixture(),
    i = {
      caseId: 'INS-024',
      at: '2026-10-13T09:42:00+07:00',
      operator: 'Budi Santoso',
      examined: 12,
      affected: 13,
      outcome: 'indication',
      notes: 'Pemeriksaan tanaman selesai.',
    };
  assert.throws(() => applyAction(s, { type: 'inspection', inspection: i }), /bergejala/);
  applyAction(s, { type: 'inspection', inspection: { ...i, affected: 2 } });
  assert.equal(s.cases.find((c) => c.id === 'INS-024').verified, true);
  assert.notEqual(s.cases.find((c) => c.id === 'INS-024').status, 'closed');
});
test('Pest simulator requires review; shares command engine; evaluates explicitly', () => {
  const s = createFixture();
  applyAction(s, {
    type: 'inspection',
    inspection: {
      caseId: 'INS-024',
      at: '2026-10-13T09:42:00+07:00',
      operator: 'Budi',
      examined: 12,
      affected: 2,
      outcome: 'indication',
      notes: 'Inspeksi tanaman demo.',
    },
  });
  const p = applyAction(s, {
    type: 'plan',
    plan: {
      caseId: 'INS-024',
      zoneId: 'B',
      kind: 'simulator',
      title: 'Modul uji',
      operator: 'Budi',
      notes: 'Review demo',
      durationSeconds: 20,
    },
  });
  assert.throws(() => applyAction(s, { type: 'start_plan', id: p.id }), /disetujui/);
  applyAction(s, { type: 'approve_plan', id: p.id });
  const r = applyAction(s, { type: 'start_plan', id: p.id });
  sch.advanceInPlace(s, 40);
  assert.equal(s.runs.find((x) => x.id === r.id).status, 'Completed');
  assert.equal(s.plans.find((x) => x.id === p.id).status, 'monitoring');
  assert.ok(s.commands.some((c) => c.runId === r.id));
  applyAction(s, {
    type: 'evaluate_plan',
    id: p.id,
    date: '2026-10-14',
    notes: 'Observasi lanjutan oleh Budi.',
    close: false,
  });
  assert.equal(s.cases.find((c) => c.id === 'INS-024').status, 'monitoring');
  assert.throws(
    () =>
      applyAction(s, {
        type: 'evaluate_plan',
        id: p.id,
        date: '2026-10-14',
        notes: 'Hasil observasi belum tersedia.',
        close: true,
      }),
    /masa depan/,
  );
});
test('Offline approved pest simulator is blocked without false success', () => {
  const s = createFixture(),
    p = s.plans[0];
  p.kind = 'simulator';
  p.status = 'approved';
  sch.setScenario(s, 'device_offline');
  applyAction(s, { type: 'start_plan', id: p.id });
  assert.equal(s.runs[0].status, 'Blocked');
  assert.equal(s.commands.length, 0);
});
test('Transition is immutable and errors do not mutate caller state', () => {
  const s = createFixture(),
    before = JSON.stringify(s);
  transition(s, { type: 'budget', period: '2026-09', amount: 5 });
  assert.equal(JSON.stringify(s), before);
  assert.throws(() => transition(s, { type: 'expense', record: expenseInput(s, { amount: -1 }) }));
  assert.equal(JSON.stringify(s), before);
});
