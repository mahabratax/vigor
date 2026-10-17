// @vitest-environment jsdom
import React, { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { SpatialView } from '../src/features/greenhouse/SpatialView';
import { createFixture } from '../src/data/fixtures';
import type { SceneProps } from '../src/features/greenhouse/Scene';
import type { SpatialLayer } from '../src/features/greenhouse/spatialModel';
import { normalizeQuery } from '../src/app/navigation';
import { PlanBedArt } from '../src/features/greenhouse/PlanBedArt';
import { cropAppearance } from '../src/features/greenhouse/botanicalModel';
const scene = vi.hoisted(() => ({ reject: false }));
vi.mock('../src/features/greenhouse/Scene', () => ({
  default: (props: SceneProps) => {
    if (scene.reject) throw new Error('Simulated renderer initialization failure');
    return (
      <div
        data-testid="scene-probe"
        data-mode={props.mode}
        data-zone={props.selected}
        data-command={props.command.action}
        data-structure={String(props.structure)}
        data-devices={String(props.devices)}
        data-asset={props.selectedAsset ?? ''}
      >
        <button onClick={props.onUnavailable}>Simulate context loss</button>
        <button onClick={() => props.onSelectAsset('water')}>Select water asset</button>
        <button onClick={() => props.onSelect('A')}>Select zone A</button>
      </div>
    );
  },
}));
let root: Root, host: HTMLDivElement;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  scene.reject = false;
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
function Harness({ initialView = '2d' }: { initialView?: '2d' | '3d' }) {
  const [view, setView] = useState(initialView),
    [layer, setLayer] = useState<SpatialLayer>('coverage'),
    [selected, setSelected] = useState('B');
  const s = createFixture();
  s.zones[0].name = 'Selada timur dekat pintu masuk greenhouse';
  return (
    <SpatialView
      s={s}
      selected={selected}
      onSelect={setSelected}
      layer={layer}
      view={view}
      onLayer={setLayer}
      onView={setView}
    />
  );
}
async function click(text: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent?.trim() === text,
  );
  expect(button, text).toBeTruthy();
  await act(async () => button!.click());
}
it.each([390, 768, 1280, 1440])(
  'keeps plan selection and layer controls working at %s px (DOM only)',
  async (width) => {
    window.innerWidth = width;
    await act(async () => root.render(<Harness />));
    expect(host.querySelectorAll('button.map-zone')).toHaveLength(6);
    const target = host.querySelector<HTMLButtonElement>('[data-zone="A"]')!;
    expect(target.getAttribute('aria-label')).toContain(
      'Selada timur dekat pintu masuk greenhouse',
    );
    await act(async () => target.click());
    expect(host.querySelector<HTMLSelectElement>('[aria-label="Plan zones"]')!.value).toBe('A');
    expect(target.getAttribute('aria-pressed')).toBe('true');
    await click('Temperature');
    expect(host.querySelector('[data-zone="A"] .plan-zone-status')!.textContent).toContain(
      '27.8 °C',
    );
    expect(host.querySelector('[aria-label="Legend Temperature"]')!.textContent).toContain('30 °C');
    await click('3D');
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-zone')).toBe('A');
    await click('Top view');
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-mode')).toBe(
      'top',
    );
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Zoom in"]')!.click());
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-command')).toBe(
      'in',
    );
    await click('Focus zone');
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-command')).toBe(
      'focus',
    );
    await click('Fit view');
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-command')).toBe(
      'fit',
    );
    await click('Select water asset');
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-asset')).toBe(
      'water',
    );
    await click('Focus asset');
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-command')).toBe(
      'focus_asset',
    );
    await click('Select zone A');
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-asset')).toBe('');
    await act(async () => host.querySelector<HTMLInputElement>('.scene-structure input')!.click());
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-structure')).toBe(
      'false',
    );
    const deviceToggle = [...host.querySelectorAll<HTMLLabelElement>('label')]
      .find((el) => el.textContent?.trim() === 'Devices')!
      .querySelector<HTMLInputElement>('input')!;
    await act(async () => deviceToggle.click());
    expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-devices')).toBe(
      'false',
    );
    await click('2D');
    expect(host.querySelector('.plan-camera')).toBeNull();
    expect(host.querySelector('[data-zone="A"]')!.getAttribute('aria-pressed')).toBe('true');
  },
);
it('recovers to the working plan after context loss and retries 3D without losing the selected zone or layer', async () => {
  await act(async () => root.render(<Harness initialView="3d" />));
  await click('Temperature');
  await click('Simulate context loss');
  expect(host.textContent).toContain('3D view unavailable');
  expect(host.querySelector('[data-zone="B"]')!.getAttribute('aria-pressed')).toBe('true');
  expect(
    [...host.querySelectorAll('button')]
      .find((b) => b.textContent === '2D')!
      .getAttribute('aria-pressed'),
  ).toBe('true');
  await act(async () => host.querySelector<HTMLButtonElement>('[data-zone="D"]')!.click());
  await click('Retry 3D');
  expect(host.querySelector('[data-testid="scene-probe"]')!.getAttribute('data-zone')).toBe('D');
  expect(host.querySelector('[aria-label="Legend Temperature"]')).toBeTruthy();
  expect(host.textContent).not.toContain('3D view unavailable');
});
it('catches a renderer startup exception without crashing the greenhouse page', async () => {
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});
  scene.reject = true;
  await act(async () => root.render(<Harness initialView="3d" />));
  expect(host.querySelectorAll('.map-zone')).toHaveLength(6);
  expect(host.textContent).toContain('3D view unavailable');
  scene.reject = false;
  await click('Retry 3D');
  expect(host.querySelector('[data-testid="scene-probe"]')).toBeTruthy();
  error.mockRestore();
});
it('normalizes unsupported layers without losing dynamic zone links', () => {
  expect(normalizeQuery('/greenhouse', 'view=3d&zone=Z27&layer=bad')).toBe(
    'view=3d&zone=Z27&layer=coverage',
  );
});

it('keeps equipment selection and details usable when artwork fails', async () => {
  await act(async () => root.render(<Harness />));
  expect(host.querySelector('.service-selector')).toBeNull();
  const water = host.querySelector<HTMLButtonElement>('[data-service="water"]')!;
  expect(water).toBeTruthy();
  await act(async () => water.querySelector('img')!.dispatchEvent(new Event('error')));
  expect(water.querySelector('img')).toBeNull();
  expect(water.querySelector('svg')).toBeTruthy();
  await act(async () => water.click());
  expect(water.getAttribute('aria-pressed')).toBe('true');
  expect(host.querySelector('.service-details [data-farm-object="water"]')).toBeTruthy();
  await act(async () =>
    host.querySelector<HTMLButtonElement>('[aria-label="Close asset details"]')!.click(),
  );
  expect(host.querySelector('.service-details')).toBeNull();
});

it('shows a representative planting without inventing crops in empty or inactive beds', async () => {
  const s = createFixture();
  const crop = cropAppearance(s, s.zones[0]);
  await act(async () =>
    root.render(<PlanBedArt crop={{ ...crop, plants: 800, inactive: false }} />),
  );
  expect(host.querySelectorAll('[data-plant]')).toHaveLength(18);
  expect(host.querySelectorAll('defs image')).toHaveLength(1);
  await act(async () => root.render(<PlanBedArt crop={{ ...crop, plants: 0 }} />));
  expect(host.querySelector('[data-plant], image')).toBeNull();
  await act(async () =>
    root.render(<PlanBedArt crop={{ ...crop, plants: 800, inactive: true }} />),
  );
  expect(host.querySelector('[data-plant], image')).toBeNull();
});

it('keeps distinct sprite references and bed structure when a plant image fails', async () => {
  const s = createFixture();
  const crop = { ...cropAppearance(s, s.zones[0]), plants: 3, inactive: false };
  await act(async () =>
    root.render(
      <>
        <PlanBedArt crop={{ ...crop, bed: 'channels' }} />
        <PlanBedArt crop={{ ...crop, bed: 'bags' }} />
      </>,
    ),
  );
  const images = host.querySelectorAll('defs image');
  expect(images).toHaveLength(2);
  expect(images[0].id).not.toBe(images[1].id);
  await act(async () => images[0].dispatchEvent(new Event('error')));
  expect(host.querySelector('[data-bed="channels"] image, [data-bed="channels"] use')).toBeNull();
  expect(host.querySelector('[data-bed="channels"] path')).toBeTruthy();
  expect(host.querySelectorAll('[data-bed="bags"] use')).toHaveLength(3);
});
