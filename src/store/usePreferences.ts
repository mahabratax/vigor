import { useSyncExternalStore } from 'react';
import { workspaceStore } from './workspace';
const subscribe = (notify: () => void) => workspaceStore.subscribe(notify);
const snapshot = () => workspaceStore.getState().preferences;
export function usePreferences() {
  return useSyncExternalStore(subscribe, snapshot, snapshot);
}
