import { useCallback, useEffect, useRef, useMemo, useState, useSyncExternalStore } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { Action, ActionResult } from '../domain/actions';
import { usePreferences } from '../store/usePreferences';
import { workspaceStore, currentMember, effectiveRole } from '../store/workspace';
import { actionPermission, modalPermission, can } from '../features/access/permissions';
import { store } from '../store/store';
import { dispatchWorkspace } from '../store/persistence';
import type { ModalSpec, PageContext } from './context';
import { detailForLocation, normalizeQuery } from './navigation';

const subscribe = (notify: () => void) => store.subscribe(notify);
const getData = () => store.getState().data;
export function useWorkspace() {
  const data = useSyncExternalStore(subscribe, getData, getData);
  // Refresh freshness labels only. This timer never dispatches actions or advances a scheduler.
  const [observedAt, setObservedAt] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const refresh = () => setObservedAt(Date.now() / 1000);
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const currentData = useMemo(
    () => (data.readings ? { ...data, clock: observedAt } : data),
    [data, observedAt],
  );
  const preferences = usePreferences();
  const role = effectiveRole(preferences);
  const location = useLocation(),
    navigate = useNavigate();
  const path = location.pathname === '/' ? '/ringkasan' : location.pathname;
  const query = normalizeQuery(path, location.search);
  const [mobile, setMobile] = useState(window.innerWidth < 1024);
  const [menu, setMenu] = useState(false);
  const [modal, setModal] = useState<ModalSpec | null>(() =>
    detailForLocation(path, query, mobile),
  );
  const [toast, setToast] = useState<{ message: string; ok: boolean } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const previousPath = useRef(path);
  useEffect(() => {
    const resize = () => setMobile(window.innerWidth < 1024);
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);
  useEffect(() => {
    setMenu(false);
    setModal(detailForLocation(path, query, mobile));
    if (previousPath.current !== path) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      previousPath.current = path;
    }
  }, [path, query, mobile]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);
  const act = useCallback(async (action: Action): Promise<ActionResult> => {
    const permission = actionPermission(action);
    const allowed =
      !permission || can(effectiveRole(workspaceStore.getState().preferences), permission);
    const result = allowed
      ? await dispatchWorkspace(action)
      : {
          ok: false,
          message: 'Your role cannot perform this action. Contact the greenhouse Owner.',
        };
    if (result.message && !['tick', 'clear_notice', 'speed'].includes(action.type)) {
      clearTimeout(toastTimer.current);
      setToast({ message: result.message, ok: result.ok });
      toastTimer.current = setTimeout(() => setToast(null), 5500);
    }
    return result;
  }, []);
  const nav = useCallback(
    (url: string) => {
      navigate(url);
      setMenu(false);
      setModal(detailForLocation(url.split('?')[0], url.split('?')[1] ?? '', mobile));
    },
    [navigate, mobile],
  );
  const open = useCallback((kind: string, id?: string, extra?: string) => {
    const permission = modalPermission(kind);
    if (permission && !can(effectiveRole(workspaceStore.getState().preferences), permission)) {
      setToast({
        ok: false,
        message: 'Your role cannot perform this action. Contact the greenhouse Owner.',
      });
      return;
    }
    setModal({ kind, id, extra });
  }, []);
  const closeModal = () => {
    const detail = detailForLocation(path, query, mobile);
    if (detail && modal?.kind === detail.kind) {
      const q = new URLSearchParams(query),
        keys: Record<string, string> = {
          'device-detail': 'device',
          'zone-detail': 'zone',
          'case-detail': 'case',
          event: 'event',
          routine: 'routine',
          'expense-detail': 'expense',
        };
      q.delete(keys[detail.kind]);
      navigate(path + (q.size ? '?' + q.toString() : ''), { replace: true });
      setModal(null);
    } else setModal(detail);
  };
  const ctx: PageContext = {
    s: currentData,
    query: new URLSearchParams(query),
    mobile,
    nav,
    open,
    act,
    role,
    actor: currentMember(preferences).name,
    can: (permission) => can(role, permission),
  };
  return {
    ctx,
    path,
    menu,
    setMenu,
    modal,
    closeModal,
    setModal,
    toast,
    setToast,
  };
}
