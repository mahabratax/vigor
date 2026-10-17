import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import type { PageContext } from '../../app/context';
import { numeric, value } from '../../app/context';
import { Alert, Button, Empty, Field, FormBox, Modal } from '../../components/ui';
import { localDate, number } from '../../domain/format';
import type { Zone } from '../../domain/types';
import {
  activeBatch,
  zoneCapacity,
  zoneDeleteBlocker,
  zoneInactiveBlocker,
  zoneName,
  zoneReferences,
} from '../../domain/zones';
import {
  GROWING_METHODS,
  PLANT_STAGES,
  type PlantStage,
  type ZoneAction,
} from '../../domain/zoneTypes';
export type ZoneEditor =
  | 'zone-new'
  | 'zone-edit'
  | 'zone-delete'
  | 'zone-status'
  | 'batch-new'
  | 'batch-edit'
  | 'count'
  | 'finish'
  | 'devices';
export function ZoneForms({
  ctx,
  zone: z,
  editor,
  onClose: close,
  onSave: save,
}: {
  ctx: PageContext;
  zone: Zone;
  editor: ZoneEditor;
  onClose: () => void;
  onSave: (action: ZoneAction) => ReturnType<PageContext['act']>;
}) {
  const { s } = ctx,
    batch = activeBatch(s, z.id);
  const inactive = z.status === 'inactive',
    references = zoneReferences(s, z.id);
  const freeArea = Math.max(
    0,
    s.greenhouse.plantedArea - s.zones.reduce((n, zone) => n + zone.area, 0),
  );
  const [confirmation, setConfirmation] = useState('');
  const [movementKey] = useState(() => `pop-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const foot = (label: string, danger = false, disabled = false) => (
    <div className="form-actions">
      <Button onClick={close}>Cancel</Button>
      <Button type="submit" tone={danger ? 'danger' : 'primary'} disabled={disabled}>
        {displayLabel(label)}
      </Button>
    </div>
  );
  const fieldNumber = (label: string, name: string, initial: number, step = '1', min = '0') => (
    <Field label={label}>
      <input
        name={name}
        type="number"
        min={min}
        max="10000000"
        step={step}
        defaultValue={initial}
        required
      />
    </Field>
  );
  return (
    <Modal
      title={
        {
          'zone-new': 'Add zone',
          'zone-edit': `Edit ${displayLabel(z.name)}`,
          'zone-delete': `Delete ${displayLabel(z.name)}?`,
          'zone-status': inactive ? 'Activate zone' : 'Deactivate zone',
          'batch-new': 'Record planting batch',
          'batch-edit': 'Edit crop details',
          count: 'Population changes',
          finish: 'Close planting batch',
          devices: 'Device placement',
        }[editor]
      }
      description={`${displayLabel(s.greenhouse.name)} / ${editor === 'zone-new' ? 'New zone' : z.name}`}
      onClose={close}
    >
      <FormBox
        key={`${editor}-${z.id}`}
        onSubmit={(f) => {
          if (editor === 'zone-new' || editor === 'zone-edit')
            return save({
              type: 'zone_save',
              id: editor === 'zone-edit' ? z.id : undefined,
              zone: {
                name: value(f, 'name'),
                area: numeric(f, 'area'),
                capacity: numeric(f, 'capacity'),
                beds: numeric(f, 'beds'),
                method: value(f, 'method'),
                notes: value(f, 'notes'),
              },
            });
          if (editor === 'zone-delete')
            return save({ type: 'zone_delete', id: z.id, confirmation });
          if (editor === 'zone-status')
            return save({ type: 'zone_status', id: z.id, inactive: !inactive });
          if (editor === 'devices')
            return save({
              type: 'zone_devices',
              id: z.id,
              deviceIds: f.getAll('devices').map(String),
            });
          if (editor === 'finish')
            return save({ type: 'planting_close', id: batch!.id, notes: value(f, 'notes') });
          if (editor === 'count')
            return save({
              type: 'planting_count',
              id: batch!.id,
              kind: value(f, 'kind') as 'add' | 'loss' | 'remove',
              quantity: numeric(f, 'quantity'),
              reason: value(f, 'reason'),
              key: movementKey,
            });
          return save({
            type: 'planting_save',
            id: editor === 'batch-edit' ? batch!.id : undefined,
            zoneId: z.id,
            plants: numeric(f, 'plants'),
            batch: {
              crop: value(f, 'crop'),
              variety: value(f, 'variety'),
              plantedOn: value(f, 'plantedOn'),
              targetHarvestOn: value(f, 'targetHarvestOn'),
              stage: value(f, 'stage') as PlantStage,
              seedSource: value(f, 'seedSource'),
              notes: value(f, 'notes'),
            },
          });
        }}
      >
        {(editor === 'zone-new' || editor === 'zone-edit') && (
          <>
            <Field label={'Zone name'}>
              <input
                name="name"
                required
                minLength={2}
                maxLength={80}
                defaultValue={editor === 'zone-edit' ? z.name : ''}
                placeholder={'Example: East-side lettuce'}
              />
            </Field>
            <div className="form-grid">
              {fieldNumber(
                'Zone area (m²)',
                'area',
                editor === 'zone-edit' ? z.area : Math.round(freeArea * 100) / 100,
                '0.01',
              )}
              {fieldNumber(
                'Plant capacity',
                'capacity',
                editor === 'zone-edit' ? zoneCapacity(z) : 0,
              )}
              {fieldNumber(
                'Number of beds / tables',
                'beds',
                editor === 'zone-edit' ? (z.beds ?? 0) : 0,
              )}
              <Field label={'Growing method'}>
                <select
                  name="method"
                  defaultValue={
                    editor === 'zone-edit' ? (z.method ?? 'Belum ditentukan') : 'Belum ditentukan'
                  }
                >
                  {GROWING_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {displayLabel(m)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
            <p className="micro muted">
              Unallocated area{' '}
              {displayLabel(number(freeArea + (editor === 'zone-edit' ? z.area : 0), 2))} m².
              Capacity is the maximum plant count; enter zero if the space is not ready.
            </p>
            <Field label={'Zone records'}>
              <textarea
                name="notes"
                maxLength={1000}
                rows={3}
                defaultValue={editor === 'zone-edit' ? z.notes : ''}
                placeholder={'Paths, bed conditions, or maintenance needs'}
              />
            </Field>
            {foot(editor === 'zone-edit' ? 'Save zone' : 'Add zone')}
          </>
        )}
        {(editor === 'batch-new' || editor === 'batch-edit') && (
          <>
            <div className="form-grid">
              <Field label={'Crop'}>
                <input
                  name="crop"
                  required
                  minLength={2}
                  maxLength={80}
                  defaultValue={editor === 'batch-edit' ? batch?.crop : ''}
                  placeholder={'Lettuce'}
                />
              </Field>
              <Field label={'Variety'}>
                <input
                  name="variety"
                  maxLength={80}
                  defaultValue={editor === 'batch-edit' ? batch?.variety : ''}
                  placeholder={'Optional, example: Romaine'}
                />
              </Field>
              <Field label={'Planting date'}>
                <input
                  type="date"
                  name="plantedOn"
                  required
                  min={s.cycle.plantedOn}
                  max={localDate(s.clock)}
                  defaultValue={editor === 'batch-edit' ? batch?.plantedOn : localDate(s.clock)}
                />
              </Field>
              <Field label={'Target harvest'}>
                <input
                  type="date"
                  name="targetHarvestOn"
                  min={s.cycle.plantedOn}
                  defaultValue={editor === 'batch-edit' ? batch?.targetHarvestOn : ''}
                />
              </Field>
              <Field label={'Crop stage'}>
                <select
                  name="stage"
                  defaultValue={editor === 'batch-edit' ? batch?.stage : 'Vegetatif'}
                >
                  {PLANT_STAGES.map((stage) => (
                    <option key={stage} value={stage}>
                      {displayLabel(stage)}
                    </option>
                  ))}
                </select>
              </Field>
              {editor === 'batch-new' ? (
                fieldNumber('Initial plant count', 'plants', 1, '1', '1')
              ) : (
                <Field
                  label={'Active population'}
                  hint={'Use Record population change to retain a traceable history.'}
                >
                  <input readOnly value={`${batch?.currentPlants} plants`} />
                </Field>
              )}
            </div>
            <Field label={'Seed / seedling source'}>
              <input
                name="seedSource"
                maxLength={120}
                defaultValue={editor === 'batch-edit' ? batch?.seedSource : ''}
                placeholder={'Supplier or seed lot number'}
              />
            </Field>
            <Field label={'Crop notes'}>
              <textarea
                name="notes"
                maxLength={1000}
                rows={3}
                defaultValue={editor === 'batch-edit' ? batch?.notes : ''}
              />
            </Field>
            <p className="micro muted">
              Zone capacity {displayLabel(number(zoneCapacity(z)))} plants. Target harvest is a user
              plan, not an AI prediction.
            </p>
            {foot(editor === 'batch-edit' ? 'Save crop details' : 'Record planting batch')}
          </>
        )}
        {editor === 'count' && (
          <>
            <p>
              {displayLabel(batch?.id)}: {displayLabel(number(batch?.currentPlants ?? 0))} active
              plants out of capacity {displayLabel(number(zoneCapacity(z)))}.
            </p>
            <Field label={'Change type'}>
              <select name="kind">
                <option value="add">Add / replace plants</option>
                <option value="loss">Dead / failed plants</option>
                <option value="remove">Plants removed</option>
              </select>
            </Field>
            {fieldNumber('Plant count', 'quantity', 1, '1', '1')}
            <Field label={'Reason for change'}>
              <textarea name="reason" required minLength={5} maxLength={1000} rows={3} />
            </Field>
            {foot('Save population change')}
          </>
        )}
        {editor === 'finish' && (
          <>
            <Alert title={'Close the batch when work is complete'}>
              Record removals until the population is zero, complete care tasks and pest cases, then
              pause zone routines. Harvest lots and sales remain saved.
            </Alert>
            <p>
              Current active population:{' '}
              <strong>{displayLabel(number(batch?.currentPlants ?? 0))} plants</strong>.
            </p>
            <Field label={'Batch closing notes'}>
              <textarea name="notes" required minLength={5} maxLength={1000} rows={3} />
            </Field>
            {foot('Close batch', false, (batch?.currentPlants ?? 0) > 0)}
          </>
        )}
        {editor === 'zone-delete' && (
          <>
            <p>
              {references.batches} batch, {references.devices} devices, {references.routines}{' '}
              routines, and {references.records} linked records.
            </p>
            {zoneDeleteBlocker(s, z.id) ? (
              <Alert>{displayLabel(zoneDeleteBlocker(s, z.id))}</Alert>
            ) : (
              <Field label={`Type “${displayLabel(z.name)}” to delete`}>
                <input
                  value={confirmation}
                  onChange={(e) => setConfirmation(e.target.value)}
                  autoComplete="off"
                />
              </Field>
            )}
            {foot(
              'Delete zone',
              true,
              !!zoneDeleteBlocker(s, z.id) || confirmation.trim() !== z.name,
            )}
          </>
        )}
        {editor === 'zone-status' && (
          <>
            <p>
              {displayLabel(
                inactive
                  ? 'This zone will be available for a new batch. Revalidate device installation before monitoring.'
                  : 'The zone will no longer accept new activity. All history remains available.',
              )}
            </p>
            {displayLabel(
              !inactive && zoneInactiveBlocker(s, z.id) && (
                <Alert>{zoneInactiveBlocker(s, z.id)}</Alert>
              ),
            )}
            {foot(
              inactive ? 'Activate zone' : 'Deactivate zone',
              false,
              !inactive && !!zoneInactiveBlocker(s, z.id),
            )}
          </>
        )}
        {editor === 'devices' && (
          <>
            <p>
              Cameras and sensors belong to one zone. Moving them invalidates the previous
              installation check; historical costs stay with their original records.
            </p>
            <div className="zone-device-options">
              {s.devices.map((d) => (
                <label key={d.id}>
                  <input
                    type="checkbox"
                    name="devices"
                    value={d.id}
                    defaultChecked={d.zones.includes(z.id)}
                  />
                  <span>
                    <strong>{displayLabel(d.label)}</strong>
                    <small>
                      {displayLabel(d.id)},{' '}
                      {displayLabel(
                        d.zones.map((id) => zoneName(s, id)).join(', ') || 'Unassigned',
                      )}
                    </small>
                  </span>
                </label>
              ))}
            </div>
            {!s.devices.length && (
              <Empty
                title={'Inventory is empty'}
                detail={'Add devices from the zone details first.'}
              />
            )}
            {foot('Save placement')}
          </>
        )}
      </FormBox>
    </Modal>
  );
}
