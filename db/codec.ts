import { validateModules } from './validate';
import { greenhouseModel, tables, relations, column, type Entity } from './model';
import { initializeCultivation } from '../src/domain/zones';
import { production } from '../src/domain/production';
import { resources } from '../src/domain/efficiency';
import { supplyState } from '../src/domain/supplies';
import { targetState } from '../src/domain/cropTargets';
import { energyConfig, energyLoads } from '../src/domain/energy';
import { sensorValue } from '../src/domain/telemetry';
import type { DomainState } from '../src/domain/types';
export type Row = Record<string, string | number | null>;
export type Rows = Record<string, Row[]>;
export function materialize(input: DomainState): DomainState {
  validateModules(input);
  const s = structuredClone(input);
  initializeCultivation(s);
  s.production = production(s);
  s.resources = resources(s);
  s.supplies = supplyState(s);
  s.targets = targetState(s);
  s.energy = energyConfig(s);
  s.energy.loads = {
    ...s.energy.loads,
    ...Object.fromEntries(
      energyLoads(s).map((l) => [l.device.id, { hours: l.hours, start: l.start }]),
    ),
  };
  // Seed readings once. A registered device alone never manufactures telemetry.
  s.readings ??= s.devices.flatMap((d) =>
    d.capabilities
      .filter((c) => ['temperature', 'humidity', 'media', 'level', 'flow', 'ec', 'ph'].includes(c))
      .map((metric) => ({
        id: `${d.id}:${metric}`,
        deviceId: d.id,
        metric,
        value:
          metric === 'humidity'
            ? (s.zones.find((z) => z.id === d.zones[0])?.humidity ?? null)
            : sensorValue(s, d.id),
        unit:
          metric === 'temperature'
            ? '°C'
            : metric === 'ec'
              ? 'mS/cm'
              : metric === 'flow'
                ? 'L/min'
                : metric === 'ph'
                  ? 'pH'
                  : '%',
        capturedAt: d.lastSeen,
        provenance: 'initial_import',
      })),
  );
  s.playing = false;
  return s;
}
const recordKey = (parent: string, key: string) => parent + '/' + encodeURIComponent(key);
export function encodeGreenhouses(bank: Record<string, DomainState>): Rows {
  const rows: Rows = Object.fromEntries(tables.map((t) => [t.entity.table, []]));
  function write(
    e: Entity,
    value: any,
    gh: string,
    key: string,
    ordinal: number,
    parent?: string,
    mapKey?: string,
  ) {
    if (!value || typeof value !== 'object' || Array.isArray(value))
      throw new Error(`${e.table}: invalid data structure.`);
    const known = new Set([
      ...e.fields.map((f) => f.name),
      ...Object.keys(e.children),
      ...e.derived,
    ]);
    for (const k of Object.keys(value))
      if (!known.has(k))
        throw new Error(`${e.table}.${k}: unmapped field; import stopped to prevent data loss.`);
    const row: Row = {
      gh,
      record_key: key,
      ordinal,
      ...(parent === undefined ? {} : { parent_key: parent }),
      ...(mapKey === undefined ? {} : { map_key: mapKey }),
    };
    for (const f of e.fields) {
      const v =
        e.table === 'supply_items' && f.name === 'deviceId' && value[f.name] === ''
          ? null
          : value[f.name];
      if (v === undefined || v === null) {
        if (!f.optional && !f.nullable) throw new Error(`${e.table}.${f.name} is required.`);
        row[column(f.name)] = null;
        continue;
      }
      if (f.type === 'n' && (typeof v !== 'number' || !Number.isFinite(v)))
        throw new Error(`${e.table}.${f.name}: invalid number.`);
      if (f.type === 's' && (typeof v !== 'string' || v.length > 100000))
        throw new Error(`${e.table}.${f.name}: invalid text.`);
      if (f.type === 'b' && typeof v !== 'boolean')
        throw new Error(`${e.table}.${f.name}: invalid boolean.`);
      row[column(f.name)] = f.type === 'j' ? JSON.stringify(v) : f.type === 'b' ? Number(v) : v;
    }
    rows[e.table].push(row);
    for (const [prop, c] of Object.entries(e.children)) {
      const child = value[prop];
      if (child === undefined || child === null) continue;
      if (c.mode === 'one') write(c.entity, child, gh, recordKey(key, prop), 0, key);
      else if (c.mode === 'map') {
        if (typeof child !== 'object' || Array.isArray(child))
          throw new Error(`${c.entity.table}: expected a relationship list.`);
        Object.entries(child).forEach(([k, v], i) =>
          write(
            c.entity,
            c.scalar ? { value: v } : v,
            gh,
            recordKey(key, prop + ':' + k),
            i,
            key,
            k,
          ),
        );
      } else {
        if (!Array.isArray(child) || child.length > 20000)
          throw new Error(`${c.entity.table}: invalid or oversized list.`);
        child.forEach((v, i) =>
          write(
            c.entity,
            c.mode === 'values' ? { value: v } : v,
            gh,
            recordKey(key, prop + ':' + (c.mode === 'values' ? i : (v.id ?? v.period ?? i))),
            i,
            key,
          ),
        );
      }
    }
  }
  for (const [gh, s] of Object.entries(bank)) {
    if (gh !== s.greenhouse.id) throw new Error('Inconsistent greenhouse ID.');
    write(greenhouseModel, materialize(s), gh, gh, 0);
  }
  for (const r of relations.filter((r) => r.legacy))
    for (const row of rows[r.table])
      row[column(r.field) + '_resolved'] = rows[r.target].some(
        (t) => t.gh === row.gh && t.id === row[column(r.field)],
      )
        ? row[column(r.field)]
        : null;
  for (const relation of relations.filter((r) => !r.legacy)) {
    const valid = new Set(
      rows[relation.target].map((row) =>
        JSON.stringify([row.gh, row[relation.targetField ?? 'id']]),
      ),
    );
    for (const row of rows[relation.table]) {
      const value = row[column(relation.field)];
      if (value !== null && value !== undefined && !valid.has(JSON.stringify([row.gh, value])))
        throw new Error(
          `Reference ${relation.table}.${relation.field} not found in ${row.gh}. Records are unchanged.`,
        );
    }
  }
  return rows;
}
export function decodeGreenhouses(rows: Rows): Record<string, DomainState> {
  const children = new Map<string, Row[]>();
  for (const [table, list] of Object.entries(rows))
    for (const r of list) {
      const k = table + ':' + r.gh + ':' + r.parent_key;
      const a = children.get(k) ?? [];
      a.push(r);
      children.set(k, a);
    }
  function read(e: Entity, row: Row): any {
    const value: Record<string, any> = {};
    for (const f of e.fields) {
      const v = row[column(f.name)];
      if (v === null && f.optional) continue;
      value[f.name] =
        v === null ? null : f.type === 'j' ? JSON.parse(String(v)) : f.type === 'b' ? !!v : v;
    }
    for (const [prop, c] of Object.entries(e.children)) {
      const list = (children.get(c.entity.table + ':' + row.gh + ':' + row.record_key) ?? []).sort(
        (a, b) => Number(a.ordinal) - Number(b.ordinal),
      );
      if (c.mode === 'one') {
        if (list[0]) value[prop] = read(c.entity, list[0]);
        else if (c.nullable) value[prop] = null;
      } else if (c.mode === 'map')
        value[prop] = Object.fromEntries(
          list.map((r) => [r.map_key, c.scalar ? read(c.entity, r).value : read(c.entity, r)]),
        );
      else
        value[prop] = list.map((r) =>
          c.mode === 'values' ? read(c.entity, r).value : read(c.entity, r),
        );
    }
    return value;
  }
  return Object.fromEntries(
    (rows.greenhouse_state ?? []).map((r) => {
      const s = read(greenhouseModel, r) as DomainState;
      s.playing = false;
      s.speed = 1;
      s.scenario = 'normal';
      s.notification = null;
      s.storageWarning = null;
      for (const b of s.cultivation!.batches) {
        let balance = b.initialPlants;
        for (const m of s.cultivation!.movements.filter((m) => m.batchId === b.id)) {
          balance += m.kind === 'add' ? m.quantity : -m.quantity;
          m.balance = balance;
        }
        b.currentPlants = b.status === 'completed' ? 0 : balance;
      }
      for (const z of s.zones)
        z.plants = s
          .cultivation!.batches.filter((b) => b.zoneId === z.id && b.status === 'active')
          .reduce((n, b) => n + b.currentPlants, 0);
      s.cycle.plants = s.zones.reduce((n, z) => n + z.plants, 0);
      for (const e of s.expenses) {
        e.greenhouseId = s.greenhouse.id;
        if (!e.usageSlices?.length) delete e.usageSlices;
      }
      for (const item of s.supplies?.items ?? []) if (item.deviceId === null) item.deviceId = '';
      for (const b of s.budgets) b.greenhouseId = s.greenhouse.id;
      for (const m of s.maintenance)
        m.expenseId = s.expenses.find((e) => e.maintenanceId === m.id)?.id;
      return [r.gh, s];
    }),
  );
}
