import type { DomainState, Zone } from '../../domain/types';
import { availableDevices, sensorValue } from '../../domain/scheduler';
import { zoneStatus } from '../../domain/selectors';
import { activeBatch } from '../../domain/zones';
import { number } from '../../domain/format';

export type SpatialLayer = 'coverage' | 'temperature' | 'pests';
export type CameraMode = 'isometric' | 'top';
export type CameraCommand = {
  action: 'fit' | 'focus' | 'focus_asset' | 'in' | 'out';
  sequence: number;
};
export const layers = [
  { id: 'coverage', label: 'Monitoring', icon: 'eye' },
  { id: 'pests', label: 'Pest findings', icon: 'bug' },
  { id: 'temperature', label: 'Temperature', icon: 'temp' },
] as const;
export function spatialLayer(value: string | null): SpatialLayer {
  return value === 'temperature' || value === 'pests' ? value : 'coverage';
}
export const spatialColors = {
  green: { ink: '#28543a', fill: '#dfebdd', mark: '#638b60' },
  amber: { ink: '#835019', fill: '#f7e8cd', mark: '#b87829' },
  blue: { ink: '#2b6573', fill: '#dcecf0', mark: '#488393' },
  gray: { ink: '#58655e', fill: '#e6ebe7', mark: '#83948a' },
};
export type SpatialTone = keyof typeof spatialColors;
/** Both renderers use row-major order, with north at negative Z. */
export function greenhouseLayout(count: number) {
  const columns = count <= 1 ? 1 : count <= 8 ? 2 : count <= 18 ? 3 : 4;
  const rows = Math.max(1, Math.ceil(count / columns));
  const pitchX = 4.65,
    pitchZ = 3.35;
  return {
    columns,
    rows,
    bedWidth: 3.6,
    bedDepth: 2.65,
    width: columns * pitchX + 0.3,
    depth: rows * pitchZ + 0.7,
    positions: Array.from({ length: count }, (_, i) => ({
      x: ((i % columns) - (columns - 1) / 2) * pitchX,
      z: (Math.floor(i / columns) - (rows - 1) / 2) * pitchZ,
      row: Math.floor(i / columns),
      column: i % columns,
    })),
    aisles: Array.from({ length: columns - 1 }, (_, i) => (i - (columns - 2) / 2) * pitchX),
  };
}
export type GreenhouseLayout = ReturnType<typeof greenhouseLayout>;
export function zoneTemperature(s: DomainState, z: Zone) {
  if (!z.validated || z.status === 'inactive') return null;
  const sensor = availableDevices(s).find(
    (d) => d.zones.includes(z.id) && d.capabilities.includes('temperature'),
  );
  return sensor ? sensorValue(s, sensor.id) : null;
}
export function zoneVisual(s: DomainState, z: Zone, layer: SpatialLayer) {
  let tone: SpatialTone = 'gray',
    label = 'Zone inactive';
  if (z.status !== 'inactive') {
    if (layer === 'temperature') {
      const reading = zoneTemperature(s, z);
      label = reading === null ? 'Temperature unavailable' : `${number(reading, 1)} °C`;
      tone = reading === null ? 'gray' : reading >= 30 ? 'amber' : 'green';
    } else if (layer === 'pests') {
      const open = s.cases.filter((c) => c.zoneId === z.id && c.status !== 'closed');
      const status = zoneStatus(s, z.id);
      tone = open.length
        ? open.every((c) => c.status === 'monitoring')
          ? 'blue'
          : 'amber'
        : status.tone === 'green'
          ? 'green'
          : 'gray';
      label = open.length
        ? `${open.length} open cases`
        : status.tone === 'green'
          ? 'No findings yet'
          : 'Incomplete data';
    } else {
      const status = zoneStatus(s, z.id);
      tone = status.tone as SpatialTone;
      label = status.label;
    }
  }
  const batch = activeBatch(s, z.id);
  const crop = batch ? `${batch.crop}${batch.variety ? ` / ${batch.variety}` : ''}` : 'Not planted';
  return { tone, label, crop, ...spatialColors[tone] };
}
export function layerLegend(layer: SpatialLayer) {
  return layer === 'temperature'
    ? [
        { tone: 'green', label: 'Below 30 °C' },
        { tone: 'amber', label: '30 °C or above' },
        { tone: 'gray', label: 'No valid data' },
      ]
    : layer === 'pests'
      ? [
          { tone: 'amber', label: 'Open cases' },
          { tone: 'blue', label: 'Follow-up monitoring' },
          { tone: 'green', label: 'No findings yet' },
          { tone: 'gray', label: 'Incomplete data' },
        ]
      : [
          { tone: 'green', label: 'Monitoring active' },
          { tone: 'amber', label: 'Needs attention' },
          { tone: 'blue', label: 'Follow-up monitoring' },
          { tone: 'gray', label: 'Unavailable / inactive' },
        ];
}
