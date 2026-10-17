// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { AssetPin } from '../src/features/greenhouse/AssetPin';
import { createFixture } from '../src/data/fixtures';
import { serviceAssets, type ServiceId } from '../src/features/greenhouse/serviceModel';

let root: Root, host: HTMLDivElement;
const focus = vi.fn(),
  nav = vi.fn();
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
function Harness({ id = 'water' }: { id?: ServiceId }) {
  const [selected, setSelected] = useState<ServiceId | null>(null);
  const asset = serviceAssets(createFixture()).find((a) => a.id === id)!;
  return (
    <AssetPin
      asset={asset}
      selected={selected === id}
      onSelect={setSelected}
      onFocus={focus}
      onNavigate={nav}
      zones={id === 'solar' ? [] : ['Zone A', 'Zone B']}
      operationsUrl={id === 'water' ? '/greenhouse?tab=operations&routine=RTN-001' : undefined}
      projection={{
        id,
        x: 180,
        y: 190,
        dx: 0,
        dy: 0,
        popover: { left: -100, top: 20, width: 280, maxHeight: 260 },
      }}
    />
  );
}
async function click(text: string) {
  const b = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === text,
  );
  expect(b, text).toBeTruthy();
  await act(async () => b!.click());
}
it.each([390, 768, 1280, 1440])(
  'reveals a keyboard tooltip, pins actions and returns focus on Escape at %s px (DOM only)',
  async (width) => {
    window.innerWidth = width;
    await act(async () => root.render(<Harness />));
    const pin = host.querySelector<HTMLButtonElement>('.scene-asset-label')!;
    expect(host.querySelector('[role=tooltip]')).toBeNull();
    await act(async () => pin.focus());
    expect(host.querySelector('[role=tooltip]')!.textContent).toContain('Water level 72%');
    expect(host.querySelector('[role=tooltip] button')).toBeNull();
    expect(pin.getAttribute('aria-describedby')).toBeTruthy();
    await act(async () => pin.click());
    expect(pin.getAttribute('aria-expanded')).toBe('true');
    expect(host.querySelector('[role=dialog]')!.textContent).toContain('Zone A, Zone B');
    await click('Focus asset');
    expect(focus).toHaveBeenCalledTimes(1);
    await click('Device details');
    expect(nav).toHaveBeenLastCalledWith('/perangkat?device=PUMP-01');
    await click('View related operation');
    expect(nav).toHaveBeenLastCalledWith('/greenhouse?tab=operations&routine=RTN-001');
    await act(async () =>
      host.querySelector<HTMLButtonElement>('.scene-asset-actions button')!.focus(),
    );
    await act(async () =>
      document.activeElement!.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      ),
    );
    expect(host.querySelector('[role=dialog]')).toBeNull();
    expect(host.querySelector('[role=tooltip]')).toBeNull();
    expect(document.activeElement).toBe(pin);
    expect(pin.getAttribute('aria-expanded')).toBe('false');
  },
);
it('allows click/tap selection without hover and labels solar as a projection', async () => {
  await act(async () => root.render(<Harness id="solar" />));
  const pin = host.querySelector<HTMLButtonElement>('.scene-asset-label')!;
  await act(async () => pin.click());
  expect(host.querySelector('[role=dialog]')!.textContent).toContain('Sample projection');
  await click('Review energy');
  expect(nav).toHaveBeenLastCalledWith('/greenhouse?tab=energy');
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Close asset tooltip"]')!.click(),
  );
  expect(host.querySelector('[role=dialog]')).toBeNull();
});
