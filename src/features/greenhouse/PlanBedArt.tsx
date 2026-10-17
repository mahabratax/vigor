import React, { useId, useState } from 'react';
import { plantingPoints, type CropAppearance } from './botanicalModel';
import { plantSprites } from '../../data/farmObjects';

/** Miniature artwork shows planting character; labels hold exact quantities and state. */
export function PlanBedArt({ crop }: { crop: CropAppearance }) {
  const spriteId = useId();
  const src = plantSprites[crop.kind];
  const [failed, setFailed] = useState<string | null>(null);
  const plants = crop.inactive ? [] : plantingPoints(crop.plants);
  // Render rear specimens first so the front row occludes naturally.
  const positions = plants
    .map((plant, i) => ({
      ...plant,
      i,
      x: 38 + (i % 6) * 27 + Math.floor(i / 6) * 28,
      y: 126 - (i % 6) * 9 + Math.floor(i / 6) * 18,
    }))
    .sort((a, b) => a.y - b.y);
  return (
    <svg
      className="plan-bed-art"
      viewBox="0 0 280 208"
      aria-hidden="true"
      focusable="false"
      data-bed={crop.bed}
      data-inactive={crop.inactive}
    >
      {!!plants.length && failed !== src && (
        <defs>
          <image
            id={spriteId}
            href={src}
            width="1"
            height="1"
            preserveAspectRatio="xMidYMax meet"
            onError={() => setFailed(src)}
          />
        </defs>
      )}
      <path d="M13 138L96 194L273 133L188 80Z" fill="#20352b" opacity=".09" />
      <path d="M12 122L96 177L96 190L12 135Z" fill="#cad7cc" />
      <path d="M96 177L268 119L268 132L96 190Z" fill="#e2eae2" />
      <path d="M12 122L186 64L268 119L96 177Z" fill="#f7faf5" />
      <path
        d="M23 121L186 71L257 119L96 168Z"
        fill={crop.bed === 'soil' || crop.bed === 'bags' ? '#625343' : '#d8e3dc'}
      />
      {crop.bed === 'soil' &&
        [0, 1, 2].map((row) => (
          <path
            key={row}
            d={`M${30 + row * 27} ${126 + row * 17}l154 -50`}
            fill="none"
            stroke="#84725b"
            strokeWidth="9"
            opacity=".65"
          />
        ))}
      {crop.bed === 'channels' &&
        [0, 1, 2].map((row) => (
          <g key={row}>
            <path d={`M${27 + row * 28} ${122 + row * 18}l153 -50l10 7l-153 50Z`} fill="#b2c7bc" />
            <path d={`M${27 + row * 28} ${119 + row * 18}l153 -50l10 7l-153 50Z`} fill="#f6faf6" />
            <path
              d={`M${32 + row * 28} ${123 + row * 18}l150 -49`}
              stroke="#b1d2cc"
              strokeWidth="1"
            />
          </g>
        ))}
      {positions.map((p) => (
        <g key={p.i} data-plant={p.i}>
          {crop.bed === 'bags' && (
            <g>
              <path d={`M${p.x - 9} ${p.y - 1}v9q9 9 18 0v-9Z`} fill="#304a3c" />
              <ellipse cx={p.x} cy={p.y - 1} rx="9" ry="5" fill="#263d30" />
              <ellipse cx={p.x} cy={p.y - 1} rx="7" ry="3.5" fill="#705e43" />
            </g>
          )}
          <ellipse cx={p.x} cy={p.y + 2} rx="11" ry="4" fill="#20352b" opacity=".12" />
          {failed !== src &&
            (() => {
              const size =
                (crop.kind === 'leafy' || crop.kind === 'generic' ? 45 : 65) *
                p.variation *
                (crop.seedling ? 0.55 : 1);
              return (
                <use
                  className="plan-plant-sprite"
                  href={`#${spriteId}`}
                  transform={`translate(${p.x - size / 2} ${p.y + 2 - size}) scale(${size})`}
                />
              );
            })()}
        </g>
      ))}
      <path d="M12 122L96 177L268 119" fill="none" stroke="#fff" strokeWidth="2" />
      {crop.inactive && (
        <path d="M27 121L244 129M91 163L187 81" stroke="#74887c" strokeWidth="1.5" opacity=".65" />
      )}
    </svg>
  );
}
