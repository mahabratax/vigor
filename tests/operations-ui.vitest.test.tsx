// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Operations } from '../src/features/greenhouse/Operations';
import { createFixture } from '../src/data/fixtures';
import { transition } from '../src/domain/actions';
import type { PageContext } from '../src/app/context';
import type { DomainState } from '../src/domain/types';
import { AccessContext } from '../src/features/access/AccessContext';

let root: Root, host: HTMLDivElement;
const nav = vi.fn(),
  open = vi.fn(),
  action = vi.fn();
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
  vi.clearAllMocks();
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
});
function Harness({
  viewer = false,
  initial = createFixture(),
  query = 'tab=operations',
}: {
  viewer?: boolean;
  initial?: DomainState;
  query?: string;
}) {
  const [s, setS] = useState(initial),
    [search, setSearch] = useState(query);
  const ctx: PageContext = {
    s,
    query: new URLSearchParams(search),
    mobile: window.innerWidth < 1000,
    open,
    nav: (url) => {
      nav(url);
      if (url.startsWith('/greenhouse')) setSearch(url.split('?')[1] ?? '');
    },
    act: (a) => {
      action(a);
      const { data, result } = transition(s, a);
      if (result.ok) setS(data);
      return result;
    },
  };
  return (
    <AccessContext.Provider value={viewer ? 'Viewer' : 'Owner'}>
      <Operations ctx={ctx} />
      <output data-clock>{s.clock}</output>
    </AccessContext.Provider>
  );
}
async function click(text: string) {
  const b = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === text,
  );
  expect(b, text).toBeTruthy();
  await act(async () => b!.click());
}
async function select(label: string, value: string) {
  const el = host.querySelector<HTMLSelectElement>(`[aria-label="${label}"]`)!;
  await act(async () => {
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
}
it.each([390, 768, 1280, 1440])(
  'reviews condition → execution → outcome and linked workflows at %s px (DOM only)',
  async (width) => {
    window.innerWidth = width;
    let s = createFixture();
    s.scenario = 'increasing';
    s = transition(s, { type: 'tick', seconds: 60 }).data;
    await act(async () => root.render(<Harness initial={s} />));
    expect(host.querySelectorAll('.operations-sequence>li')).toHaveLength(5);
    expect(host.textContent).toContain('Gateway and scheduler are not connected.');
    await select('Select an operations routine', 'RTN-003');
    expect(nav).toHaveBeenLastCalledWith('/greenhouse?tab=operations&routine=RTN-003');
    await click('Check rules');
    expect(open).toHaveBeenLastCalledWith('dry-run', 'RTN-003');
    expect(host.textContent).not.toContain('Lanjutkan 60 detik');
    expect(host.querySelector('[data-clock]')!.textContent).toBe(String(s.clock));
    expect(host.querySelector('.operations-detail')!.textContent).toContain('Running');
    await click('View execution steps');
    expect(nav).toHaveBeenLastCalledWith(expect.stringMatching(/^\/otomasi\?tab=executions&run=/));
    await click('Review temperature sensor');
    expect(nav).toHaveBeenLastCalledWith('/perangkat?device=TH-A-01');
    const profit = host.querySelector<HTMLButtonElement>('.operations-handoffs button:last-child')!;
    await act(async () => profit.click());
    expect(nav).toHaveBeenLastCalledWith('/biaya?tab=profit');
    await select('Operations zone filter', 'F');
    expect(host.textContent).toContain('No automation in this scope');
    await click('Create routine');
    expect(nav).toHaveBeenLastCalledWith('/otomasi?tab=builder');
  },
);
it('keeps scenario and clock mutations disabled for Viewer while allowing read-only rule review', async () => {
  await act(async () => root.render(<Harness viewer />));
  for (const text of ['Coba skenario', 'Lanjutkan 60 detik']) {
    const b = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
      (b) => b.textContent?.trim() === text,
    )!;
    expect(b).toBeUndefined();
  }
  expect(action).not.toHaveBeenCalled();
  expect(open).not.toHaveBeenCalled();
  await click('Check rules');
  expect(open).toHaveBeenCalledWith('dry-run', 'RTN-001');
});
it('shows the actual low-tank blocker and leads to its device record', async () => {
  const s = createFixture();
  s.scenario = 'low_tank';
  await act(async () => root.render(<Harness initial={s} />));
  expect(host.textContent).toContain('Conditions not met');
  expect(host.querySelector('.operations-warning')!.textContent).toMatch(/tank/i);
  const sensor = host.querySelector<HTMLButtonElement>('.operations-readings dt button')!;
  await act(async () => sensor.click());
  expect(nav).toHaveBeenLastCalledWith(expect.stringMatching(/^\/perangkat\?device=/));
});
