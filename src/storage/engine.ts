import type { SqlJsStatic } from 'sql.js';
import { getWorkspace, mutateWorkspace, type Principal } from '../../server/service';
import { readDatabase } from '../../server/repository';
import { decodeGreenhouses, encodeGreenhouses } from '../../db/codec';
import { workspaceDefaults } from '../store/workspace';
import { openSqlite, type BrowserSqlite } from './sqlite';
import { StorageConflict, type FileStore } from './idb';
import { migrateStarterRecords } from './starterMigration';
const LOCAL_OWNER = 'vigor-local-owner';
/** Local role controls guide workflows; they are not multi-user authentication. */
export class BrowserEngine {
  constructor(
    private SQL: SqlJsStatic,
    private migrations: string[],
    private files: FileStore,
  ) {}
  private async principal(db: BrowserSqlite, body?: any): Promise<Principal> {
    const owner = await db
      .prepare('SELECT name,email FROM members WHERE principal=? AND active=1 AND role=?')
      .bind(LOCAL_OWNER, 'Owner')
      .first<{ name: string; email: string }>();
    const source =
      owner ??
      body?.payload?.preferences?.members?.find((m: any) => m.active && m.role === 'Owner') ??
      workspaceDefaults().members[0];
    return { id: LOCAL_OWNER, name: source.name, email: source.email };
  }
  async request(body?: any, retryRead = true): Promise<any> {
    const stored = await this.files.read();
    const db = openSqlite(this.SQL, this.migrations, stored?.bytes);
    try {
      const principal = await this.principal(db, body);
      const migrated = !body && (await migrateStarterRecords(db, principal.id));
      const result = body
        ? await mutateWorkspace(db, principal, body)
        : await getWorkspace(db, principal);
      // Do not report success until IndexedDB has durably stored the SQLite file.
      // If this fails, discard the connection; reopening returns the prior file.
      if (body || migrated) await this.files.save(db.sql.export(), stored?.generation ?? 0);
      return result;
    } catch (error) {
      // Two newly opened tabs may attempt the same additive update. Re-read the
      // winner's file; stale writes still fail and are never replayed silently.
      if (!body && retryRead && error instanceof StorageConflict)
        return this.request(undefined, false);
      throw error;
    } finally {
      db.sql.close();
    }
  }
  async export(previous = false) {
    const stored = await this.files.read(previous ? 'before-restore' : 'workspace');
    if (!stored)
      throw new Error(previous ? 'No pre-restore copy is available.' : 'No saved data yet.');
    return stored.bytes;
  }
  async info() {
    const stored = await this.files.read(),
      previous = await this.files.read('before-restore');
    return {
      bytes: stored?.bytes.byteLength ?? 0,
      savedAt: stored?.savedAt ?? null,
      generation: stored?.generation ?? 0,
      hasPrevious: !!previous,
    };
  }
  private async validate(bytes: Uint8Array) {
    if (bytes.length > 50 * 1024 * 1024) throw new Error('Backup must be 50 MB or smaller.');
    if (new TextDecoder().decode(bytes.slice(0, 16)) !== 'SQLite format 3\0')
      throw new Error('This file is not a valid SQLite database.');
    const db = openSqlite(this.SQL, this.migrations, bytes);
    try {
      if (
        db.sql.exec('PRAGMA integrity_check')[0]?.values[0]?.[0] !== 'ok' ||
        db.sql.exec('PRAGMA foreign_key_check').length
      )
        throw new Error(
          'Backup records or relationships are invalid. Your current workspace is unchanged.',
        );
      const { rows } = await readDatabase(db);
      const owner = rows.members.find(
        (m) => m.principal === LOCAL_OWNER && m.active && m.role === 'Owner',
      );
      if (!owner || !rows.workspace_meta.length)
        throw new Error('The backup has no valid workspace and Owner.');
      const bank = decodeGreenhouses(rows);
      encodeGreenhouses(bank);
      return {
        bytes: db.sql.export(),
        greenhouseCount: Object.keys(bank).length,
        ownerName: String(owner.name),
      };
    } finally {
      db.sql.close();
    }
  }
  async inspect(bytes: Uint8Array) {
    const valid = await this.validate(bytes);
    return {
      greenhouseCount: valid.greenhouseCount,
      ownerName: valid.ownerName,
      generation: (await this.files.read())?.generation ?? 0,
    };
  }
  async restore(bytes: Uint8Array, generation: number) {
    const current = await this.files.read();
    if ((current?.generation ?? 0) !== generation) throw new StorageConflict();
    const valid = await this.validate(bytes);
    await this.files.save(valid.bytes, generation, true);
    return this.request();
  }
}
