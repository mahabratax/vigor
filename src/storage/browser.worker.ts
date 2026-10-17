import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm-browser.wasm?url';
import migration0 from '../../drizzle/0000_curvy_war_machine.sql?raw';
import migration1 from '../../drizzle/0001_young_blonde_phantom.sql?raw';
import migration2 from '../../drizzle/0002_old_blizzard.sql?raw';
import migration3 from '../../drizzle/0003_whole_earthquake.sql?raw';
import { BrowserEngine } from './engine';
import { IndexedDbFiles } from './idb';
let engine: Promise<BrowserEngine> | undefined;
function getEngine() {
  if (!engine)
    engine = initSqlJs({ locateFile: () => wasmUrl })
      .then(
        (SQL) =>
          new BrowserEngine(
            SQL,
            [migration0, migration1, migration2, migration3],
            new IndexedDbFiles(indexedDB),
          ),
      )
      .catch((e) => {
        engine = undefined;
        throw e;
      });
  return engine;
}
let tail: Promise<unknown> = Promise.resolve();
self.onmessage = ({ data: { id, method, payload } }) => {
  const task = async () => {
    try {
      let db: BrowserEngine;
      try {
        db = await getEngine();
      } catch {
        self.postMessage({
          id,
          error: 'SQLite could not be loaded. Try again; previous records are retained.',
          restart: true,
        });
        return;
      }
      let result;
      if (method === 'workspace') result = await db.request(payload);
      else if (method === 'export') result = await db.export(payload?.previous);
      else if (method === 'info') result = await db.info();
      else if (method === 'inspect') result = await db.inspect(payload.bytes);
      else if (method === 'restore') result = await db.restore(payload.bytes, payload.generation);
      else throw new Error('Unknown storage request.');
      self.postMessage({ id, result });
    } catch (e) {
      self.postMessage({
        id,
        error: e instanceof Error ? e.message : 'Browser storage failed.',
        status: (e as { status?: number })?.status,
      });
    }
  };
  tail = tail.then(task, task);
};
