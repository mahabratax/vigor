import React, { useState } from 'react';
import { illustrations, type IllustrationName } from '../data/illustrations';

export function FarmIllustration({
  name,
  className = '',
  alt = '',
}: {
  name: IllustrationName;
  className?: string;
  alt?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      className={`vigor-illustration ${className}`}
      data-illustration={name}
      src={illustrations[name]}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={480}
      height={320}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

/** Artwork belongs to the workflow, never to a measured state or camera feed. */
export function pageIllustration(path: string, query: URLSearchParams): IllustrationName | null {
  const tab = query.get('tab');
  if (path === '/greenhouse')
    return tab === 'manage' ? 'greenhouse' : tab === 'energy' ? 'resources' : null;
  if (path === '/hama') return tab === 'detection' ? null : 'inspection';
  if (path === '/pengendalian') return !tab || tab === 'plans' ? 'inspection' : null;
  if (path === '/siklus') return !tab || tab === 'care' ? 'inspection' : 'harvest';
  if (path === '/otomasi')
    return !tab || ['schedule', 'routines'].includes(tab) ? 'irrigation' : null;
  if (path === '/perangkat')
    return tab === 'supplies' ? 'harvest' : !tab || tab === 'inventory' ? 'irrigation' : null;
  if (path === '/biaya')
    return tab === 'expenses'
      ? null
      : ['profit', 'efficiency'].includes(tab ?? '')
        ? 'harvest'
        : 'resources';
  return null;
}
