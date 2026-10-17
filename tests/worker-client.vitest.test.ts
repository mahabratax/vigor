import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../src/storage/browser.worker.ts?worker&url', () => ({
  default: '/_next/static/browser.worker-test.js',
}));
const origin = 'https://vigor-greenhouse-aldi.brawnycoin1.chatgpt.site';
class TestWorker {
  static instances: TestWorker[] = [];
  onmessage?: (event: { data: unknown }) => void;
  onerror?: () => void;
  onmessageerror?: () => void;
  terminated = false;
  constructor(
    public url: URL,
    public options: WorkerOptions,
  ) {
    expect(url.origin).toBe(origin);
    TestWorker.instances.push(this);
  }
  postMessage(message: { id: number; method: string }) {
    queueMicrotask(() =>
      this.onmessage?.({ data: { id: message.id, result: { method: message.method } } }),
    );
  }
  terminate() {
    this.terminated = true;
  }
}
beforeEach(() => {
  vi.resetModules();
  TestWorker.instances = [];
  vi.stubGlobal('window', { location: { origin, href: origin + '/nested?tab=storage' } });
  vi.stubGlobal('indexedDB', {});
  vi.stubGlobal('Worker', TestWorker);
});
afterEach(() => vi.unstubAllGlobals());
describe('SQLite client bootstrap', () => {
  it('constructs a same-origin worker and correlates concurrent replies', async () => {
    const { localRequest } = await import('../src/storage/client');
    const replies = await Promise.all([localRequest('workspace'), localRequest('inspect')]);
    expect(TestWorker.instances).toHaveLength(1);
    expect(TestWorker.instances[0].url.href).toBe(origin + '/_next/static/browser.worker-test.js');
    expect(TestWorker.instances[0].options.type).toBe('module');
    expect(replies).toEqual([{ method: 'workspace' }, { method: 'inspect' }]);
  });
  it('rejects a constructor failure as a promise and allows a retry', async () => {
    const { localRequest } = await import('../src/storage/client');
    vi.stubGlobal(
      'Worker',
      class {
        constructor() {
          throw new Error('Worker construction blocked');
        }
      },
    );
    await expect(localRequest('inspect')).rejects.toThrow('Worker construction blocked');
    vi.stubGlobal('Worker', TestWorker);
    await expect(localRequest('inspect')).resolves.toEqual({ method: 'inspect' });
  });
  it('restarts after worker loading fails without keeping unresolved requests', async () => {
    const { localRequest } = await import('../src/storage/client');
    vi.stubGlobal(
      'Worker',
      class extends TestWorker {
        postMessage() {
          queueMicrotask(() => this.onerror?.());
        }
      },
    );
    await expect(localRequest('workspace')).rejects.toThrow('SQLite');
    expect(TestWorker.instances[0].terminated).toBe(true);
    vi.stubGlobal('Worker', TestWorker);
    await expect(localRequest('workspace')).resolves.toEqual({ method: 'workspace' });
    expect(TestWorker.instances).toHaveLength(2);
  });
});
