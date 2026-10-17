import { expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { createGreenhouseFixture } from '../src/data/greenhouses';
import { loadGuides, matchesTourRoute, tours } from '../src/features/guide/model';
import { workQueue } from '../src/features/overview/workQueue';
import { loadPreferences, workspaceDefaults } from '../src/store/workspace';
import { transition } from '../src/domain/actions';
import { production } from '../src/domain/production';

it('builds tours from the selected greenhouse without requiring fixture zone A or device IDs', () => {
  const s = createFixture();
  s.zones = s.zones.map((z, i) => ({ ...z, id: `Z${i + 1}` }));
  const setup = tours(s).find((t) => t.id === 'setup')!;
  expect(setup.steps.find((s) => s.id === 'targets')!.route).toContain('zone=Z1');
  for (const t of tours(s)) {
    expect(new Set(t.steps.map((s) => s.id)).size).toBe(t.steps.length);
    for (const step of t.steps)
      expect(step.route).toMatch(
        /^\/(ringkasan|greenhouse|settings|otomasi|siklus|hama|perangkat|biaya)/,
      );
  }
});
it('matches a tour step only on its actual section and allows additional user filters', () => {
  expect(
    matchesTourRoute(
      '/perangkat',
      new URLSearchParams('tab=supplies&supply=SUP-001'),
      '/perangkat?tab=supplies',
    ),
  ).toBe(true);
  expect(
    matchesTourRoute(
      '/perangkat',
      new URLSearchParams('tab=maintenance'),
      '/perangkat?tab=supplies',
    ),
  ).toBe(false);
  expect(
    matchesTourRoute('/biaya', new URLSearchParams('tab=supplies'), '/perangkat?tab=supplies'),
  ).toBe(false);
});
it('isolates malformed guide progress from profile and keeps progress scoped by member and greenhouse', () => {
  const p = workspaceDefaults();
  p.theme = 'dark';
  p.members[0].name = 'Aldi';
  const restored = loadPreferences(
    JSON.stringify({
      ...p,
      guides: {
        progress: {
          'member-owner:GH-01': {
            daily: { step: 'care', seen: ['priorities', 42, 'priorities'], finished: false },
          },
          'member-owner:GH-02': null,
          broken: [],
        },
        dismissed: ['member-owner:GH-01', 9],
      },
    }),
  );
  expect(restored.theme).toBe('dark');
  expect(restored.members[0].name).toBe('Aldi');
  expect(restored.guides?.progress['member-owner:GH-01']?.daily).toEqual({
    step: 'care',
    seen: ['priorities'],
    finished: false,
  });
  expect(restored.guides?.progress['member-owner:GH-02']).toBeUndefined();
  expect(restored.guides?.dismissed).toEqual(['member-owner:GH-01']);
  expect(loadGuides({ progress: [], dismissed: {} })).toEqual({ progress: {}, dismissed: [] });
});
it('derives work from active records, deduplicates offline devices with open tickets and never mutates state', () => {
  const s = createFixture(),
    before = JSON.stringify(s),
    items = workQueue(s);
  const ticket = s.maintenance.find((m) => m.status !== 'completed')!;
  expect(items.some((i) => i.id === `maintenance:${ticket.id}`)).toBe(true);
  expect(items.some((i) => i.id === `device:${ticket.deviceId}`)).toBe(false);
  expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
  expect(JSON.stringify(s)).toBe(before);
  const closed = structuredClone(s);
  closed.cases.forEach((c) => (c.status = 'closed'));
  closed.maintenance.forEach((m) => (m.status = 'completed'));
  closed.devices.forEach((d) => {
    d.connection = 'online';
    d.calibrated = true;
    d.maintenance = false;
  });
  expect(workQueue(closed)).toHaveLength(0);
});
it('opens the exact case in each greenhouse without an INS-024 or CAM-E-01 assumption', () => {
  const s = createGreenhouseFixture('GH-02');
  s.cases = [
    { ...s.cases[0], id: 'CUSTOM-CASE', zoneId: 'D', status: 'inspection', verified: false },
  ];
  const items = workQueue(s);
  expect(items.find((i) => i.id === 'case:CUSTOM-CASE')?.url).toBe('/hama?case=CUSTOM-CASE');
  expect(items.find((i) => i.id === 'case:CUSTOM-CASE')?.title).toContain('Zone D');
  expect(items.some((i) => i.url.includes('INS-024'))).toBe(false);
});
it('includes pending care, held harvest and overdue outstanding receipts using the demo clock', () => {
  let s = transition(createFixture(), { type: 'crop_sample' }).data;
  const p = production(s);
  p.tasks.push({
    id: 'CARE-X',
    zoneId: 'C',
    title: 'Cek akar',
    dueOn: '2026-10-12',
    operator: 'Aldi',
    status: 'pending',
    notes: '',
    key: 'care-x',
  });
  p.lots.push({ ...p.lots[0], id: 'LOT-X', status: 'held', key: 'lot-x' });
  p.sales[0].dueOn = '2026-10-12';
  const items = workQueue(s);
  expect(items.find((i) => i.id === 'care:CARE-X')?.url).toContain('task=CARE-X');
  expect(items.find((i) => i.id === 'care:CARE-X')?.label).toBe('Overdue');
  expect(items.find((i) => i.id === 'lot:LOT-X')).toBeTruthy();
  expect(items.find((i) => i.id === `sale:${p.sales[0].id}`)).toBeTruthy();
  p.tasks.at(-1)!.status = 'done';
  p.lots.at(-1)!.status = 'released';
  p.receipts.push({
    id: 'PAY-X',
    saleId: p.sales[0].id,
    date: '2026-10-13',
    amount: p.sales[0].kg * p.sales[0].price - p.receipts.reduce((n, r) => n + r.amount, 0),
    reference: 'Pelunasan demo',
    key: 'pay-x',
  });
  expect(
    workQueue(s).some((i) => ['care:CARE-X', 'lot:LOT-X', `sale:${p.sales[0].id}`].includes(i.id)),
  ).toBe(false);
});
it('keeps low stock and its restock ticket as one task rather than two', () => {
  let s = createFixture();
  s = transition(s, {
    type: 'supply_item',
    item: {
      name: 'Nutrisi A',
      unit: 'L',
      category: 'Nutrisi',
      reorderAt: 2,
      deviceId: 'DOSE-01',
      autoTask: true,
      operator: 'Aldi',
    },
  }).data;
  const item = s.supplies!.items[0];
  expect(s.maintenance.some((m) => m.supplyItemId === item.id)).toBe(true);
  expect(workQueue(s).some((i) => i.id === `supply:${item.id}`)).toBe(false);
});
