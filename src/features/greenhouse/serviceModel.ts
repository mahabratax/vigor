import type { Capability, DomainState } from '../../domain/types';
import type { IconName } from '../../components/ui';
import { availableDevices, sensorValue } from '../../domain/scheduler';
import { energyConfig, energyModel } from '../../domain/energy';
import { number } from '../../domain/format';
import type { GreenhouseLayout } from './spatialModel';

export type ServiceId = 'solar' | 'water' | 'nutrition' | 'climate' | 'controller';
export interface ServiceAsset {
  id: ServiceId;
  title: string;
  icon: IconName;
  status: string;
  detail: string;
  value: string;
  deviceIds: string[];
  running: boolean;
  attention: boolean;
}
export function serviceLayout(layout: GreenhouseLayout) {
  return { x: layout.width / 2 + 2.45, depth: 8.4, width: 3.6 };
}
export function deviceRunning(s: DomainState, id: string) {
  return s.runs.some(
    (r) =>
      r.status === 'Running' &&
      r.steps.some(
        (step) =>
          step.status === 'running' &&
          step.deviceIds.includes(id) &&
          ['start', 'water', 'dose', 'flush', 'fan', 'test'].includes(step.action),
      ),
  );
}
export function serviceAssets(s: DomainState): ServiceAsset[] {
  const assets: ServiceAsset[] = [];
  const config = energyConfig(s);
  if (config.enabled) {
    const model = energyModel(s, config);
    assets.push({
      id: 'solar',
      title: 'Solar & inverter',
      icon: 'sun',
      status: 'Sample plan',
      detail: `${config.panelCount} panels × ${number(config.panelWatts)} Wp, inverter ${number(config.inverterKw, 1)} kW. Service canopy is separate from the crop roof. No battery or backup power.`,
      value: `${number(model.day.used, 2)} kWh/day used directly`,
      deviceIds: [],
      running: false,
      attention: false,
    });
  }
  const definitions: {
    id: ServiceId;
    title: string;
    icon: IconName;
    primary: Capability;
    related: Capability[];
    detail: string;
  }[] = [
    {
      id: 'water',
      title: 'Tank & irrigation',
      icon: 'drop',
      primary: 'pump',
      related: ['pump', 'valve', 'flow', 'level'],
      detail:
        'The tank supplies the pump and zone valves. Water level and flow are required by routines that use them.',
    },
    {
      id: 'nutrition',
      title: 'Fertigation',
      icon: 'flask',
      primary: 'dose',
      related: ['dose', 'ec', 'ph', 'level'],
      detail:
        'Solution tanks, injector, and EC/pH sensors reflect registered devices. Doses follow the reviewed nutrient profile.',
    },
    {
      id: 'climate',
      title: 'Air circulation',
      icon: 'wind',
      primary: 'fan',
      related: ['fan'],
      detail:
        'Circulation fan with grille and structural mount. Running status follows the simulator execution step.',
    },
    {
      id: 'controller',
      title: 'Controller',
      icon: 'wifi',
      primary: 'gateway',
      related: ['gateway'],
      detail:
        'Control cabinet and gateway represent registered devices. No live IoT connection is available.',
    },
  ];
  const devices = availableDevices(s);
  for (const def of definitions) {
    const primary = devices.find((d) => d.capabilities.includes(def.primary));
    if (!primary) continue;
    const related = devices.filter(
      (d) =>
        def.related.some((c) => d.capabilities.includes(c)) &&
        (def.id !== 'water' || d.type !== 'nutrition') &&
        (def.id !== 'nutrition' || d.type === 'nutrition'),
    );
    const running = deviceRunning(s, primary.id);
    let attention = related.some(
      (d) => d.maintenance || d.connection !== 'online' || !d.calibrated,
    );
    const levelDevice =
      def.id === 'water' ? related.find((d) => d.capabilities.includes('level')) : null;
    const level = levelDevice ? sensorValue(s, levelDevice.id) : null;
    const lowWater = def.id === 'water' && primary.id === 'PUMP-01' && level !== null && level < 20;
    attention ||= lowWater;
    const value =
      def.id === 'water'
        ? level === null
          ? 'Water level unavailable'
          : `Water level ${number(level)}% / sample`
        : `${number(primary.watts)} W registered power`;
    assets.push({
      ...def,
      status: lowWater
        ? 'Low water / sample threshold 20%'
        : attention
          ? 'Inspection needed'
          : running
            ? 'Running / simulated'
            : 'Standby / simulated',
      detail: def.detail,
      value,
      deviceIds: [primary.id, ...related.filter((d) => d.id !== primary.id).map((d) => d.id)],
      running,
      attention,
    });
  }
  return assets;
}
