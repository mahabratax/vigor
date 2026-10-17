import { displayLabel } from '../../i18n/display';
import React from 'react';
import type { DomainState } from '../../domain/types';
import { Button } from '../../components/ui';
import { FarmObject } from '../../components/FarmObject';
import type { ServiceAsset } from './serviceModel';

export function ServiceDetails({
  s,
  asset,
  onNavigate,
  onClose,
}: {
  s: DomainState;
  asset: ServiceAsset;
  onNavigate?: (url: string) => void;
  onClose: () => void;
}) {
  const routine = s.routines.find((r) =>
    r.version.requiredDevices.some((id) => asset.deviceIds.includes(id)),
  );
  return (
    <section className="service-details" aria-label={`Details ${asset.title}`}>
      <div className="service-detail-heading">
        <FarmObject name={asset.id} />
        <div>
          <h3>{displayLabel(asset.title)}</h3>
          <span>{displayLabel(asset.status)}</span>
        </div>
        <Button small icon="close" ariaLabel="Close asset details" tone="ghost" onClick={onClose} />
      </div>
      <p>{displayLabel(asset.detail)}</p>
      <strong className="service-reading">{displayLabel(asset.value)}</strong>
      {onNavigate && (
        <div className="service-links">
          {asset.id === 'solar' ? (
            <Button small icon="sun" onClick={() => onNavigate('/greenhouse?tab=energy')}>
              Review energy & costs
            </Button>
          ) : (
            <>
              <Button
                small
                icon="devices"
                onClick={() =>
                  onNavigate(`/perangkat?device=${encodeURIComponent(asset.deviceIds[0])}`)
                }
              >
                Device details
              </Button>
              {routine && (
                <Button
                  small
                  icon="workflow"
                  onClick={() =>
                    onNavigate(
                      `/greenhouse?tab=operations&routine=${encodeURIComponent(routine.id)}`,
                    )
                  }
                >
                  Review operations
                </Button>
              )}
              <Button
                small
                icon="wallet"
                onClick={() =>
                  onNavigate(`/biaya?tab=expenses&device=${encodeURIComponent(asset.deviceIds[0])}`)
                }
              >
                Linked costs
              </Button>
            </>
          )}
        </div>
      )}
      {!!asset.deviceIds.length && (
        <small className="service-device-list">
          Linked devices: {displayLabel(asset.deviceIds.join(', '))}
        </small>
      )}
    </section>
  );
}
