import { describe, expect, it } from 'vitest';
import { createDomainStore, DOMAIN_STORAGE_KEY } from '../src/store/store';
import { createGreenhouseFixture } from '../src/data/greenhouses';
import {
  currentMember,
  effectiveRole,
  loadPreferences,
  workspaceDefaults,
} from '../src/store/workspace';
import { costSummary } from '../src/domain/costs';
import { advanceInPlace } from '../src/domain/scheduler';
import { actionPermission, can, modalPermission } from '../src/features/access/permissions';
import { notificationsFor } from '../src/features/workspace/notifications';

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
  };
}
describe('independent greenhouse workspaces', () => {
  it('persists each ledger and selection, pauses switches, and restores device links', () => {
    const storage = memoryStorage(),
      store = createDomainStore(storage);
    store.getState().dispatch({ type: 'budget', period: '2026-09', amount: 1600000 });
    store.getState().dispatch({ type: 'play', value: true });
    store.getState().switchGreenhouse('GH-02');
    expect(store.getState().greenhouses['GH-01'].playing).toBe(false);
    expect(costSummary(store.getState().data, { period: '2026-09' }).operating).toBe(864000);
    expect(
      costSummary(store.getState().data, { period: '2026-09', deviceId: 'PUMP-01' }).total,
    ).toBe(68400);
    store.getState().dispatch({ type: 'budget', period: '2026-09', amount: 900000 });
    const restored = createDomainStore(storage);
    expect(restored.getState().activeId).toBe('GH-02');
    expect(costSummary(restored.getState().data, { period: '2026-09' }).budget).toBe(900000);
    restored.getState().switchGreenhouse('GH-01');
    expect(costSummary(restored.getState().data, { period: '2026-09' }).budget).toBe(1600000);
    expect(
      costSummary(restored.getState().data, { period: '2026-09', deviceId: 'PUMP-01' }).total,
    ).toBe(85500);
  });
  it('migrates the existing single-greenhouse record without discarding user changes', () => {
    const storage = memoryStorage(),
      original = createGreenhouseFixture('GH-01');
    original.cases[0].assignedTo = 'Petugas lama';
    storage.setItem('vigor-demo-v3', JSON.stringify(original));
    const store = createDomainStore(storage);
    expect(store.getState().data.cases[0].assignedTo).toBe('Petugas lama');
    store.getState().switchGreenhouse('GH-02');
    expect(store.getState().data.greenhouse.id).toBe('GH-02');
    expect(storage.getItem(DOMAIN_STORAGE_KEY)).toContain('Petugas lama');
  });
  it('resets only the selected greenhouse to its own fixture', () => {
    const store = createDomainStore();
    store.getState().dispatch({ type: 'assign', caseId: 'INS-024', operator: 'Aldi' });
    store.getState().switchGreenhouse('GH-02');
    store.getState().dispatch({ type: 'budget', period: '2026-09', amount: 50 });
    store.getState().dispatch({ type: 'reset' });
    expect(store.getState().data.greenhouse.location).toBe('Ciawi Farm');
    expect(costSummary(store.getState().data, { period: '2026-09' }).budget).toBe(960000);
    expect(
      store.getState().greenhouses['GH-01'].cases.find((c) => c.id === 'INS-024')?.assignedTo,
    ).toBe('Aldi');
  });
  it('reconciles interrupted runs in both greenhouse records on reload', () => {
    const storage = memoryStorage();
    const first = createGreenhouseFixture('GH-01'),
      second = createGreenhouseFixture('GH-02');
    for (const s of [first, second]) {
      advanceInPlace(s, Date.parse('2026-10-13T10:00:30+07:00') / 1000 - s.clock);
      s.playing = true;
    }
    storage.setItem(
      DOMAIN_STORAGE_KEY,
      JSON.stringify({ activeId: 'GH-02', greenhouses: { 'GH-01': first, 'GH-02': second } }),
    );
    const restored = createDomainStore(storage);
    for (const s of Object.values(restored.getState().greenhouses)) {
      expect(s.playing).toBe(false);
      expect(s.runs[0].status).toBe('Needs reconciliation');
    }
  });
  it('keeps changes usable and reports a browser storage failure', () => {
    const store = createDomainStore({
      getItem: () => null,
      setItem: () => {
        throw new Error('quota');
      },
    });
    store.getState().switchGreenhouse('GH-02');
    expect(store.getState().data.greenhouse.id).toBe('GH-02');
    expect(store.getState().data.storageWarning).toContain('this session');
  });
});

describe('account and permission preferences', () => {
  it('restores personal preferences without persisting a temporary role preview', () => {
    const p = workspaceDefaults();
    Object.assign(p, { theme: 'dark', collapsed: true, previewRole: 'Viewer' });
    p.readNotifications['member-owner:GH-01'] = ['device:CAM-E-01:offline:false'];
    const restored = loadPreferences(JSON.stringify(p));
    expect(restored).toMatchObject({
      theme: 'dark',
      collapsed: true,
      previewRole: null,
      loggedIn: true,
    });
    expect(restored.readNotifications).toEqual(p.readNotifications);
    expect(effectiveRole(restored)).toBe('Owner');
  });
  it('handles invalid records and inactive sessions instead of granting an unknown role', () => {
    expect(loadPreferences('{broken').storageWarning).toBeTruthy();
    const p = workspaceDefaults();
    p.memberId = 'member-operator';
    p.members.find((m) => m.id === p.memberId)!.active = false;
    const restored = loadPreferences(JSON.stringify(p));
    expect(restored.loggedIn).toBe(false);
    expect(currentMember(restored).role).toBe('Owner');
    p.members[1].greenhouseIds = ['GH-unknown'] as never;
    expect(loadPreferences(JSON.stringify(p)).storageWarning).toBeTruthy();
  });
  it('separates operations from finance and team management', () => {
    expect(can('Operator', 'run')).toBe(true);
    expect(can('Operator', 'finance')).toBe(false);
    expect(can('Manager', 'team')).toBe(false);
    expect(can('Viewer', actionPermission({ type: 'speed', value: 10 })!)).toBe(false);
    expect(modalPermission('activate-routine')).toBe('automation');
    expect(actionPermission({ type: 'maintenance', paid: true, amount: 50000 } as never)).toBe(
      'finance',
    );
    expect(actionPermission({ type: 'maintenance', paid: false } as never)).toBe('maintenance');
  });
});

it('derives actionable notifications from the active greenhouse, including draft expenses', () => {
  const first = createGreenhouseFixture('GH-01'),
    second = createGreenhouseFixture('GH-02');
  expect(notificationsFor(first).some((n) => n.url.includes('CAM-E-01'))).toBe(true);
  expect(notificationsFor(second).some((n) => n.kind === 'device')).toBe(false);
  second.expenses[0].status = 'draft';
  const notice = notificationsFor(second).find((n) => n.kind === 'expense')!;
  expect(notice.url).toContain('status=draft');
  expect(notice.url).toContain(`expense=${second.expenses[0].id}`);
});
