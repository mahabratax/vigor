import React from 'react';
import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { createFixture } from '../src/data/fixtures';
import type { PageContext } from '../src/app/context';
import { SensorCard } from '../src/components/monitoring';
import { Overview } from '../src/features/overview/Overview';
import { Greenhouse } from '../src/features/greenhouse/Greenhouse';
import { Pests } from '../src/features/pests/Pests';
import { Control } from '../src/features/control/Control';
import { Automation } from '../src/features/automation/Automation';
import Devices, { DeviceDetails } from '../src/features/devices/Devices';
import HistoryPage from '../src/features/history/History';
import Costs, { ExpenseDetails } from '../src/features/costs/Costs';

function context(mobile = false, query = ''): PageContext {
  return {
    s: createFixture(),
    mobile,
    query: new URLSearchParams(query),
    nav: () => {},
    open: () => {},
    act: () => ({ ok: true, message: '' }),
  };
}
const destinations: [string, (ctx: PageContext) => React.ReactElement][] = [
  ['Overview', (c) => React.createElement(Overview, c)],
  ['Greenhouse', (c) => React.createElement(Greenhouse, c)],
  ['Pests & inspections', (c) => React.createElement(Pests, c)],
  ['Pest management', (c) => React.createElement(Control, c)],
  ['Otomasi', (c) => React.createElement(Automation, c)],
  ['Devices', (c) => React.createElement(Devices, { ctx: c })],
  ['Riwayat', (c) => React.createElement(HistoryPage, { ctx: c })],
  ['Costs', (c) => React.createElement(Costs, { ctx: c })],
];
// Native React render coverage only. This does NOT measure browser layout or WebGL.
describe.each([false, true])('Native React page rendering, mobile=%s', (mobile) => {
  it.each(destinations)('%s renders its actual component', (_name, render) => {
    const html = renderToString(render(context(mobile, 'view=2d')));
    expect(html.length).toBeGreaterThan(500);
    expect(html).not.toContain('[object Object]');
  });
});
it('native device and expense details refer to the same pump and period', () => {
  const ctx = context(false, 'period=2026-09&detailTab=cost');
  const device = renderToString(React.createElement(DeviceDetails, { ctx, id: 'PUMP-01' }));
  expect(device).toContain('85,500');
  expect(device).toContain('EXP-003');
  expect(device).toContain('EXP-005');
  const expense = renderToString(React.createElement(ExpenseDetails, { ctx, id: 'EXP-005' }));
  expect(expense).toContain('PUMP-01');
  expect(expense).toContain('45,000');
});
it('2D fallback exposes all six keyboard-operable zones', () => {
  const html = renderToString(React.createElement(Greenhouse, context(true, 'view=2d')));
  expect(html.match(/class="map-zone"/g)).toHaveLength(6);
  expect(html.match(/<button type="button" class="map-zone"/g)).toHaveLength(6);
});

it('humidity is not presented as a valid reading when its sensor is uncalibrated or unavailable', () => {
  const s = createFixture();
  const uncalibrated = renderToString(
    React.createElement(SensorCard, { s, id: 'TH-F-01', humidity: true }),
  );
  expect(uncalibrated).toContain('Not calibrated');
  expect(uncalibrated).not.toContain('% RH');
  s.scenario = 'insufficient';
  const unavailable = renderToString(
    React.createElement(SensorCard, { s, id: 'TH-B-01', humidity: true }),
  );
  expect(unavailable).not.toContain('% RH');
  expect(unavailable).toContain('Check the sensor connection and calibration.');
});
