import { displayLabel } from '../../i18n/display';
import React from 'react';
import { FarmObject } from '../../components/FarmObject';
import type { ServiceAsset, ServiceId } from './serviceModel';

export function ServicePlan({
  assets,
  selected,
  onSelect,
  panels,
}: {
  assets: ServiceAsset[];
  selected: ServiceId | null;
  onSelect: (id: ServiceId) => void;
  panels: number;
}) {
  return (
    <aside className="plan-utilities" aria-label="Greenhouse service area">
      <div className="plan-utilities-heading">
        <h4>Service area</h4>
        <p>Select equipment for details</p>
      </div>
      <div className="plan-utility-assets">
        {assets.map((a) => (
          <button
            key={a.id}
            type="button"
            aria-pressed={a.id === selected}
            onClick={() => onSelect(a.id)}
            aria-label={`Details ${a.title}`}
            data-service={a.id}
          >
            <FarmObject name={a.id} className="service-plan-art" />
            <strong>{displayLabel(a.title)}</strong>
            {a.id === 'solar' && <span className="plan-equipment-count">{panels} panels</span>}
            <small data-attention={a.attention} data-running={a.running}>
              {displayLabel(a.status)}
            </small>
          </button>
        ))}
      </div>
    </aside>
  );
}
