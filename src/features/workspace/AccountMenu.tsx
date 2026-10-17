import { displayLabel } from '../../i18n/display';
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '../../components/ui';
import type { PageContext } from '../../app/context';
import {
  currentMember,
  initials,
  workspaceStore,
  type WorkspacePreferences,
} from '../../store/workspace';

export function AccountMenu({
  ctx,
  preferences,
  collapsed,
  resolvedTheme,
  path,
  onNavigate,
  onLogout,
}: {
  ctx: PageContext;
  preferences: WorkspacePreferences;
  collapsed: boolean;
  resolvedTheme: string;
  path: string;
  onNavigate: () => void;
  onLogout: () => void;
}) {
  const member = currentMember(preferences);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ left: 12, top: 12 });
  const trigger = useRef<HTMLButtonElement>(null),
    popup = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = (restoreFocus = false) => {
    setOpen(false);
    if (restoreFocus) trigger.current?.focus();
  };
  const action = (fn: () => void) => {
    close();
    onNavigate();
    fn();
  };
  useEffect(() => {
    setOpen(false);
  }, [path, ctx.s.greenhouse.id, preferences.memberId, collapsed]);
  useLayoutEffect(() => {
    if (!open) return;
    const place = () => {
      const anchor = trigger.current?.getBoundingClientRect(),
        box = popup.current?.getBoundingClientRect();
      if (!anchor || !box) return;
      setPosition({
        left: Math.max(12, Math.min(anchor.left, window.innerWidth - box.width - 12)),
        top: Math.max(
          12,
          Math.min(anchor.top - box.height - 8, window.innerHeight - box.height - 12),
        ),
      });
    };
    place();
    popup.current?.querySelector<HTMLButtonElement>('button')?.focus();
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (
        !popup.current?.contains(event.target as Node) &&
        !trigger.current?.contains(event.target as Node)
      )
        close();
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        close(true);
      }
      if (event.key === 'Tab' && popup.current) {
        const buttons = [
          ...popup.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
        ];
        if (event.shiftKey && document.activeElement === buttons[0]) {
          event.preventDefault();
          buttons.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === buttons.at(-1)) {
          event.preventDefault();
          buttons[0]?.focus();
        }
      }
    };
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', keyboard, true);
    return () => {
      document.removeEventListener('pointerdown', outside, true);
      document.removeEventListener('keydown', keyboard, true);
    };
  }, [open]);
  return (
    <>
      <button
        ref={trigger}
        className={`operator account-menu-trigger ${path === '/settings' ? 'selected' : ''}`}
        aria-label={`Account menu ${displayLabel(member.name)}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        aria-current={path === '/settings' ? 'page' : undefined}
        title={collapsed ? member.name : undefined}
        onClick={() => (open ? close(true) : setOpen(true))}
        onKeyDown={(event) => {
          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="avatar">{displayLabel(initials(member.name))}</span>
        <span className="operator-label">
          <strong>{displayLabel(member.name)}</strong>
          <small>{displayLabel(member.role)} / Demo account</small>
        </span>
        <Icon name="down" size={15} className={open ? '' : 'account-chevron'} />
      </button>
      {open &&
        createPortal(
          <div
            ref={popup}
            id={id}
            role="dialog"
            aria-label={'Account menu'}
            className="account-popup"
            style={position}
            onBlur={(event) => {
              if (
                event.relatedTarget &&
                !event.currentTarget.contains(event.relatedTarget as Node) &&
                event.relatedTarget !== trigger.current
              )
                close();
            }}
          >
            <div className="account-popup-identity">
              <strong>{displayLabel(member.name)}</strong>
              <span>{displayLabel(member.email)}</span>
              <small>{displayLabel(member.role)} / Akun demo</small>
            </div>
            <div className="account-popup-links">
              <button onClick={() => action(() => ctx.nav('/settings?tab=profile'))}>
                <Icon name="user" size={17} />
                My profile
              </button>
              <button onClick={() => action(() => ctx.nav('/settings?tab=appearance'))}>
                <Icon name="settings" size={17} />
                Settings
              </button>
              <button onClick={() => action(() => ctx.open('help'))}>
                <Icon name="help" size={17} />
                Vigor guide
              </button>
            </div>
            <div className="account-appearance">
              <span>
                Appearance{displayLabel(preferences.theme === 'system' ? ' (System)' : '')}
              </span>
              <div role="group" aria-label="Appearance">
                {(['light', 'dark'] as const).map((theme) => (
                  <button
                    key={theme}
                    aria-pressed={resolvedTheme === theme}
                    onClick={() => workspaceStore.getState().update({ theme })}
                  >
                    <Icon name={theme === 'light' ? 'sun' : 'moon'} size={16} />
                    {displayLabel(theme === 'light' ? 'Light' : 'Dark')}
                  </button>
                ))}
              </div>
            </div>
            <div className="account-popup-footer">
              <button onClick={() => action(onLogout)}>
                <Icon name="logout" size={17} />
                Logout
              </button>
              <span>Demo</span>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
