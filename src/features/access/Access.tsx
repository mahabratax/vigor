import { displayLabel } from '../../i18n/display';
import React, { useState, useSyncExternalStore } from 'react';
import type { PageContext } from '../../app/context';
import { updateQuery } from '../../app/context';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Field,
  Icon,
  Modal,
  SearchField,
  Tabs,
} from '../../components/ui';
import type { GreenhouseId } from '../../data/greenhouses';
import { store } from '../../store/store';
import { currentMember, initials, workspaceStore, type Member } from '../../store/workspace';
import { usePreferences } from '../../store/usePreferences';
import { can, permissions, ROLES, type Role } from './permissions';
export function Access({ ctx }: { ctx: PageContext }) {
  const greenhouses = useSyncExternalStore(store.subscribe, () => store.getState().greenhouses);
  const preferences = usePreferences(),
    member = currentMember(preferences),
    tab = ctx.query.get('tab') ?? 'members';
  const [search, setSearch] = useState(''),
    [editing, setEditing] = useState<Member | 'new' | null>(null),
    [message, setMessage] = useState('');
  const rows = preferences.members.filter((m) =>
    `${displayLabel(m.name)} ${m.email} ${m.role}`.toLowerCase().includes(search.toLowerCase()),
  );
  const update = workspaceStore.getState().update;
  if (!['Owner', 'Manager'].includes(member.role))
    return (
      <Card>
        <Empty
          icon="shield"
          title={'Team access is visible to Owners and Managers'}
          detail={'You can still update your profile and appearance in Settings.'}
          action={<Button onClick={() => ctx.nav('/settings')}>Open Settings</Button>}
        />
      </Card>
    );
  return (
    <div className="page-stack access-page">
      <Alert tone="blue" title={'Workspace access'}>
        Roles and greenhouse scope control workflows in this browser. Shared access across devices
        is not connected.
      </Alert>
      <div className="access-toolbar">
        <Tabs
          value={tab}
          onChange={(v) => updateQuery(ctx, '/akses', { tab: v })}
          items={[
            { id: 'members', label: 'Members', count: preferences.members.length },
            { id: 'permissions', label: 'Roles & permissions' },
          ]}
        />
        {tab === 'members' && (
          <Button permission="team" icon="plus" tone="primary" onClick={() => setEditing('new')}>
            Add member
          </Button>
        )}
      </div>
      {displayLabel(
        message && (
          <p className="settings-saved" role="status">
            <Icon name="checkcircle" size={17} />
            {message}
          </p>
        ),
      )}
      {tab === 'members' && (
        <>
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={'Search name, email, or role…'}
          />
          <Card
            title={'Farm team'}
            variant="register"
            subtitle={'Each member has a role and greenhouse access scope.'}
          >
            <div className="table-scroll">
              <table className="member-table">
                <thead>
                  <tr>
                    <th>Members</th>
                    <th>Role</th>
                    <th>Greenhouse</th>
                    <th>Status</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((m) => (
                    <tr key={m.id}>
                      <td>
                        <div className="member-person">
                          <span className="avatar">{displayLabel(initials(m.name))}</span>
                          <span>
                            <strong>
                              {displayLabel(m.name)}
                              {m.id === member.id && <small>You</small>}
                            </strong>
                            <span className="cell-sub">{displayLabel(m.email)}</span>
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge tone={m.role === 'Owner' ? 'green' : 'gray'}>
                          {displayLabel(m.role)}
                        </Badge>
                      </td>
                      <td>
                        <span>
                          {displayLabel(
                            m.greenhouseIds
                              .map((id) => greenhouses[id]?.greenhouse.name)
                              .filter(Boolean)
                              .join(', ') || 'No access assigned',
                          )}
                        </span>
                      </td>
                      <td>
                        <Badge dot tone={m.active ? 'green' : 'gray'}>
                          {displayLabel(m.active ? 'Active' : 'Inactive')}
                        </Badge>
                      </td>
                      <td>
                        {m.role === 'Owner' ? (
                          <span className="micro muted">Fixed Owner role</span>
                        ) : (
                          <Button
                            permission="team"
                            small
                            onClick={() => setEditing(m)}
                            ariaLabel={`Edit access ${displayLabel(m.name)}`}
                          >
                            Edit access
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!rows.length && (
              <Empty title={'Member not found'} detail={'Try another name or email address.'} />
            )}
          </Card>
        </>
      )}
      {tab === 'permissions' && (
        <>
          <Card
            title={'Permissions by role'}
            variant="register"
            subtitle={
              'All roles can view monitoring and costs. The permissions below determine available actions.'
            }
          >
            <div className="table-scroll">
              <table className="permission-table">
                <thead>
                  <tr>
                    <th>Permission</th>
                    {ROLES.map((role) => (
                      <th key={role}>{displayLabel(role)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissions.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <strong>{displayLabel(p.label)}</strong>
                        <span className="cell-sub">{displayLabel(p.detail)}</span>
                      </td>
                      {ROLES.map((role) => (
                        <td key={role}>
                          <span
                            className={`permission-cell ${can(role, p.id) ? 'allowed' : 'denied'}`}
                          >
                            <Icon name={can(role, p.id) ? 'check' : 'close'} size={17} />
                            <span className="sr-only">
                              {displayLabel(can(role, p.id) ? 'Allowed' : 'Not allowed')}
                            </span>
                          </span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          {member.role === 'Owner' && (
            <Card variant="plain" title={'Preview a role'}>
              <p className="muted">
                Preview does not change account roles or member access. Use the banner above to
                return to Owner view.
              </p>
              <div className="role-preview-buttons">
                {ROLES.filter((r) => r !== 'Owner').map((role) => (
                  <Button
                    key={role}
                    icon="eye"
                    onClick={() => {
                      update({ previewRole: role });
                      ctx.nav('/ringkasan');
                    }}
                  >
                    Preview {displayLabel(role)}
                  </Button>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
      {editing && (
        <MemberEditor
          key={editing === 'new' ? 'new' : editing.id}
          member={editing === 'new' ? null : editing}
          members={preferences.members}
          greenhouses={Object.values(greenhouses).map((s) => s.greenhouse)}
          onClose={() => setEditing(null)}
          onSave={async (draft) => {
            if (!ctx.can?.('team')) return 'Only the Owner can change members.';
            if (
              !draft.greenhouseIds.length ||
              draft.greenhouseIds.some((id) => !Object.hasOwn(store.getState().greenhouses, id))
            )
              return 'Select an available greenhouse.';
            if (
              preferences.members.some(
                (m) => m.id !== draft.id && m.email.toLowerCase() === draft.email.toLowerCase(),
              )
            )
              return 'Another member already uses this email.';
            const result = await update({
              members:
                editing === 'new'
                  ? [...preferences.members, draft]
                  : preferences.members.map((m) => (m.id === draft.id ? draft : m)),
            });
            if (!result.ok) return result.message;
            setMessage(
              editing === 'new'
                ? 'Member added. No invitation was sent.'
                : 'Member access updated.',
            );
            setEditing(null);
            return '';
          }}
        />
      )}
    </div>
  );
}
function MemberEditor({
  member,
  members,
  greenhouses,
  onClose,
  onSave,
}: {
  member: Member | null;
  members: Member[];
  greenhouses: { id: string; name: string }[];
  onClose: () => void;
  onSave: (member: Member) => Promise<string>;
}) {
  const [error, setError] = useState('');
  return (
    <Modal
      title={member ? 'Edit member access' : 'Add member'}
      description={
        'Member records are stored in this browser. Saving does not send an invitation or grant access on another device.'
      }
      onClose={onClose}
    >
      <form
        className="form-stack"
        onSubmit={async (e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget),
            name = String(data.get('name') ?? '').trim(),
            email = String(data.get('email') ?? '')
              .trim()
              .toLowerCase(),
            greenhouseIds = data.getAll('greenhouse') as GreenhouseId[];
          if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email) || !greenhouseIds.length) {
            setError('Enter a name, valid email, and at least one greenhouse.');
            return;
          }
          const role = String(data.get('role')) as Role;
          if (!['Manager', 'Operator', 'Viewer'].includes(role)) {
            setError('Select an available member role.');
            return;
          }
          setError(
            await onSave({
              id: member?.id ?? `member-${Date.now()}-${members.length}`,
              name,
              email,
              phone: member?.phone ?? '',
              position: member?.position ?? '',
              role,
              greenhouseIds,
              active: data.get('active') === 'on',
            }),
          );
        }}
      >
        <Field label={'Full name'}>
          <input name="name" defaultValue={member?.name} minLength={2} maxLength={100} required />
        </Field>
        <Field label="Email">
          <input
            name="email"
            type="email"
            defaultValue={member?.email}
            maxLength={120}
            required
            placeholder={'name@farm.example'}
          />
        </Field>
        <Field label="Role">
          <select name="role" defaultValue={member?.role ?? 'Operator'}>
            <option>Manager</option>
            <option>Operator</option>
            <option>Viewer</option>
          </select>
        </Field>
        <fieldset className="greenhouse-access">
          <legend>Greenhouse access</legend>
          {greenhouses.map(({ id, name }) => (
            <label key={id}>
              <input
                name="greenhouse"
                value={id}
                type="checkbox"
                defaultChecked={
                  member ? member.greenhouseIds.includes(id) : id === greenhouses[0]?.id
                }
              />
              <span>{displayLabel(name)}</span>
            </label>
          ))}
        </fieldset>
        <label className="check">
          <input type="checkbox" name="active" defaultChecked={member?.active ?? true} />
          Active member
        </label>
        <p className="micro muted">
          Inactive members cannot access records. The Owner role cannot be changed here.
        </p>
        {displayLabel(
          error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          ),
        )}
        <div className="form-footer">
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" tone="primary">
            {displayLabel(member ? 'Save access' : 'Add member')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
