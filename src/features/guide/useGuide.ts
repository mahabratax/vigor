import { useEffect, useState } from 'react';
import type { PageContext } from '../../app/context';
import { usePreferences } from '../../store/usePreferences';
import { workspaceStore } from '../../store/workspace';
import { tours, type TourId, type TourProgress } from './model';

export function useGuide(ctx: PageContext, closeOverlays: () => void) {
  const p = usePreferences(),
    scope = `${p.memberId}:${ctx.s.greenhouse.id}`;
  const [session, setSession] = useState<{
    id: TourId;
    step: string;
    scope: string;
    role: string;
    seen: string[];
  } | null>(null);
  const catalog = tours(ctx.s),
    active =
      session?.scope === scope && session.role === (ctx.role ?? 'Owner') && p.loggedIn
        ? session
        : null;
  const tour = active ? catalog.find((t) => t.id === active.id) : undefined;
  const index = tour
    ? Math.max(
        0,
        tour.steps.findIndex((s) => s.id === active?.step),
      )
    : 0;
  const progress = p.guides?.progress[scope] ?? {};
  useEffect(() => {
    setSession(null);
  }, [scope, ctx.role, p.loggedIn]);
  function save(id: TourId, record: TourProgress) {
    const state = workspaceStore.getState(),
      guides = state.preferences.guides ?? { progress: {}, dismissed: [] };
    state.update({
      guides: {
        ...guides,
        progress: { ...guides.progress, [scope]: { ...guides.progress[scope], [id]: record } },
      },
    });
  }
  function start(id: TourId, restart = false) {
    const chosen = catalog.find((t) => t.id === id)!;
    const previous = progress[id];
    const next =
      restart || previous?.finished
        ? chosen.steps[0]
        : (chosen.steps.find((s) => s.id === previous?.step) ?? chosen.steps[0]);
    save(id, {
      step: next.id,
      seen: restart || previous?.finished ? [] : (previous?.seen ?? []),
      finished: false,
    });
    closeOverlays();
    setSession({
      id,
      step: next.id,
      scope,
      role: ctx.role ?? 'Owner',
      seen: restart || previous?.finished ? [] : (previous?.seen ?? []),
    });
    ctx.nav(next.route);
  }
  function move(delta: number) {
    if (!tour) return;
    const next = tour.steps[Math.max(0, Math.min(tour.steps.length - 1, index + delta))];
    const previous = active ?? progress[tour.id];
    save(tour.id, {
      step: next.id,
      seen: [...new Set([...(previous?.seen ?? []), ...(delta > 0 ? [tour.steps[index].id] : [])])],
      finished: false,
    });
    closeOverlays();
    setSession({
      id: tour.id,
      step: next.id,
      scope,
      role: ctx.role ?? 'Owner',
      seen: [...new Set([...(previous?.seen ?? []), ...(delta > 0 ? [tour.steps[index].id] : [])])],
    });
    ctx.nav(next.route);
  }
  function finish() {
    if (!tour) return;
    save(tour.id, {
      step: tour.steps[index].id,
      seen: tour.steps.map((s) => s.id),
      finished: true,
    });
    setSession(null);
    ctx.open('help');
  }
  const pause = () => {
    setSession(null);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  };
  const dismiss = () => {
    const guides = p.guides ?? { progress: {}, dismissed: [] };
    workspaceStore.getState().update({
      guides: { ...guides, dismissed: [...new Set([...guides.dismissed, scope])].slice(-200) },
    });
  };
  return {
    catalog,
    tour,
    index,
    step: tour?.steps[index],
    progress,
    start,
    move,
    finish,
    pause,
    dismiss,
    showWelcome: !tour && !p.guides?.dismissed.includes(scope) && !Object.keys(progress).length,
  };
}
export type GuideController = ReturnType<typeof useGuide>;
