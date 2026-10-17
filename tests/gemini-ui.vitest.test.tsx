// @vitest-environment jsdom
import React, { act } from 'react';
import { webcrypto } from 'node:crypto';
import { transferableAbortController } from 'node:util';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { Assistant } from '../src/features/ai/Assistant';
import { createFixture } from '../src/data/fixtures';
import { addStarterRecords } from '../src/data/starterRecords';
import { materialize } from '../db/codec';
import { transition } from '../src/domain/actions';
import { production } from '../src/domain/production';
import { createAiHandler } from '../server/ai/handler';
import { can } from '../src/features/access/permissions';
import { AccessContext } from '../src/features/access/AccessContext';
import type { PageContext } from '../src/app/context';
let ctx: PageContext, host: HTMLDivElement, root: Root;
let fetcher: ReturnType<typeof vi.fn>, provider: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.stubGlobal('crypto', webcrypto);
  // Browser and gateway share a process in this test; use Node's Fetch-compatible
  // signal classes rather than passing a jsdom signal into the Node HTTP boundary.
  const controller = transferableAbortController();
  vi.stubGlobal('AbortController', controller.constructor);
  vi.stubGlobal('AbortSignal', controller.signal.constructor);
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
  provider = vi.fn(async (_url: string, init: RequestInit) => {
    const data = JSON.parse(JSON.parse(String(init.body)).contents[0].parts[0].text);
    const finding = data.snapshot.findings.find((f: any) => f.id.includes(':case:'));
    return new Response(
      JSON.stringify({
        candidates: [
          {
            finishReason: 'STOP',
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    answer: 'Inspect this case before reviewing the linked harvest.',
                    priorities: [
                      {
                        findingId: finding.id,
                        why: 'Plant care and harvest review depend on this inspection.',
                        evidenceIds: [finding.evidence[0].id],
                        uncertainty: 'The saved case does not verify current conditions.',
                      },
                    ],
                    followUpQuestion: '',
                  }),
                },
              ],
            },
          },
        ],
        usageMetadata: { promptTokenCount: 500, candidatesTokenCount: 120, totalTokenCount: 620 },
      }),
    );
  });
  const handler = createAiHandler(
    { apiKey: 'only-in-test-server', model: 'gemini-test-model', hosting: 'cloud-run' },
    provider as typeof fetch,
  );
  fetcher = vi.fn((url: string, init?: RequestInit) =>
    handler(new Request(`https://vigor.example${url}`, init)),
  );
  vi.stubGlobal('fetch', fetcher);
  const s = materialize(createFixture());
  s.clock = Math.floor(Date.now() / 1000);
  addStarterRecords({ [s.greenhouse.id]: s });
  ctx = {
    s,
    role: 'Owner',
    actor: 'Grower',
    can: (p) => can(ctx.role!, p),
    query: new URLSearchParams(),
    mobile: false,
    nav: vi.fn(),
    open: vi.fn(),
    act: async (a) => {
      const r = transition(ctx.s, a);
      ctx = { ...ctx, s: r.data };
      render();
      return r.result;
    },
  };
  host = document.createElement('div');
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
function render() {
  root.render(
    <AccessContext.Provider value={ctx.role!}>
      <Assistant ctx={ctx} />
    </AccessContext.Provider>,
  );
}
async function click(label: string) {
  const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.getAttribute('aria-label') === label || b.textContent?.trim() === label,
  );
  expect(button, label).toBeTruthy();
  expect(button!.disabled, host.textContent ?? label).toBe(false);
  await act(async () => button!.click());
}
async function settled() {
  await vi.waitFor(async () => {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
    });
    expect(host.textContent).not.toContain('Analyzing the selected');
  });
}
it.each([390, 1440])(
  'uses the actual gateway contract and existing assignment form at %s px (DOM only)',
  async (width) => {
    window.innerWidth = width;
    await act(async () => render());
    await click('Open Vigor assistant');
    await click('Gemini');
    await click('What needs attention?');
    await settled();
    expect(provider).toHaveBeenCalledTimes(1);
    expect(host.textContent).toContain('Inspect this case before reviewing');
    const evidence = host.querySelector<HTMLDetailsElement>('.va-disclosure')!;
    expect(evidence.textContent).toContain('What remains uncertain.');
    expect(evidence.textContent).toContain('Cited by Gemini:');
    expect(evidence.open).toBe(false);
    expect(host.querySelectorAll('.va-disclosure')).toHaveLength(1);
    expect(host.textContent).toContain('620');
    expect(production(ctx.s).tasks.filter((t) => t.key.startsWith('assistant-v1:'))).toHaveLength(
      0,
    );
    await click('Assign follow-up');
    await act(async () =>
      host
        .querySelector('dialog.modal form')!
        .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
    );
    expect(production(ctx.s).tasks.filter((t) => t.key.startsWith('assistant-v1:'))).toHaveLength(
      1,
    );
    expect(ctx.s.cases.find((c) => c.id === 'INS-024')?.status).not.toBe('closed');
  },
);
it('never labels a provider failure as an AI answer or writes an operational record', async () => {
  provider.mockImplementation(async () => new Response('quota details', { status: 429 }));
  await act(async () => render());
  await click('Open Vigor assistant');
  await click('Gemini');
  await click('What needs attention?');
  await settled();
  expect(host.querySelector('[role=alert]')?.textContent).toContain('quota');
  expect(host.querySelector('.va-decision')).toBeNull();
  expect(production(ctx.s).tasks.filter((t) => t.key.startsWith('assistant-v1:'))).toHaveLength(0);
  await click('Local records');
  await click('New conversation');
  await click('What needs attention?');
  expect(host.querySelector('.va-decision')).toBeTruthy();
  expect(host.textContent).toContain('From your records');
});
it('keeps Gemini unavailable when deployment has no key, without making a model request', async () => {
  fetcher.mockImplementation(
    async () =>
      new Response(
        JSON.stringify({
          configured: false,
          model: null,
          hosting: 'sites',
          message: 'Setup required.',
        }),
      ),
  );
  await act(async () => render());
  await click('Open Vigor assistant');
  const button = [...host.querySelectorAll<HTMLButtonElement>('button')].find(
    (b) => b.textContent === 'Gemini',
  )!;
  expect(button.disabled).toBe(true);
  expect(host.textContent).toContain('Gemini not connected');
  await click('What needs attention?');
  expect(provider).not.toHaveBeenCalled();
});

it.each(['cancel', 'scope change'])('ignores a late model response after %s', async (condition) => {
  const original = provider.getMockImplementation()!;
  let release: (() => void) | undefined;
  provider.mockImplementation(
    (...args: unknown[]) =>
      new Promise<Response>((resolve) => {
        release = () => {
          void original(...args).then(resolve);
        };
      }),
  );
  await act(async () => render());
  await click('Open Vigor assistant');
  await click('Gemini');
  await click('What needs attention?');
  await vi.waitFor(() => expect(release).toBeDefined());
  if (condition === 'cancel') await click('Cancel analysis');
  else {
    ctx = {
      ...ctx,
      s: { ...ctx.s, greenhouse: { ...ctx.s.greenhouse, id: 'different-greenhouse' } },
    };
    await act(async () => render());
  }
  await act(async () => {
    release!();
    await new Promise((resolve) => setTimeout(resolve, 10));
  });
  await settled();
  expect(host.textContent).toContain(
    condition === 'cancel' ? 'Analysis cancelled' : 'Records changed',
  );
  expect(host.querySelector('.va-model-answer')).toBeNull();
  expect(production(ctx.s).tasks.filter((t) => t.key.startsWith('assistant-v1:'))).toHaveLength(0);
});
