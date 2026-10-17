import { displayLabel } from '../../i18n/display';
import React, { useState } from 'react';
import { Badge, Button, Icon, Modal, SearchField } from '../../components/ui';
import { kpis } from '../../domain/selectors';
import type { DomainState } from '../../domain/types';
import type { GreenhouseId } from '../../data/greenhouses';
export function GreenhouseSwitcher({
  greenhouses,
  activeId,
  onSelect,
  onClose,
  onManage,
}: {
  greenhouses: DomainState[];
  activeId: string;
  onSelect: (id: GreenhouseId) => void;
  onClose: () => void;
  onManage: () => void;
}) {
  const [search, setSearch] = useState('');
  const rows = greenhouses.filter((s) =>
    `${displayLabel(s.greenhouse.name)} ${s.greenhouse.location}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <Modal
      title={'Select greenhouse'}
      description={'Sensors, activity, devices, and costs follow the selected greenhouse.'}
      onClose={onClose}
    >
      <div className="greenhouse-picker">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={'Search greenhouse or location…'}
        />
        {rows.map((s) => {
          const k = kpis(s),
            selected = activeId === s.greenhouse.id;
          return (
            <button
              key={s.greenhouse.id}
              className={`greenhouse-option ${selected ? 'selected' : ''}`}
              aria-pressed={selected}
              onClick={() => onSelect(s.greenhouse.id as GreenhouseId)}
            >
              <span className="greenhouse-option-mark">
                <Icon name="greenhouse" size={26} />
              </span>
              <span className="greenhouse-option-content">
                <strong>{displayLabel(s.greenhouse.name)}</strong>
                <span>{displayLabel(s.greenhouse.location)}</span>
                <small>
                  {displayLabel(s.cycle.crop)}, {s.greenhouse.area} m²
                </small>
                <span className="greenhouse-option-status">
                  <Badge tone={k.inspection ? 'amber' : 'green'} dot>
                    {displayLabel(
                      k.inspection
                        ? `${k.inspection} pending inspections`
                        : k.observationsTotal
                          ? 'Monitoring available'
                          : 'No monitoring devices yet',
                    )}
                  </Badge>
                  <span>
                    {k.coverage}/{s.zones.length} validated zones
                  </span>
                </span>
              </span>
              {selected ? <Icon name="checkcircle" size={22} /> : <Icon name="chevron" />}
            </button>
          );
        })}
        {!rows.length && (
          <p className="muted">No greenhouse matches that name. Try another location.</p>
        )}
        <p className="micro muted">
          Options follow member access. Devices, crops, and costs are stored separately for each
          greenhouse.
        </p>
        <Button icon="settings" onClick={onManage}>
          Manage greenhouses
        </Button>
      </div>
    </Modal>
  );
}
