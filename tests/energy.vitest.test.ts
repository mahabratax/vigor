import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { createFixture } from '../src/data/fixtures';
import { defaultEnergy, energyConfig, energyModel, validEnergy } from '../src/domain/energy';
import { hydrate } from '../src/domain/storage';
import { createDomainStore } from '../src/store/store';
import { actionPermission, can } from '../src/features/access/permissions';
import { normalizeQuery } from '../src/app/navigation';
import { serviceAssets, serviceLayout } from '../src/features/greenhouse/serviceModel';
import {
  boundsCorners,
  fitGreenhouseCamera,
  sceneBounds,
} from '../src/features/greenhouse/sceneGeometry';
import { greenhouseLayout } from '../src/features/greenhouse/spatialModel';

describe('solar planning and accounting boundaries', () => {
  it('conserves energy every hour and uses only simultaneous demand as savings', () => {
    const s = createFixture(),
      c = defaultEnergy(s),
      m = energyModel(s, c);
    for (const h of m.hours) {
      expect(h.used + h.grid).toBeCloseTo(h.demand, 10);
      expect(h.used + h.surplus).toBeCloseTo(h.solar, 10);
      expect(h.solar).toBeLessThanOrEqual(c.inverterKw);
      expect(h.used).toBeLessThanOrEqual(h.demand);
    }
    expect(m.day.solar).toBeCloseTo(m.capacity * c.sunHours * c.performanceRatio, 8);
    expect(m.grossSavings).toBeCloseTo(m.day.used * c.tariff * 30, 8);
    expect(m.paybackMonths).toBeNull();
    for (const id of ['EC-01', 'PH-01', 'LEVEL-01', 'FLOW-01', 'CTRL-01'])
      expect(m.loads.find((l) => l.device.id === id)?.hours).toBe(24);
    expect(m.loads.find((l) => l.device.id === 'PUMP-01')?.hours).toBe(1);
  });
  it('does not turn unused surplus or absent devices into income', () => {
    const s = createFixture();
    s.devices = [];
    const m = energyModel(s, { ...defaultEnergy(s), investment: 4000000 });
    expect(m.day.surplus).toBeCloseTo(m.day.solar);
    expect(m.coverage).toBeNull();
    expect(m.netSavings).toBe(0);
    expect(m.paybackMonths).toBeNull();
  });
  it('uses grid for loads at night and supports fractional runtimes crossing midnight', () => {
    const s = createFixture();
    s.devices = [s.devices[0]];
    s.devices[0].watts = 1000;
    const c = { ...defaultEnergy(s), loads: { [s.devices[0].id]: { hours: 2.5, start: 23 } } };
    const m = energyModel(s, c);
    expect(m.hours[23].demand).toBe(1);
    expect(m.hours[0].demand).toBe(1);
    expect(m.hours[1].demand).toBe(0.5);
    expect(m.day.used).toBe(0);
    expect(m.day.grid).toBe(2.5);
  });
  it('clips inverter output and reduces production for poor sun assumptions', () => {
    const s = createFixture(),
      c = { ...defaultEnergy(s), panelCount: 12, panelWatts: 700, inverterKw: 0.1 };
    const m = energyModel(s, c);
    expect(m.day.solar).toBeLessThanOrEqual(1.2 + 1e-9);
    expect(energyModel(s, { ...c, sunHours: 0 }).day.solar).toBe(0);
  });
  it('includes maintenance once, handles negative savings and disables all solar costs with the plan', () => {
    const s = createFixture(),
      c = { ...defaultEnergy(s), investment: 4000000, maintenanceMonthly: 1000000 };
    const m = energyModel(s, c, 90);
    expect(m.maintenance).toBe(3000000);
    expect(m.netSavings).toBeLessThan(0);
    expect(m.paybackMonths).toBeNull();
    const off = energyModel(s, { ...c, enabled: false });
    expect(off.day.used).toBe(0);
    expect(off.netSavings).toBe(0);
    expect(off.paybackMonths).toBeNull();
  });
  it('scales period costs without changing monthly payback assumptions', () => {
    const s = createFixture(),
      c = { ...defaultEnergy(s), investment: 4000000 };
    const a = energyModel(s, c, 30),
      b = energyModel(s, c, 90);
    expect(b.netSavings).toBeCloseTo(a.netSavings * 3);
    expect(b.paybackMonths).toBe(a.paybackMonths);
    expect(a.paybackMonths).toBeCloseTo(4000000 / a.netSavings);
  });
  it.each([
    { panelCount: 0 },
    { panelCount: 1.5 },
    { panelCount: 13 },
    { panelWatts: NaN },
    { sunHours: Infinity },
    { sunHours: -1 },
    { tariff: -1 },
    { investment: 0 },
    { investment: -2 },
    { performanceRatio: 1.1 },
    { maintenanceMonthly: -1 },
    { loads: { x: { hours: 25, start: 0 } } },
    { loads: { x: { hours: 3, start: 24 } } },
  ])('rejects invalid assumptions: %j', (patch) => {
    const store = createDomainStore(),
      before = JSON.stringify(store.getState().data);
    const config = { ...defaultEnergy(store.getState().data), ...patch };
    expect(validEnergy(config)).toBe(false);
    expect(store.getState().dispatch({ type: 'energy_save', config }).ok).toBe(false);
    expect(JSON.stringify(store.getState().data)).toBe(before);
  });
  it('persists separate scenarios while leaving runs, schedules, expenses and profit data untouched', () => {
    const memory = new Map<string, string>(),
      storage = {
        getItem: (k: string) => memory.get(k) ?? null,
        setItem: (k: string, v: string) => {
          memory.set(k, v);
        },
      };
    const store = createDomainStore(storage),
      before = store.getState().data;
    const config = { ...defaultEnergy(before), panelCount: 6, investment: 5000000 };
    expect(store.getState().dispatch({ type: 'energy_save', config }).ok).toBe(true);
    const after = store.getState().data;
    for (const k of [
      'devices',
      'routines',
      'expenses',
      'allocations',
      'production',
      'usages',
      'runs',
    ] as const)
      expect(after[k]).toEqual(before[k]);
    store.getState().switchGreenhouse('GH-02');
    expect(energyConfig(store.getState().data).panelCount).toBe(4);
    const restored = createDomainStore(storage);
    restored.getState().switchGreenhouse('GH-01');
    expect(energyConfig(restored.getState().data).panelCount).toBe(6);
    config.panelCount = 2;
    expect(energyConfig(restored.getState().data).panelCount).toBe(6);
  });
  it('recovers invalid stored solar data without losing greenhouse records', () => {
    const s = createFixture();
    s.energy = { ...defaultEnergy(s), sunHours: -5 };
    const restored = hydrate(JSON.stringify(s));
    expect(restored.energy).toBeUndefined();
    expect(restored.devices).toEqual(s.devices);
    expect(restored.expenses).toEqual(s.expenses);
    expect(restored.storageWarning).toContain('Energy');
  });
  it('respects finance roles and new deep links', () => {
    const permission = actionPermission({
      type: 'energy_save',
      config: defaultEnergy(createFixture()),
    })!;
    expect(can('Viewer', permission)).toBe(false);
    expect(can('Operator', permission)).toBe(false);
    expect(can('Manager', permission)).toBe(true);
    expect(normalizeQuery('/greenhouse', 'tab=energy')).toBe('tab=energy');
    expect(normalizeQuery('/biaya', 'tab=energy')).toBe('tab=energy');
  });
});
describe('service assets and scene footprint', () => {
  it('only presents registered hardware and labels planned solar separately', () => {
    const s = createFixture();
    const assets = serviceAssets(s);
    expect(assets.map((a) => a.id)).toEqual([
      'solar',
      'water',
      'nutrition',
      'climate',
      'controller',
    ]);
    expect(assets[0].status).toBe('Sample plan');
    expect(assets[0].deviceIds).toEqual([]);
    expect(assets.find((a) => a.id === 'water')?.value).toContain('72%');
    s.scenario = 'low_tank';
    expect(serviceAssets(s).find((a) => a.id === 'water')?.status).toContain('Low water');
    expect(serviceAssets(s).find((a) => a.id === 'water')?.value).toContain('8%');
    s.devices.find((d) => d.id === 'LEVEL-01')!.connection = 'offline';
    expect(serviceAssets(s).find((a) => a.id === 'water')?.value).toContain('unavailable');
    s.devices.find((d) => d.id === 'PUMP-01')!.active = false;
    expect(serviceAssets(s).some((a) => a.id === 'water')).toBe(false);
    s.profile = 'monitoring';
    expect(serviceAssets(s).map((a) => a.id)).toEqual(['solar']);
    s.greenhouse.source = 'custom';
    expect(serviceAssets(s)).toEqual([]);
  });
  it.each([390, 768, 1280, 1440])(
    'fits the full service area at %s px in top/isometric modes',
    (width) => {
      for (const count of [1, 6, 32])
        for (const mode of ['top', 'isometric'] as const) {
          const l = greenhouseLayout(count),
            service = serviceLayout(l),
            bounds = sceneBounds(l, true),
            camera = new THREE.OrthographicCamera();
          expect(bounds.max.x).toBeGreaterThan(service.x + service.width / 2);
          expect(bounds.max.z).toBeGreaterThan(service.depth / 2);
          fitGreenhouseCamera(camera, l, width, 440, mode, true);
          for (const corner of boundsCorners(bounds)) {
            const p = corner.project(camera);
            expect(Math.abs(p.x)).toBeLessThan(1);
            expect(Math.abs(p.y)).toBeLessThan(1);
            expect(Math.abs(p.z)).toBeLessThan(1);
          }
        }
    },
  );
});
