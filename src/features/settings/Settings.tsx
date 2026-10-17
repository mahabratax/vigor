import { displayLabel } from '../../i18n/display';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Field, Icon, Tabs } from '../../components/ui';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import { usePreferences } from '../../store/usePreferences';
import { AiReadiness } from '../ai/AiReadiness';
import { StorageSettings } from './StorageSettings';
import {
  currentMember,
  initials,
  workspaceStore,
  type NotificationKind,
  type Theme,
} from '../../store/workspace';
const notificationLabels: { id: NotificationKind; label: string; description: string }[] = [
  {
    id: 'inspection',
    label: 'Pests & inspections',
    description: 'Plant inspections and follow-up observations.',
  },
  {
    id: 'device',
    label: 'Device condition',
    description: 'Offline cameras, delayed data, and calibration.',
  },
  {
    id: 'automation',
    label: 'Automation executions',
    description: 'Completed, failed, or uncertain executions.',
  },
  {
    id: 'expense',
    label: 'Costs & budgets',
    description: 'Expense drafts and exceeded budgets.',
  },
];
export function Settings({ ctx, onLogout }: { ctx: PageContext; onLogout: () => void }) {
  const preferences = usePreferences(),
    member = currentMember(preferences),
    tab = ctx.query.get('tab') ?? 'profile';
  const [draft, setDraft] = useState({
    name: member.name,
    email: member.email,
    phone: member.phone,
    position: member.position,
  });
  const [message, setMessage] = useState(''),
    [error, setError] = useState('');
  useEffect(() => {
    setDraft({
      name: member.name,
      email: member.email,
      phone: member.phone,
      position: member.position,
    });
    setMessage('');
    setError('');
  }, [member.id]);
  const update = workspaceStore.getState().update;
  return (
    <div className="page-stack settings-page">
      <Tabs
        value={tab}
        onChange={(v) => updateQuery(ctx, '/settings', { tab: v })}
        items={[
          { id: 'profile', label: 'Profile' },
          { id: 'appearance', label: 'Appearance' },
          { id: 'notifications', label: 'Notifications' },
          { id: 'storage', label: 'Data & backup' },
          { id: 'ai', label: 'AI integration' },
        ]}
      />
      {tab === 'profile' && (
        <div className="settings-grid">
          <Card title={'My profile'}>
            <div className="profile-summary">
              <span className="avatar profile-avatar">{displayLabel(initials(member.name))}</span>
              <div>
                <strong>{displayLabel(member.name)}</strong>
                <span>{displayLabel(member.role)}</span>
                <small>{displayLabel(member.position || 'Farm team')}</small>
              </div>
            </div>
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault();
                setError('');
                setMessage('');
                const name = draft.name.trim(),
                  email = draft.email.trim().toLowerCase();
                if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) {
                  setError('Enter a name of at least two characters and a valid email address.');
                  return;
                }
                if (
                  preferences.members.some(
                    (m) => m.id !== member.id && m.email.toLowerCase() === email,
                  )
                ) {
                  setError('Another member already uses this email. Enter a different address.');
                  return;
                }
                const result = await update({
                  members: preferences.members.map((m) =>
                    m.id === member.id ? { ...m, ...draft, name, email } : m,
                  ),
                });
                if (result.ok) setMessage('Profile saved.');
                else setError(result.message);
              }}
            >
              <div className="form-grid">
                {(
                  [
                    { key: 'name', label: 'Full name', type: 'text' },
                    { key: 'email', label: 'Email', type: 'email' },
                    { key: 'phone', label: 'Phone number', type: 'tel' },
                    { key: 'position', label: 'Farm role', type: 'text' },
                  ] as const
                ).map((f) => (
                  <Field key={f.key} label={f.label}>
                    <input
                      type={f.type}
                      readOnly={f.key === 'email'}
                      required={f.key === 'name' || f.key === 'email'}
                      maxLength={100}
                      value={draft[f.key]}
                      onChange={(e) => {
                        setDraft({ ...draft, [f.key]: e.target.value });
                        setMessage('');
                      }}
                    />
                  </Field>
                ))}
              </div>
              {displayLabel(
                error && (
                  <p role="alert" className="form-error">
                    {error}
                  </p>
                ),
              )}
              {displayLabel(
                message && (
                  <p role="status" className="settings-saved">
                    <Icon name="checkcircle" size={16} />
                    {message}
                  </p>
                ),
              )}
              <div className="form-footer">
                <Button
                  onClick={() => {
                    setDraft({
                      name: member.name,
                      email: member.email,
                      phone: member.phone,
                      position: member.position,
                    });
                    setMessage('');
                    setError('');
                  }}
                >
                  Discard changes
                </Button>
                <Button type="submit" tone="primary">
                  Save profile
                </Button>
              </div>
            </form>
          </Card>
          <aside className="page-stack">
            <Card variant="plain" title={'Account access'}>
              <dl className="settings-facts">
                <div>
                  <dt>Role</dt>
                  <dd>{displayLabel(member.role)}</dd>
                </div>
                <div>
                  <dt>Greenhouse</dt>
                  <dd>{member.greenhouseIds.length} locations</dd>
                </div>
                <div>
                  <dt>Time zone</dt>
                  <dd>WIB (Asia/Jakarta)</dd>
                </div>
              </dl>
              <p className="micro muted">
                Profile saved in this browser. Roles guide local workflows; cross-device shared
                access is not connected.
              </p>
            </Card>
            <Card variant="plain" title={'Account session'}>
              <p>
                Logout ends this prototype session and returns to the entry page. Your greenhouse
                records remain in this browser.
              </p>
              <div className="session-links">
                <Button icon="logout" onClick={onLogout}>
                  Logout
                </Button>
                <a href={'/login?returnTo=' + encodeURIComponent('/#/settings?tab=profile')}>
                  View sign-in page
                </a>
              </div>
            </Card>
          </aside>
        </div>
      )}
      {tab === 'appearance' && (
        <Card
          title={'Workspace appearance'}
          data-tour="workspace-appearance"
          subtitle={'Choose a comfortable theme and navigation width.'}
        >
          <div className="theme-options">
            {(
              [
                { id: 'light', label: 'Light', icon: 'sun' },
                { id: 'dark', label: 'Dark', icon: 'moon' },
                { id: 'system', label: 'System', icon: 'monitor' },
              ] as const
            ).map((theme) => (
              <button
                key={theme.id}
                className={`theme-option ${preferences.theme === theme.id ? 'selected' : ''}`}
                aria-pressed={preferences.theme === theme.id}
                onClick={() => update({ theme: theme.id as Theme })}
              >
                <span className={`theme-preview ${theme.id}`} aria-hidden="true">
                  <i />
                  <span>
                    <b />
                    <b />
                    <b />
                  </span>
                </span>
                <span>
                  <Icon name={theme.icon} size={17} />
                  {displayLabel(theme.label)}
                  {preferences.theme === theme.id && <Icon name="checkcircle" size={17} />}
                </span>
              </button>
            ))}
          </div>
          <p className="micro muted">
            System follows your device theme. Your choice is saved for this account.
          </p>
          <div className="preference-row">
            <div>
              <strong>Compact sidebar</strong>
              <p>Icons only on desktop. Mobile menus retain labels.</p>
            </div>
            <button
              className="switch"
              role="switch"
              aria-label={'Compact sidebar'}
              aria-checked={preferences.collapsed}
              onClick={() => update({ collapsed: !preferences.collapsed })}
            >
              <span />
            </button>
          </div>
        </Card>
      )}
      {tab === 'notifications' && (
        <Card
          title={'In-app notifications'}
          subtitle={'Choose notification types for the active greenhouse.'}
        >
          {notificationLabels.map((n) => (
            <div className="preference-row" key={n.id}>
              <div>
                <strong>{displayLabel(n.label)}</strong>
                <p>{displayLabel(n.description)}</p>
              </div>
              <button
                className="switch"
                role="switch"
                aria-label={n.label}
                aria-checked={preferences.notificationKinds[n.id]}
                onClick={() =>
                  update({
                    notificationKinds: {
                      ...preferences.notificationKinds,
                      [n.id]: !preferences.notificationKinds[n.id],
                    },
                  })
                }
              >
                <span />
              </button>
            </div>
          ))}
          <Alert tone="blue">
            Settings are saved immediately. Push notifications, email, and operator messages are not
            connected.
          </Alert>
        </Card>
      )}
      {tab === 'storage' && <StorageSettings />}
      {tab === 'ai' && <AiReadiness ctx={ctx} />}
    </div>
  );
}
