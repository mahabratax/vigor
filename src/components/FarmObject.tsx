import React, { useState } from 'react';
import { farmObjects, type FarmObjectName } from '../data/farmObjects';
import { Icon, type IconName } from './ui';

const fallback: Record<FarmObjectName, IconName> = {
  solar: 'sun',
  water: 'drop',
  nutrition: 'flask',
  climate: 'wind',
  controller: 'devices',
  camera: 'camera',
  sensor: 'temp',
};
/** The adjacent text describes the asset. This image never encodes measured status. */
export function FarmObject({ name, className = '' }: { name: FarmObjectName; className?: string }) {
  const [failed, setFailed] = useState<string | null>(null);
  const src = farmObjects[name];
  return (
    <span className={`farm-object ${className}`} data-farm-object={name} aria-hidden="true">
      {failed === src ? (
        <Icon name={fallback[name]} size={24} />
      ) : (
        <img
          src={src}
          alt=""
          width={256}
          height={256}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(src)}
        />
      )}
    </span>
  );
}
