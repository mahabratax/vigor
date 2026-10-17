import type { Device, DomainState } from './types';
import { availableDevices } from './scheduler';

export interface EnergyConfig {
  enabled: boolean;
  panelCount: number;
  panelWatts: number;
  inverterKw: number;
  sunHours: number;
  performanceRatio: number;
  tariff: number;
  investment: number | null;
  maintenanceMonthly: number;
  loads: Record<string, { hours: number; start: number }>;
}
export const defaultEnergy = (s: DomainState): EnergyConfig => ({
  enabled: s.greenhouse.source !== 'custom',
  panelCount: 4,
  panelWatts: 250,
  inverterKw: 1,
  sunHours: 4,
  performanceRatio: 0.8,
  tariff: s.costs.electricityPerKwh,
  investment: null,
  maintenanceMonthly: 0,
  loads: {},
});
export function validEnergy(value: unknown): value is EnergyConfig {
  if (!value || typeof value !== 'object') return false;
  const c = value as EnergyConfig;
  const range = (n: number, min: number, max: number) => Number.isFinite(n) && n >= min && n <= max;
  return (
    typeof c.enabled === 'boolean' &&
    Number.isInteger(c.panelCount) &&
    range(c.panelCount, 1, 12) &&
    range(c.panelWatts, 50, 700) &&
    range(c.inverterKw, 0.1, 20) &&
    range(c.sunHours, 0, 8) &&
    range(c.performanceRatio, 0.5, 1) &&
    range(c.tariff, 0, 10000) &&
    (c.investment === null || range(c.investment, 1, 1e12)) &&
    range(c.maintenanceMonthly, 0, 1e9) &&
    !!c.loads &&
    typeof c.loads === 'object' &&
    !Array.isArray(c.loads) &&
    Object.values(c.loads).every(
      (l) => !!l && range(l.hours, 0, 24) && Number.isInteger(l.start) && range(l.start, 0, 23),
    )
  );
}
export function energyConfig(s: DomainState): EnergyConfig {
  return validEnergy(s.energy) ? s.energy : defaultEnergy(s);
}
function defaultLoad(device: Device) {
  if (device.capabilities.includes('fan')) return { hours: 8, start: 8 };
  if (
    device.capabilities.some((cap) => ['pump', 'valve', 'dose', 'test_module'].includes(cap)) &&
    !device.capabilities.includes('gateway')
  )
    return { hours: 1, start: 7 };
  // Sensors can belong to the irrigation/nutrition inventory categories too.
  if (
    ['camera', 'sensor', 'controller'].includes(device.type) ||
    device.capabilities.some((cap) =>
      ['temperature', 'humidity', 'flow', 'level', 'media', 'ec', 'ph', 'gateway'].includes(cap),
    )
  )
    return { hours: 24, start: 0 };
  return { hours: 1, start: 7 };
}
export function energyLoads(s: DomainState, config = energyConfig(s)) {
  return availableDevices(s).map((device) => ({
    device,
    watts: Number.isFinite(device.watts) ? Math.max(0, device.watts) : 0,
    ...defaultLoad(device),
    ...config.loads[device.id],
  }));
}
/** One-hour bins; fractional duration is supported, including crossing midnight. */
export function energyModel(s: DomainState, config = energyConfig(s), days = 30) {
  const loads = energyLoads(s, config);
  const weights = Array.from({ length: 24 }, (_, h) =>
    h >= 6 && h < 18 ? Math.sin(((h + 0.5 - 6) / 12) * Math.PI) : 0,
  );
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const capacity = (config.panelCount * config.panelWatts) / 1000;
  const potential = config.enabled ? capacity * config.sunHours * config.performanceRatio : 0;
  const hours = weights.map((weight, hour) => {
    const demand = loads.reduce(
      (sum, l) =>
        sum + (l.watts / 1000) * Math.min(1, Math.max(0, l.hours - ((hour - l.start + 24) % 24))),
      0,
    );
    const solar = Math.min(config.inverterKw, (potential * weight) / weightSum);
    const used = Math.min(demand, solar);
    return {
      hour,
      label: `${String(hour).padStart(2, '0')}:00`,
      demand,
      solar,
      used,
      grid: demand - used,
      surplus: solar - used,
    };
  });
  const sum = (key: 'demand' | 'solar' | 'used' | 'grid' | 'surplus') =>
    hours.reduce((n, h) => n + h[key], 0);
  const day = {
    demand: sum('demand'),
    solar: sum('solar'),
    used: sum('used'),
    grid: sum('grid'),
    surplus: sum('surplus'),
  };
  const grossSavings = day.used * config.tariff * days;
  const maintenance = config.enabled ? (config.maintenanceMonthly * days) / 30 : 0;
  const netSavings = grossSavings - maintenance;
  const monthlyNet =
    day.used * config.tariff * 30 - (config.enabled ? config.maintenanceMonthly : 0);
  return {
    hours,
    day,
    loads,
    capacity,
    days,
    coverage: day.demand > 0 ? (day.used / day.demand) * 100 : null,
    utilization: day.solar > 0 ? (day.used / day.solar) * 100 : null,
    baselineCost: day.demand * config.tariff * days,
    gridCost: day.grid * config.tariff * days,
    grossSavings,
    maintenance,
    netSavings,
    paybackMonths:
      config.enabled && config.investment !== null && monthlyNet > 0
        ? config.investment / monthlyNet
        : null,
  };
}
