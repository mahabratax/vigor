// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Sparkline, TrendChart } from '../src/components/charts';

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
});
it('distinguishes missing observations from recorded zero captures in the native component', async () => {
  await act(async () =>
    root.render(<TrendChart data={[{ day: 'Mon', A: NaN, B: null }]} keys={['A', 'B']} />),
  );
  expect(host.textContent).toContain('No observations for this selection');
  expect(host.textContent).toContain('Missing readings are not zero captures');
  await act(async () => root.render(<TrendChart data={[{ day: 'Mon', A: 0 }]} keys={['A']} />));
  expect(host.textContent).not.toContain('No observations');
  expect(host.querySelector('.chart-native')).not.toBeNull();
});
it('offers recovery when every legend series has been hidden', async () => {
  await act(async () =>
    root.render(<TrendChart data={[{ day: 'Mon', A: 0, B: 3 }]} keys={['A', 'B']} />),
  );
  for (const button of host.querySelectorAll<HTMLButtonElement>('.chart-legend button'))
    await act(async () => button.click());
  expect(host.textContent).toContain('All zones are hidden');
  const restore = [...host.querySelectorAll('button')].find(
    (b) => b.textContent?.trim() === 'Show all zones',
  )!;
  await act(async () => restore.click());
  expect(host.textContent).not.toContain('All zones are hidden');
  expect(
    [...host.querySelectorAll('.chart-legend button')].every(
      (b) => b.getAttribute('aria-pressed') === 'true',
    ),
  ).toBe(true);
});
it('draws a single sparkline reading without NaN geometry and ignores invalid values', async () => {
  await act(async () => root.render(<Sparkline points={[0]} />));
  expect(host.innerHTML).not.toMatch(/NaN|Infinity/);
  expect(host.querySelector('circle')?.getAttribute('cx')).toBe('100');
  await act(async () => root.render(<Sparkline points={[NaN, null, Infinity]} />));
  expect(host.textContent).toContain('No data available yet');
});
