let worker: Worker | undefined;
let sequence = 0;
const pending = new Map<
  number,
  {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
  }
>();
function fail(message: string) {
  worker?.terminate();
  worker = undefined;
  for (const entry of pending.values()) {
    clearTimeout(entry.timer);
    entry.reject(new Error(message));
  }
  pending.clear();
}
export async function localRequest(method: string, payload?: unknown): Promise<any> {
  if (!worker) {
    if (typeof Worker === 'undefined' || typeof indexedDB === 'undefined')
      return Promise.reject(
        new Error(
          'This browser does not support Vigor storage. Use an up-to-date browser with site storage enabled.',
        ),
      );
    // Vinext's server-reference pass can rewrite import.meta.url to file:///ROOT.
    // Import the emitted asset URL and resolve it against the browser origin.
    worker = new Worker(new URL(sqliteWorkerUrl, window.location.origin), { type: 'module' });
    worker.onmessage = ({ data }) => {
      if (data.restart) {
        fail(data.error);
        return;
      }
      const entry = pending.get(data.id);
      if (!entry) return;
      pending.delete(data.id);
      clearTimeout(entry.timer);
      if (data.error) entry.reject(Object.assign(new Error(data.error), { status: data.status }));
      else entry.resolve(data.result);
    };
    worker.onerror = () =>
      fail('SQLite could not be loaded. Try again; saved records have not been deleted.');
    worker.onmessageerror = () =>
      fail('Could not read the storage response. Reload to check the latest records.');
  }
  const target = worker,
    id = ++sequence;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () =>
        fail(
          'Storage has not responded. Reload and check the latest result before repeating the change.',
        ),
      45000,
    );
    pending.set(id, { resolve, reject, timer });
    target.postMessage({ id, method, payload });
  });
}
import sqliteWorkerUrl from './browser.worker.ts?worker&url';
