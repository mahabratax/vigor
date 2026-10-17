import { displayLabel } from '../../i18n/display';
import { execute, selectGreenhouse } from '../../store/persistence';
import React, { useState, useSyncExternalStore } from 'react';
import type { PageContext } from '../../app/context';
import { numeric, value } from '../../app/context';
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  Field,
  FormBox,
  Icon,
  Modal,
  SearchField,
} from '../../components/ui';
import { localDate, number } from '../../domain/format';
import { greenhouseDeleteBlocker, type GreenhouseActor } from '../../domain/greenhouses';
import { store } from '../../store/store';
import {
  currentMember,
  effectiveRole,
  syncGreenhouseAccess,
  workspaceStore,
} from '../../store/workspace';
import { can } from '../access/permissions';

function actor(): GreenhouseActor {
  const preferences = workspaceStore.getState().preferences;
  const member = currentMember(preferences);
  return {
    name: member.name,
    role: effectiveRole(preferences),
    greenhouseIds: member.greenhouseIds,
  };
}

export function GreenhouseManagement({ ctx }: { ctx: PageContext }) {
  const bank = useSyncExternalStore(store.subscribe, () => store.getState().greenhouses);
  const preferences = useSyncExternalStore(
    workspaceStore.subscribe,
    () => workspaceStore.getState().preferences,
  );
  const member = currentMember(preferences),
    role = effectiveRole(preferences);
  const [search, setSearch] = useState('');
  const [editor, setEditor] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const accessible = Object.values(bank).filter((s) =>
    member.greenhouseIds.includes(s.greenhouse.id),
  );
  const list = accessible.filter(({ greenhouse: g }) =>
    `${displayLabel(g.name)} ${g.location}`.toLowerCase().includes(search.toLowerCase().trim()),
  );
  const edited = editor && editor !== 'new' ? bank[editor] : undefined;
  const target = deleting ? bank[deleting] : undefined;
  const blocker = target ? greenhouseDeleteBlocker(target, Object.keys(bank).length) : '';
  const affectedMembers = target
    ? preferences.members.filter(
        (m) => m.role !== 'Owner' && m.greenhouseIds.includes(target.greenhouse.id),
      ).length
    : 0;
  const close = () => {
    setEditor(null);
    setDeleting(null);
    setConfirmation('');
  };
  const openGreenhouse = (id: string, manage = false) => {
    store.getState().switchGreenhouse(id);
    ctx.nav(manage ? '/greenhouse?tab=zones' : '/greenhouse?view=2d');
  };
  return (
    <div className="page-stack">
      {displayLabel(
        notice && (
          <div role="status">
            <Alert tone="green">{notice}</Alert>
          </div>
        ),
      )}
      <Card
        title={'Greenhouses'}
        data-tour="greenhouse-register"
        subtitle={'Manage locations, planted areas, and access for each greenhouse.'}
        tools={
          can(role, 'greenhouse_manage') ? (
            <Button icon="plus" tone="primary" onClick={() => setEditor('new')}>
              Add greenhouse
            </Button>
          ) : undefined
        }
      >
        <div className="greenhouse-register-toolbar">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={'Search greenhouse name or location'}
          />
          <span>{accessible.length} greenhouses you can access</span>
        </div>
        <div className="greenhouse-register">
          {list.map(({ greenhouse: g, cycle, devices }) => (
            <article key={g.id} className="greenhouse-register-row">
              <div className="greenhouse-register-identity">
                <span className="greenhouse-register-symbol">
                  <Icon name="greenhouse" size={24} />
                </span>
                <div>
                  <div className="greenhouse-register-name">
                    <h3>{displayLabel(g.name)}</h3>
                    {ctx.s.greenhouse.id === g.id && <Badge tone="green">Selected</Badge>}
                  </div>
                  <p>
                    <Icon name="map" size={14} />
                    {displayLabel(g.location)}
                  </p>
                  <small>
                    {displayLabel(g.id)} / {displayLabel(cycle.crop)}
                  </small>
                </div>
              </div>
              <dl className="greenhouse-register-facts">
                <div>
                  <dt>Planted / total area</dt>
                  <dd>
                    {displayLabel(number(g.plantedArea, 2))} / {displayLabel(number(g.area, 2))} m²
                  </dd>
                </div>
                <div>
                  <dt>Crop</dt>
                  <dd>{displayLabel(number(cycle.plants))}</dd>
                </div>
                <div>
                  <dt>Devices</dt>
                  <dd>{devices.filter((d) => d.active).length} active</dd>
                </div>
              </dl>
              <div className="greenhouse-register-actions">
                <Button
                  small
                  onClick={() => openGreenhouse(g.id, true)}
                  ariaLabel={`Manage zones ${displayLabel(g.name)}`}
                >
                  Zones & crops
                </Button>
                <Button
                  small
                  onClick={() => openGreenhouse(g.id)}
                  ariaLabel={`Open ${displayLabel(g.name)}`}
                >
                  Open
                </Button>
                {can(role, 'greenhouse_edit') && (
                  <Button
                    small
                    icon="edit"
                    onClick={() => setEditor(g.id)}
                    ariaLabel={`Edit ${displayLabel(g.name)}`}
                  >
                    Edit
                  </Button>
                )}
                {can(role, 'greenhouse_manage') && (
                  <Button
                    small
                    tone="ghost"
                    icon="trash"
                    onClick={() => {
                      setConfirmation('');
                      setDeleting(g.id);
                    }}
                    ariaLabel={`Delete ${displayLabel(g.name)}`}
                  />
                )}
              </div>
            </article>
          ))}
          {!list.length && (
            <Empty
              title={'Greenhouse not found'}
              detail={'Try another name or location.'}
              action={<Button onClick={() => setSearch('')}>Clear search</Button>}
            />
          )}
        </div>
        <p className="greenhouse-register-note">
          Data is stored in this browser's SQLite database. Each greenhouse has its own devices,
          activity, and expense records.
        </p>
      </Card>
      {displayLabel(
        editor && (
          <Modal
            title={edited ? 'Edit greenhouse' : 'Add greenhouse'}
            description={
              edited
                ? `${edited.greenhouse.id} / Profil lokasi`
                : 'Start with the location profile and initial crop cycle.'
            }
            onClose={close}
          >
            <FormBox
              key={editor}
              onSubmit={async (form) => {
                const profile = {
                  name: value(form, 'name'),
                  location: value(form, 'location'),
                  area: numeric(form, 'area'),
                  plantedArea: numeric(form, 'plantedArea'),
                };
                const result = edited
                  ? await execute('greenhouse_edit', profile, edited.greenhouse.id)
                  : await execute('greenhouse_create', {
                      ...profile,
                      crop: value(form, 'crop'),
                      plantedOn: value(form, 'plantedOn'),
                      plants: numeric(form, 'plants'),
                    });
                if (result.ok) {
                  if ('id' in result && typeof result.id === 'string') selectGreenhouse(result.id);
                  close();
                  setNotice(result.message);
                }
                return result;
              }}
            >
              <Field label={'Greenhouse name'}>
                <input
                  name="name"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={edited?.greenhouse.name}
                  placeholder={'Example: Melati Greenhouse'}
                />
              </Field>
              <Field label={'Location'}>
                <input
                  name="location"
                  required
                  minLength={2}
                  maxLength={120}
                  defaultValue={edited?.greenhouse.location}
                  placeholder={'Village or farm area'}
                />
              </Field>
              <div className="form-grid">
                <Field label={'Total area (m²)'}>
                  <input
                    name="area"
                    type="number"
                    required
                    min="0.01"
                    max="10000000"
                    step="0.01"
                    defaultValue={edited?.greenhouse.area}
                  />
                </Field>
                <Field label={'Planted area (m²)'}>
                  <input
                    name="plantedArea"
                    type="number"
                    required
                    min="0"
                    max="10000000"
                    step="0.01"
                    defaultValue={edited?.greenhouse.plantedArea}
                  />
                </Field>
              </div>
              {edited ? (
                <p className="micro muted">
                  Planted area must cover all zone allocations. Set each zone's area in Zones &
                  crops; profile changes do not alter existing allocations.
                </p>
              ) : (
                <>
                  <Field label={'Initial crop'}>
                    <input
                      name="crop"
                      required
                      minLength={2}
                      maxLength={80}
                      placeholder={'Example: Lettuce'}
                    />
                  </Field>
                  <div className="form-grid">
                    <Field label={'Cycle start date'}>
                      <input
                        type="date"
                        name="plantedOn"
                        required
                        defaultValue={localDate(ctx.s.clock)}
                      />
                    </Field>
                    <Field label={'Initial plant count'} hint={'Enter zero during preparation.'}>
                      <input
                        type="number"
                        name="plants"
                        min="0"
                        max="10000000"
                        step="1"
                        required
                        defaultValue={0}
                      />
                    </Field>
                  </div>
                  <Alert tone="blue" title={'Six initial zones: A–F'}>
                    Planted area and plant count are distributed across six zones. Add devices in
                    Devices. Monitoring, automation, harvests, and transactions start with no
                    history.
                  </Alert>
                </>
              )}
              <div className="form-actions">
                <Button onClick={close}>Cancel</Button>
                <Button type="submit" tone="primary">
                  {edited ? 'Save changes' : 'Add greenhouse'}
                </Button>
              </div>
            </FormBox>
          </Modal>
        ),
      )}
      {target && (
        <Modal
          title={`Delete ${displayLabel(target.greenhouse.name)}?`}
          description={'Deleting saved records cannot be undone.'}
          onClose={close}
        >
          <FormBox
            key={target.greenhouse.id}
            onSubmit={async () => {
              const result = await execute(
                'greenhouse_delete',
                { confirmation },
                target.greenhouse.id,
              );
              if (result.ok) {
                close();
                setNotice(result.message);
                ctx.nav('/greenhouse?tab=manage');
              }
              return result;
            }}
          >
            <p>
              The profile, six zones, {target.devices.length} devices, {target.events.length}{' '}
              activities, {target.expenses.length} expenses, and all care, harvest, and sales
              records for this greenhouse will be deleted.
            </p>
            {affectedMembers > 0 && (
              <Alert tone="blue">
                Access {affectedMembers} members will lose access to this greenhouse. Members left
                with no greenhouse access will be deactivated until the Owner grants new access.
              </Alert>
            )}
            {blocker ? (
              <Alert title={'Deletion unavailable'}>{displayLabel(blocker)}</Alert>
            ) : (
              <Field label={`Type “${displayLabel(target.greenhouse.name)}” to continue`}>
                <input
                  name="confirmation"
                  autoComplete="off"
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
              </Field>
            )}
            <div className="form-actions">
              <Button onClick={close}>Cancel</Button>
              <Button
                type="submit"
                tone="danger"
                disabled={!!blocker || confirmation.trim() !== target.greenhouse.name}
              >
                Delete greenhouse
              </Button>
            </div>
          </FormBox>
        </Modal>
      )}
    </div>
  );
}
