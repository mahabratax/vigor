// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Energy } from '../src/features/greenhouse/Energy';
import { SpatialView } from '../src/features/greenhouse/SpatialView';
import { createFixture } from '../src/data/fixtures';
import { transition } from '../src/domain/actions';
import type { PageContext } from '../src/app/context';
import { defaultEnergy } from '../src/domain/energy';

let root: Root, host: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
const nav = vi.fn();
function Harness({ viewer = false }: { viewer?: boolean }) {
  const [s, setS] = useState(createFixture);
  const ctx: PageContext = {
    s,
    nav,
    query: new URLSearchParams(),
    mobile: false,
    open: () => {},
    can: () => !viewer,
    act: (a) => {
      const { result, data } = transition(s, a);
      if (result.ok) setS(data);
      return result;
    },
  };
  return (
    <>
      <Energy ctx={ctx} />
      <output data-saved>{s.energy?.panelCount ?? 'unsaved'}</output>
    </>
  );
}
async function input(el: HTMLInputElement, text: string) {
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(el, text);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  });
}
async function button(text: string) {
  const b = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === text,
  );
  expect(b).toBeTruthy();
  await act(async () => b!.click());
}
it.each([390, 768, 1280, 1440])(
  'edits and saves energy assumptions at %s px (DOM only)',
  async (width) => {
    window.innerWidth = width;
    await act(async () => root.render(<Harness />));
    expect(host.textContent).toContain('Enter installation investment');
    await input(host.querySelector<HTMLInputElement>('[name="panelCount"]')!, '6');
    await input(host.querySelector<HTMLInputElement>('[name="investment"]')!, '5000000');
    expect(host.textContent).toContain('Unsaved changes');
    expect(host.textContent).toContain('years, if daily assumptions');
    await button('Save scenario');
    expect(host.querySelector('[data-saved]')!.textContent).toBe('6');
    expect(host.textContent).not.toContain('Unsaved changes');
    await button('View recorded bills');
    expect(nav).toHaveBeenLastCalledWith('/biaya?tab=expenses&category=Listrik');
  },
);
it('keeps configuration read-only for Viewer, including per-device load assumptions', async () => {
  await act(async () => root.render(<Harness viewer />));
  expect([...host.querySelectorAll<HTMLInputElement>('input')].every((i) => i.disabled)).toBe(true);
  const save = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === 'Save scenario',
  )!;
  expect(save.disabled).toBe(true);
});
it('selects physical services in the 2D fallback and follows their real workflow links', async () => {
  const s = createFixture();
  await act(async () =>
    root.render(
      <SpatialView
        s={s}
        selected="B"
        onSelect={() => {}}
        layer="coverage"
        view="2d"
        onLayer={() => {}}
        onView={() => {}}
        onNavigate={nav}
      />,
    ),
  );
  expect(host.querySelectorAll('[data-service]')).toHaveLength(5);
  await act(async () => host.querySelector<HTMLButtonElement>('[data-service="water"]')!.click());
  expect(
    host.querySelector('section[aria-label="Details Tank & irrigation"]')!.textContent,
  ).toContain('Water level 72%');
  await button('Device details');
  expect(nav).toHaveBeenLastCalledWith('/perangkat?device=PUMP-01');
  await button('Linked costs');
  expect(nav).toHaveBeenLastCalledWith('/biaya?tab=expenses&device=PUMP-01');
  await button('Review operations');
  expect(nav).toHaveBeenLastCalledWith('/greenhouse?tab=operations&routine=RTN-001');
  await act(async () => host.querySelector<HTMLButtonElement>('[data-service="solar"]')!.click());
  await button('Review energy & costs');
  expect(nav).toHaveBeenLastCalledWith('/greenhouse?tab=energy');
  s.energy = { ...defaultEnergy(s), enabled: false };
  await act(async () =>
    root.render(
      <SpatialView
        s={s}
        selected="B"
        onSelect={() => {}}
        layer="coverage"
        view="2d"
        onLayer={() => {}}
        onView={() => {}}
        onNavigate={nav}
      />,
    ),
  );
  expect(host.querySelector('[data-service="solar"]')).toBeNull();
  expect(host.querySelector('section[aria-label="Detail PLTS & inverter"]')).toBeNull();
});
