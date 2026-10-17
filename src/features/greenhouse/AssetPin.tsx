import { displayLabel } from '../../i18n/display';
import React, { useEffect, useId, useRef, useState } from 'react';
import { Icon } from '../../components/ui';
import type { ServiceAsset, ServiceId } from './serviceModel';
import type { AssetProjection } from './assetAnnotations';

export function AssetPin({
  asset,
  projection,
  selected,
  zones,
  onSelect,
  onFocus,
  onNavigate,
  operationsUrl,
}: {
  asset: ServiceAsset;
  projection: AssetProjection;
  selected: boolean;
  zones: string[];
  onSelect: (id: ServiceId | null) => void;
  onFocus: () => void;
  onNavigate?: (url: string) => void;
  operationsUrl?: string;
}) {
  const id = useId(),
    button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (selected) button.current?.focus({ preventScroll: true });
  }, [selected]);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(hoverTimeout.current), []);
  const [hover, setHover] = useState(false),
    [focus, setFocus] = useState(false),
    [dismissed, setDismissed] = useState(false);
  const open = selected || (!dismissed && (hover || focus));
  const close = () => {
    setDismissed(true);
    onSelect(null);
    button.current?.focus();
  };
  return (
    <div
      className="scene-asset-anchor"
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          clearTimeout(hoverTimeout.current);
          setHover(true);
          setDismissed(false);
        }
      }}
      onPointerLeave={() => {
        clearTimeout(hoverTimeout.current);
        hoverTimeout.current = setTimeout(() => setHover(false), 180);
      }}
      onFocus={() => setFocus(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setFocus(false);
          setDismissed(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <svg className="scene-asset-leader" width="1" height="1" aria-hidden="true">
        <line x1="0" y1="0" x2={projection.dx} y2={projection.dy} />
        <circle cx="0" cy="0" r="2.5" />
      </svg>
      <button
        ref={button}
        type="button"
        className={`scene-asset-label ${selected ? 'selected' : ''}`}
        style={{ left: projection.dx - 38, top: projection.dy - 16 }}
        aria-label={`${asset.title}: ${asset.status}`}
        aria-expanded={selected}
        aria-controls={selected ? id : undefined}
        aria-describedby={open && !selected ? id : undefined}
        onClick={() => {
          setDismissed(selected);
          onSelect(selected ? null : asset.id);
        }}
      >
        <Icon name={asset.icon} size={13} />
        <span>{displayLabel(asset.id === 'solar' ? 'PLTS' : asset.deviceIds[0])}</span>
        <i data-attention={asset.attention} data-running={asset.running} />
      </button>
      {open && (
        <section
          id={id}
          className={`scene-asset-popover ${selected ? 'pinned' : ''}`}
          role={selected ? 'dialog' : 'tooltip'}
          aria-label={`Quick details ${asset.title}`}
          style={projection.popover}
        >
          <div className="scene-asset-popover-title">
            <strong>{displayLabel(asset.title)}</strong>
            {selected && (
              <button type="button" aria-label={'Close asset tooltip'} onClick={close}>
                <Icon name="close" size={15} />
              </button>
            )}
          </div>
          <span className="scene-asset-status" data-attention={asset.attention}>
            {displayLabel(asset.status)}
          </span>
          <p>{displayLabel(asset.value)}</p>
          {zones.length > 0 && <small>Linked: {displayLabel(zones.join(', '))}</small>}
          {asset.id === 'solar' && <small>Sample projection / inverter not connected</small>}
          {selected ? (
            <div className="scene-asset-actions">
              <button type="button" onClick={onFocus}>
                <Icon name="eye" size={13} />
                Focus asset
              </button>
              {onNavigate && (
                <button
                  type="button"
                  onClick={() =>
                    onNavigate(
                      asset.id === 'solar'
                        ? '/greenhouse?tab=energy'
                        : `/perangkat?device=${encodeURIComponent(asset.deviceIds[0])}`,
                    )
                  }
                >
                  {displayLabel(asset.id === 'solar' ? 'Review energy' : 'Device details')}
                </button>
              )}
              {displayLabel(
                onNavigate && operationsUrl && (
                  <button
                    type="button"
                    className="scene-asset-process"
                    onClick={() => onNavigate(operationsUrl)}
                  >
                    View related operation
                  </button>
                ),
              )}
            </div>
          ) : (
            <small className="scene-asset-hint">Select an asset to see its actions.</small>
          )}
        </section>
      )}
    </div>
  );
}
