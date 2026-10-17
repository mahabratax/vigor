import { createStore } from 'zustand/vanilla';
import {
  createGreenhouseFixture,
  isDemoGreenhouseId,
  type GreenhouseId,
} from '../data/greenhouses';
import type { Action, ActionResult } from '../domain/actions';
import { transition } from '../domain/actions';
import { hydrate } from '../domain/storage';
import type { DomainState } from '../domain/types';
import { can } from '../features/access/permissions';
import { activity } from '../domain/format';
import {
  emptyGreenhouse,
  greenhouseDeleteBlocker,
  updateGreenhouseProfile,
  validateGreenhouseProfile,
  validGreenhouseId,
  type GreenhouseActor,
  type GreenhouseDraft,
  type GreenhouseProfile,
} from '../domain/greenhouses';
export const DOMAIN_STORAGE_KEY = 'vigor-greenhouses-v1';
const LEGACY_KEY = 'vigor-demo-v3';
type GreenhouseBank = Record<GreenhouseId, DomainState>;
interface Store {
  activeId: GreenhouseId;
  greenhouses: GreenhouseBank;
  data: DomainState;
  nextGreenhouseNumber: number;
  createGreenhouse: (
    draft: GreenhouseDraft,
    actor: GreenhouseActor,
  ) => ActionResult & { id?: string };
  editGreenhouse: (id: string, draft: GreenhouseProfile, actor: GreenhouseActor) => ActionResult;
  deleteGreenhouse: (id: string, confirmation: string, actor: GreenhouseActor) => ActionResult;
  switchGreenhouse: (id: GreenhouseId) => ActionResult;
  dispatch: (action: Action) => ActionResult;
}
export function createDomainStore(storage?: Pick<Storage, 'getItem' | 'setItem'>) {
  let activeId: GreenhouseId = 'GH-01';
  let greenhouses: GreenhouseBank = {
    'GH-01': createGreenhouseFixture('GH-01'),
    'GH-02': createGreenhouseFixture('GH-02'),
  };
  let nextGreenhouseNumber = 3;
  try {
    const raw = storage?.getItem(DOMAIN_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.greenhouses || typeof parsed.greenhouses !== 'object') throw new Error();
      const recoveredBank: GreenhouseBank = {};
      for (const [id, value] of Object.entries(parsed.greenhouses)) {
        if (!validGreenhouseId(id) || (value as DomainState)?.greenhouse?.id !== id) continue;
        const recovered = hydrate(JSON.stringify(value));
        if (recovered.greenhouse.id === id) recoveredBank[id] = recovered;
      }
      if (!Object.keys(recoveredBank).length) throw new Error();
      greenhouses = recoveredBank;
      activeId = Object.hasOwn(greenhouses, parsed.activeId)
        ? parsed.activeId
        : Object.keys(greenhouses)[0];
      nextGreenhouseNumber = Math.max(
        ...Object.keys(greenhouses).map((id) => Number(id.slice(3)) + 1),
        Number.isSafeInteger(parsed.nextGreenhouseNumber) ? parsed.nextGreenhouseNumber : 3,
      );
    } else {
      const legacy = storage?.getItem(LEGACY_KEY);
      if (legacy) greenhouses['GH-01'] = hydrate(legacy);
    }
  } catch {
    greenhouses[activeId].storageWarning =
      'Could not read greenhouse data. Sample records were restored; new changes apply to this browser only.';
  }
  return createStore<Store>()((set, get) => {
    function persist() {
      try {
        storage?.setItem(
          DOMAIN_STORAGE_KEY,
          JSON.stringify({
            activeId: get().activeId,
            greenhouses: get().greenhouses,
            nextGreenhouseNumber: get().nextGreenhouseNumber,
          }),
        );
      } catch {
        const data = {
          ...get().data,
          storageWarning: 'Browser storage is unavailable. Changes apply to this session only.',
        };
        set({ data, greenhouses: { ...get().greenhouses, [get().activeId]: data } });
      }
    }
    function allowed(
      id: string,
      actor: GreenhouseActor,
      permission: 'greenhouse_edit' | 'greenhouse_manage',
    ) {
      if (!can(actor.role, permission))
        throw new Error('Your role cannot make this greenhouse change.');
      if (!get().greenhouses[id] || (actor.role !== 'Owner' && !actor.greenhouseIds.includes(id)))
        throw new Error('This greenhouse is outside your access scope.');
    }
    const failure = (error: unknown): ActionResult => ({
      ok: false,
      message: error instanceof Error ? error.message : 'Could not save greenhouse changes.',
    });
    return {
      activeId,
      greenhouses,
      data: greenhouses[activeId],
      nextGreenhouseNumber,
      createGreenhouse(draft, actor) {
        try {
          if (!can(actor.role, 'greenhouse_manage'))
            throw new Error('Only the Owner can add a greenhouse.');
          const profile = validateGreenhouseProfile(draft, get().greenhouses);
          const id = `GH-${String(get().nextGreenhouseNumber).padStart(2, '0')}`;
          const data = emptyGreenhouse(id, { ...draft, ...profile });
          activity(
            data,
            'system',
            'Greenhouse added',
            'Six initial zones prepared. No devices or monitoring history yet.',
            id,
            undefined,
            actor.name,
          );
          set({
            greenhouses: { ...get().greenhouses, [id]: data },
            nextGreenhouseNumber: get().nextGreenhouseNumber + 1,
          });
          persist();
          return {
            ok: true,
            id,
            message: `${profile.name} added. Add devices to set up monitoring.`,
          };
        } catch (error) {
          return failure(error);
        }
      },
      editGreenhouse(id, draft, actor) {
        try {
          allowed(id, actor, 'greenhouse_edit');
          const profile = validateGreenhouseProfile(draft, get().greenhouses, id);
          const data = updateGreenhouseProfile(get().greenhouses[id], profile);
          // Events belong to this greenhouse and are not shared with the prior state snapshot.
          data.events = [...data.events];
          activity(
            data,
            'system',
            'Greenhouse profile updated',
            'Name, location, and area updated. Cycle history remains linked.',
            id,
            undefined,
            actor.name,
          );
          set({
            greenhouses: { ...get().greenhouses, [id]: data },
            ...(get().activeId === id ? { data } : {}),
          });
          persist();
          return { ok: true, message: `${profile.name} updated.` };
        } catch (error) {
          return failure(error);
        }
      },
      deleteGreenhouse(id, confirmation, actor) {
        try {
          allowed(id, actor, 'greenhouse_manage');
          const current = get().greenhouses[id];
          const blocker = greenhouseDeleteBlocker(current, Object.keys(get().greenhouses).length);
          if (blocker) throw new Error(blocker);
          if (confirmation.trim() !== current.greenhouse.name)
            throw new Error('Type the exact greenhouse name to confirm deletion.');
          const bank = { ...get().greenhouses };
          delete bank[id];
          const activeId = get().activeId === id ? Object.keys(bank)[0] : get().activeId;
          const data =
            get().activeId === id ? { ...bank[activeId], playing: false } : bank[activeId];
          bank[activeId] = data;
          set({ greenhouses: bank, activeId, data });
          persist();
          return {
            ok: true,
            message: `${current.greenhouse.name} and its linked records deleted.`,
          };
        } catch (error) {
          return failure(error);
        }
      },
      switchGreenhouse(id) {
        if (!Object.hasOwn(get().greenhouses, id))
          return { ok: false, message: 'Greenhouse not found.' };
        if (id === get().activeId) return { ok: true, message: '' };
        const bank = { ...get().greenhouses, [get().activeId]: { ...get().data, playing: false } };
        const data = { ...bank[id], playing: false };
        bank[id] = data;
        set({ activeId: id, data, greenhouses: bank });
        persist();
        return {
          ok: true,
          message: `${data.greenhouse.name} selected.`,
        };
      },
      dispatch(action) {
        try {
          if (
            action.type === 'reset' &&
            (get().data.greenhouse.source === 'custom' || !isDemoGreenhouseId(get().activeId))
          )
            throw new Error(
              'This is a custom greenhouse. Sample reset is available only for the initial sample greenhouses.',
            );
          const resultState =
            action.type === 'reset' && isDemoGreenhouseId(get().activeId)
              ? {
                  data: updateGreenhouseProfile(
                    createGreenhouseFixture(get().activeId as 'GH-01' | 'GH-02'),
                    get().data.greenhouse,
                  ),
                  result: {
                    ok: true,
                    message: 'Selected greenhouse restored to its initial sample records.',
                  },
                }
              : transition(get().data, action);
          set({
            data: resultState.data,
            greenhouses: { ...get().greenhouses, [get().activeId]: resultState.data },
          });
          persist();
          return resultState.result;
        } catch (error) {
          return {
            ok: false,
            message: error instanceof Error ? error.message : 'Could not save changes.',
          };
        }
      },
    };
  });
}
export const store = createDomainStore();
