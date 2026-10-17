import type { Database as SqlDatabase, SqlJsStatic, BindParams } from 'sql.js';
import type { Database, Statement } from '../../server/repository';
import type { Row } from '../../db/codec';
export const APPLICATION_ID = 0x56494752;
export class BrowserSqlite implements Database {
  constructor(public sql: SqlDatabase) {
    sql.run('PRAGMA foreign_keys=ON');
  }
  prepare(query: string): Statement {
    let values: BindParams = [];
    const read = () => {
      const statement = this.sql.prepare(query);
      try {
        statement.bind(values);
        const results: Row[] = [];
        while (statement.step()) results.push(statement.getAsObject() as Row);
        return { results };
      } finally {
        statement.free();
      }
    };
    const wrapped = {
      bind: (...input: unknown[]) => {
        values = input as BindParams;
        return wrapped;
      },
      all: async () => read(),
      first: async () => read().results[0] ?? null,
      run: async () => read(),
    };
    return wrapped as Statement;
  }
  async batch(statements: Statement[]) {
    this.sql.run('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.all());
      this.sql.run('COMMIT');
      return results;
    } catch (e) {
      this.sql.run('ROLLBACK');
      throw e;
    }
  }
}
export function openSqlite(SQL: SqlJsStatic, migrations: string[], bytes?: Uint8Array) {
  const sql = new SQL.Database(bytes);
  try {
    const scalar = (query: string) => Number(sql.exec(query)[0]?.values[0]?.[0] ?? 0);
    if (bytes && scalar('PRAGMA application_id') !== APPLICATION_ID)
      throw new Error('This is not a Vigor SQLite backup. Choose a .sqlite file from Backup.');
    const version = scalar('PRAGMA user_version');
    if (version > migrations.length)
      throw new Error(
        'This backup was created by a newer Vigor version. Update the application before restoring.',
      );
    sql.run('PRAGMA foreign_keys=ON');
    sql.run('BEGIN');
    try {
      for (const migration of migrations.slice(version)) sql.run(migration);
      sql.run(`PRAGMA user_version=${migrations.length}; PRAGMA application_id=${APPLICATION_ID}`);
      sql.run('COMMIT');
    } catch (e) {
      sql.run('ROLLBACK');
      throw e;
    }
    return new BrowserSqlite(sql);
  } catch (e) {
    sql.close();
    throw e;
  }
}
