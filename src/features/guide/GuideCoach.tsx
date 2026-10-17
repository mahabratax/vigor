import { displayLabel } from '../../i18n/display';
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PageContext } from '../../app/context';
import { Button, Icon } from '../../components/ui';
import { matchesTourRoute } from './model';
import type { GuideController } from './useGuide';
import { backdropRects, type GuideRect } from './placement';
import { useSpotlight } from './useSpotlight';

const boxStyle = (r: GuideRect): React.CSSProperties => ({
  left: r.x,
  top: r.y,
  width: r.width,
  height: r.height,
});

export function GuideCoach({
  ctx,
  path,
  guide,
  obscured,
}: {
  ctx: PageContext;
  path: string;
  guide: GuideController;
  obscured: boolean;
}) {
  const { tour, step, index } = guide;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [exploringStep, setExploringStep] = useState<string | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const focusCleanup = useRef<(() => void) | undefined>(undefined);
  const id = useId();
  const stepKey = `${tour?.id}:${step?.id}:${ctx.s.greenhouse.id}`;
  const exploring = exploringStep === stepKey;
  const onPage = !!step && matchesTourRoute(path, ctx.query, step.route);
  const hidden = obscured || dialogOpen;
  const visible = !!tour && !hidden && !exploring;
  const { layout, missing, panel, target } = useSpotlight(
    visible,
    stepKey,
    onPage ? step?.target : undefined,
  );

  useEffect(() => {
    if (!tour) {
      setDialogOpen(false);
      setExploringStep(null);
      return;
    }
    // Native dialogs own the top layer. The tour is a section, so it cannot detect itself.
    const check = () => setDialogOpen(!!document.querySelector('dialog[open], .account-popup'));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ['open'],
    });
    return () => observer.disconnect();
  }, [!!tour]);

  useLayoutEffect(() => {
    if (!visible) return;
    const shell = document.querySelector<HTMLElement>('.app-shell');
    const wasInert = shell?.hasAttribute('inert');
    const root = document.documentElement;
    const overflow = root.style.overflow,
      gutter = root.style.scrollbarGutter;
    shell?.setAttribute('inert', '');
    root.style.scrollbarGutter = 'stable';
    root.style.overflow = 'hidden';
    return () => {
      if (!wasInert) shell?.removeAttribute('inert');
      root.style.overflow = overflow;
      root.style.scrollbarGutter = gutter;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) return;
    // GuideDialog restores its trigger on close; focus after that cleanup, not before it.
    const frame = requestAnimationFrame(() => heading.current?.focus({ preventScroll: true }));
    const containFocus = (e: FocusEvent) => {
      if (panel.current && !panel.current.contains(e.target as Node))
        heading.current?.focus({ preventScroll: true });
    };
    document.addEventListener('focusin', containFocus);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('focusin', containFocus);
    };
  }, [visible, stepKey, onPage]);

  useEffect(() => () => focusCleanup.current?.(), []);
  if (!tour || !step) return null;

  const pause = () => {
    focusCleanup.current?.();
    guide.pause();
    requestAnimationFrame(() =>
      document.getElementById('main-content')?.focus({ preventScroll: true }),
    );
  };
  const tryPage = () => {
    const el = target.current;
    setExploringStep(stepKey);
    requestAnimationFrame(() => {
      if (!el?.isConnected) return;
      const previous = el.getAttribute('tabindex');
      const clean = () => {
        if (previous === null) el.removeAttribute('tabindex');
        else el.setAttribute('tabindex', previous);
        el.removeEventListener('blur', clean);
      };
      focusCleanup.current?.();
      focusCleanup.current = clean;
      el.setAttribute('tabindex', '-1');
      el.addEventListener('blur', clean, { once: true });
      el.focus({ preventScroll: true });
    });
  };
  const resume = () => {
    focusCleanup.current?.();
    setExploringStep(null);
    if (!onPage) ctx.nav(step.route);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      pause();
    }
    if (e.key === 'Tab' && panel.current) {
      const buttons = [
        ...panel.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
      ];
      const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
      const next =
        current < 0
          ? e.shiftKey
            ? buttons.length - 1
            : 0
          : (current + (e.shiftKey ? -1 : 1) + buttons.length) % buttons.length;
      e.preventDefault();
      buttons[next]?.focus();
    }
  };

  return createPortal(
    exploring ? (
      <aside className="guide-resume" hidden={hidden} aria-label={'Tour paused'}>
        <div>
          <strong>{displayLabel(tour.title)}</strong>
          <span>
            Steps {index + 1} of {tour.steps.length}
          </span>
        </div>
        <Button small tone="primary" onClick={resume}>
          Resume tour
        </Button>
        <button className="guide-close" aria-label={'Pause tour'} onClick={pause}>
          <Icon name="close" size={18} />
        </button>
      </aside>
    ) : (
      <div className="guide-layer" hidden={hidden} data-tour-step={stepKey}>
        <div className="guide-backdrop" aria-hidden="true">
          {backdropRects(layout.viewport, layout.spotlight).map((r, i) => (
            <div className="guide-shade" key={i} style={boxStyle(r)} />
          ))}
          {layout.spotlight && (
            <div className="guide-spotlight" style={boxStyle(layout.spotlight)} />
          )}
        </div>
        <section
          ref={panel}
          className="guide-coach"
          role="dialog"
          aria-modal="true"
          aria-label={'Vigor tour'}
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-text`}
          data-placement={layout.side}
          style={{
            left: layout.panel.x,
            top: layout.panel.y,
            width: layout.panel.width,
            maxHeight: layout.maxHeight,
          }}
          onKeyDown={onKeyDown}
        >
          {['top', 'bottom', 'left', 'right'].includes(layout.side) && (
            <span
              className="guide-arrow"
              aria-hidden="true"
              style={{ '--guide-arrow': `${layout.arrow}px` } as React.CSSProperties}
            />
          )}
          <div className="guide-coach-top">
            <span>
              <Icon name={tour.icon} size={17} />
              {displayLabel(tour.title)}
            </span>
            <button
              className="guide-close"
              aria-label={'Pause tour'}
              title={'Pause tour (Esc)'}
              onClick={pause}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
          <div className="guide-coach-content">
            <span className="guide-step-count" aria-live="polite">
              Steps {index + 1} of {tour.steps.length}
              {step.timing && <span className="guide-timing">{step.timing}</span>}
            </span>
            <h2 ref={heading} id={`${id}-title`} tabIndex={-1}>
              {displayLabel(step.title)}
            </h2>
            <p id={`${id}-text`}>{displayLabel(step.text)}</p>
            <p className="guide-access">{displayLabel(step.access)}</p>
            {step.permission && ctx.can?.(step.permission) === false && (
              <p className="guide-readonly">
                Role {displayLabel(ctx.role)} can follow this tour. Saving or acting requires the
                appropriate role.
              </p>
            )}
            {!onPage ? (
              <p className="guide-readonly">
                The page changed. Return to this step to see the highlighted section.
              </p>
            ) : (
              missing && (
                <p className="guide-readonly" role="status">
                  This section is unavailable in the current records. You can open the page or
                  continue the tour.
                </p>
              )
            )}
          </div>
          <footer className="guide-controls">
            <button className="guide-try" onClick={onPage ? tryPage : () => ctx.nav(step.route)}>
              {displayLabel(onPage ? 'Try on page' : 'Return to step')}
            </button>
            <div>
              <Button small disabled={index === 0} onClick={() => guide.move(-1)}>
                Previous
              </Button>
              <Button
                small
                tone="primary"
                onClick={() => (index === tour.steps.length - 1 ? guide.finish() : guide.move(1))}
              >
                {displayLabel(index === tour.steps.length - 1 ? 'Finish tour' : 'Next')}
              </Button>
            </div>
          </footer>
        </section>
      </div>
    ),
    document.body,
  );
}
