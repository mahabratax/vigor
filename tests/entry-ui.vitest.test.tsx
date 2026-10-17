// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import LoginPage from '../src/features/auth/LoginPage';
import BrowserApp from '../src/app/BrowserApp';
import { enterPrototype, exitPrototype, workspaceReturn } from '../src/features/auth/entry';
import { workspaceStore } from '../src/store/workspace';
import { FarmIllustration, pageIllustration } from '../src/components/FarmIllustration';

const persistence = vi.hoisted(() => ({
  initialize: vi.fn(),
  refresh: vi.fn(),
  backup: vi.fn(),
}));
vi.mock('../src/store/persistence', () => ({
  initializeWorkspace: persistence.initialize,
  refreshWorkspace: persistence.refresh,
  exportBrowserBackup: persistence.backup,
  connectionStore: { getState: () => ({ pending: 0 }) },
}));
vi.mock('../src/app/App', () => ({
  default: () => (
    <main>
      Greenhouse workspace opened<button onClick={exitPrototype}>Logout</button>
    </main>
  ),
}));
vi.mock('../src/features/settings/StorageSettings', () => ({
  StorageSettings: () => <button>Restore backup</button>,
}));

let host: HTMLDivElement, root: Root;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  vi.clearAllMocks();
  persistence.initialize.mockResolvedValue(undefined);
  persistence.refresh.mockResolvedValue(undefined);
  exitPrototype();
  window.sessionStorage.clear();
  window.history.replaceState({}, '', '/');
  document.documentElement.dataset.theme = 'light';
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
async function render(view: React.ReactNode) {
  await act(async () => {
    root.render(view);
  });
}
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

it('opens the workspace from the primary button without credentials or an external redirect', async () => {
  const route = '/#/siklus?tab=harvest&zone=B';
  window.history.replaceState({}, '', '/login?returnTo=' + encodeURIComponent(route));
  const open = vi.spyOn(window, 'open');
  await render(<BrowserApp />);
  await settle();
  const button = host.querySelector<HTMLButtonElement>('button.entry-primary')!;
  expect(button.textContent).toContain('Enter workspace');
  expect(host.querySelector('input, form')).toBeNull();
  expect(persistence.initialize).not.toHaveBeenCalled();
  await act(async () => button.click());
  await settle();
  expect(window.location.pathname + window.location.hash).toBe(route);
  expect(host.textContent).toContain('Greenhouse workspace opened');
  expect(persistence.initialize).toHaveBeenCalledOnce();
  expect(open).not.toHaveBeenCalled();
});

it.each([
  'https://other.example/',
  '//other.example/',
  '/login',
  '/#/unknown',
  '/#/ringkasan\\other.example',
  '/#/ringkasan\nunsafe',
  'javascript:alert(1)',
])('replaces an unsafe or unknown return destination: %s', (destination) => {
  expect(workspaceReturn(destination)).toBe('/#/ringkasan');
});

it('explains prototype access without claiming a verified identity', async () => {
  await render(<LoginPage returnTo="/#/settings?tab=profile" />);
  expect(host.querySelector('a.entry-primary')).toBeNull();
  expect(host.textContent).toContain('Prototype access. No email or password needed.');
  expect(host.textContent).not.toContain('ChatGPT');
});

it('keeps access help and theme switching usable without changing workspace records', async () => {
  await render(<LoginPage />);
  await act(async () => host.querySelector<HTMLButtonElement>('.entry-help-trigger')!.click());
  expect(host.querySelector('.entry-help-trigger')!.getAttribute('aria-expanded')).toBe('true');
  expect(host.querySelector('#entry-help')!.textContent).toContain('does not verify your identity');
  const theme = host.querySelector<HTMLButtonElement>('.entry-theme')!;
  await act(async () => theme.click());
  expect(document.documentElement.dataset.theme).toBe('dark');
  expect(theme.getAttribute('aria-label')).toBe('Use light theme');
  await act(async () => theme.click());
  expect(document.documentElement.dataset.theme).toBe('light');
  expect(persistence.initialize).not.toHaveBeenCalled();
});

it('does not route away from root entry when keyboard users skip to sign-in', async () => {
  await render(<BrowserApp />);
  await settle();
  const skip = host.querySelector<HTMLAnchorElement>('.skip-link');
  expect(skip).toBeTruthy();
  await act(async () => skip!.click());
  expect(document.activeElement?.id).toBe('sign-in');
  expect(window.location.hash).toBe('');
  expect(persistence.initialize).not.toHaveBeenCalled();
});

it.each(['/', '/login', '/#/login'])(
  'opens %s without starting SQLite, including focus and reconnect',
  async (path) => {
    window.history.replaceState({}, '', path);
    await render(<BrowserApp />);
    await settle();
    expect(host.querySelector('h1')?.textContent).toBe('Welcome to Vigor');
    await act(async () => {
      window.dispatchEvent(new Event('focus'));
      window.dispatchEvent(new Event('online'));
    });
    expect(persistence.initialize).not.toHaveBeenCalled();
    expect(persistence.refresh).not.toHaveBeenCalled();
  },
);

it('continues directly into an existing deep link and still refreshes browser records', async () => {
  enterPrototype('/#/greenhouse?tab=zones&zone=B');
  await render(<BrowserApp />);
  await settle();
  expect(persistence.initialize).toHaveBeenCalledOnce();
  expect(host.textContent).toContain('Greenhouse workspace opened');
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(persistence.refresh).toHaveBeenCalledOnce();
});

it('opens the workspace after leaving entry and stops refresh listeners when returning to login', async () => {
  await render(<BrowserApp />);
  await settle();
  await act(async () => {
    host.querySelector<HTMLButtonElement>('button.entry-primary')!.click();
  });
  await settle();
  expect(persistence.initialize).toHaveBeenCalledOnce();
  expect(host.textContent).toContain('Greenhouse workspace opened');
  await act(async () => {
    host.querySelector<HTMLButtonElement>('main button')!.click();
  });
  await settle();
  await act(async () => window.dispatchEvent(new Event('focus')));
  expect(host.querySelector('h1')?.textContent).toBe('Welcome to Vigor');
  expect(window.location.pathname).toBe('/login');
  expect(persistence.refresh).not.toHaveBeenCalled();
});

it('retains recovery and retry when SQLite cannot open after sign-in', async () => {
  persistence.initialize.mockRejectedValueOnce(new Error('Browser storage is unavailable.'));
  enterPrototype('/#/ringkasan');
  await render(<BrowserApp />);
  expect(host.textContent).toContain('Browser storage is unavailable.');
  expect(host.textContent).toContain('Restore backup');
  const buttons = [...host.querySelectorAll<HTMLButtonElement>('button')];
  await act(async () =>
    buttons.find((button) => button.textContent === 'Export browser data')!.click(),
  );
  expect(persistence.backup).toHaveBeenCalledOnce();
  await act(async () => buttons.find((button) => button.textContent === 'Try again')!.click());
  await settle();
  expect(host.textContent).toContain('Greenhouse workspace opened');
});

it('preserves an unopened deep link through local entry', async () => {
  window.history.replaceState({}, '', '/#/greenhouse?tab=zones&zone=B');
  await render(<BrowserApp />);
  await settle();
  expect(persistence.initialize).not.toHaveBeenCalled();
  await act(async () => host.querySelector<HTMLButtonElement>('button.entry-primary')!.click());
  await settle();
  expect(window.location.hash).toBe('#/greenhouse?tab=zones&zone=B');
  expect(host.textContent).toContain('Greenhouse workspace opened');
});

it('enters and logs out when session storage is blocked, without altering records or roles', async () => {
  const workspace = workspaceStore.getState();
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new DOMException('Blocked');
  });
  vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
    throw new DOMException('Blocked');
  });
  await render(<BrowserApp />);
  await settle();
  await act(async () => host.querySelector<HTMLButtonElement>('button.entry-primary')!.click());
  await settle();
  expect(host.textContent).toContain('Greenhouse workspace opened');
  await act(async () => host.querySelector<HTMLButtonElement>('main button')!.click());
  await settle();
  expect(host.querySelector('h1')?.textContent).toBe('Welcome to Vigor');
  expect(workspaceStore.getState()).toBe(workspace);
});

it('does not resume the local session when a previous workspace route is revisited after logout', async () => {
  enterPrototype();
  await render(<BrowserApp />);
  await settle();
  await act(async () => host.querySelector<HTMLButtonElement>('main button')!.click());
  await settle();
  await act(async () => {
    window.history.replaceState({}, '', '/#/ringkasan');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(host.querySelector('h1')?.textContent).toBe('Welcome to Vigor');
  expect(persistence.initialize).toHaveBeenCalledOnce();
});

it('keeps sign-in usable when the illustration cannot decode', async () => {
  await render(<LoginPage />);
  await act(async () => host.querySelector('.entry-greenhouse')!.dispatchEvent(new Event('error')));
  expect(host.querySelector('.entry-greenhouse')).toBeNull();
  expect(host.querySelector('.entry-primary')).toBeTruthy();
  expect(host.querySelector('h1')?.textContent).toBe('Welcome to Vigor');
});

it('removes an unavailable decorative image without introducing an error or replacing page content', async () => {
  await render(
    <>
      <FarmIllustration name="harvest" />
      <button>Record harvest</button>
    </>,
  );
  const image = host.querySelector('img')!;
  expect(image.alt).toBe('');
  expect(image.getAttribute('aria-hidden')).toBe('true');
  await act(async () => image.dispatchEvent(new Event('error')));
  expect(host.querySelector('img')).toBeNull();
  expect(host.textContent).toBe('Record harvest');
});

it('keeps decorative art away from measured evidence and control surfaces', () => {
  const routes = [
    '/ringkasan',
    '/greenhouse',
    '/greenhouse?tab=monitoring',
    '/greenhouse?tab=operations',
    '/greenhouse?tab=zones',
    '/hama?tab=detection',
    '/perangkat?tab=cameras',
    '/perangkat?tab=maintenance',
    '/otomasi?tab=builder',
    '/otomasi?tab=executions',
    '/pengendalian?tab=simulator',
    '/biaya?tab=expenses',
    '/riwayat',
    '/akses',
    '/settings',
  ];
  for (const path of routes) {
    const url = new URL(path, 'https://vigor.example');
    expect(pageIllustration(url.pathname, url.searchParams), path).toBeNull();
  }
});
