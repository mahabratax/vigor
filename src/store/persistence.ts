import { createStore } from 'zustand/vanilla';
import { localRequest } from '../storage/client';
import { store, DOMAIN_STORAGE_KEY } from './store';
import {
  workspaceStore,
  WORKSPACE_STORAGE_KEY,
  setWorkspaceWriter,
  type WorkspacePreferences,
} from './workspace';
import type { DomainState } from '../domain/types';
import type { Action, ActionResult } from '../domain/actions';
interface Snapshot {
  revision: number;
  greenhouses: Record<string, DomainState>;
  activeId: string;
  nextGreenhouseNumber: number;
  preferences: WorkspacePreferences;
}
export const connectionStore = createStore<{
  pending: number;
  error: string;
  legacyNotice: boolean;
}>(() => ({ pending: 0, error: '', legacyNotice: false }));
let revision = 0,
  tail: Promise<unknown> = Promise.resolve();
let selectedId: string | undefined;
/** Revision used to invalidate AI inputs after any committed workspace change. */
export const getWorkspaceRevision = () => revision;
function apply(s: Snapshot) {
  revision = s.revision;
  const previewRole = workspaceStore.getState().preferences.previewRole;
  const activeId = selectedId && s.greenhouses[selectedId] ? selectedId : s.activeId;
  selectedId = activeId;
  store.setState({
    greenhouses: s.greenhouses,
    activeId,
    data: s.greenhouses[activeId],
    nextGreenhouseNumber: s.nextGreenhouseNumber,
  });
  workspaceStore.setState({
    preferences: {
      ...s.preferences,
      previewRole:
        s.preferences.members.find((m) => m.id === s.preferences.memberId)?.role === 'Owner'
          ? previewRole
          : null,
    },
  });
}
const request = (body?: unknown) => localRequest('workspace', body);
let initializing: Promise<void> | undefined;
let channel: BroadcastChannel | undefined;
export const storageInfo = () =>
  localRequest('info') as Promise<{
    bytes: number;
    savedAt: string | null;
    generation: number;
    hasPrevious: boolean;
  }>;
export function initializeWorkspace(): Promise<void> {
  if (!initializing)
    initializing = initialize().catch((e) => {
      initializing = undefined;
      throw e;
    });
  return initializing;
}
export async function refreshWorkspace() {
  const s = await request();
  if (s.greenhouses) apply(s);
  return s;
}
function browserValue(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
async function initialize() {
  const s = await request();
  if (s.initialize || s.claim) {
    let payload: unknown = {};
    if (s.initialize) {
      const raw = browserValue(DOMAIN_STORAGE_KEY),
        prefs = browserValue(WORKSPACE_STORAGE_KEY);
      if (raw) {
        try {
          payload = { legacy: JSON.parse(raw), preferences: prefs ? JSON.parse(prefs) : undefined };
        } catch {
          throw new Error(
            'Could not read browser data. Previous records are retained; export a copy before contacting the administrator.',
          );
        }
      }
    }
    let initialized;
    try {
      initialized = await request({
        requestId: crypto.randomUUID(),
        revision: s.revision,
        operation: 'initialize',
        payload,
      });
    } catch (e) {
      if ((e as { status?: number })?.status !== 409) throw e;
      initialized = await request();
      if (!initialized.greenhouses) throw e;
    }
    apply(initialized);
    try {
      localStorage.setItem('vigor-browser-sqlite-migrated', '1');
    } catch {
      /* IndexedDB does not depend on localStorage being writable. */
    }
  } else {
    apply(s);
    connectionStore.setState({ legacyNotice: false });
  }
  if (!channel && typeof BroadcastChannel !== 'undefined') {
    channel = new BroadcastChannel('vigor-sqlite-changes');
    channel.onmessage = () => {
      void tail.then(() => refreshWorkspace()).catch(() => {});
    };
  }
  setWorkspaceWriter(async (patch) => {
    if (Object.hasOwn(patch, 'previewRole'))
      workspaceStore.setState({
        preferences: {
          ...workspaceStore.getState().preferences,
          previewRole: patch.previewRole ?? null,
        },
      });
    const { previewRole, loggedIn, memberId, version, storageWarning, ...persisted } = patch;
    if (!Object.keys(persisted).length) return { ok: true, message: '' };
    return execute('preferences', persisted);
  });
}
export function execute(
  operation: string,
  payload?: unknown,
  greenhouseId = store.getState().activeId,
): Promise<ActionResult & { id?: string }> {
  connectionStore.setState((s) => ({ pending: s.pending + 1 }));
  const task = async () => {
    try {
      const s = await request({
        requestId: crypto.randomUUID(),
        revision,
        operation,
        greenhouseId,
        payload,
        previewRole: workspaceStore.getState().preferences.previewRole,
      });
      apply(s);
      channel?.postMessage('changed');
      connectionStore.setState({ error: '' });
      return s.result;
    } catch (error) {
      if ((error as { status?: number })?.status === 409) await refreshWorkspace().catch(() => {});
      const message = error instanceof Error ? error.message : 'Changes not saved. Try again.';
      connectionStore.setState({ error: message });
      return { ok: false, message };
    } finally {
      connectionStore.setState((s) => ({ pending: Math.max(0, s.pending - 1) }));
    }
  };
  const next = tail.then(task, task);
  tail = next;
  return next;
}
export const dispatchWorkspace = (action: Action) => execute('action', action);
export function selectGreenhouse(id: string) {
  selectedId = id;
  store.getState().switchGreenhouse(id);
  void execute('select', undefined, id);
}
export function exportBrowserBackup() {
  const raw = browserValue(DOMAIN_STORAGE_KEY);
  if (!raw) return;
  const parse = (value: string | null) => {
    try {
      return JSON.parse(value || 'null');
    } catch {
      return value;
    }
  };
  const content = JSON.stringify(
    {
      domain: parse(raw),
      preferences: parse(browserValue(WORKSPACE_STORAGE_KEY)),
    },
    null,
    2,
  );
  const url = URL.createObjectURL(new Blob([content], { type: 'application/json' })),
    a = document.createElement('a');
  a.href = url;
  a.download = 'Vigor-browser-backup.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function download(bytes: Uint8Array, filename: string) {
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], { type: 'application/vnd.sqlite3' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function exportSqlite(previous = false) {
  await tail.catch(() => {});
  const bytes: Uint8Array = await localRequest('export', { previous });
  download(
    bytes,
    `Vigor-${previous ? 'before-restore-' : ''}${new Date().toISOString().slice(0, 10)}.sqlite`,
  );
}
export async function inspectBackup(file: File) {
  if (file.size > 50 * 1024 * 1024) throw new Error('Backup must be 50 MB or smaller.');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const result: { greenhouseCount: number; ownerName: string; generation: number } =
    await localRequest('inspect', { bytes });
  return { ...result, bytes, filename: file.name };
}
export async function restoreBackup(bytes: Uint8Array, generation: number) {
  const task = async () => {
    const snapshot = await localRequest('restore', { bytes, generation });
    selectedId = undefined;
    apply(snapshot);
    connectionStore.setState({ error: '' });
    channel?.postMessage('changed');
  };
  const next = tail.then(task, task);
  tail = next;
  return next;
}
