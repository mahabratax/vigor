import type { AutomationRoutine } from '../../domain/types';
export const kindLabels = {
  irrigation: 'Irigasi',
  fertigation: 'Nutrisi',
  environment: 'Lingkungan',
  preventive: 'Preventif',
  pest: 'Pest test module',
};
export const kindIcons = {
  irrigation: 'drop' as const,
  fertigation: 'flask' as const,
  environment: 'wind' as const,
  preventive: 'wrench' as const,
  pest: 'shield' as const,
};
export const routineStatus = (r: AutomationRoutine) =>
  r.status === 'Active'
    ? 'Active'
    : r.status === 'Paused'
      ? 'Paused'
      : r.status === 'Draft'
        ? 'Draft'
        : 'Needs review';
export const triggerLabel = (r: AutomationRoutine) =>
  r.trigger.type === 'schedule'
    ? r.trigger.schedule.times.join(', ') + ' WIB'
    : r.trigger.type === 'sensor'
      ? `${r.trigger.deviceId} ${r.trigger.direction === 'below' ? '<' : '>'} ${r.trigger.start}`
      : `After ${r.trigger.routineId} completed`;
