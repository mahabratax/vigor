/** Component-test transport. Persistence and authorization run separately against
 * actual SQLite in sqlite.vitest.test.ts; this isolates DOM flow assertions. */
import { store } from '../../src/store/store';
import {
  currentMember,
  effectiveRole,
  workspaceStore,
  syncGreenhouseAccess,
} from '../../src/store/workspace';
export async function dispatchWorkspace(action: any) {
  return store.getState().dispatch(action);
}
export function selectGreenhouse(id: string) {
  return store.getState().switchGreenhouse(id);
}
export async function execute(
  operation: string,
  payload: any,
  greenhouseId = store.getState().activeId,
) {
  const p = workspaceStore.getState().preferences,
    m = currentMember(p),
    actor = { name: m.name, role: effectiveRole(p), greenhouseIds: m.greenhouseIds };
  let result;
  if (operation === 'greenhouse_create') result = store.getState().createGreenhouse(payload, actor);
  else if (operation === 'greenhouse_edit')
    result = store.getState().editGreenhouse(greenhouseId, payload, actor);
  else if (operation === 'greenhouse_delete')
    result = store.getState().deleteGreenhouse(greenhouseId, payload.confirmation, actor);
  else return { ok: false, message: 'Unsupported component transport operation' };
  if (result.ok) syncGreenhouseAccess();
  return result;
}
