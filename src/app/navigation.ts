import type { ModalSpec } from './context';
import { validZoneId } from '../domain/zones';
const tabOptions: Record<string, string[]> = {
  '/greenhouse': ['monitoring', 'operations', 'zones', 'energy', 'manage'],
  '/siklus': ['care', 'harvest', 'sales'],
  '/hama': ['cases', 'detection'],
  '/settings': ['profile', 'appearance', 'notifications', 'storage', 'ai'],
  '/akses': ['members', 'permissions'],
  '/perangkat': ['inventory', 'cameras', 'maintenance', 'supplies'],
  '/otomasi': ['schedule', 'routines', 'executions', 'nutrition', 'builder', 'preview'],
  '/biaya': ['summary', 'expenses', 'savings', 'energy', 'profit', 'efficiency'],
  '/pengendalian': ['plans', 'simulator', 'evaluation'],
  '/riwayat': ['timeline', 'report'],
};
export function normalizeQuery(path: string, search: string) {
  const q = new URLSearchParams(search),
    tabs = tabOptions[path];
  if (tabs && q.has('tab') && !tabs.includes(q.get('tab')!)) q.set('tab', tabs[0]);
  if (path === '/siklus') {
    const selected = [
      ['sale', 'sales'],
      ['lot', 'harvest'],
      ['task', 'care'],
    ].find(([key]) => q.has(key));
    if (selected) q.set('tab', selected[1]);
  }
  if (path === '/hama') {
    if (q.has('case') && q.get('tab') === 'detection') q.set('tab', 'cases');
    if (q.has('reviewZone') && !validZoneId(q.get('reviewZone')!)) q.delete('reviewZone');
  }
  if (
    path === '/perangkat' &&
    q.has('detailTab') &&
    !['condition', 'usage', 'cost'].includes(q.get('detailTab')!)
  )
    q.set('detailTab', 'cost');
  if (path === '/greenhouse') {
    if (q.get('tab') === 'manage') q.delete('zone');
    if (q.has('panel') && !['plants', 'targets', 'devices', 'activity'].includes(q.get('panel')!))
      q.set('panel', 'plants');
    if (q.has('layer') && !['coverage', 'temperature', 'pests'].includes(q.get('layer')!))
      q.set('layer', 'coverage');
    if (q.has('view') && !['2d', '3d'].includes(q.get('view')!)) q.set('view', '2d');
    if (q.has('zone') && !validZoneId(q.get('zone')!)) q.delete('zone');
  }
  return q.toString();
}
// Entity links must expose the same information on mobile as the desktop inspector.
export function detailForLocation(path: string, search: string, mobile: boolean): ModalSpec | null {
  const q = new URLSearchParams(search),
    tab = q.get('tab');
  if (path === '/biaya' && tab === 'expenses' && q.get('expense'))
    return { kind: 'expense-detail', id: q.get('expense')! };
  if (!mobile) return null;
  const rule =
    path === '/perangkat' && (!tab || tab === 'inventory')
      ? ['device', 'device-detail']
      : path === '/greenhouse' && (!tab || tab === 'monitoring')
        ? ['zone', 'zone-detail']
        : path === '/hama' && tab !== 'detection'
          ? ['case', 'case-detail']
          : path === '/riwayat' && (!tab || tab === 'timeline')
            ? ['event', 'event']
            : path === '/otomasi' && tab === 'routines'
              ? ['routine', 'routine']
              : null;
  return rule && q.get(rule[0]) ? { kind: rule[1], id: q.get(rule[0])! } : null;
}
export function boundedPage(value: string | null, count: number, size = 10) {
  const parsed = Number(value ?? 1);
  return Math.min(
    Math.max(1, Math.ceil(count / size)),
    Number.isFinite(parsed) ? Math.max(1, Math.floor(parsed)) : 1,
  );
}
