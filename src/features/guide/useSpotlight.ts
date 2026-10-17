import { useLayoutEffect, useRef, useState } from 'react';
import { placeGuide, type GuideRect } from './placement';
function viewport(): GuideRect {
  const v = window.visualViewport;
  return {
    x: v?.offsetLeft ?? 0,
    y: v?.offsetTop ?? 0,
    width: v?.width ?? (document.documentElement.clientWidth || window.innerWidth),
    height: v?.height ?? window.innerHeight,
  };
}
function rect(el: Element): GuideRect {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
}
function visible(el: HTMLElement) {
  const r = rect(el),
    style = getComputedStyle(el);
  return (
    r.width > 0 &&
    r.height > 0 &&
    !el.closest('[hidden]') &&
    style.display !== 'none' &&
    style.visibility !== 'hidden'
  );
}
export function findTourTarget(selector?: string) {
  return selector
    ? ([...document.querySelectorAll<HTMLElement>(selector)].find(visible) ?? null)
    : null;
}
export function useSpotlight(enabled: boolean, stepKey: string, selector?: string) {
  const panel = useRef<HTMLElement>(null),
    target = useRef<HTMLElement | null>(null);
  const measureAfterResize = useRef<(() => void) | undefined>(undefined);
  const [state, setState] = useState(() => ({
    layout: placeGuide(null, viewport()),
    missing: false,
  }));
  useLayoutEffect(() => {
    if (!enabled) return;
    let frame = 0,
      disposed = false,
      pendingScroll = false,
      current: HTMLElement | null = null;
    const measure = (autoScroll = true) => {
      if (disposed) return;
      const el = findTourTarget(selector);
      const fallback = selector && !el ? findTourTarget('.page-header') : null;
      const next = el ?? fallback;
      if (next !== current) {
        current?.removeAttribute('data-guide-focus');
        if (current) sizes.unobserve(current);
        current = next;
        pendingScroll = true;
        if (current) {
          current.setAttribute('data-guide-focus', 'true');
          sizes.observe(current);
        }
      }
      if (current && pendingScroll && autoScroll) {
        // Route effects reset page scroll. Run after those effects, not during their commit.
        current.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' });
        pendingScroll = false;
      }
      target.current = el;
      const layout = placeGuide(
        current ? rect(current) : null,
        viewport(),
        panel.current?.getBoundingClientRect().height || 340,
      );
      setState((previous) => {
        const nextState = { layout, missing: !!selector && !el };
        return JSON.stringify(previous) === JSON.stringify(nextState) ? previous : nextState;
      });
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => measure());
    };
    measureAfterResize.current = () => measure(false);
    const resize = () => {
      pendingScroll = true;
      schedule();
    };
    const sizes = new ResizeObserver(schedule);
    if (panel.current) sizes.observe(panel.current);
    const mutations = new MutationObserver(schedule);
    const app = document.querySelector('.app-shell');
    if (app) {
      sizes.observe(app);
      mutations.observe(app, {
        subtree: true,
        childList: true,
        attributes: true,
        attributeFilter: ['hidden', 'open', 'class', 'style', 'data-tour'],
      });
    }
    measure(false);
    schedule();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', schedule, true);
    window.visualViewport?.addEventListener('resize', resize);
    window.visualViewport?.addEventListener('scroll', schedule);
    return () => {
      disposed = true;
      measureAfterResize.current = undefined;
      cancelAnimationFrame(frame);
      mutations.disconnect();
      sizes.disconnect();
      current?.removeAttribute('data-guide-focus');
      target.current = null;
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', schedule, true);
      window.visualViewport?.removeEventListener('resize', resize);
      window.visualViewport?.removeEventListener('scroll', schedule);
    };
  }, [enabled, stepKey, selector]);
  // A new width or max-height reflows the tooltip itself. Re-read that final height
  // before paint; otherwise a taller tooltip can escape the viewport for one frame.
  useLayoutEffect(() => {
    if (enabled) measureAfterResize.current?.();
  }, [enabled, state.layout.maxHeight, state.layout.panel.width]);
  return { ...state, panel, target };
}
