import { tables, relations, column } from '../db/model';
import { type Rows, type Row } from '../db/codec';
import { workspaceColumns, workspaceKeys } from './workspace-codec';
export interface Statement {
  bind(...values: unknown[]): Statement;
  all<T = Row>(): Promise<{ results: T[] }>;
  first<T = Row>(): Promise<T | null>;
  run(): Promise<unknown>;
}
export interface Database {
  prepare(sql: string): Statement;
  batch(statements: Statement[]): Promise<{ results?: Row[] }[]>;
}
export const columns: Record<string, string[]> = {
  ...Object.fromEntries(
    tables.map(({ entity: e, parent, mode }) => [
      e.table,
      [
        'gh',
        'record_key',
        'ordinal',
        ...(parent ? ['parent_key'] : []),
        ...(mode === 'map' ? ['map_key'] : []),
        ...e.fields.map((f) => column(f.name)),
        ...relations
          .filter((r) => r.table === e.table && r.legacy)
          .map((r) => column(r.field) + '_resolved'),
      ],
    ]),
  ),
  ...workspaceColumns,
};
const keys: Record<string, string[]> = {
  ...Object.fromEntries(tables.map((t) => [t.entity.table, ['gh', 'record_key']])),
  ...workspaceKeys,
};
export async function readDatabase(db: Database) {
  // A transaction gives a consistent snapshot without a large compound SELECT.
  const names = Object.keys(columns);
  const result = await db.batch([
    ...names.map((t) =>
      db.prepare(`SELECT ${columns[t].map((c) => `"${c}"`).join(',')} FROM "${t}"`),
    ),
    db.prepare('SELECT coalesce(max(revision),0) AS revision FROM workspace_commits'),
  ]);
  const rows: Rows = Object.fromEntries(names.map((t, i) => [t, result[i].results ?? []]));
  return { rows, revision: Number(result[names.length].results?.[0]?.revision ?? 0) };
}
const key = (table: string, row: Row) => JSON.stringify(keys[table].map((k) => row[k]));
const equal = (table: string, a: Row, b: Row) =>
  columns[table].every((k) => (a[k] ?? null) === (b[k] ?? null));
export function changes(db: Database, before: Rows, after: Rows): Statement[] {
  const result: Statement[] = [];
  for (const table of Object.keys(columns).reverse()) {
    const next = new Set((after[table] ?? []).map((r) => key(table, r)));
    const removed = (before[table] ?? []).filter((r) => !next.has(key(table, r)));
    for (let i = 0; i < removed.length; i += Math.floor(96 / keys[table].length)) {
      const part = removed.slice(i, i + Math.floor(96 / keys[table].length));
      result.push(
        db
          .prepare(
            `DELETE FROM "${table}" WHERE ${part.map(() => `(${keys[table].map((k) => `"${k}"=?`).join(' AND ')})`).join(' OR ')}`,
          )
          .bind(...part.flatMap((r) => keys[table].map((k) => r[k]))),
      );
    }
  }
  for (const [table, cols] of Object.entries(columns)) {
    const prior = new Map((before[table] ?? []).map((r) => [key(table, r), r]));
    const updated = (after[table] ?? []).filter(
      (r) => !prior.has(key(table, r)) || !equal(table, prior.get(key(table, r))!, r),
    );
    const size = Math.max(1, Math.floor(96 / cols.length));
    for (let i = 0; i < updated.length; i += size) {
      const part = updated.slice(i, i + size);
      result.push(
        db
          .prepare(
            `INSERT INTO "${table}" (${cols.map((c) => `"${c}"`).join(',')}) VALUES ${part.map(() => `(${cols.map(() => '?').join(',')})`).join(',')} ON CONFLICT (${keys[table].map((k) => `"${k}"`).join(',')}) DO UPDATE SET ${
              cols
                .filter((c) => !keys[table].includes(c))
                .map((c) => `"${c}"=excluded."${c}"`)
                .join(',') || `"${cols[0]}"=excluded."${cols[0]}"`
            }`,
          )
          .bind(...part.flatMap((r) => cols.map((c) => r[c] ?? null))),
      );
    }
  }
  return result;
}
export class Conflict extends Error {
  status = 409;
  constructor() {
    super('Data changed in another tab or device. Latest records loaded; review and save again.');
  }
}
export async function commit(
  db: Database,
  revision: number,
  requestId: string,
  bodyHash: string,
  actor: string,
  operation: string,
  before: Rows,
  after: Rows,
  resultId?: string,
) {
  try {
    await db.batch([
      db.prepare('PRAGMA defer_foreign_keys = ON'),
      db
        .prepare(
          'INSERT INTO workspace_commits (revision,request_id,body_hash,actor,operation,result_id,at) VALUES (?,?,?,?,?,?,?)',
        )
        .bind(
          revision + 1,
          requestId,
          bodyHash,
          actor,
          operation,
          resultId ?? null,
          new Date().toISOString(),
        ),
      ...changes(db, before, after),
    ]);
  } catch (error) {
    const latest = await db
      .prepare('SELECT max(revision) AS revision FROM workspace_commits')
      .first<{ revision: number }>();
    if ((latest?.revision ?? 0) > revision) throw new Conflict();
    throw error;
  }
}
