import { displayLabel } from '../i18n/display';
import React, { useCallback, useEffect, useState, useRef, useSyncExternalStore } from 'react';
import { HashRouter } from 'react-router';
import { Alert, Badge, Button, Icon } from '../components/ui';
import { dateLabel } from '../domain/format';
import { connectionStore, selectGreenhouse, exportBrowserBackup } from '../store/persistence';
import Modals from './Modals';
import { PageActions } from './PageActions';
import { PageRoutes } from './PageRoutes';
import { navItems } from './pages';
import { Sidebar } from './Sidebar';
import { useWorkspace } from './useWorkspace';
import { useTheme } from './theme';
import { usePreferences } from '../store/usePreferences';
import { currentMember, effectiveRole, workspaceStore } from '../store/workspace';
import { store } from '../store/store';
import type { GreenhouseId } from '../data/greenhouses';
import { GreenhouseSwitcher } from '../features/workspace/GreenhouseSwitcher';
import { NotificationCenter } from '../features/workspace/NotificationCenter';
import { notificationsFor } from '../features/workspace/notifications';

import { AccessContext } from '../features/access/AccessContext';
import { can } from '../features/access/permissions';
import { useGuide } from '../features/guide/useGuide';
import { GuideDialog } from '../features/guide/GuideDialog';
import { GuideCoach } from '../features/guide/GuideCoach';
import { FarmIllustration, pageIllustration } from '../components/FarmIllustration';
import { exitPrototype } from '../features/auth/entry';
function Workspace() {
  const { ctx, path, menu, setMenu, modal, setModal, closeModal, toast, setToast } = useWorkspace();
  const connection = useSyncExternalStore(connectionStore.subscribe, connectionStore.getState);
  const preferences = usePreferences(),
    member = currentMember(preferences),
    role = effectiveRole(preferences);
  const greenhouses = useSyncExternalStore(store.subscribe, () => store.getState().greenhouses);
  const previousIdentity = useRef(`${member.id}:${role}`);
  const [panel, setPanel] = useState<'greenhouse' | 'notifications' | null>(null);
  const guide = useGuide(ctx, () => {
    setModal(null);
    setPanel(null);
    setMenu(false);
  });
  const resolvedTheme = useTheme(preferences.theme);
  const update = workspaceStore.getState().update;
  const closeMenu = useCallback(() => setMenu(false), [setMenu]);
  const page = navItems.find((item) => item.path === path) ?? navItems[0];
  const artwork = pageIllustration(path, ctx.query);
  const collapsed = preferences.collapsed && !ctx.mobile;
  const switchGreenhouse = (id: GreenhouseId) => {
    if (!member.greenhouseIds.includes(id)) return;
    if (id === ctx.s.greenhouse.id) {
      setPanel(null);
      return;
    }
    selectGreenhouse(id);
    setPanel(null);
    setModal(null);
    setMenu(false);
    ctx.nav(path);
    setToast(null);
  };
  const logout = () => {
    exitPrototype();
  };
  useEffect(() => {
    if (!can(role, 'run')) store.getState().dispatch({ type: 'play', value: false });
    if (previousIdentity.current !== `${member.id}:${role}`) {
      setModal(null);
      setPanel(null);
      previousIdentity.current = `${member.id}:${role}`;
    }
  }, [role, member.id]);
  useEffect(() => {
    if (!preferences.loggedIn) return;
    if (!member.active) {
      logout();
      return;
    }
    if (!member.greenhouseIds.includes(store.getState().activeId)) {
      store.getState().switchGreenhouse(member.greenhouseIds[0]);
      setModal(null);
      setPanel(null);
      ctx.nav('/ringkasan');
    }
  }, [member.id, member.active, member.greenhouseIds.join(','), preferences.loggedIn]);
  const items = notificationsFor(ctx.s).filter((n) => preferences.notificationKinds[n.kind]);
  const readKey = `${member.id}:${ctx.s.greenhouse.id}`,
    readIds = preferences.readNotifications[readKey] ?? [],
    unread = items.filter((n) => !readIds.includes(n.id)).length;
  const markRead = (ids: string[]) => {
    const p = workspaceStore.getState().preferences;
    update({
      readNotifications: {
        ...p.readNotifications,
        [readKey]: [...new Set([...(p.readNotifications[readKey] ?? []), ...ids])].slice(-500),
      },
    });
  };
  const openPanel = (name: 'greenhouse' | 'notifications') => {
    setModal(null);
    setMenu(false);
    setPanel(name);
  };
  return (
    <AccessContext.Provider value={role}>
      <div className={`app-shell ${collapsed ? 'is-collapsed' : ''}`}>
        <a
          className="skip-link"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('main-content')?.focus();
          }}
        >
          Skip to content
        </a>
        <Sidebar
          ctx={ctx}
          path={path}
          open={menu}
          collapsed={collapsed}
          preferences={preferences}
          onClose={closeMenu}
          onSelectGreenhouse={() => openPanel('greenhouse')}
          onLogout={logout}
          resolvedTheme={resolvedTheme}
        />
        <div className="workspace">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="header-icon sidebar-toggle mobile-menu"
                aria-label={
                  ctx.mobile ? 'Open menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'
                }
                title={ctx.mobile ? 'Open menu' : collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                aria-expanded={ctx.mobile ? menu : !collapsed}
                aria-controls="main-navigation"
                onClick={() =>
                  ctx.mobile ? setMenu(!menu) : update({ collapsed: !preferences.collapsed })
                }
              >
                <Icon name={ctx.mobile ? 'menu' : collapsed ? 'expand' : 'collapse'} size={20} />
              </button>
              <div className="breadcrumb">
                <span className="breadcrumb-location">
                  {displayLabel(ctx.s.greenhouse.location)}
                  <span>/</span>
                </span>
                <button
                  onClick={() => openPanel('greenhouse')}
                  data-tour="greenhouse-switcher"
                  aria-label={`Switch greenhouse, ${displayLabel(ctx.s.greenhouse.name)}`}
                >
                  <strong>{displayLabel(ctx.s.greenhouse.name)}</strong>
                  <Icon name="down" size={13} />
                </button>
              </div>
            </div>
            <div className="topbar-right">
              <span className="date-chip">{displayLabel(dateLabel(ctx.s.clock))}</span>
              {connection.pending > 0 && (
                <span className="save-indicator" role="status">
                  Saving…
                </span>
              )}
              <button
                className="header-icon notification-trigger"
                data-tour="notifications"
                aria-label={`Notifications, ${unread} unread`}
                title={'Notifications'}
                aria-haspopup="dialog"
                onClick={() => openPanel('notifications')}
              >
                <Icon name="bell" size={20} />
                {unread > 0 && (
                  <span className="notification-count" aria-hidden="true">
                    {displayLabel(unread > 9 ? '9+' : unread)}
                  </span>
                )}
              </button>
            </div>
          </header>

          {preferences.previewRole && member.role === 'Owner' && (
            <div className="role-preview-banner">
              <Icon name="eye" size={17} />
              <span>
                Preview as <strong>{displayLabel(preferences.previewRole)}</strong>. Your account
                role remains Owner.
              </span>
              <Button
                small
                onClick={() => {
                  update({ previewRole: null });
                  ctx.nav('/akses?tab=permissions');
                }}
              >
                Return to Owner view
              </Button>
            </div>
          )}
          <main id="main-content" tabIndex={-1} className={`page-${path.slice(1)}`}>
            <div className={`page-header${artwork ? ' has-artwork' : ''}`}>
              <div className="page-heading">
                {artwork && <FarmIllustration key={artwork} name={artwork} />}
                <div className="page-heading-copy">
                  <h1>{displayLabel(page.label)}</h1>
                  <p>{displayLabel(page.subtitle)}</p>
                </div>
              </div>
              <div className="page-header-actions">
                <PageActions path={path} ctx={ctx} />
              </div>
            </div>
            <GuideCoach ctx={ctx} path={path} guide={guide} obscured={!!modal || !!panel || menu} />
            {displayLabel(
              connection.error && <Alert title={'Changes not saved'}>{connection.error}</Alert>,
            )}
            {connection.legacyNotice && (
              <Alert
                title={'Previous browser copy retained'}
                action={
                  <Button small onClick={exportBrowserBackup}>
                    Export copy
                  </Button>
                }
              >
                SQLite already contains records. The previous browser copy has been kept separately
                to prevent existing records from being overwritten.
              </Alert>
            )}
            {displayLabel(
              ctx.s.storageWarning && (
                <Alert
                  title={'Storage'}
                  action={
                    <Button small onClick={async () => await ctx.act({ type: 'clear_notice' })}>
                      Close
                    </Button>
                  }
                >
                  {ctx.s.storageWarning}
                </Alert>
              ),
            )}
            {displayLabel(
              preferences.storageWarning && (
                <Alert title={'Settings'}>{preferences.storageWarning}</Alert>
              ),
            )}
            {role === 'Viewer' && (
              <div className="readonly-note">
                <Icon name="eye" size={16} />
                Viewers have read-only access. Editing and simulation controls are disabled.
              </div>
            )}
            {path === '/ringkasan' && guide.showWelcome && (
              <aside className="guide-welcome" aria-label={'Get started with Vigor'}>
                <Icon name="help" size={22} />
                <div>
                  <strong>Start with your daily work</strong>
                  <span>Take a short tour to find your tools and next steps.</span>
                </div>
                <Button small onClick={() => ctx.open('help')}>
                  Open guide
                </Button>
                <Button
                  small
                  tone="ghost"
                  icon="close"
                  ariaLabel="Dismiss the introduction"
                  onClick={guide.dismiss}
                />
              </aside>
            )}
            <div className="page-route-area" data-guide-page>
              <PageRoutes ctx={ctx} onLogout={logout} />
            </div>
            <footer className="page-footer">
              <span>Vigor / {displayLabel(ctx.s.greenhouse.name)}</span>
              <span>
                Saved in this browser's SQLite database. Devices and a scheduler are not connected.
              </span>
            </footer>
          </main>
        </div>
        {modal?.kind === 'help' && !panel && (
          <GuideDialog ctx={ctx} path={path} guide={guide} onClose={closeModal} />
        )}
        {modal && modal.kind !== 'help' && !panel && (
          <Modals
            key={`${ctx.s.greenhouse.id}-${modal.kind}-${modal.id}-${modal.extra}`}
            ctx={ctx}
            spec={modal}
            onClose={closeModal}
          />
        )}
        {panel === 'greenhouse' && (
          <GreenhouseSwitcher
            activeId={ctx.s.greenhouse.id}
            greenhouses={Object.values(greenhouses).filter((s) =>
              member.greenhouseIds.includes(s.greenhouse.id),
            )}
            onSelect={switchGreenhouse}
            onClose={() => setPanel(null)}
            onManage={() => {
              setPanel(null);
              ctx.nav('/greenhouse?tab=manage');
            }}
          />
        )}
        {panel === 'notifications' && (
          <NotificationCenter
            items={items}
            readIds={readIds}
            greenhouseName={ctx.s.greenhouse.name}
            onRead={markRead}
            onNavigate={ctx.nav}
            onClose={() => setPanel(null)}
          />
        )}
        {toast && (
          <div
            className={`toast ${toast.ok ? 'success' : 'failure'}`}
            role={toast.ok ? 'status' : 'alert'}
          >
            <Icon name={toast.ok ? 'checkcircle' : 'alert'} size={20} />
            <span>{displayLabel(toast.message)}</span>
            <button aria-label={'Dismiss notification'} onClick={() => setToast(null)}>
              <Icon name="close" size={16} />
            </button>
          </div>
        )}
      </div>
    </AccessContext.Provider>
  );
}
export default function App() {
  return (
    <HashRouter>
      <Workspace />
    </HashRouter>
  );
}
