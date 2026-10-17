// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import App from '../src/app/App';
import { store } from '../src/store/store';
import { transition } from '../src/domain/actions';
import { localDate, monthLabel } from '../src/domain/format';
import { createFixture } from '../src/data/fixtures';
import { createGreenhouseFixture } from '../src/data/greenhouses';
import {
  loadPreferences,
  workspaceDefaults,
  workspaceStore,
  WORKSPACE_STORAGE_KEY,
} from '../src/store/workspace';
import { boundedPage, normalizeQuery } from '../src/app/navigation';
import { scopeFrom } from '../src/features/costs/Costs';
vi.mock('../src/store/persistence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/store/persistence')>();
  const transport = await import('./support/domain-transport');
  return { ...actual, ...transport };
});
vi.mock('../src/features/greenhouse/Scene', () => ({
  default: () =>
    React.createElement('div', { 'data-testid': 'scene-stub' }, 'WebGL excluded from DOM tests'),
}));
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  Object.defineProperty(window, 'innerWidth', { value: 390, writable: true, configurable: true });
  window.scrollTo = vi.fn();
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  window.localStorage.clear();
  workspaceStore.setState({ preferences: workspaceDefaults() });
  const first = createFixture();
  store.setState({
    activeId: 'GH-01',
    nextGreenhouseNumber: 3,
    data: first,
    greenhouses: { 'GH-01': first, 'GH-02': createGreenhouseFixture('GH-02') },
  });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
async function mount(path: string, width = 390) {
  window.innerWidth = width;
  window.history.replaceState({}, '', '/#' + path);
  await act(async () => root.render(React.createElement(App)));
}
async function click(text: string, scope: ParentNode = host) {
  const button = Array.from(scope.querySelectorAll<HTMLElement>('button,a')).find(
    (b) => b.textContent?.trim() === text,
  );
  expect(button, `control ${text}`).toBeTruthy();
  await act(async () => button!.click());
}
async function go(path: string) {
  await act(async () => {
    window.location.hash = path;
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}
it.each([390, 768, 1280, 1440])(
  'completes greenhouse CRUD through the actual forms at %s (DOM only)',
  async (width) => {
    await mount('/greenhouse?tab=manage', width);
    expect(host.querySelectorAll('.greenhouse-register-row')).toHaveLength(2);
    await click('Add greenhouse');
    let dialog = host.querySelector('dialog')!;
    for (const [name, value] of Object.entries({
      name: 'Kebun Melati',
      location: 'Bandung',
      area: '120',
      plantedArea: '90',
      crop: 'Lettuce',
    }))
      await fill(dialog.querySelector<HTMLInputElement>(`[name="${name}"]`)!, value);
    await click('Add greenhouse', dialog);
    expect(store.getState().activeId).toBe('GH-03');
    expect(store.getState().data.devices).toHaveLength(0);
    expect(host.querySelectorAll('.greenhouse-register-row')).toHaveLength(3);
    expect(workspaceStore.getState().preferences.members[0].greenhouseIds).toContain('GH-03');
    await press('[aria-label="Edit Kebun Melati"]');
    dialog = host.querySelector('dialog')!;
    await fill(dialog.querySelector<HTMLInputElement>('[name="name"]')!, 'Melati Utara');
    await click('Save changes', dialog);
    expect(host.querySelector('.breadcrumb')?.textContent).toContain('Melati Utara');
    await press('.breadcrumb button');
    expect(host.querySelectorAll('.greenhouse-option')).toHaveLength(3);
    expect(host.querySelector('dialog')?.textContent).toContain('Melati Utara');
    await click('Manage greenhouses', host.querySelector('dialog')!);
    expect(host.querySelector('dialog[open]')).toBeNull();
    await press('[aria-label="Delete Melati Utara"]');
    dialog = host.querySelector('dialog')!;
    expect(dialog.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled).toBe(true);
    await fill(dialog.querySelector<HTMLInputElement>('[name="confirmation"]')!, 'wrong');
    expect(dialog.querySelector<HTMLButtonElement>('[type="submit"]')!.disabled).toBe(true);
    await click('Cancel', dialog);
    expect(store.getState().greenhouses['GH-03']).toBeTruthy();
    await press('[aria-label="Delete Melati Utara"]');
    dialog = host.querySelector('dialog')!;
    await fill(dialog.querySelector<HTMLInputElement>('[name="confirmation"]')!, 'Melati Utara');
    await click('Delete greenhouse', dialog);
    expect(store.getState().greenhouses['GH-03']).toBeUndefined();
    expect(store.getState().activeId).toBe('GH-01');
    expect(host.querySelectorAll('.greenhouse-register-row')).toHaveLength(2);
    expect(workspaceStore.getState().preferences.members[0].greenhouseIds).not.toContain('GH-03');
  },
);
it('renders all work areas in a newly created greenhouse without fabricated history or an undefined-record crash', async () => {
  const result = store.getState().createGreenhouse(
    {
      name: 'Kebun Baru',
      location: 'Bandung',
      area: 100,
      plantedArea: 80,
      crop: 'Lettuce',
      plants: 0,
      plantedOn: '2026-10-13',
    },
    { name: 'Budi', role: 'Owner', greenhouseIds: ['GH-01', 'GH-02'] },
  );
  const p = workspaceDefaults();
  p.members[0].greenhouseIds.push(result.id!);
  workspaceStore.setState({ preferences: p });
  store.getState().switchGreenhouse(result.id!);
  await mount('/greenhouse?view=2d', 1280);
  expect(host.textContent).toContain('Greenhouse ready for setup');
  expect(host.querySelectorAll('.map-zone ellipse')).toHaveLength(0);
  for (const path of [
    '/ringkasan',
    '/hama',
    '/hama?tab=detection',
    '/pengendalian',
    '/pengendalian?tab=simulator',
    '/siklus',
    '/siklus?tab=harvest',
    '/siklus?tab=sales',
    '/otomasi',
    '/otomasi?tab=routines',
    '/otomasi?tab=executions',
    '/otomasi?tab=nutrition',
    '/otomasi?tab=builder',
    '/perangkat',
    '/perangkat?tab=cameras',
    '/perangkat?tab=maintenance',
    '/riwayat',
    '/biaya',
    '/biaya?tab=expenses',
    '/biaya?tab=savings',
    '/biaya?tab=profit',
    '/akses',
    '/settings',
  ]) {
    await go(path);
    expect(host.querySelector('h1'), path).toBeTruthy();
    expect(host.textContent, path).not.toContain('Terjadi kesalahan');
  }
  await go('/otomasi?tab=builder');
  await click('Save draft');
  expect(store.getState().data.routines).toHaveLength(1);
  expect(store.getState().data.routines[0]).toMatchObject({
    kind: 'preventive',
    policy: 'task',
    status: 'Draft',
  });
  expect(store.getState().data.expenses).toHaveLength(0);
  expect(store.getState().data.cases).toHaveLength(0);
  await go('/ringkasan');
  expect(host.textContent).not.toContain('Pulihkan kamera Zone E');
  expect(host.textContent).not.toContain('Periksa tanaman di Zona B');
});
it('exposes scoped greenhouse edits to Manager and read-only details to Viewer', async () => {
  const p = workspaceDefaults();
  p.memberId = 'member-manager';
  p.members[1].greenhouseIds = ['GH-02'];
  workspaceStore.setState({ preferences: p });
  store.getState().switchGreenhouse('GH-02');
  await mount('/greenhouse?tab=manage', 1280);
  expect(host.querySelectorAll('.greenhouse-register-row')).toHaveLength(1);
  expect(host.querySelector('[aria-label^="Edit "]')).toBeTruthy();
  expect(host.querySelector('[aria-label^="Delete "]')).toBeNull();
  expect(host.textContent).not.toContain('Add greenhouse');
  await act(async () => workspaceStore.getState().update({ memberId: 'member-viewer' }));
  expect(host.querySelector('[aria-label^="Edit "]')).toBeNull();
  expect(host.querySelector('[aria-label^="Open "]')).toBeTruthy();
});
it('opens the account popup from a collapsed rail, contains keyboard focus and moves Vigor guide Vigor into it', async () => {
  await mount('/ringkasan', 1280);
  await press('.sidebar-toggle');
  await press('.account-menu-trigger');
  let popup = document.querySelector('.account-popup')!;
  expect(popup.textContent).toContain('budi@vigor.example');
  expect(popup.textContent).toContain('My profile');
  expect(host.querySelector('.sidebar')?.textContent).not.toContain('Vigor guide');
  const buttons = popup.querySelectorAll<HTMLButtonElement>('button');
  expect(document.activeElement).toBe(buttons[0]);
  await act(async () =>
    buttons[0].dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true }),
    ),
  );
  expect(document.activeElement).toBe(buttons[buttons.length - 1]);
  await act(async () =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  );
  expect(document.querySelector('.account-popup')).toBeNull();
  expect(document.activeElement).toBe(host.querySelector('.account-menu-trigger'));
  await press('.account-menu-trigger');
  await click('Vigor guide', document.querySelector('.account-popup')!);
  expect(document.querySelector('.account-popup')).toBeNull();
  expect(host.querySelector('dialog[open]')?.textContent).toContain('Vigor guide');
  await press('dialog button[aria-label="Close"]');
  await press('.account-menu-trigger');
  await click('My profile', document.querySelector('.account-popup')!);
  expect(window.location.hash).toContain('/settings?tab=profile');
  await press('.account-menu-trigger');
  await act(async () => document.body.dispatchEvent(new Event('pointerdown', { bubbles: true })));
  expect(document.querySelector('.account-popup')).toBeNull();
});
it('closes only the account popup on Escape before closing the mobile drawer', async () => {
  await mount('/ringkasan', 390);
  await press('.sidebar-toggle');
  await press('.account-menu-trigger');
  await act(async () =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  );
  expect(document.querySelector('.account-popup')).toBeNull();
  expect(host.querySelector('.sidebar.open')).toBeTruthy();
  await act(async () =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  );
  expect(host.querySelector('.sidebar.open')).toBeNull();
});
it.each([390, 768, 1280, 1440])(
  'routes all eleven actual pages at width %s (DOM only)',
  async (width) => {
    await mount('/ringkasan', width);
    for (const [path, title] of [
      ['/greenhouse?view=2d', 'Greenhouse'],
      ['/hama', 'Pests & inspections'],
      ['/pengendalian', 'Pest management'],
      ['/siklus', 'Crop cycle'],
      ['/otomasi', 'Automation'],
      ['/perangkat', 'Devices'],
      ['/riwayat', 'Activity & reports'],
      ['/biaya', 'Costs & savings'],
      ['/akses', 'Roles & permissions'],
      ['/settings', 'Settings'],
      ['/ringkasan', 'Dashboard'],
    ]) {
      await go(path);
      expect(host.querySelector('h1')?.textContent).toBe(title);
      if (path === '/settings')
        expect(host.querySelector('.account-menu-trigger')?.getAttribute('aria-current')).toBe(
          'page',
        );
      else expect(host.querySelector('.nav-item.selected')?.textContent).toContain(title);
    }
  },
);
it('mobile device deep-link opens inspector and keeps it through detail tabs', async () => {
  await mount('/perangkat?device=PUMP-01&period=2026-09');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('85,500');
  await click('Condition', host.querySelector('dialog')!);
  expect(window.location.hash).toContain('detailTab=condition');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('PUMP-01');
  await click('Linked costs', host.querySelector('dialog')!);
  await click('View expenses', host.querySelector('dialog')!);
  expect(host.querySelector('h1')?.textContent).toBe('Costs & savings');
  expect(host.querySelector('dialog[open]')).toBeNull();
  expect(window.location.hash).toContain('device=PUMP-01');
  expect(host.textContent).toContain('45,000');
});
it('mobile routine deep-link opens detail, and edit leads to builder without a stale drawer', async () => {
  await mount('/otomasi?tab=routines&routine=RTN-001');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('RTN-001');
  await click('Edit', host.querySelector('dialog')!);
  expect(window.location.hash).toContain('tab=builder');
  expect(host.querySelector('dialog[open]')).toBeNull();
});
it('hash history closes unrelated dialogs and exposes selected zone', async () => {
  await mount('/perangkat?device=PUMP-01');
  await go('/greenhouse?view=2d&zone=E');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('Zone E');
  expect(host.querySelector('dialog[open]')?.textContent).not.toContain('85,500');
  await go('/ringkasan');
  expect(host.querySelector('dialog[open]')).toBeNull();
});
it('camera changes use the matching environmental sensors', async () => {
  await mount('/perangkat?tab=cameras&camera=CAM-A-01', 1280);
  const cards = Array.from(host.querySelectorAll('.card')).filter((c) =>
    c.textContent?.includes('Environmental conditions'),
  );
  expect(cards[0]?.textContent).toContain('Zone A');
  expect(cards[0]?.textContent).toContain(
    String(createFixture().zones.find((z) => z.id === 'A')!.temperature),
  );
  await go('/perangkat?tab=cameras&zone=E&camera=CAM-A-01');
  expect(host.querySelector('.camera-picker .selected')?.textContent).toContain('E-01');
});
it('mobile menu closes with Escape and clears body lock', async () => {
  await mount('/ringkasan');
  await act(async () => (host.querySelector('.mobile-menu') as HTMLElement).click());
  expect(document.body.style.overflow).toBe('hidden');
  await act(async () => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
  expect(document.body.style.overflow).toBe('');
  expect(host.querySelector('.sidebar.open')).toBeNull();
});
it('invalid tabs and pagination recover instead of empty pages', async () => {
  expect(boundedPage('NaN', 25)).toBe(1);
  expect(boundedPage('999', 25)).toBe(3);
  expect(boundedPage('-1', 0)).toBe(1);
  expect(normalizeQuery('/otomasi', 'tab=unknown')).toBe('tab=schedule');
  await mount('/perangkat?tab=broken&page=NaN', 1280);
  expect(host.textContent).toContain('Device inventory');
  expect(host.querySelectorAll('tbody tr').length).toBeGreaterThan(0);
});
it('custom cost range uses the dates displayed by the form', () => {
  const scope = scopeFrom({
    s: createFixture(),
    mobile: false,
    query: new URLSearchParams('period=custom'),
    nav: vi.fn(),
    open: vi.fn(),
    act: vi.fn(),
  });
  expect(scope.from).toBe('2026-10-01');
  expect(scope.to).toBe('2026-10-13');
});

it('closing a URL-driven drawer clears selection and remains closed on refresh', async () => {
  await mount('/perangkat?device=PUMP-01&detailTab=cost');
  await act(async () =>
    (host.querySelector('dialog button[aria-label="Close"]') as HTMLElement).click(),
  );
  expect(host.querySelector('dialog[open]')).toBeNull();
  expect(window.location.hash).not.toContain('device=');
  await go('/perangkat?device=CAM-E-01');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('CAM-E-01');
});
it('browser back restores the previous route and matching mobile inspector', async () => {
  await mount('/perangkat?device=PUMP-01');
  await click('View expenses', host.querySelector('dialog')!);
  await act(async () => {
    window.history.back();
    await new Promise((resolve) => setTimeout(resolve, 30));
  });
  expect(host.querySelector('h1')?.textContent).toBe('Devices');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('PUMP-01');
});
it('keyboard arrows select the next tab', async () => {
  await mount('/perangkat', 1280);
  const tab = host.querySelector('[role="tab"][aria-selected="true"]')!;
  await act(async () =>
    tab.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true })),
  );
  expect(host.querySelector('[role="tab"][aria-selected="true"]')?.textContent).toBe(
    'Cameras & sensors',
  );
});
it('monitoring board reflects unavailable readings and opens the matching zone inspector', async () => {
  await mount('/ringkasan');
  const beds = host.querySelectorAll('.growing-bed');
  expect(beds).toHaveLength(6);
  expect(beds[4].textContent).toContain('Camera offline');
  expect(beds[5].textContent).toContain('Invalid data');
  expect(beds[5].textContent).not.toContain('% RH');
  await act(async () => (beds[1] as HTMLElement).click());
  expect(window.location.hash).toContain('/greenhouse?zone=B');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('Zone B');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('INS-024');
});
it('dashboard shortcuts carry the pending-inspection filter into the shared case list', async () => {
  await mount('/ringkasan', 1280);
  const link = host.querySelector<HTMLButtonElement>('.watch-summary button')!;
  await act(async () => link.click());
  expect(window.location.hash).toContain('/hama?status=inspection');
  expect(host.querySelectorAll('.case-item')).toHaveLength(
    createFixture().cases.filter((c) => c.status === 'inspection').length,
  );
});
it('chart legend exposes and updates the selected zone without changing navigation', async () => {
  await mount('/ringkasan', 1280);
  const legend = host.querySelector('[role="group"][aria-label="Chart zones"]')!;
  const button = legend.querySelector<HTMLButtonElement>('button')!;
  expect(button.getAttribute('aria-pressed')).toBe('true');
  await act(async () => button.click());
  expect(button.getAttribute('aria-pressed')).toBe('false');
  expect(window.location.hash).toBe('#/ringkasan');
});

async function press(selector: string, scope: ParentNode = host) {
  const control = scope.querySelector<HTMLElement>(selector);
  expect(control, selector).toBeTruthy();
  await act(async () => control!.click());
}
async function fill(control: HTMLInputElement | HTMLSelectElement, value: string) {
  await act(async () => {
    const prototype =
      control.tagName === 'SELECT' ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, 'value')!.set!.call(control, value);
    control.dispatchEvent(
      new Event(control.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }),
    );
  });
}

it('collapses the desktop sidebar from the left of the breadcrumb and retains labeled destinations', async () => {
  await mount('/ringkasan', 1280);
  const toggle = host.querySelector<HTMLButtonElement>('.sidebar-toggle')!;
  expect(toggle.parentElement?.firstElementChild).toBe(toggle);
  expect(toggle.nextElementSibling?.className).toBe('breadcrumb');
  await press('.sidebar-toggle');
  expect(toggle.getAttribute('aria-expanded')).toBe('false');
  expect(host.querySelector('.sidebar.collapsed')).toBeTruthy();
  expect(host.querySelector('.account-menu-trigger')?.getAttribute('title')).toBe('Budi Santoso');
  expect(loadPreferences(localStorage.getItem(WORKSPACE_STORAGE_KEY)).collapsed).toBe(true);
  await press('.account-menu-trigger');
  await click('Settings', document.querySelector('.account-popup')!);
  expect(host.querySelector('h1')?.textContent).toBe('Settings');
  await press('.sidebar-toggle');
  expect(host.querySelector('.sidebar.collapsed')).toBeNull();
});

it('uses the expanded labeled drawer on mobile even when desktop collapse is saved', async () => {
  workspaceStore.setState({ preferences: { ...workspaceDefaults(), collapsed: true } });
  await mount('/ringkasan', 390);
  await press('.sidebar-toggle');
  expect(host.querySelector('.sidebar.open')).toBeTruthy();
  expect(host.querySelector('.sidebar.collapsed')).toBeNull();
  expect(host.querySelector('.sidebar nav')?.textContent).toContain('Roles & permissions');
  await press('.account-menu-trigger');
  await click('Settings', document.querySelector('.account-popup')!);
  expect(host.querySelector('.sidebar.open')).toBeNull();
  expect(document.body.style.overflow).toBe('');
});

it('switches data, clears stale deep links, and preserves the previous greenhouse edits', async () => {
  store.getState().dispatch({ type: 'assign', caseId: 'INS-024', operator: 'Aldi' });
  await mount('/perangkat?device=PUMP-01', 1280);
  await press('.breadcrumb button');
  await press('.greenhouse-option:nth-of-type(2)', host.querySelector('dialog')!);
  expect(store.getState().activeId).toBe('GH-02');
  expect(window.location.hash).toBe('#/perangkat');
  expect(host.querySelector('.breadcrumb')?.textContent).toContain('Ciawi Farm');
  await go('/perangkat?device=PUMP-01&period=2026-09');
  expect(host.querySelector('.cost-total')?.textContent).toContain('68,400');
  expect(host.textContent).not.toContain('Rp40.500');
  await go('/ringkasan');
  expect(host.querySelector('.chart-context')?.textContent).toContain('All zones');
  expect(host.querySelectorAll('.chart-legend button')).toHaveLength(6);
  await press('.breadcrumb button');
  await press('.greenhouse-option', host.querySelector('dialog')!);
  expect(store.getState().activeId).toBe('GH-01');
  expect(store.getState().data.cases.find((c) => c.id === 'INS-024')?.assignedTo).toBe('Aldi');
});

it('persists theme choices and reacts to system color-scheme changes', async () => {
  const media = Object.assign(new EventTarget(), { matches: false });
  vi.stubGlobal('matchMedia', () => media);
  await mount('/settings?tab=appearance', 1280);
  await click('Dark');
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(loadPreferences(localStorage.getItem(WORKSPACE_STORAGE_KEY)).theme).toBe('dark');
  await click('System');
  expect(document.documentElement.dataset.theme).toBe('light');
  await act(async () => {
    media.matches = true;
    media.dispatchEvent(new Event('change'));
  });
  expect(document.documentElement.dataset.theme).toBe('dark');
  await press('.account-menu-trigger');
  expect(document.querySelector('.account-popup [aria-pressed="true"]')?.textContent).toBe('Dark');
  await click('Light', document.querySelector('.account-popup')!);
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(workspaceStore.getState().preferences.theme).toBe('light');
});

it('saves profile edits and updates the sidebar identity', async () => {
  await mount('/settings?tab=profile', 1280);
  const fields = host.querySelectorAll<HTMLInputElement>('form input');
  await fill(fields[0], 'Aldi Pratama');
  expect(fields[1].readOnly).toBe(true);
  await click('Save profile');
  expect(host.querySelector('[role="status"]')?.textContent).toContain('Profile saved');
  expect(host.querySelector('.operator')?.getAttribute('aria-label')).toBe(
    'Account menu Aldi Pratama',
  );
  expect(loadPreferences(localStorage.getItem(WORKSPACE_STORAGE_KEY)).members[0].name).toBe(
    'Aldi Pratama',
  );
});

it('marks notifications read per greenhouse and opens the matching detail', async () => {
  await mount('/ringkasan', 390);
  await press('.notification-trigger');
  expect(host.querySelectorAll('.notification-item.unread').length).toBeGreaterThan(0);
  await click('Mark all as read');
  expect(host.querySelector('.notification-trigger')?.getAttribute('aria-label')).toBe(
    'Notifications, 0 unread',
  );
  const inspection = Array.from(
    host.querySelectorAll<HTMLButtonElement>('.notification-target'),
  ).find((n) => n.textContent?.includes('Inspect Zone B'))!;
  await act(async () => inspection.click());
  expect(window.location.hash).toContain('/hama?case=');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('INS-024');
  await press('dialog button[aria-label="Close"]');
  await press('.breadcrumb button');
  await press('.greenhouse-option:nth-of-type(2)', host.querySelector('dialog')!);
  expect(host.querySelector('.notification-trigger')?.getAttribute('aria-label')).not.toBe(
    'Notifications, 0 unread',
  );
  expect(
    workspaceStore.getState().preferences.readNotifications['member-owner:GH-01'].length,
  ).toBeGreaterThan(0);
  expect(
    workspaceStore.getState().preferences.readNotifications['member-owner:GH-02'],
  ).toBeUndefined();
});

it('opens a draft expense from its notification on desktop and clears the detail on close', async () => {
  const s = createFixture();
  s.expenses[0].status = 'draft';
  store.setState({ data: s, greenhouses: { ...store.getState().greenhouses, 'GH-01': s } });
  await mount('/ringkasan', 1280);
  await press('.notification-trigger');
  const notice = Array.from(host.querySelectorAll<HTMLButtonElement>('.notification-target')).find(
    (n) => n.textContent?.includes('Expense draft'),
  )!;
  await act(async () => notice.click());
  expect(host.querySelector('h1')?.textContent).toBe('Costs & savings');
  expect(window.location.hash).toContain('status=draft');
  expect(host.querySelector('dialog[open]')?.textContent).toContain(s.expenses[0].id);
  await press('dialog button[aria-label="Close"]');
  expect(window.location.hash).not.toContain('expense=');
  expect(host.querySelector('dialog[open]')).toBeNull();
});

it('filters notifications according to the saved category preferences', async () => {
  await mount('/settings?tab=notifications', 1280);
  const initial = host.querySelector('.notification-trigger')!.getAttribute('aria-label');
  const switches = host.querySelectorAll<HTMLButtonElement>('[role="switch"]');
  for (const control of switches) await act(async () => control.click());
  expect(initial).not.toBe('Notifications, 0 unread');
  expect(host.querySelector('.notification-trigger')?.getAttribute('aria-label')).toBe(
    'Notifications, 0 unread',
  );
  await press('.notification-trigger');
  expect(host.querySelector('dialog')?.textContent).toContain('No notifications yet');
});

it('previews role restrictions, blocks the editor route, and restores Owner controls', async () => {
  await mount('/akses?tab=permissions', 1280);
  await click('Preview Viewer');
  expect(host.querySelector('.readonly-note')).toBeTruthy();
  expect(host.querySelector('.demo-toolbar')).toBeNull();
  await go('/otomasi?tab=builder');
  expect(host.textContent).toContain('Automation settings require');
  expect(host.querySelector('.routine-builder')).toBeNull();
  await click('Return to Owner view');
  expect(workspaceStore.getState().preferences.previewRole).toBeNull();
  expect(host.querySelector('.role-preview-banner')).toBeNull();
  await press('.access-toolbar [role="tab"]:first-child');
  expect(
    Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find((b) =>
      b.textContent?.includes('Add member'),
    )?.disabled,
  ).toBe(false);
});

it('keeps account actions accessible without a simulation toolbar or account impersonation picker', async () => {
  await mount('/ringkasan', 1280);
  expect(host.querySelector('.demo-toolbar')).toBeNull();
  expect(host.textContent).not.toContain('Data demo');
  await press('.account-menu-trigger');
  expect(document.querySelector('.account-popup')?.textContent).toContain('Logout');
  expect(host.textContent).not.toContain('Masuk demo');
});

it('adds a scoped directory member without sending an invitation', async () => {
  await mount('/akses', 1280);
  await click('Add member');
  const dialog = host.querySelector('dialog')!;
  await fill(dialog.querySelector<HTMLInputElement>('[name="name"]')!, 'Rina Kebun');
  await fill(dialog.querySelector<HTMLInputElement>('[name="email"]')!, 'rina@kebun.example');
  await fill(dialog.querySelector<HTMLSelectElement>('[name="role"]')!, 'Viewer');
  await press('[name="greenhouse"][value="GH-01"]', dialog);
  await press('[name="greenhouse"][value="GH-02"]', dialog);
  await click('Add member', dialog);
  const member = workspaceStore
    .getState()
    .preferences.members.find((m) => m.email === 'rina@kebun.example');
  expect(member).toMatchObject({ role: 'Viewer', greenhouseIds: ['GH-02'] });
  expect(host.querySelector('dialog[open]')).toBeNull();
  expect(host.textContent).toContain('No invitation was sent');
});

it.each([390, 768, 1280, 1440])(
  'renders detection review and honest source labels at width %s (DOM only)',
  async (width) => {
    await mount('/hama?tab=detection&reviewZone=B', width);
    expect(host.querySelectorAll('.detection-zone')).toHaveLength(6);
    expect(host.querySelector('.detection-verdict')?.textContent).toContain('Plant review needed');
    expect(host.querySelector('.observation-proof')?.textContent).toContain('15.5');
    expect(host.querySelector('.detection-source')?.textContent).toContain(
      'not analysis of this image',
    );
    expect(host.querySelector('.detection-limit')?.textContent).toContain('no AI inference');
    expect(host.querySelector('dialog[open]')).toBeNull();
    await press('[aria-label^="Review Zone E:"]');
    expect(host.querySelector('.detection-verdict')?.textContent).toContain('Cannot assess yet');
    expect(host.querySelector('details.detection-quality[open]')).toBeTruthy();
  },
);

it('opens stored detection evidence and has no scenario mutation controls', async () => {
  store.getState().dispatch({ type: 'detection_sample', zoneId: 'D', sample: 'rising' });
  const created = store.getState().data.cases.find((c) => c.zoneId === 'D')!;
  await mount('/hama?tab=detection&reviewZone=D', 390);
  expect(host.querySelector('.detection-demo')).toBeNull();
  await click(`Open case ${created.id}`);
  expect(host.querySelector('dialog[open]')?.textContent).toContain('Monitoring trigger');
  await click('Review detection', host.querySelector('dialog[open]')!);
  expect(window.location.hash).toContain('reviewZone=D');
});

it('keeps a Viewer review read-only, including direct deep-linked sample controls', async () => {
  workspaceStore.setState({ preferences: { ...workspaceDefaults(), memberId: 'member-viewer' } });
  await mount('/hama?tab=detection&reviewZone=D&demo=true', 1280);
  // Login scope changes to GH-02 and returns to Dashboard.
  await go('/hama?tab=detection&reviewZone=D&demo=true');
  const controls = host.querySelectorAll<HTMLButtonElement>('.detection-demo button');
  expect(controls).toHaveLength(0);
  expect([...controls].every((b) => b.disabled)).toBe(true);
  const evaluate = Array.from(
    host.querySelectorAll<HTMLButtonElement>('.page-header-actions button'),
  ).find((b) => b.textContent?.includes('Evaluate'))!;
  expect(evaluate.disabled).toBe(true);
  expect(store.getState().data.cases.some((c) => c.zoneId === 'D' && c.status !== 'closed')).toBe(
    false,
  );
});

it('shows the automatic monitoring case in header notifications and opens its evidence', async () => {
  await mount('/hama?tab=detection&reviewZone=D&demo=true', 390);
  await act(async () => {
    store.getState().dispatch({ type: 'detection_sample', zoneId: 'D', sample: 'rising' });
  });
  const created = store.getState().data.cases.find((c) => c.zoneId === 'D')!;
  await press('.notification-trigger');
  const notice = Array.from(host.querySelectorAll<HTMLButtonElement>('.notification-target')).find(
    (n) => n.textContent?.includes('Inspect Zone D'),
  )!;
  await act(async () => notice.click());
  expect(window.location.hash).toContain(`case=${created.id}`);
  expect(host.querySelector('dialog[open]')?.textContent).toContain('Monitoring trigger');
});

it.each([390, 768, 1280, 1440])(
  'renders crop workflow, stock and profit at width %s (DOM only)',
  async (width) => {
    await mount('/siklus', width);
    expect(host.querySelectorAll('.crop-journey button')).toHaveLength(5);
    expect(host.querySelector('.crop-columns')?.textContent).toContain(
      'Cases affecting this cycle',
    );
    await press('[role="tablist"] button:nth-child(2)');
    expect(window.location.hash).toContain('tab=harvest');
    await act(async () => {
      store.getState().dispatch({ type: 'crop_sample' });
    });
    expect(host.querySelectorAll('.crop-lot')).toHaveLength(1);
    expect(host.querySelector('.crop-totals')?.textContent).toContain('22');
    await go('/siklus?tab=sales');
    expect(host.querySelector('.crop-sale')?.textContent).toContain('375,000');
    await click('Review cycle profit');
    expect(window.location.hash).toContain('profit');
    expect(host.querySelector('.crop-statement')?.textContent).toContain('875,000');
    expect(host.querySelector('.crop-profit')?.textContent).toContain('costs need review');
    expect(host.querySelector('.scope-filter')).toBeNull();
  },
);

it('completes care, records and releases harvest, creates a sale and records a partial receipt through real forms', async () => {
  await mount('/siklus', 390);
  await click('Add care task');
  let d = host.querySelector('dialog[open]')!;
  await fill(d.querySelector('[name="title"]')!, 'Cek penyangga tanaman');
  await click('Save record', d);
  expect(store.getState().data.production?.tasks).toHaveLength(1);
  await click('Record outcome');
  d = host.querySelector('dialog[open]')!;
  (d.querySelector('[name="notes"]') as HTMLTextAreaElement).value =
    'Penyangga diperiksa dan diperbaiki.';
  await click('Save record', d);
  expect(store.getState().data.production?.tasks[0].status).toBe('done');
  await go('/siklus?tab=harvest');
  await click('Record harvest');
  d = host.querySelector('dialog[open]')!;
  await fill(d.querySelector('[name="gross"]')!, '10');
  await fill(d.querySelector('[name="a"]')!, '7');
  await fill(d.querySelector('[name="b"]')!, '2');
  await fill(d.querySelector('[name="reject"]')!, '1');
  (d.querySelector('[name="notes"]') as HTMLTextAreaElement).value =
    'Hasil timbang, satu kg reject saat sortasi.';
  await click('Save record', d);
  expect(store.getState().data.production?.lots[0].status).toBe('held');
  await click('Review lot');
  d = host.querySelector('dialog[open]')!;
  (d.querySelector('[name="notes"]') as HTMLTextAreaElement).value =
    'Mutu dan catatan hasil sudah diperiksa.';
  await click('Release lot', d);
  expect(store.getState().data.production?.lots[0].status).toBe('released');
  await click('Record sale', host.querySelector('.crop-lot')!);
  d = host.querySelector('dialog[open]')!;
  await fill(d.querySelector('[name="kg"]')!, '5');
  await fill(d.querySelector('[name="price"]')!, '30000');
  await fill(d.querySelector('[name="buyer"]')!, 'Pembeli kebun demo');
  await click('Save sale', d);
  expect(store.getState().data.production?.sales).toHaveLength(1);
  await go('/siklus?tab=sales');
  await click('Record receipt');
  d = host.querySelector('dialog[open]')!;
  await fill(d.querySelector('[name="amount"]')!, '100000');
  await fill(d.querySelector('[name="reference"]')!, 'Transfer contoh');
  await click('Save receipt', d);
  expect(host.querySelector('.crop-sale')?.textContent).toContain('50,000');
  expect(store.getState().data.expenses).toHaveLength(7);
});

it('reviews actual ledger shares and shows profit without adding assumed savings', async () => {
  store.getState().dispatch({ type: 'crop_sample' });
  await mount('/biaya?tab=profit', 1280);
  await click('Review cycle costs');
  let d = host.querySelector('dialog[open]')!;
  await click('Use 100% of displayed records', d);
  for (const name of ['depreciation', 'labor', 'accrued'])
    await fill(d.querySelector(`[name="${name}"]`)!, '0');
  await fill(d.querySelector('[name="baseline"]')!, '1500000');
  (d.querySelector('[name="notes"]') as HTMLTextAreaElement).value =
    'Cakupan biaya contoh satu siklus sudah diperiksa.';
  await press('[name="reviewed"]', d);
  await click('Save cost review', d);
  expect(host.querySelector('dialog[open]')).toBeNull();
  expect(store.getState().data.production?.finance.reviewKey).toBeTruthy();
  expect(host.querySelector('.crop-profit-total')?.textContent).toContain('205,000');
  expect(host.querySelector('.crop-comparison')?.textContent).toContain('420,000');
  await click('Review closure');
  d = host.querySelector('dialog[open]')!;
  expect(d.textContent).toContain('outstanding');
  expect(
    [...d.querySelectorAll<HTMLButtonElement>('button')].find(
      (x) => x.textContent?.trim() === 'Close cycle',
    )!.disabled,
  ).toBe(true);
});

it('makes crop action controls read-only for a Viewer while retaining all records', async () => {
  workspaceStore.setState({ preferences: { ...workspaceDefaults(), memberId: 'member-viewer' } });
  await mount('/siklus', 768);
  await go('/siklus');
  for (const label of ['Add care task', 'Set targets'])
    expect(
      [...host.querySelectorAll<HTMLButtonElement>('button')].find(
        (x) => x.textContent?.trim() === label,
      )!.disabled,
    ).toBe(true);
  await go('/siklus?tab=harvest');
  expect(
    [...host.querySelectorAll<HTMLButtonElement>('button')].find(
      (x) => x.textContent?.trim() === 'Record harvest',
    )!.disabled,
  ).toBe(true);
  await go('/biaya?tab=profit');
  expect(
    [...host.querySelectorAll<HTMLButtonElement>('button')].find(
      (x) => x.textContent?.trim() === 'Review cycle costs',
    )!.disabled,
  ).toBe(true);
});

it('connects a new pest case to the affected crop lot and holds sales', async () => {
  store.getState().dispatch({ type: 'crop_sample' });
  store.getState().dispatch({ type: 'detection_sample', zoneId: 'D', sample: 'rising' });
  await mount('/siklus?tab=harvest', 390);
  expect(host.querySelector('.crop-hold')?.textContent).toContain('Stock held');
  expect(
    [...host.querySelectorAll<HTMLButtonElement>('.crop-lot button')].find(
      (x) => x.textContent?.trim() === 'Record sale',
    )!.disabled,
  ).toBe(true);
  await click('View case', host.querySelector('.crop-hold')!);
  expect(window.location.hash).toContain('/hama?case=');
  expect(host.querySelector('dialog[open]')?.textContent).toContain('Monitoring trigger');
});

it.each([390, 768, 1280, 1440])(
  'manages a new zone and crop batch through connected forms at %s (DOM only)',
  async (width) => {
    await mount('/greenhouse?tab=zones&zone=A', width);
    expect(host.querySelector('dialog[open]')).toBeNull();
    await click('Edit zone');
    let d = host.querySelector('dialog[open]')!;
    await fill(d.querySelector('[name="area"]')!, '40');
    await click('Save zone', d);
    await click('Add zone');
    d = host.querySelector('dialog[open]')!;
    await fill(d.querySelector('[name="name"]')!, 'Meja selada timur');
    await fill(d.querySelector('[name="capacity"]')!, '24');
    await fill(d.querySelector('[name="beds"]')!, '2');
    await fill(d.querySelector('[name="method"]')!, 'Hidroponik');
    await click('Add zone', d);
    expect(store.getState().data.zones).toHaveLength(7);
    expect(window.location.hash).toContain('zone=G');
    expect(host.querySelector('.zone-detail-heading')?.textContent).toContain('Meja selada timur');
    await click('Record planting batch');
    d = host.querySelector('dialog[open]')!;
    await fill(d.querySelector('[name="crop"]')!, 'Lettuce');
    await fill(d.querySelector('[name="variety"]')!, 'Romaine');
    await fill(d.querySelector('[name="plants"]')!, '20');
    await fill(d.querySelector('[name="seedSource"]')!, 'Lot benih S-01');
    await click('Record planting batch', d);
    const batchId = store.getState().data.cultivation!.batches.find((b) => b.zoneId === 'G')!.id;
    expect(host.querySelector('.plant-population')?.textContent).toContain('20');
    await click('Record population change');
    d = host.querySelector('dialog[open]')!;
    await fill(d.querySelector('[name="kind"]')!, 'loss');
    await fill(d.querySelector('[name="quantity"]')!, '2');
    (d.querySelector('[name="reason"]') as HTMLTextAreaElement).value =
      'Dua bibit gagal tumbuh saat pindah tanam.';
    await click('Save population change', d);
    expect(store.getState().data.zones.find((z) => z.id === 'G')!.plants).toBe(18);
    expect(store.getState().data.cycle.plants).toBe(450);
    await press('.zone-next-actions > button:nth-child(1)');
    d = host.querySelector('dialog[open]')!;
    expect(d.querySelector<HTMLSelectElement>('[name="zone"]')!.value).toBe('G');
    await fill(d.querySelector('[name="title"]')!, 'Cek akar dan meja tanam');
    await click('Save record', d);
    expect(store.getState().data.production!.tasks[0]).toMatchObject({
      zoneId: 'G',
      plantingId: batchId,
    });
    await press('.zone-next-actions > button:nth-child(2)');
    d = host.querySelector('dialog[open]')!;
    expect(d.querySelector<HTMLSelectElement>('[name="zone"]')!.value).toBe('G');
    for (const [name, value] of Object.entries({ gross: '10', a: '7', b: '2', reject: '1' }))
      await fill(d.querySelector(`[name="${name}"]`)!, value);
    (d.querySelector('[name="notes"]') as HTMLTextAreaElement).value =
      'Catatan timbang dan sortasi manual demo.';
    await click('Save record', d);
    expect(store.getState().data.production!.lots[0]).toMatchObject({
      zoneId: 'G',
      plantingId: batchId,
      crop: 'Lettuce',
      variety: 'Romaine',
    });
    expect(store.getState().data.zones.find((z) => z.id === 'G')!.plants).toBe(18);
    const deviceTab = [
      ...host.querySelectorAll<HTMLButtonElement>('[aria-label="Zone details"] [role="tab"]'),
    ].find((button) => button.textContent?.startsWith('Devices'));
    expect(deviceTab).toBeTruthy();
    await act(async () => deviceTab!.click());
    await click('Add device');
    d = host.querySelector('dialog[open]')!;
    expect(d.querySelector<HTMLSelectElement>('[name="zone"]')!.value).toBe('G');
    await fill(d.querySelector('[name="id"]')!, 'CAM-G-01');
    await fill(d.querySelector('[name="name"]')!, 'Kamera meja selada');
    await click('Add to inventory', d);
    expect(store.getState().data.devices.find((d) => d.id === 'CAM-G-01')!.zones).toEqual(['G']);
    expect(host.querySelector('.zone-device-row')?.textContent).toContain('Kamera meja selada');
    await click('Work & history', host.querySelector('[aria-label="Zone details"]')!);
    expect(host.querySelector('.zone-history')?.textContent).toContain('Dua bibit gagal');
    await click('Open care tasks');
    expect(window.location.hash).toContain('zone=G');
    expect(host.querySelector('.crop-task-list')?.textContent ?? host.textContent).toContain(
      'Cek akar dan meja tanam',
    );
    await go('/greenhouse?tab=zones&zone=G');
    await press('.zone-next-actions > button:nth-child(3)');
    expect(window.location.hash).toContain('/biaya?tab=expenses&zone=G');
    expect(store.getState().data.expenses).toHaveLength(7);
    await go('/greenhouse?view=2d');
    expect(host.querySelectorAll('.map-zone')).toHaveLength(7);
  },
);

it('keeps zone and crop management read-only for a Viewer', async () => {
  const p = workspaceDefaults();
  p.previewRole = 'Viewer';
  workspaceStore.setState({ preferences: p });
  await mount('/greenhouse?tab=zones&zone=A', 390);
  for (const label of [
    'Add zone',
    'Edit zone',
    'Edit crop',
    'Record population change',
    'Close batch',
  ]) {
    const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.textContent?.trim() === label,
    );
    expect(button?.disabled, label).toBe(true);
  }
  expect(host.querySelector<HTMLButtonElement>('.zone-next-actions > button')!.disabled).toBe(true);
  expect(host.querySelector('.zone-detail-heading')?.textContent).toContain('Zone A');
});

it('normalizes zone panels and accepts dynamic zone links', () => {
  expect(normalizeQuery('/greenhouse', 'tab=zones&zone=Z27&panel=bad')).toBe(
    'tab=zones&zone=Z27&panel=plants',
  );
});

it('starts a zone-specific preventive routine from the zone activity tab', async () => {
  await mount('/greenhouse?tab=zones&zone=D&panel=activity', 768);
  await click('Create zone routine');
  expect(window.location.hash).toContain('/otomasi?tab=builder&zone=D');
  expect(
    host.querySelector<HTMLInputElement>('[name="name"]')?.value ?? host.textContent,
  ).toContain('Inspection');
  const boxes = [...host.querySelectorAll<HTMLInputElement>('.zone-checkboxes input')];
  expect(boxes.filter((box) => box.checked)).toHaveLength(1);
  expect(boxes[3].checked).toBe(true);
});

it('defaults expense views to the current month and explains invalid custom ranges', async () => {
  const current = localDate(store.getState().data.clock).slice(0, 7);
  await mount('/biaya', 1280);
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Expense period"]')?.value).toBe(
    current,
  );
  await go('/perangkat?device=PUMP-01');
  expect(host.querySelector<HTMLSelectElement>('[aria-label="Device cost period"]')?.value).toBe(
    current,
  );
  expect(host.querySelector('.period-note')?.textContent).toContain(monthLabel(current));
  await go('/biaya?period=custom&from=2026-10-13&to=2026-10-01');
  expect(host.textContent).toContain('Start date must be on or before the end date');
  expect(host.querySelector('.stats')).toBeNull();
  await click('Use current month');
  expect(host.querySelector<HTMLInputElement>('[aria-label="Cost start date"]')?.value).toBe(
    '2026-10-01',
  );
  expect(host.querySelector<HTMLInputElement>('[aria-label="Cost end date"]')?.value).toBe(
    '2026-10-13',
  );
});

it.each([390, 768, 1280, 1440])(
  'preserves custom cost dates through device and expense links at %s (DOM only)',
  async (width) => {
    await mount('/perangkat?device=PUMP-01&period=custom&from=2026-09-01&to=2026-09-30', width);
    const inspector = host.querySelector(width < 1024 ? 'dialog[open]' : '.inspector')!;
    expect(inspector.textContent).toContain('85,500');
    await click('View expenses', inspector);
    const query = new URLSearchParams(window.location.hash.split('?')[1]);
    expect(query.get('period')).toBe('custom');
    expect(query.get('from')).toBe('2026-09-01');
    expect(query.get('to')).toBe('2026-09-30');
    expect(host.querySelector<HTMLInputElement>('[aria-label="Cost start date"]')?.value).toBe(
      '2026-09-01',
    );
    expect(host.textContent).toContain('45,000');
  },
);

it.each([390, 768, 1280, 1440])(
  'never substitutes another case for a missing deep link at %s (DOM only)',
  async (width) => {
    await mount('/hama?case=CASE-MISSING', width);
    expect(host.textContent).toContain('Case not found');
    expect(host.querySelector('.case-details')).toBeNull();
    const action = [
      ...host.querySelectorAll<HTMLButtonElement>('.page-header-actions button'),
    ].find((b) => b.textContent?.includes('Record inspection'));
    expect(action).toBeTruthy();
    expect(action!.disabled).toBe(true);
    await click('View available cases', host.querySelector('dialog[open]') ?? host);
    expect(window.location.hash).not.toContain('case=');
    expect(host.querySelector('.case-item.selected')).not.toBeNull();
  },
);

it('keeps the inspection action aligned with the filtered case and recovers a hidden link', async () => {
  const chosen = store.getState().data.cases[1];
  await mount('/hama?search=' + chosen.id, 1280);
  expect(host.querySelector('.case-item.selected')?.textContent).toContain(chosen.id);
  await click('Record inspection', host.querySelector('.page-header-actions') ?? host);
  expect(host.querySelector('dialog[open]')?.textContent).toContain(chosen.id);
  await go('/hama?case=' + chosen.id + '&search=not-a-match');
  expect(host.textContent).toContain('Case hidden by filters');
  expect(host.querySelector('.case-details')).toBeNull();
  await click('Show selected case');
  expect(host.querySelector('.case-details')?.textContent).toContain(chosen.id);
});

it.each([390, 768, 1280, 1440])(
  'focuses linked care, harvest, and sales records and recovers zone filters at %s (DOM only)',
  async (width) => {
    let s = transition(store.getState().data, { type: 'crop_sample' }).data;
    s = transition(s, {
      type: 'crop_task',
      task: {
        title: 'Check irrigation line',
        zoneId: 'D',
        dueOn: '2026-10-13',
        operator: 'Aldi',
        key: 'ux-task',
      },
    }).data;
    store.setState({ data: s, greenhouses: { ...store.getState().greenhouses, 'GH-01': s } });
    const task = s.production!.tasks[0],
      lot = s.production!.lots[0],
      sale = s.production!.sales[0];
    await mount('/siklus?task=' + task.id, width);
    expect(document.activeElement?.getAttribute('data-linked-record')).toBe(task.id);
    expect(host.querySelector('.crop-journey [aria-current="step"]')?.textContent).toContain(
      'Maintenance',
    );
    await go('/siklus?lot=' + lot.id);
    expect(document.activeElement?.getAttribute('data-linked-record')).toBe(lot.id);
    expect(host.querySelector('.crop-journey [aria-current="step"]')?.textContent).toContain(
      'Harvest',
    );
    await go('/siklus?sale=' + sale.id);
    expect(document.activeElement?.getAttribute('data-linked-record')).toBe(sale.id);
    await go('/siklus?lot=' + lot.id + '&zone=A');
    expect(host.textContent).toContain('Record hidden by zone filter');
    expect(host.querySelector('[data-linked-record]')).toBeNull();
    await click('Show all zones');
    expect(document.activeElement?.getAttribute('data-linked-record')).toBe(lot.id);
    await go('/siklus?task=CARE-MISSING');
    expect(host.textContent).toContain('CARE-MISSING is not available');
    expect(host.querySelector('[data-linked-record]')).toBeNull();
  },
);

it('shows only payment receipts and losses related to the selected zone', async () => {
  let s = transition(store.getState().data, { type: 'crop_sample' }).data;
  s = transition(s, {
    type: 'crop_loss',
    loss: {
      lotId: s.production!.lots[0].id,
      grade: 'A',
      kg: 1,
      date: '2026-10-13',
      reason: 'Damaged packaging',
      key: 'ux-loss',
    },
  }).data;
  store.setState({ data: s, greenhouses: { ...store.getState().greenhouses, 'GH-01': s } });
  await mount('/siklus?tab=sales&zone=A', 1280);
  expect(host.textContent).toContain('No sales yet');
  expect(host.textContent).not.toContain('Payment receipt history');
  await go('/siklus?tab=sales&zone=D');
  expect(host.textContent).toContain('Payment receipt history');
  expect(host.textContent).toContain(s.production!.receipts[0].reference);
  await go('/siklus?tab=harvest&zone=A');
  expect(host.textContent).not.toContain('Loss records');
  await go('/siklus?tab=harvest&zone=D');
  expect(host.textContent).toContain('Damaged packaging');
});
