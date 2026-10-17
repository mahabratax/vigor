import { displayLabel } from '../i18n/display';
import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { number } from '../domain/format';
import { Button, Empty } from './ui';
const finite = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);
export const SERIES_COLORS: Record<string, string> = {
  A: 'var(--chart-a, #427e4e)',
  B: 'var(--chart-b, #bc7527)',
  C: 'var(--chart-c, #357e88)',
  D: 'var(--chart-d, #77758d)',
  E: 'var(--chart-e, #647c5d)',
  F: 'var(--chart-f, #9a775d)',
  actual: 'var(--chart-actual, #244735)',
  baseline: 'var(--chart-baseline, #b9c8ae)',
};
const seriesColor = (key: string) =>
  SERIES_COLORS[key] ??
  Object.values(SERIES_COLORS)[Array.from(key).reduce((n, c) => n + c.charCodeAt(0), 0) % 6];
export function isPortable() {
  return (
    typeof window !== 'undefined' &&
    Boolean(
      (
        window as Window & {
          __VIGOR_PORTABLE__?: boolean;
        }
      ).__VIGOR_PORTABLE__,
    )
  );
}
export function Sparkline({
  points,
  tone = 'green',
  height = 38,
}: {
  points: (number | null)[];
  tone?: string;
  height?: number;
}) {
  const valid = points.filter(finite);
  if (!valid.length) return <span className="muted">No data available yet</span>;
  const min = Math.min(...valid) - 1,
    max = Math.max(...valid) + 1;
  const coords = points.map((n, i) =>
    !finite(n)
      ? null
      : `${points.length === 1 ? 100 : (i * 200) / (points.length - 1)},${height - 4 - ((n - min) / (max - min)) * (height - 8)}`,
  );
  const segments: string[] = [];
  let current: string[] = [];
  for (const p of coords) {
    if (p === null) {
      if (current.length) segments.push(current.join(' '));
      current = [];
    } else current.push(p);
  }
  if (current.length) segments.push(current.join(' '));
  return (
    <svg
      className={`sparkline ${tone}`}
      viewBox={`0 0 200 ${height}`}
      preserveAspectRatio="none"
      role="img"
      aria-label={`Recorded trend: ${valid.map((n) => number(n, 1)).join(', ')}`}
    >
      {segments.map((p, i) =>
        p.includes(' ') ? (
          <polyline
            key={i}
            points={p}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <circle key={i} cx={p.split(',')[0]} cy={p.split(',')[1]} r="2.5" fill="currentColor" />
        ),
      )}
    </svg>
  );
}
export class TrendChart extends React.Component<
  {
    data: Record<string, string | number | null>[];
    keys?: string[];
    height?: number;
  },
  {
    hidden: string[];
  }
> {
  state = { hidden: [] as string[] };
  private renderLegend(keys: string[]) {
    return (
      <div className="chart-legend" role="group" aria-label={'Chart zones'}>
        {keys.map((key) => (
          <button
            key={key}
            aria-pressed={!this.state.hidden.includes(key)}
            onClick={() =>
              this.setState((state) => ({
                hidden: state.hidden.includes(key)
                  ? state.hidden.filter((value) => value !== key)
                  : [...state.hidden, key],
              }))
            }
          >
            <i style={{ background: seriesColor(key) }} />
            Zone {displayLabel(key)}
          </button>
        ))}
      </div>
    );
  }
  render() {
    const { height = 220 } = this.props,
      keys = this.props.keys ?? ['A', 'B', 'C', 'D'];
    const data = this.props.data.map((row) => ({
      ...row,
      ...Object.fromEntries(keys.map((key) => [key, finite(row[key]) ? row[key] : null])),
    }));
    const visible = keys.filter((k) => !this.state.hidden.includes(k));
    const allHidden = keys.length > 0 && !visible.length;
    if (allHidden || !data.some((row) => visible.some((key) => finite(row[key]))))
      return (
        <div className="trend-chart">
          <div style={{ minHeight: Math.max(120, height - 40) }}>
            <Empty
              title={allHidden ? 'All zones are hidden' : 'No observations for this selection'}
              detail={
                allHidden
                  ? 'Show a zone to compare its capture history.'
                  : 'Choose another zone or add an observation in Detection review. Missing readings are not zero captures.'
              }
              action={
                allHidden ? (
                  <Button small onClick={() => this.setState({ hidden: [] })}>
                    Show all zones
                  </Button>
                ) : undefined
              }
            />
          </div>
          {this.renderLegend(keys)}
        </div>
      );
    if (!isPortable())
      return (
        <div className="chart-native">
          <div style={{ height: Math.max(120, height - 40) }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 10, left: -18, right: 14, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  unit=""
                  allowDecimals={false}
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v: unknown, name: unknown) => [
                    `${v} captures / 24 hours`,
                    `Zone ${name}`,
                  ]}
                />
                {keys.map((key) => (
                  <Line
                    key={key}
                    type="linear"
                    dataKey={key}
                    name={key}
                    hide={this.state.hidden.includes(key)}
                    stroke={seriesColor(key)}
                    strokeDasharray={key === 'C' ? '5 3' : key === 'D' ? '2 3' : undefined}
                    dot={{ r: 3 }}
                    strokeWidth={2}
                    connectNulls={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {this.renderLegend(keys)}
        </div>
      );
    const values = data.flatMap((d) => visible.map((k) => d[k]).filter(finite));
    const max = Math.max(30, Math.ceil(Math.max(0, ...values) / 10) * 10),
      W = 640,
      H = 205,
      L = 34,
      R = 18,
      T = 14,
      B = 32,
      x = (i: number) =>
        data.length === 1 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (data.length - 1),
      y = (v: number) => T + ((max - v) / max) * (H - T - B);
    return (
      <div className="trend-chart">
        <div className="chart-unit">New captures / 24 hours</div>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{ height: height - 28 }}
          role="img"
          aria-label={`New captures per 24 hours, zone ${visible.join(', ')}. Gaps indicate unavailable data.`}
        >
          {Array.from({ length: 4 }, (_, i) => (i * max) / 3).map((v) => (
            <g key={v}>
              <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e7ece4" strokeDasharray="3 4" />
              <text x={L - 12} y={y(v) + 4} textAnchor="end">
                {Math.round(v)}
              </text>
            </g>
          ))}
          {data.map((d, i) => (
            <text key={i} x={x(i)} y={H - 9} textAnchor="middle">
              {displayLabel(d.day)}
            </text>
          ))}
          {visible.map((key) => {
            const segments: string[] = [];
            let segment = '';
            data.forEach((d, i) => {
              const value = d[key];
              if (finite(value)) segment += (segment ? ' L' : 'M') + x(i) + ' ' + y(value);
              else {
                if (segment) segments.push(segment);
                segment = '';
              }
            });
            if (segment) segments.push(segment);
            return (
              <g key={key}>
                {segments.map((path, i) => (
                  <path
                    key={i}
                    d={path}
                    stroke={seriesColor(key)}
                    strokeDasharray={key === 'C' ? '5 3' : key === 'D' ? '2 3' : undefined}
                    strokeWidth="2.4"
                    fill="none"
                  />
                ))}
                {data.map((d, i) =>
                  finite(d[key]) ? (
                    <circle
                      key={i}
                      cx={x(i)}
                      cy={y(d[key] as number)}
                      r="3.8"
                      fill={seriesColor(key)}
                      stroke="white"
                      strokeWidth="1.3"
                    >
                      <title>{`Zone ${key}, ${d.day}: ${d[key]} new captures / 24 hours`}</title>
                    </circle>
                  ) : null,
                )}
              </g>
            );
          })}
        </svg>
        {this.renderLegend(keys)}
      </div>
    );
  }
}
export function CostBars({
  rows,
}: {
  rows: {
    label: string;
    before: number | null;
    after: number | null;
  }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.before ?? 0), ...rows.map((r) => r.after ?? 0));
  return (
    <div className="cost-bars">
      {rows.map((r) => (
        <div className="cost-bar-row" key={r.label}>
          <span>{displayLabel(r.label)}</span>
          <div>
            <div className="bar-baseline" style={{ width: `${((r.before ?? 0) / max) * 100}%` }}>
              <title>
                {displayLabel(r.before === null ? 'No baseline recorded' : number(r.before))}
              </title>
            </div>
            {r.after === null ? (
              <small>Unavailable</small>
            ) : (
              <div className="bar-actual" style={{ width: `${(r.after / max) * 100}%` }}>
                <title>{displayLabel(number(r.after))}</title>
              </div>
            )}
          </div>
          <b>{displayLabel(r.after === null ? '—' : number(r.after))}</b>
        </div>
      ))}
      <div className="chart-legend static">
        <span>
          <i style={{ background: '#c5d1b9' }} />
          Manual baseline
        </span>
        <span>
          <i style={{ background: '#244735' }} />
          Sample record
        </span>
      </div>
    </div>
  );
}
