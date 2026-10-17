import { displayLabel } from '../i18n/display';
import React, { lazy, Suspense, useEffect, useRef, useState } from 'react';
import {
  initializeWorkspace,
  exportBrowserBackup,
  refreshWorkspace,
  connectionStore,
} from '../store/persistence';
import { StorageSettings } from '../features/settings/StorageSettings';
import { applyTheme } from './theme';
import { workspaceStore } from '../store/workspace';
import { entryReturn, needsEntry } from '../features/auth/entry';

const App = lazy(() => import('./App'));
const LoginPage = lazy(() => import('../features/auth/LoginPage'));

class WorkspaceLoadBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (this.state.failed)
      return (
        <main className="storage-gate" role="alert">
          <h1>Vigor</h1>
          <p>Could not load this page. Reload to try again. Your browser records are retained.</p>
          <button onClick={() => window.location.reload()}>Reload page</button>
        </main>
      );
    return this.props.children;
  }
}

export default function BrowserApp() {
  const [entry, setEntry] = useState(needsEntry);
  const entryRef = useRef(entry);
  entryRef.current = entry;
  const [ready, setReady] = useState(false),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(false);
  async function start() {
    setLoading(true);
    setError('');
    try {
      await initializeWorkspace();
      if (entryRef.current) return;
      applyTheme(workspaceStore.getState().preferences.theme);
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the workspace.');
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const route = () => setEntry(needsEntry());
    window.addEventListener('hashchange', route);
    window.addEventListener('popstate', route);
    return () => {
      window.removeEventListener('hashchange', route);
      window.removeEventListener('popstate', route);
    };
  }, []);
  useEffect(() => {
    // The entry page must remain usable even when local storage needs recovery.
    if (entry) return;
    void start();
    const refresh = () => {
      if (!connectionStore.getState().pending) void refreshWorkspace().catch(() => {});
    };
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
    };
  }, [entry]);
  const fallback = (
    <main className="storage-gate" aria-busy="true">
      <h1>Vigor</h1>
      <p role="status">Opening your workspace…</p>
    </main>
  );
  if (entry)
    return (
      <WorkspaceLoadBoundary key="entry">
        <Suspense fallback={fallback}>
          <LoginPage returnTo={entryReturn()} />
        </Suspense>
      </WorkspaceLoadBoundary>
    );
  if (ready)
    return (
      <WorkspaceLoadBoundary key="workspace">
        <Suspense fallback={fallback}>
          <App />
        </Suspense>
      </WorkspaceLoadBoundary>
    );
  return (
    <main className="storage-gate">
      <h1>Vigor</h1>
      <p>{displayLabel(error || 'Preparing your greenhouse workspace…')}</p>
      {displayLabel(
        error && (
          <div role="alert">
            <button disabled={loading} onClick={start}>
              Try again
            </button>
            <button onClick={exportBrowserBackup}>Export browser data</button>
            <StorageSettings onRestored={start} />
          </div>
        ),
      )}
    </main>
  );
}
