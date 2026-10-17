import { displayLabel } from '../i18n/display';
import type { DomainState, RunStatus, Scenario } from './types';
export const TIME_ZONE = 'Asia/Jakarta';
export const START = Date.parse('2026-10-13T09:42:00+07:00') / 1000;
export const money = (value: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
    .format(value)
    .replace(/\u00a0/g, ' ');
export const number = (value: number, digits = 0) =>
  new Intl.NumberFormat('en-GB', { maximumFractionDigits: digits }).format(value);
export const clockTime = (value: number | string, seconds = false) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    ...(seconds ? { second: '2-digit' as const } : {}),
  })
    .format(new Date(typeof value === 'number' ? value * 1000 : value))
    .replaceAll('.', ':');
export const dateLabel = (value: number | string, full = false) =>
  new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    day: 'numeric',
    month: full ? 'long' : 'short',
    year: 'numeric',
  }).format(new Date(typeof value === 'number' ? value * 1000 : value));
export const iso = (seconds: number) => new Date(seconds * 1000).toISOString();
export function localDate(seconds: number): string {
  return new Date((seconds + 7 * 3600) * 1000).toISOString().slice(0, 10);
}
export function localTime(seconds: number): string {
  return new Date((seconds + 7 * 3600) * 1000).toISOString().slice(11, 16);
}
export const monthLabel = (period: string) => {
  if (period === '3months') return 'Last 3 months';
  if (period === 'custom') return 'Custom range';
  if (!/^(?:19|[2-9]\d)\d{2}-(?:0[1-9]|1[0-2])$/.test(period)) return 'Unknown period';
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TIME_ZONE,
    month: 'long',
    year: 'numeric',
  }).format(new Date(period + '-01T00:00:00+07:00'));
};
export const duration = (seconds: number) =>
  `${Math.floor(Math.max(0, seconds) / 60)
    .toString()
    .padStart(2, '0')}:${Math.floor(Math.max(0, seconds) % 60)
    .toString()
    .padStart(2, '0')}`;
export const periodOf = (date: string) => date.slice(0, 7);
export const isActiveRun = (status: RunStatus) =>
  ['Checking', 'Queued', 'Running', 'Verifying'].includes(status);
export const runLabels: Record<RunStatus, string> = {
  Scheduled: 'Awaiting approval',
  Checking: 'Checking',
  Queued: 'Queued',
  Running: 'Running',
  Verifying: 'Verifying',
  Completed: 'Completed',
  Skipped: 'Skipped',
  Blocked: 'Blocked',
  Failed: 'Failed',
  Stopped: 'Stopped',
  'Needs reconciliation': 'State review needed',
};
export const scenarioLabels: Record<Scenario, string> = {
  normal: 'Normal operations',
  increasing: 'Rising trap captures',
  device_offline: 'Pump offline',
  sensor_stale: 'Flow sensor data expired',
  command_failed: 'Acknowledgment failed',
  insufficient: 'Insufficient data',
  wet_media: 'Zone B media already wet',
  low_tank: 'Low tank level',
  no_flow: 'No flow detected',
  flow_stuck: 'Flow did not stop',
  lost_connection: 'Connection lost during execution',
  interrupted: 'Simulation session interrupted',
};
export function nextId(
  prefix: string,
  rows: {
    id: string;
  }[],
) {
  const values = rows.map((r) => Number(r.id.match(/(\d+)$/)?.[1] ?? 0));
  return prefix + '-' + String(Math.max(0, ...values) + 1).padStart(3, '0');
}
export function activity(
  s: DomainState,
  type: DomainState['events'][number]['type'],
  title: string,
  detail: string,
  objectId: string,
  zoneId?: DomainState['zones'][number]['id'],
  actor = 'Budi Santoso',
) {
  s.events.unshift({
    id: nextId('EVT', s.events),
    at: iso(s.clock),
    type,
    title,
    detail,
    actor,
    objectId,
    zoneId,
  });
  s.events = s.events.slice(0, 500);
}
export function safeCsvCell(value: unknown): string {
  let s = String(displayLabel(value) ?? '');
  if (/^\s*[=+\-@]/.test(s) || /^[\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replaceAll('"', '""') + '"';
}
export const makeCsv = (headers: string[], rows: unknown[][]) =>
  '\uFEFF' + [headers, ...rows].map((row) => row.map(safeCsvCell).join(',')).join('\r\n');
export function downloadCsv(filename: string, headers: string[], rows: unknown[][]) {
  const url = URL.createObjectURL(
    new Blob([makeCsv(headers, rows)], { type: 'text/csv;charset=utf-8;' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export const num = number;
export const csv = (rows: unknown[][]) =>
  '\uFEFF' + rows.map((row) => row.map(safeCsvCell).join(',')).join('\r\n');
export function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
