import { displayLabel } from '../i18n/display';
import React, { useEffect, useRef } from 'react';
import { NavLink } from 'react-router';
import { Icon } from '../components/ui';
import { assets } from '../data/assets';
import type { PageContext } from './context';
import { navItems } from './pages';
import { currentMember, type WorkspacePreferences } from '../store/workspace';
import { AccountMenu } from '../features/workspace/AccountMenu';
export function Sidebar({
  ctx,
  path,
  open,
  onClose,
  collapsed,
  preferences,
  onSelectGreenhouse,
  onLogout,
  resolvedTheme,
}: {
  ctx: PageContext;
  path: string;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  preferences: WorkspacePreferences;
  onSelectGreenhouse: () => void;
  onLogout: () => void;
  resolvedTheme: string;
}) {
  const member = currentMember(preferences);
  const groups = [
    {
      label: 'Monitoring',
      items: navItems.filter((i) => ['/ringkasan', '/greenhouse', '/hama'].includes(i.path)),
    },
    {
      label: 'Operations',
      items: navItems.filter((i) =>
        ['/siklus', '/pengendalian', '/otomasi', '/perangkat'].includes(i.path),
      ),
    },
    { label: 'Review', items: navItems.filter((i) => ['/riwayat', '/biaya'].includes(i.path)) },
    {
      label: 'Workspace',
      items: navItems
        .filter((item) => item.path === '/akses')
        .filter((item) => item.path !== '/akses' || ['Owner', 'Manager'].includes(member.role)),
    },
  ].filter((group) => group.items.length);
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement,
      previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('button')?.focus();
    const keyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const nodes = Array.from(
        panel.current?.querySelectorAll<HTMLElement>('button,a') ?? [],
      ).filter((n) => n.tabIndex >= 0);
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener('keydown', keyboard);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', keyboard);
      previous?.focus();
    };
  }, [open, onClose]);
  return (
    <>
      <aside
        id="main-navigation"
        ref={panel}
        inert={ctx.mobile && !open}
        className={`sidebar ${open ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
        aria-label={'Main navigation'}
      >
        <div className="sidebar-brand">
          <button
            className="brand"
            aria-label="Vigor Dashboard"
            onClick={() => ctx.nav('/ringkasan')}
          >
            <img src={assets.logo} alt="Vigor" />
          </button>
          <button className="sidebar-close" aria-label={'Close navigation'} onClick={onClose}>
            <Icon name="close" />
          </button>
        </div>
        <button
          className="workspace-switch"
          onClick={onSelectGreenhouse}
          aria-label={`Select greenhouse, ${displayLabel(ctx.s.greenhouse.name)}`}
          title={collapsed ? ctx.s.greenhouse.name : undefined}
        >
          <span className="workspace-initial">
            {displayLabel(
              collapsed ? <Icon name="greenhouse" size={20} /> : ctx.s.greenhouse.id.slice(-2),
            )}
          </span>
          <span className="workspace-switch-label">
            <strong>{displayLabel(ctx.s.greenhouse.name)}</strong>
            <small>{displayLabel(ctx.s.greenhouse.location)}</small>
          </span>
          <Icon name="down" size={14} />
        </button>
        <nav className="sidebar-navigation" aria-label={'Workspace menu'}>
          {groups.map((group) => (
            <div className="nav-group" key={group.label}>
              <span className="nav-section">{displayLabel(group.label)}</span>
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  aria-label={item.label}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item ${path === item.path ? 'selected' : ''}`}
                  onClick={onClose}
                >
                  <Icon name={item.icon} size={19} />
                  <span className="nav-label">{displayLabel(item.label)}</span>
                  {item.path === '/hama' && ctx.s.cases.some((c) => c.status === 'inspection') && (
                    <span className="nav-count">
                      {ctx.s.cases.filter((c) => c.status === 'inspection').length}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <AccountMenu
            ctx={ctx}
            preferences={preferences}
            collapsed={collapsed}
            resolvedTheme={resolvedTheme}
            path={path}
            onNavigate={onClose}
            onLogout={onLogout}
          />
        </div>
      </aside>
      {open && <button className="sidebar-backdrop" aria-label={'Close menu'} onClick={onClose} />}
    </>
  );
}
