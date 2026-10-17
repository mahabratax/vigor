import { describe, expect, it } from 'vitest';
import { createDomainStore, DOMAIN_STORAGE_KEY } from '../src/store/store';
import {
  loadPreferences,
  reconcileGreenhouseAccess,
  workspaceDefaults,
} from '../src/store/workspace';
import { type GreenhouseActor, type GreenhouseDraft } from '../src/domain/greenhouses';
import { advanceInPlace } from '../src/domain/scheduler';
import { kpis, zoneStatus } from '../src/domain/selectors';

const owner: GreenhouseActor = { name: 'Aldi', role: 'Owner', greenhouseIds: ['GH-01', 'GH-02'] };
const draft: GreenhouseDraft = {
  name: 'Kebun Melati',
  location: 'Bandung',
  area: 120,
  plantedArea: 87.17,
  crop: 'Lettuce',
  plantedOn: '2026-10-13',
  plants: 125,
};
function storage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}
describe('greenhouse CRUD and data ownership', () => {
  it('creates an empty workspace, distributes area/plants exactly, persists selection and isolates changes', () => {
    const memory = storage(),
      store = createDomainStore(memory);
    const original = JSON.stringify(store.getState().greenhouses['GH-01']);
    const result = store.getState().createGreenhouse(draft, owner);
    expect(result).toMatchObject({ ok: true, id: 'GH-03' });
    store.getState().switchGreenhouse(result.id!);
    const s = store.getState().data;
    expect(s.zones.reduce((n, z) => n + z.area, 0)).toBeCloseTo(draft.plantedArea, 8);
    expect(s.zones.reduce((n, z) => n + z.plants, 0)).toBe(draft.plants);
    for (const key of [
      'devices',
      'expenses',
      'usages',
      'observations',
      'runs',
      'routines',
      'cases',
      'plans',
      'inspections',
      'allocations',
      'nutrientProfiles',
    ] as const)
      expect(s[key]).toEqual([]);
    expect(s.baseline).toBeNull();
    expect(s.production).toBeUndefined();
    expect(kpis(s).coverage).toBe(0);
    expect(zoneStatus(s, 'A').label).toBe('No camera registered');
    expect(store.getState().dispatch({ type: 'validate_zone', id: 'A' }).ok).toBe(false);
    expect(store.getState().dispatch({ type: 'reset' }).ok).toBe(false);
    store.getState().dispatch({ type: 'budget', period: '2026-10', amount: 125000 });
    const restored = createDomainStore(memory);
    expect(restored.getState().activeId).toBe('GH-03');
    expect(restored.getState().data.budgets[0].amount).toBe(125000);
    expect(JSON.stringify(restored.getState().greenhouses['GH-01'])).toBe(original);
    expect(restored.getState().data.storageWarning).toBeNull();
  });
  it('keeps device-to-expense links and plant counts through edit and reset', () => {
    const store = createDomainStore();
    const before = store.getState().data;
    const profile = { ...draft, name: 'Lokasi diperbarui', area: 400, plantedArea: 300 };
    expect(store.getState().editGreenhouse('GH-01', profile, owner).ok).toBe(true);
    const changed = store.getState().data;
    expect(changed.devices).toEqual(before.devices);
    expect(changed.expenses).toEqual(before.expenses);
    expect(changed.allocations).toEqual(before.allocations);
    expect(changed.zones.map((z) => z.plants)).toEqual(before.zones.map((z) => z.plants));
    expect(changed.zones.reduce((n, z) => n + z.area, 0)).toBeCloseTo(
      before.zones.reduce((n, z) => n + z.area, 0),
      8,
    );
    store.getState().dispatch({ type: 'reset' });
    expect(store.getState().data.greenhouse.name).toBe(profile.name);
    expect(store.getState().data.greenhouse.area).toBe(profile.area);
  });
  it('enforces role and greenhouse scope in mutations', () => {
    const store = createDomainStore();
    const manager = { ...owner, role: 'Manager' as const, greenhouseIds: ['GH-02'] };
    expect(store.getState().createGreenhouse(draft, manager).ok).toBe(false);
    expect(store.getState().editGreenhouse('GH-01', draft, manager).ok).toBe(false);
    expect(
      store.getState().editGreenhouse('GH-02', { ...draft, area: 1000, plantedArea: 800 }, manager)
        .ok,
    ).toBe(true);
    expect(store.getState().deleteGreenhouse('GH-02', draft.name, manager).ok).toBe(false);
    for (const role of ['Operator', 'Viewer'] as const)
      expect(store.getState().editGreenhouse('GH-02', draft, { ...manager, role }).ok).toBe(false);
  });
  it.each([
    { name: ' ' },
    { location: '' },
    { area: 0 },
    { area: NaN },
    { plantedArea: -1 },
    { plantedArea: 121 },
    { crop: '' },
    { plants: -1 },
    { plants: 1.5 },
    { plantedOn: '2026-02-31' },
  ])('rejects an invalid draft without partial creation: %j', (patch) => {
    const store = createDomainStore();
    expect(store.getState().createGreenhouse({ ...draft, ...patch }, owner).ok).toBe(false);
    expect(Object.keys(store.getState().greenhouses)).toHaveLength(2);
    expect(store.getState().nextGreenhouseNumber).toBe(3);
  });
  it('rejects duplicate names, including case and whitespace', () => {
    const store = createDomainStore();
    store.getState().createGreenhouse(draft, owner);
    expect(
      store.getState().createGreenhouse({ ...draft, name: '  KEBUN MELATI  ' }, owner).ok,
    ).toBe(false);
    expect(store.getState().editGreenhouse('GH-01', draft, owner).ok).toBe(false);
  });
  it('requires name confirmation, blocks active or uncertain processes and never deletes the last greenhouse', () => {
    const store = createDomainStore();
    const name = store.getState().data.greenhouse.name;
    expect(store.getState().deleteGreenhouse('GH-01', 'wrong', owner).ok).toBe(false);
    store.getState().dispatch({ type: 'play', value: true });
    expect(store.getState().deleteGreenhouse('GH-01', name, owner).ok).toBe(false);
    store.getState().dispatch({ type: 'play', value: false });
    advanceInPlace(
      store.getState().data,
      Date.parse('2026-10-13T10:00:30+07:00') / 1000 - store.getState().data.clock,
    );
    expect(store.getState().data.runs.length).toBeGreaterThan(0);
    expect(store.getState().deleteGreenhouse('GH-01', name, owner).ok).toBe(false);
    store.getState().data.runs[0].status = 'Needs reconciliation';
    expect(store.getState().deleteGreenhouse('GH-01', name, owner).ok).toBe(false);
    const other = store.getState().greenhouses['GH-02'];
    expect(store.getState().deleteGreenhouse('GH-02', other.greenhouse.name, owner).ok).toBe(true);
    expect(store.getState().deleteGreenhouse('GH-01', name, owner).message).toContain('last');
  });
  it('deletes an active workspace, preserves the other ledger, and never resurrects deleted seed IDs', () => {
    const memory = storage(),
      store = createDomainStore(memory);
    const otherExpenses = JSON.stringify(store.getState().greenhouses['GH-02'].expenses);
    expect(
      store.getState().deleteGreenhouse('GH-01', store.getState().data.greenhouse.name, owner).ok,
    ).toBe(true);
    const restored = createDomainStore(memory);
    expect(Object.keys(restored.getState().greenhouses)).toEqual(['GH-02']);
    expect(restored.getState().activeId).toBe('GH-02');
    expect(JSON.stringify(restored.getState().data.expenses)).toBe(otherExpenses);
    const created = restored.getState().createGreenhouse(draft, owner);
    expect(created.id).toBe('GH-03');
    restored.getState().deleteGreenhouse(created.id!, draft.name, owner);
    expect(createDomainStore(memory).getState().createGreenhouse(draft, owner).id).toBe('GH-04');
    expect(memory.getItem(DOMAIN_STORAGE_KEY)).not.toContain('"GH-01":');
  });
  it('syncs owners to new greenhouses, preserves scoped permissions on reload, and disables orphaned members', () => {
    const p = workspaceDefaults();
    p.members[1].greenhouseIds = ['GH-03'];
    const restored = loadPreferences(JSON.stringify(p), ['GH-01', 'GH-02', 'GH-03']);
    expect(restored.members[0].greenhouseIds).toEqual(['GH-01', 'GH-02', 'GH-03']);
    expect(restored.members[1].greenhouseIds).toEqual(['GH-03']);
    restored.memberId = restored.members[1].id;
    restored.readNotifications['member-owner:GH-03'] = ['old'];
    const next = reconcileGreenhouseAccess(restored, ['GH-01', 'GH-02']);
    expect(next.members[1]).toMatchObject({ active: false, greenhouseIds: [] });
    expect(next.members[2].greenhouseIds).toEqual(['GH-01']);
    expect(next.memberId).toBe('member-owner');
    expect(next.loggedIn).toBe(false);
    expect(next.readNotifications).toEqual({});
    expect(loadPreferences(JSON.stringify(next)).storageWarning).toBeNull();
  });
});
