// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Assistant } from '../src/features/ai/Assistant';
import { createFixture } from '../src/data/fixtures';
import { addStarterRecords } from '../src/data/starterRecords';
import { materialize } from '../db/codec';
import type { PageContext } from '../src/app/context';
import { transition } from '../src/domain/actions';
import { production } from '../src/domain/production';
import { can, type Role } from '../src/features/access/permissions';
import { AccessContext } from '../src/features/access/AccessContext';
let root: Root, host: HTMLDivElement, ctx: PageContext;
beforeEach(() => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  const s = materialize(createFixture());
  s.clock = Date.parse('2026-10-16T03:00:00Z') / 1000;
  addStarterRecords({ [s.greenhouse.id]: s });
  ctx = {
    s,
    role: 'Owner',
    actor: 'Budi Santoso',
    can: (p) => can(ctx.role!, p),
    query: new URLSearchParams(),
    mobile: false,
    nav: vi.fn(),
    open: vi.fn(),
    act: async (a) => {
      try {
        const next = transition(ctx.s, a);
        ctx = { ...ctx, s: next.data };
        render();
        return next.result;
      } catch (e) {
        return { ok: false, message: (e as Error).message };
      }
    },
  };
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.restoreAllMocks();
});
function render() {
  root.render(
    <AccessContext.Provider value={ctx.role as Role}>
      <Assistant ctx={ctx} key={ctx.s.greenhouse.id} />
    </AccessContext.Provider>,
  );
}
async function click(label: string, scope: ParentNode = host) {
  const button = [...scope.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.getAttribute('aria-label') === label || b.textContent?.trim() === label,
  );
  expect(button, label).toBeTruthy();
  await act(async () => {
    button!.focus();
    button!.click();
  });
}
async function submit() {
  await act(async () =>
    host
      .querySelector('dialog.modal form')!
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
}
async function ask(text: string, launcher = false) {
  const scope = host.querySelector(launcher ? '.va-launch' : '.va-dialog')!;
  const input = scope.querySelector<HTMLInputElement>('[name=question]')!;
  input.value = text;
  await act(async () =>
    input.form!.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
  );
}
it.each([390, 768, 1280, 1440])(
  'keeps the dashboard compact and completes follow-up through the drawer at %s px (DOM only)',
  async (width) => {
    window.innerWidth = width;
    ctx.mobile = width < 768;
    await act(async () => render());
    expect(host.querySelector('.va-dialog')).toBeNull();
    expect(host.querySelector('.va-decision')).toBeNull();
    expect(host.querySelectorAll('.va-launch')).toHaveLength(1);
    await click('Open Vigor assistant');
    expect(host.querySelector('dialog[open]')).toBeTruthy();
    expect(host.textContent).toContain('Gemini not connected');
    await click('What needs attention?');
    expect(host.querySelector('.va-decision h3')!.textContent).toContain('Zone B');
    expect(host.querySelector('.va-disclosure')!.hasAttribute('open')).toBe(false);
    await click('Assign follow-up');
    await submit();
    expect(host.querySelector('dialog.modal')).toBeNull();
    expect(host.querySelector('.va-dialog[open]')).toBeTruthy();
    expect(production(ctx.s).tasks.filter((t) => t.key.startsWith('assistant-v1:'))).toHaveLength(
      1,
    );
    await click('Record care results');
    host.querySelector<HTMLTextAreaElement>('dialog.modal [name=notes]')!.value =
      'Sticky traps replaced. Follow-up inspection still needed.';
    await submit();
    expect(host.textContent).toContain('Outcome review needed');
    expect(ctx.s.cases.find((c) => c.id === 'INS-024')!.status).toBe('inspection');
    await click('Follow-up 1');
    await act(async () => host.querySelector<HTMLElement>('.va-task summary')!.click());
    expect(host.textContent).toContain('Sticky traps replaced.');
    expect(host.textContent).toContain('Work recorded; verify outcome');
    await click('Review source evidence');
    expect(ctx.nav).toHaveBeenLastCalledWith('/hama?case=INS-024');
    expect(host.querySelector('.va-dialog')).toBeNull();
  },
);
it('answers a typed payment question, records the receipt, and opens the current routine preview', async () => {
  await act(async () => render());
  await ask('Show unpaid payments', true);
  expect(host.querySelector('.va-question')!.textContent).toContain('Show unpaid payments');
  await click('Record receipt');
  expect(host.querySelector('dialog.modal')!.textContent).toContain('Outstanding balance');
  const receiptsBefore = production(ctx.s).receipts.length;
  host.querySelector<HTMLInputElement>('dialog.modal [name=reference]')!.value =
    'Confirmed transfer for presentation';
  await submit();
  expect(production(ctx.s).receipts).toHaveLength(receiptsBefore + 1);
  expect(host.querySelector('dialog.modal')).toBeNull();
  await ask('Check watering');
  await click('Open routine preview');
  expect(ctx.nav).toHaveBeenLastCalledWith(
    expect.stringContaining('/otomasi?tab=preview&routine='),
  );
  expect(host.querySelector('.va-dialog')).toBeNull();
});
it('keeps Viewer decisions readable while disabling writes and clears conversation on greenhouse change', async () => {
  ctx.role = 'Viewer';
  await act(async () => render());
  await ask('What needs attention?', true);
  const writes = [...host.querySelectorAll<HTMLButtonElement>('button')].filter((b) =>
    ['Record inspection', 'Assign follow-up'].includes(b.textContent?.trim() ?? ''),
  );
  expect(writes).toHaveLength(2);
  expect(writes.every((b) => b.disabled)).toBe(true);
  ctx = {
    ...ctx,
    s: { ...ctx.s, greenhouse: { ...ctx.s.greenhouse, id: 'GH-02', name: 'Second greenhouse' } },
  };
  await act(async () => render());
  expect(host.querySelector('.va-dialog')).toBeNull();
  await click('Open Vigor assistant');
  expect(host.textContent).toContain('Second greenhouse');
  expect(host.querySelector('.va-question')).toBeNull();
});
it('restores focus and scrolling on Escape, retains recent questions, and clears them on request', async () => {
  document.documentElement.style.overflow = 'auto';
  await act(async () => render());
  await click('Open Vigor assistant');
  const opener = host.querySelector('[aria-label="Open Vigor assistant"]');
  await ask('Check watering');
  await ask('Review harvest & cash');
  expect(host.querySelector('.va-history')).toBeTruthy();
  await act(async () =>
    host
      .querySelector('dialog.va-dialog')!
      .dispatchEvent(new Event('cancel', { cancelable: true })),
  );
  expect(host.querySelector('dialog')).toBeNull();
  expect(document.activeElement).toBe(opener);
  expect(document.documentElement.style.overflow).toBe('auto');
  await click('Open Vigor assistant');
  expect(host.querySelector('.va-question')!.textContent).toContain('Review harvest & cash');
  await click('New conversation');
  expect(host.querySelector('.va-question')).toBeNull();
  expect(host.textContent).toContain('What should we check?');
});
it('explains unsupported questions without claiming inference or writing data', async () => {
  const before = JSON.stringify(ctx.s);
  await act(async () => render());
  await ask('Write a poem about Mars', true);
  expect(host.textContent).toContain('General AI questions need a connected model');
  expect(host.querySelector('.va-decision')).toBeNull();
  expect(JSON.stringify(ctx.s)).toBe(before);
  await click('AI setup');
  expect(ctx.nav).toHaveBeenLastCalledWith('/settings?tab=ai');
});
it('hands inspection off to the existing modal and closes the assistant layer', async () => {
  await act(async () => render());
  await ask('Inspect plants in Zone B', true);
  await click('Record inspection');
  expect(ctx.open).toHaveBeenCalledWith('inspection', 'INS-024');
  expect(host.querySelector('.va-dialog')).toBeNull();
});
