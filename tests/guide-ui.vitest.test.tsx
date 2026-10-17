// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import App from '../src/app/App';
import { store } from '../src/store/store';
import {
  workspaceStore,
  workspaceDefaults,
  loadPreferences,
  WORKSPACE_STORAGE_KEY,
} from '../src/store/workspace';
import { createFixture } from '../src/data/fixtures';
import { createGreenhouseFixture } from '../src/data/greenhouses';
import { tours, TOUR_IDS, type TourId } from '../src/features/guide/model';
import { intersectRect } from '../src/features/guide/placement';
import { enterPrototype } from '../src/features/auth/entry';
vi.mock('../src/features/greenhouse/Scene', () => ({
  default: () => <div>WebGL excluded from DOM tests</div>,
}));
let root: Root, host: HTMLDivElement;
let targetTops: WeakMap<HTMLElement, number>;
function bounds(x: number, y: number, width: number, height: number): DOMRect {
  return {
    x,
    y,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
    toJSON: () => ({}),
  };
}
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  window.scrollTo = vi.fn();
  window.innerHeight = 844;
  targetTops = new WeakMap();
  // Explicit geometry fixtures; these exercise placement, not browser CSS/layout rendering.
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    if (this.classList.contains('guide-coach')) {
      return bounds(
        parseFloat(this.style.left) || 0,
        parseFloat(this.style.top) || 0,
        Math.min(376, window.innerWidth - 24),
        Math.min(346, parseFloat(this.style.maxHeight) || 346),
      );
    }
    if (this.hasAttribute('data-tour') || this.classList.contains('page-header')) {
      const header = ['greenhouse-switcher', 'notifications'].includes(this.dataset.tour ?? '');
      return bounds(
        header ? 64 : window.innerWidth >= 1024 ? 280 : 20,
        targetTops.get(this) ?? (header ? 20 : 1400),
        header ? 130 : window.innerWidth >= 1024 ? 760 : window.innerWidth - 40,
        header ? 40 : 540,
      );
    }
    return bounds(0, 0, 0, 0);
  });
  HTMLElement.prototype.scrollIntoView = vi.fn(function (this: HTMLElement) {
    targetTops.set(this, 24);
  });
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
  const s = createFixture();
  s.playing = false;
  store.setState({
    data: s,
    greenhouses: { 'GH-01': s, 'GH-02': createGreenhouseFixture('GH-02') },
    activeId: 'GH-01',
    nextGreenhouseNumber: 3,
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
async function settleTour() {
  await act(async () => {
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}
async function mount(path = '/ringkasan', width = 390) {
  window.innerWidth = width;
  window.history.replaceState({}, '', '/#' + path);
  await act(async () => root.render(<App />));
  await settleTour();
}
async function go(path: string) {
  await act(async () => {
    window.location.hash = path;
    await new Promise((r) => setTimeout(r, 15));
  });
  await settleTour();
}
async function press(selector: string, scope: ParentNode = host) {
  const b = scope.querySelector<HTMLElement>(selector);
  expect(b, selector).toBeTruthy();
  await act(async () => b!.click());
  await settleTour();
}
async function click(label: string, scope: ParentNode = host) {
  const b = [...scope.querySelectorAll<HTMLButtonElement>('button')].find(
    (x) => x.textContent?.trim() === label,
  );
  expect(b, label).toBeTruthy();
  await act(async () => b!.click());
  await settleTour();
}
async function select(label: string, v: string) {
  const el = host.querySelector<HTMLSelectElement>(`select[aria-label="${label}"]`);
  expect(el, label).toBeTruthy();
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')!.set!.call(el, v);
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
async function openGuide() {
  if (window.innerWidth < 1024) await press('.sidebar-toggle');
  await press('.account-menu-trigger');
  await click('Vigor guide', document.querySelector('.account-popup')!);
}
async function start(id: TourId) {
  const t = tours(store.getState().data).find((t) => t.id === id)!;
  await press(`[aria-label="Start tour ${t.title}"]`);
}
const coach = () => document.querySelector<HTMLElement>('.guide-coach')!;
const layer = () => document.querySelector<HTMLElement>('.guide-layer')!;
const resume = () => document.querySelector<HTMLElement>('.guide-resume')!;

it.each(['account', 'settings'])(
  'logs out locally from %s without clearing greenhouse records',
  async (surface) => {
    enterPrototype();
    const open = vi.spyOn(window, 'open');
    await mount(surface === 'settings' ? '/settings?tab=profile' : '/ringkasan', 1280);
    const before = JSON.stringify(store.getState().data);
    const preferences = workspaceStore.getState().preferences;
    if (surface === 'account') {
      await press('.account-menu-trigger');
      await click('Logout', document.querySelector('.account-popup')!);
    } else {
      await click('Logout');
    }
    expect(window.location.pathname).toBe('/login');
    expect(window.location.hash).toBe('');
    expect(open).not.toHaveBeenCalled();
    expect(JSON.stringify(store.getState().data)).toBe(before);
    expect(workspaceStore.getState().preferences).toBe(preferences);
  },
);

function checkSpotlight(target: string) {
  expect(coach()).toBeTruthy();
  expect(layer().hidden).toBe(false);
  expect(host.contains(layer())).toBe(false); // portal escapes main/sidebar stacking contexts
  expect(coach().getAttribute('aria-modal')).toBe('true');
  expect(host.querySelector('.app-shell')?.hasAttribute('inert')).toBe(true);
  expect(host.querySelector(target)?.getAttribute('data-guide-focus')).toBe('true');
  expect(host.querySelectorAll('[data-guide-focus]')).toHaveLength(1);
  expect(coach().textContent).not.toContain('unavailable in the current records');
  const hole = document.querySelector<HTMLElement>('.guide-spotlight')!;
  expect(hole).toBeTruthy();
  expect(document.querySelectorAll('.guide-shade').length).toBeGreaterThan(0);
  const rect = (e: HTMLElement) => ({
    x: parseFloat(e.style.left),
    y: parseFloat(e.style.top),
    width: parseFloat(e.style.width),
    height: e === coach() ? coach().getBoundingClientRect().height : parseFloat(e.style.height),
  });
  const panelRect = rect(coach());
  expect(panelRect.x).toBeGreaterThanOrEqual(12);
  expect(panelRect.x + panelRect.width).toBeLessThanOrEqual(window.innerWidth - 12);
  expect(panelRect.y).toBeGreaterThanOrEqual(12);
  expect(panelRect.y + panelRect.height).toBeLessThanOrEqual(window.innerHeight - 12);
  expect(intersectRect(panelRect, rect(hole))).toBeNull();
}

it.each([390, 768, 1280, 1440])(
  'walks the workspace tour through actual routes at %s px without modifying greenhouse data (DOM only)',
  async (width) => {
    await mount('/ringkasan', width);
    const before = JSON.stringify(store.getState().data);
    await click('Open guide');
    expect(host.querySelectorAll('.guide-choice')).toHaveLength(5);
    await start('workspace');
    expect(host.querySelector('dialog[open]')).toBeNull();
    checkSpotlight('[data-tour="greenhouse-switcher"]');
    expect(document.activeElement).toBe(coach().querySelector('h2'));
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
    for (let i = 1; i < 5; i++) await click('Next', coach());
    expect(window.location.hash).toBe('#/settings?tab=appearance');
    await click('Finish tour', coach());
    expect(host.querySelector('dialog[open]')?.textContent).toContain('Tour completed');
    expect(coach()).toBeNull();
    expect(JSON.stringify(store.getState().data)).toBe(before);
    const restored = loadPreferences(localStorage.getItem(WORKSPACE_STORAGE_KEY));
    expect(restored.guides?.progress['member-owner:GH-01']?.workspace?.finished).toBe(true);
  },
);
it.each([390, 768, 1280, 1440].flatMap((width) => TOUR_IDS.map((id) => ({ width, id }))))(
  'shows every $id step at $width px with real anchors and nonoverlapping geometry fixtures',
  async ({ id, width }) => {
    await mount('/ringkasan', width);
    const before = JSON.stringify(store.getState().data);
    await openGuide();
    await start(id);
    const steps = tours(store.getState().data).find((t) => t.id === id)!.steps;
    for (let i = 0; i < steps.length; i++) {
      expect(coach().querySelector('h2')!.textContent).toBe(steps[i].title);
      expect(window.location.hash).toBe('#' + steps[i].route);
      checkSpotlight(steps[i].target);
      await click(i === steps.length - 1 ? 'Finish tour' : 'Next', coach());
    }
    expect(JSON.stringify(store.getState().data)).toBe(before);
  },
);
it('pauses, resumes, goes back and returns from an off-route page without losing progress', async () => {
  await mount();
  await openGuide();
  await start('setup');
  await click('Next', coach());
  await click('Next', coach());
  await go('/biaya?tab=summary');
  expect(coach().textContent).toContain('Return to step');
  expect(host.querySelector('[data-guide-focus]')).toBeNull();
  await click('Return to step', coach());
  expect(window.location.hash).toContain('panel=targets');
  await click('Previous', coach());
  expect(window.location.hash).toContain('panel=plants');
  await press('[aria-label="Pause tour"]', coach());
  await openGuide();
  await press('[aria-label="Resume tour Set up a greenhouse"]');
  expect(window.location.hash).toContain('panel=plants');
  await act(async () =>
    coach().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  );
  await settleTour();
  expect(coach()).toBeNull();
  expect(host.querySelector('.app-shell')?.hasAttribute('inert')).toBe(false);
  expect(document.documentElement.style.overflow).toBe('');
  expect(document.activeElement?.id).toBe('main-content');
});
it('keeps the guide out of dialogs and restores it without interrupting form focus', async () => {
  await mount();
  await openGuide();
  await start('setup');
  await click('Next', coach());
  await click('Next', coach());
  await click('Try on page', coach());
  expect(layer()).toBeNull();
  expect(resume().hidden).toBe(false);
  expect(host.querySelector('.app-shell')?.hasAttribute('inert')).toBe(false);
  expect(document.activeElement).toBe(host.querySelector('[data-tour="crop-targets"]'));
  await click('Set targets');
  expect(host.querySelector('dialog[open]')).toBeTruthy();
  expect(resume().hidden).toBe(true);
  expect(host.querySelector('[data-guide-focus]')).toBeNull();
  await press('dialog [aria-label="Close"]');
  expect(resume().hidden).toBe(false);
  await click('Resume tour', resume());
  checkSpotlight('[data-tour="crop-targets"]');
});
it('separates tour progress by greenhouse and member and cancels an active tour on identity changes', async () => {
  await mount();
  await openGuide();
  await start('daily');
  await click('Next', coach());
  await act(async () => store.getState().switchGreenhouse('GH-02'));
  expect(coach()).toBeNull();
  expect(
    workspaceStore.getState().preferences.guides?.progress['member-owner:GH-02'],
  ).toBeUndefined();
  await openGuide();
  await start('daily');
  await act(async () => workspaceStore.getState().update({ memberId: 'member-manager' }));
  expect(coach()).toBeNull();
  expect(
    workspaceStore.getState().preferences.guides?.progress['member-manager:GH-02'],
  ).toBeUndefined();
  expect(
    workspaceStore.getState().preferences.guides?.progress['member-owner:GH-01']?.daily?.step,
  ).toBe('schedule');
});
it('lets a Viewer learn while keeping business controls read-only', async () => {
  workspaceStore.setState({ preferences: { ...workspaceDefaults(), previewRole: 'Viewer' } });
  await mount();
  const before = JSON.stringify(store.getState().data);
  await openGuide();
  await start('setup');
  expect(coach().textContent).toContain('Role Viewer');
  await click('Next', coach());
  await click('Next', coach());
  const action = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === 'Set targets',
  )!;
  expect(action.disabled).toBe(true);
  await click('Next', coach());
  expect(JSON.stringify(store.getState().data)).toBe(before);
});
it('uses mobile section selectors and limits actions and filters to the active work area', async () => {
  await mount('/perangkat', 390);
  await select('Device sections, select a section', 'supplies');
  expect(window.location.hash).toContain('tab=supplies');
  expect(host.querySelector('.page-header-actions')?.textContent).not.toContain('Add device');
  expect(host.querySelector('.page-perangkat .stats')).toBeNull();
  await select('Device sections, select a section', 'maintenance');
  expect(host.querySelector('[aria-label="Device cost period"]')).toBeNull();
  expect(host.querySelector('input[placeholder="Search tickets or tasks…"]')).toBeTruthy();
  await select('Device sections, select a section', 'cameras');
  expect(host.querySelector('.filter-bar input')).toBeNull();
  await select('Device sections, select a section', 'inventory');
  expect(host.querySelector('.page-header-actions')?.textContent).toContain('Add device');
  await go('/biaya');
  await select('Cost sections, select a section', 'efficiency');
  expect(host.querySelector('.page-header-actions')?.textContent).toBe('');
  await select('Cost sections, select a section', 'expenses');
  expect(host.querySelector('.page-header-actions')?.textContent).toContain('Record expense');
  await go('/siklus');
  expect(host.querySelector<HTMLDetailsElement>('.workflow-map')?.open).toBe(false);
});
it('dismisses the introduction without removing the guide from the account menu', async () => {
  await mount();
  await press('[aria-label="Dismiss the introduction"]');
  expect(host.querySelector('.guide-welcome')).toBeNull();
  await openGuide();
  expect(host.querySelector('dialog[open]')?.textContent).toContain('Vigor guide');
  expect(loadPreferences(localStorage.getItem(WORKSPACE_STORAGE_KEY)).guides?.dismissed).toContain(
    'member-owner:GH-01',
  );
});

it('traps keyboard focus in the spotlight and restores page interaction on Escape', async () => {
  await mount();
  await openGuide();
  await start('workspace');
  const buttons = [...coach().querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
  await act(async () => buttons.at(-1)!.focus());
  await act(async () =>
    coach().dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true })),
  );
  expect(document.activeElement).toBe(buttons[0]);
  await act(async () =>
    coach().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    ),
  );
  expect(document.activeElement).toBe(buttons.at(-1));
  await act(async () => host.querySelector<HTMLButtonElement>('.notification-trigger')!.focus());
  expect(document.activeElement).toBe(coach().querySelector('h2'));
  await act(async () =>
    coach().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })),
  );
  await settleTour();
  expect(document.querySelector('.guide-layer')).toBeNull();
  expect(host.querySelector('.app-shell')?.hasAttribute('inert')).toBe(false);
  expect(document.querySelector('[data-guide-focus]')).toBeNull();
  expect(document.activeElement?.id).toBe('main-content');
});

it('stays visible when a target disappears and recovers when the component becomes available', async () => {
  await mount();
  await openGuide();
  await start('workspace');
  const anchor = host.querySelector<HTMLElement>('[data-tour="greenhouse-switcher"]')!;
  await act(async () => anchor.removeAttribute('data-tour'));
  await settleTour();
  expect(layer().hidden).toBe(false);
  expect(coach().textContent).toContain('unavailable in the current records');
  expect(host.querySelector('.page-header')?.hasAttribute('data-guide-focus')).toBe(true);
  await act(async () => anchor.setAttribute('data-tour', 'greenhouse-switcher'));
  await settleTour();
  checkSpotlight('[data-tour="greenhouse-switcher"]');
  await click('Next', coach());
  expect(coach().textContent).toContain('Start with crop conditions');
});

it('remeasures on orientation and visual viewport changes without restarting the tour', async () => {
  await mount('/ringkasan', 1440);
  await openGuide();
  await start('workspace');
  await click('Next', coach());
  for (const width of [768, 390, 1280]) {
    await act(async () => {
      window.innerWidth = width;
      window.dispatchEvent(new Event('resize'));
    });
    await settleTour();
    checkSpotlight('[data-tour="zone-monitoring"]');
    expect(coach().textContent).toContain('Steps 2 of 5');
  }
  const visual = Object.assign(new EventTarget(), {
    offsetLeft: 80,
    offsetTop: 120,
    width: 320,
    height: 360,
  });
  vi.stubGlobal('visualViewport', visual);
  // Reopen so the subscription uses this viewport object, like the browser at mount.
  await click('Try on page', coach());
  await click('Resume tour', resume());
  visual.height = 420;
  await act(async () => visual.dispatchEvent(new Event('resize')));
  await settleTour();
  const r = coach().getBoundingClientRect();
  expect(parseFloat(coach().style.width)).toBe(296);
  expect(r.top).toBeGreaterThanOrEqual(132);
  expect(r.bottom).toBeLessThanOrEqual(528);
});

it('scrolls to the target after the route resets scroll, including same-page section changes', async () => {
  await mount();
  await openGuide();
  await start('daily');
  window.scrollTo = vi.fn(() => {
    for (const el of host.querySelectorAll<HTMLElement>('[data-tour]')) targetTops.set(el, 1800);
  });
  await click('Next', coach());
  expect(window.scrollTo).toHaveBeenCalled();
  checkSpotlight('[data-tour="automation-schedule"]');
  expect(targetTops.get(host.querySelector('[data-tour="automation-schedule"]')!)).toBe(24);
  await press('[aria-label="Pause tour"]', coach());
  await openGuide();
  await start('harvest');
  await click('Next', coach());
  checkSpotlight('[data-tour="harvest-sales"]');
  expect(targetTops.get(host.querySelector('[data-tour="harvest-sales"]')!)).toBe(24);
});

it('resumes the same step after trying another page, without duplicating layers or losing progress', async () => {
  await mount();
  await openGuide();
  await start('workspace');
  await click('Try on page', coach());
  expect(document.documentElement.style.overflow).toBe('');
  await go('/perangkat?tab=maintenance');
  expect(coach()).toBeNull();
  await click('Resume tour', resume());
  expect(window.location.hash).toBe('#/ringkasan');
  expect(document.querySelectorAll('.guide-layer')).toHaveLength(1);
  checkSpotlight('[data-tour="greenhouse-switcher"]');
});

it('returns to Monitoring after trying another greenhouse tab with the same 2D query', async () => {
  await mount();
  await openGuide();
  await start('workspace');
  await click('Next', coach());
  await click('Next', coach());
  await click('Try on page', coach());
  await go('/greenhouse?tab=zones&view=2d');
  await click('Resume tour', resume());
  expect(window.location.hash).toBe('#/greenhouse?tab=monitoring&view=2d');
  checkSpotlight('[data-tour="greenhouse-map"]');
});
