// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { beforeEach, afterEach, expect, it, vi } from 'vitest';
import App from '../src/app/App';
import { store, createDomainStore } from '../src/store/store';
import { workspaceStore, workspaceDefaults } from '../src/store/workspace';
import { createFixture } from '../src/data/fixtures';
import { activeTarget } from '../src/domain/cropTargets';
import { supplyBalance } from '../src/domain/supplies';
import { efficiencySummary } from '../src/domain/efficiency';
import { normalizeQuery } from '../src/app/navigation';
vi.mock('../src/store/persistence', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/store/persistence')>();
  const transport = await import('./support/domain-transport');
  return { ...actual, ...transport };
});
vi.mock('../src/features/greenhouse/Scene', () => ({
  default: () => <div>WebGL excluded from DOM tests</div>,
}));
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
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
  const s = createFixture();
  store.setState({
    data: s,
    greenhouses: { 'GH-01': s },
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
});
async function mount(path: string, width = 390) {
  window.innerWidth = width;
  window.history.replaceState({}, '', '/#' + path);
  await act(async () => root.render(<App />));
}
async function go(path: string) {
  await act(async () => {
    window.location.hash = path;
    await new Promise((r) => setTimeout(r, 20));
  });
}
async function click(text: string, scope: ParentNode = host) {
  const b = [...scope.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === text,
  );
  expect(b, `button ${text}`).toBeTruthy();
  await act(async () => b!.click());
}
async function field(name: string, text: string) {
  const el = host.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
    `dialog [name="${name}"]`,
  )!;
  expect(el, name).toBeTruthy();
  await act(async () => {
    const proto =
      el.tagName === 'TEXTAREA'
        ? HTMLTextAreaElement.prototype
        : el.tagName === 'SELECT'
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value')!.set!.call(el, text);
    el.dispatchEvent(new Event(el.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  });
}
async function check(name: string) {
  await act(async () => host.querySelector<HTMLInputElement>(`dialog [name="${name}"]`)!.click());
}
async function submit(text: string) {
  await click(text, host.querySelector('dialog')!);
  expect(host.querySelector('[role=alert].form-error')?.textContent ?? '').toBe('');
}
it.each([390, 768, 1280, 1440])(
  'connects targets, evidence review, stock and efficiency at %s px (DOM only)',
  async (width) => {
    await mount('/greenhouse?tab=zones&zone=A&panel=targets', width);
    await click('Set targets');
    await field('temperatureMin', '26');
    await field('temperatureMax', '29');
    await field('notes', 'Rentang contoh untuk review prototype Vigor.');
    await submit('Save target draft');
    expect(activeTarget(store.getState().data, 'A')).toBeUndefined();
    await click('Review & activate target');
    expect(activeTarget(store.getState().data, 'A')?.version).toBe(1);
    expect(host.textContent).toContain('Within range');
    await act(async () => {
      store.getState().dispatch({ type: 'run_once', id: 'RTN-003' });
      store.getState().dispatch({ type: 'tick', seconds: 240 });
      store.getState().dispatch({ type: 'play', value: false });
    });
    await go('/greenhouse?tab=operations&routine=RTN-003');
    expect(host.querySelector('.run-outcome')!.textContent).toContain('27.8');
    await click('Record outcome review');
    await field('verdict', 'unchanged');
    await field('notes', 'Nilai sensor demo belum berubah setelah run.');
    await submit('Save outcome review');
    expect(store.getState().data.runs[0].evidence!.reviews[0].verdict).toBe('unchanged');
    await go('/perangkat?tab=supplies');
    await click('Add item');
    await field('name', 'Nutrisi A');
    await field('unit', 'L');
    await field('category', 'Nutrisi');
    await field('deviceId', 'DOSE-01');
    await field('reorderAt', '2');
    await field('operator', 'Aldi');
    await check('autoTask');
    await submit('Save item');
    await click('Record movement');
    await field('quantity', '10');
    await field('notes', 'Saldo awal barang dari gudang.');
    await submit('Save movement');
    await click('Record movement');
    await field('kind', 'use');
    await field('quantity', '9');
    await field('notes', 'Refill larutan untuk demonstrasi.');
    await submit('Save movement');
    const s = store.getState().data,
      id = s.supplies!.items[0].id;
    expect(supplyBalance(s, id)).toBe(1);
    expect(s.maintenance.filter((m) => m.supplyItemId === id)).toHaveLength(1);
    expect(s.expenses).toHaveLength(7);
    await click('Link expense');
    await field('expenseId', s.expenses.find((e) => e.category === 'Nutrisi')!.id);
    await submit('Save expense link');
    expect(store.getState().data.expenses).toHaveLength(7);
    await go('/biaya?tab=efficiency');
    expect(host.textContent).toContain('No reviewed output to divide by');
    await act(async () => {
      store.getState().dispatch({ type: 'crop_sample' });
    });
    await click('Record additional usage');
    await field('waterLiters', '470');
    await field('energyKwh', '4.7');
    await field('notes', 'Pemakaian tambahan di luar catatan run.');
    await check('excludesRuns');
    await submit('Save usage');
    expect(efficiencySummary(store.getState().data).waterPerKg).toBe(10);
    await click('Review usage allocation');
    await field('coverage', 'partial');
    await field('notes', 'Cakupan sementara untuk demonstrasi presentasi.');
    await submit('Save usage review');
    expect(efficiencySummary(store.getState().data).reviewed).toBe(true);
    expect(host.textContent).toContain('Partial coverage');
    const restored = store.getState().data; // Relational reload is verified in sqlite.vitest.test.ts.
    expect(restored.targets?.revisions.length).toBe(1);
    expect(restored.supplies?.movements.length).toBe(2);
    expect(restored.resources?.extras.length).toBe(1);
    expect(restored.runs[0].evidence?.reviews.length).toBe(1);
  },
);
it('keeps new mutation controls disabled for Viewer across all four surfaces', async () => {
  workspaceStore.setState({ preferences: { ...workspaceDefaults(), previewRole: 'Viewer' } });
  await mount('/greenhouse?tab=zones&zone=A&panel=targets');
  const disabled = (text: string) => {
    const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.textContent?.trim() === text,
    )!;
    expect(button, text).toBeTruthy();
    expect(button.disabled).toBe(true);
  };
  disabled('Set targets');
  await go('/perangkat?tab=supplies');
  disabled('Add item');
  await go('/biaya?tab=efficiency');
  disabled('Record additional usage');
  disabled('Review usage allocation');
  await go('/greenhouse?tab=operations');
  expect(host.textContent).not.toContain('Lanjutkan 60 detik');
  expect(store.getState().data.targets).toBeUndefined();
  expect(store.getState().data.supplies).toBeUndefined();
  expect(store.getState().data.resources).toBeUndefined();
});
it('keeps new deep links and target panels intact through route normalization', () => {
  expect(normalizeQuery('/greenhouse', 'tab=zones&zone=A&panel=targets')).toContain(
    'panel=targets',
  );
  expect(normalizeQuery('/perangkat', 'tab=supplies&supply=SUP-001')).toContain('tab=supplies');
  expect(normalizeQuery('/biaya', 'tab=efficiency')).toBe('tab=efficiency');
});

it.each([390, 768, 1280, 1440])(
  'opens AI readiness and a read-only routine preview at %s px (DOM only)',
  async (width) => {
    const before = JSON.stringify(store.getState().data);
    await mount('/settings?tab=ai', width);
    expect(host.querySelector('.settings-page')?.textContent).toContain('AI integration');
    expect(host.textContent).toContain('Setup required');
    expect(host.textContent).toContain('Not configured');
    expect(host.textContent).toContain('Export AI input');
    await click('Check inputs again');
    await click('Preview a routine');
    expect(window.location.hash).toContain('tab=preview');
    expect(host.textContent).toContain('Routine preview');
    expect(host.textContent).toContain('Read-only preview');
    await click('Check again');
    expect(JSON.stringify(store.getState().data)).toBe(before);
    await click('Review sensor evidence');
    expect(host.textContent).toContain('Sensor evidence');
    await go('/settings?tab=storage');
    expect(host.textContent).toContain('Data & backup');
    expect(JSON.stringify(store.getState().data)).toBe(before);
  },
);
