import { describe, expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import { transition, type Action } from '../src/domain/actions';
import { emptyGreenhouse, updateGreenhouseProfile } from '../src/domain/greenhouses';
import {
  activeBatch,
  cultivation,
  initializeCultivation,
  zoneDeleteBlocker,
  zoneInactiveBlocker,
} from '../src/domain/zones';
import { validateExpense } from '../src/domain/costs';
import { relatedUrl } from '../src/features/history/presentation';
import { hydrate } from '../src/domain/storage';
import { productionSummary, closingIssues } from '../src/domain/production';
import { sensorValue, validateRoutine } from '../src/domain/scheduler';
import { actionPermission, can } from '../src/features/access/permissions';
import type { DomainState } from '../src/domain/types';
import type { BatchDraft, ZoneDraft } from '../src/domain/zoneTypes';
const day = '2026-10-13';
const run = (s: DomainState, a: Action) => transition(s, a).data;
const zone: ZoneDraft = {
  name: 'Selada timur',
  area: 50,
  capacity: 100,
  beds: 4,
  method: 'Hidroponik',
  notes: 'Meja dekat pintu timur.',
};
const batch: BatchDraft = {
  crop: 'Lettuce',
  variety: 'Romaine',
  plantedOn: day,
  targetHarvestOn: '2026-11-20',
  stage: 'Vegetatif',
  seedSource: 'Lot benih S01',
  notes: '',
};
function empty() {
  return emptyGreenhouse('GH-03', {
    name: 'Kebun baru',
    location: 'Bandung',
    area: 400,
    plantedArea: 300,
    crop: 'Lettuce',
    plants: 0,
    plantedOn: day,
  });
}
function planted() {
  let s = run(empty(), { type: 'zone_save', id: 'A', zone });
  return run(s, { type: 'planting_save', zoneId: 'A', batch, plants: 80 });
}
const harvest: Action = {
  type: 'crop_harvest',
  lot: {
    zoneId: 'A',
    date: day,
    grossKg: 10,
    aKg: 7,
    bKg: 2,
    rejectedKg: 1,
    operator: 'Aldi',
    notes: 'Hasil timbang dan sortasi batch Selada.',
    key: 'selada-lot-1',
  },
};

describe('zone configuration and persistence', () => {
  it('migrates existing populations without inventing varieties or harvest', () => {
    const s = createFixture(),
      c = cultivation(s);
    expect(c.batches).toHaveLength(6);
    expect(c.batches[0]).toMatchObject({
      crop: 'Red bell pepper',
      variety: '',
      initialPlants: 72,
      currentPlants: 72,
    });
    expect(s.cultivation).toBeUndefined();
    expect(productionSummary(s).harvest).toBe(0);
  });
  it('adds and removes empty zones with stable IDs, supports one zone and restores all data', () => {
    let s = empty();
    for (const id of ['B', 'C', 'D', 'E', 'F'])
      s = run(s, { type: 'zone_delete', id, confirmation: `Zone ${id}` });
    expect(zoneDeleteBlocker(s, 'A')).toContain('at least one');
    s = run(s, { type: 'zone_save', zone });
    expect(s.zones[1].id).toBe('G');
    s = run(s, { type: 'zone_delete', id: 'G', confirmation: zone.name });
    s = run(s, { type: 'zone_save', zone });
    expect(s.zones[1].id).toBe('H');
    expect(hydrate(JSON.stringify(s)).zones).toEqual(s.zones);
    expect(hydrate(JSON.stringify(s)).cultivation).toEqual(s.cultivation);
  });
  it('rejects area over-allocation, duplicate names, and shrinking below active plant counts without partial edits', () => {
    const s = planted(),
      original = JSON.stringify(s);
    expect(() =>
      run(s, { type: 'zone_save', zone: { ...zone, name: 'Lainnya', area: 1 } }),
    ).toThrow('exceed');
    expect(() => run(s, { type: 'zone_save', zone: { ...zone, area: 0, capacity: 0 } })).toThrow(
      'already exists',
    );
    expect(() => run(s, { type: 'zone_save', id: 'A', zone: { ...zone, capacity: 79 } })).toThrow(
      'active plant count',
    );
    expect(() => updateGreenhouseProfile(s, { ...s.greenhouse, plantedArea: 290 })).toThrow(
      'allocated zones',
    );
    expect(JSON.stringify(s)).toBe(original);
  });
  it('preserves zone allocation when greenhouse area changes', () => {
    const s = planted();
    expect(
      updateGreenhouseProfile(s, { ...s.greenhouse, area: 500, plantedArea: 400 }).zones,
    ).toEqual(s.zones);
  });
  it('retains zones with records and blocks inactive zones in automation', () => {
    let s = planted();
    expect(zoneDeleteBlocker(s, 'A')).toContain('history');
    expect(zoneInactiveBlocker(s, 'A')).toContain('batch');
    s = run(s, { type: 'zone_status', id: 'B', inactive: true });
    expect(() => run(s, { type: 'planting_save', zoneId: 'B', batch, plants: 1 })).toThrow(
      'Activate',
    );
    const routine = createFixture().routines[0];
    routine.version.zones = ['B'];
    expect(validateRoutine(s, routine).join(' ')).toContain('active zones');
  });
});

describe('plant batches connected to production', () => {
  it('tracks additions, mortality and removals separately from harvest, idempotently', () => {
    let s = planted();
    const id = activeBatch(s, 'A')!.id;
    const loss: Action = {
      type: 'planting_count',
      id,
      kind: 'loss',
      quantity: 5,
      reason: 'Bibit gagal tumbuh setelah pindah tanam.',
      key: 'loss-1',
      actor: 'Aldi',
    };
    s = run(s, loss);
    s = run(s, loss);
    expect(s.cycle.plants).toBe(75);
    expect(s.zones[0].plants).toBe(75);
    expect(s.cultivation!.movements).toHaveLength(1);
    expect(s.cultivation!.movements[0].actor).toBe('Aldi');
    expect(() => run(s, { ...loss, key: 'loss-2', quantity: 76 })).toThrow('Final count');
    expect(() => run(s, { ...loss, kind: 'add', key: 'add-1', quantity: 26 })).toThrow(
      'Final count',
    );
    s = run(s, harvest);
    expect(s.cycle.plants).toBe(75);
    expect(productionSummary(s).stock).toBe(9);
    expect(s.production!.lots[0]).toMatchObject({
      plantingId: id,
      crop: 'Lettuce',
      variety: 'Romaine',
      status: 'held',
    });
    expect(s.expenses).toEqual([]);
    expect(hydrate(JSON.stringify(s)).cultivation).toEqual(s.cultivation);
  });
  it('links care to the batch, blocks unfinished work, and retains old crop identity when replanting', () => {
    let s = planted();
    const id = activeBatch(s, 'A')!.id;
    s = run(s, {
      type: 'crop_task',
      task: {
        zoneId: 'A',
        title: 'Bersihkan meja tanam',
        dueOn: day,
        operator: 'Aldi',
        key: 'care-selada',
      },
    });
    expect(s.production!.tasks[0].plantingId).toBe(id);
    s = run(s, harvest);
    expect(() =>
      run(s, {
        type: 'planting_save',
        id,
        zoneId: 'A',
        batch: { ...batch, crop: 'Tomat' },
        plants: 0,
      }),
    ).toThrow('Crop identity');
    expect(() => run(s, { type: 'planting_close', id, notes: 'Pekerjaan selesai semua.' })).toThrow(
      'population reaches zero',
    );
    s = run(s, {
      type: 'planting_count',
      id,
      kind: 'remove',
      quantity: 80,
      reason: 'Seluruh tanaman dicabut sesudah panen.',
      key: 'remove-1',
    });
    expect(() => run(s, { type: 'planting_close', id, notes: 'Pekerjaan selesai semua.' })).toThrow(
      'care',
    );
    s = run(s, {
      type: 'crop_task_done',
      id: s.production!.tasks[0].id,
      notes: 'Meja dan tanaman sudah dibersihkan.',
    });
    s = run(s, { type: 'planting_close', id, notes: 'Batch selesai. Meja siap tanam berikutnya.' });
    s = run(s, harvest); // duplicate submission remains idempotent after the batch closes
    expect(s.production!.lots).toHaveLength(1);
    s = run(s, {
      type: 'planting_save',
      zoneId: 'A',
      batch: { ...batch, crop: 'Pakcoy', variety: 'Nauli' },
      plants: 60,
    });
    expect(activeBatch(s, 'A')!.id).not.toBe(id);
    expect(s.production!.lots[0]).toMatchObject({
      plantingId: id,
      crop: 'Lettuce',
      variety: 'Romaine',
    });
    expect(s.production!.tasks[0].plantingId).toBe(id);
    expect(s.cycle.crop).toBe('Pakcoy');
    expect(s.cycle.plants).toBe(60);
    expect(zoneDeleteBlocker(s, 'A')).toContain('history');
  });
  it('migrates legacy harvest metadata before changing crop identity', () => {
    let s = run(createFixture(), { ...harvest, lot: { ...harvest.lot, zoneId: 'D' } });
    delete s.production!.lots[0].plantingId;
    delete s.production!.lots[0].crop;
    delete s.production!.lots[0].variety;
    initializeCultivation(s);
    expect(s.production!.lots[0].plantingId).toBe(activeBatch(s, 'D')!.id);
    expect(s.production!.lots[0].crop).toBe('Red bell pepper');
    expect(() =>
      run(s, { type: 'planting_save', id: activeBatch(s, 'D')!.id, zoneId: 'D', batch, plants: 0 }),
    ).toThrow('Crop identity');
  });
  it('rejects stale batch forms and dates before planting', () => {
    const s = planted();
    expect(() => run(s, { ...harvest, lot: { ...harvest.lot, plantingId: 'old-batch' } })).toThrow(
      'changed',
    );
    expect(() => run(s, { type: 'planting_save', zoneId: 'A', batch, plants: 1 })).toThrow(
      'active batch',
    );
    expect(() =>
      run(s, {
        type: 'planting_save',
        id: activeBatch(s, 'A')!.id,
        zoneId: 'A',
        batch: { ...batch, plantedOn: '2026-10-14' },
        plants: 80,
      }),
    ).toThrow('in the future');
  });
  it('requires completing active batches before financial cycle closure', () => {
    const s = planted();
    expect(closingIssues(s).join(' ')).toContain('Close planting batch');
  });
  it('retains crop source through review, sale and profit with no invented savings', () => {
    let s = run(planted(), harvest);
    const lotId = s.production!.lots[0].id;
    s = run(s, { type: 'crop_release', id: lotId, notes: 'Sortasi dan mutu telah diperiksa.' });
    s = run(s, {
      type: 'crop_sale',
      sale: {
        lotId,
        grade: 'A',
        kg: 5,
        price: 20000,
        date: day,
        dueOn: day,
        buyer: 'Koperasi sayur',
        key: 'sale-1',
      },
    });
    expect(productionSummary(s).revenue).toBe(100000);
    expect(productionSummary(s).stock).toBe(4);
    expect(productionSummary(s).reviewed).toBe(false);
    expect(s.production!.sales[0].lotId).toBe(lotId);
    expect(s.production!.lots[0].plantingId).toBe(activeBatch(s, 'A')!.id);
  });
});

describe('zone devices and permissions', () => {
  it('moves observation devices without changing historical expenses and requires revalidation', () => {
    const s = createFixture();
    const expense = structuredClone(s.expenses);
    const ids = s.devices.filter((d) => d.zones.includes('D')).map((d) => d.id);
    const next = run(s, { type: 'zone_devices', id: 'D', deviceIds: [...ids, 'CAM-A-01'] });
    expect(next.devices.find((d) => d.id === 'CAM-A-01')).toMatchObject({
      zones: ['D'],
      calibrated: false,
    });
    expect(next.zones.find((z) => z.id === 'A')!.validated).toBe(false);
    expect(next.expenses).toEqual(expense);
    expect(next.allocations).toEqual(s.allocations);
    expect(sensorValue(next, 'TH-D-01')).toBe(28.1);
  });
  it('blocks moving a routine-bound actuator', () => {
    const s = createFixture();
    expect(() => run(s, { type: 'zone_devices', id: 'A', deviceIds: [] })).toThrow('routine');
    expect(s.devices.find((d) => d.id === 'CAM-A-01')!.zones).toEqual(['A']);
  });
  it('separates configuration, crop review and daily population permissions', () => {
    expect(actionPermission({ type: 'zone_save', zone })).toBe('greenhouse_edit');
    expect(actionPermission({ type: 'planting_save', zoneId: 'A', batch, plants: 10 })).toBe(
      'crop_review',
    );
    expect(
      actionPermission({
        type: 'planting_count',
        id: 'BATCH-1',
        kind: 'loss',
        quantity: 1,
        reason: 'Test reason',
        key: 'test',
      }),
    ).toBe('cultivation');
    expect(can('Viewer', 'cultivation')).toBe(false);
    expect(can('Operator', 'crop_review')).toBe(false);
    expect(can('Operator', 'cultivation')).toBe(true);
    expect(can('Manager', 'greenhouse_edit')).toBe(true);
  });
});

it('keeps historical device expenses editable after relocation but rejects a new mismatched expense', () => {
  const s = createFixture();
  const expense = {
    ...s.expenses[0],
    id: 'EXP-900',
    deviceId: 'CAM-A-01',
    zoneId: 'A',
    submissionKey: 'historical-camera',
  };
  s.expenses.push(expense);
  const next = run(s, {
    type: 'zone_devices',
    id: 'D',
    deviceIds: [...s.devices.filter((d) => d.zones.includes('D')).map((d) => d.id), 'CAM-A-01'],
  });
  expect(
    validateExpense(next, { ...expense, note: 'Koreksi catatan historis' }, expense.id),
  ).not.toContain('Zone and device do not match.');
  expect(
    validateExpense(next, { ...expense, id: 'EXP-901', submissionKey: 'new-camera' }),
  ).toContain('Zone and device do not match.');
  expect(relatedUrl('BATCH-001', 'G')).toBe('/greenhouse?tab=zones&panel=activity&zone=G');
});
