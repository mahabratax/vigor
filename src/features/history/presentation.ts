import type { IconName } from '../../components/ui';
export const eventTypes: Record<
  string,
  {
    label: string;
    icon: IconName;
    tone: string;
  }
> = {
  observation: { label: 'Observations', icon: 'eye', tone: 'green' },
  inspection: { label: 'Inspection', icon: 'bug', tone: 'amber' },
  plan: { label: 'Pest management', icon: 'shield', tone: 'green' },
  routine: { label: 'Routine', icon: 'workflow', tone: 'blue' },
  run: { label: 'Executions', icon: 'play', tone: 'green' },
  device: { label: 'Devices', icon: 'devices', tone: 'amber' },
  maintenance: { label: 'Maintenance', icon: 'wrench', tone: 'amber' },
  expense: { label: 'Expenses', icon: 'wallet', tone: 'purple' },
  system: { label: 'Local system', icon: 'info', tone: 'gray' },
};
export function relatedUrl(id: string, zoneId?: string) {
  if (id.startsWith('BATCH-') || id.startsWith('POP-') || (zoneId && id === zoneId))
    return `/greenhouse?tab=zones&panel=activity${zoneId ? `&zone=${encodeURIComponent(zoneId)}` : ''}`;
  if (id.startsWith('CROP-') || id.startsWith('CARE-')) return '/siklus?tab=care';
  if (id.startsWith('LOT-') || id.startsWith('LOSS-'))
    return `/siklus?tab=harvest&lot=${encodeURIComponent(id)}`;
  if (id.startsWith('SALE-') || id.startsWith('PAY-'))
    return `/siklus?tab=sales&sale=${encodeURIComponent(id)}`;
  if (id.startsWith('INS-')) return `/hama?case=${id}`;
  if (id.startsWith('RUN-')) return `/otomasi?tab=executions&run=${id}`;
  if (id.startsWith('RTN-')) return `/otomasi?tab=routines&routine=${id}`;
  if (id.startsWith('PLN-')) return `/pengendalian?plan=${id}`;
  if (id.startsWith('EXP-')) return '/biaya?tab=expenses';
  if (id.startsWith('MNT-') || id.startsWith('DEV-')) return '/perangkat?tab=maintenance';
  return `/perangkat?device=${id}`;
}
