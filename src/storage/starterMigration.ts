import { decodeGreenhouses, encodeGreenhouses } from '../../db/codec';
import { commit, readDatabase, type Database } from '../../server/repository';
import { addStarterRecords, STARTER_RECORDS_VERSION } from '../data/starterRecords';

/** One journaled update for databases already initialized before starter v1.
 * The caller persists the whole SQLite file with IndexedDB compare-and-swap. */
export async function migrateStarterRecords(db: Database, actor: string): Promise<boolean> {
  const marked = await db
    .prepare('SELECT 1 FROM workspace_commits WHERE operation IN (?,?,?) LIMIT 1')
    .bind(
      STARTER_RECORDS_VERSION,
      `initial_seed:${STARTER_RECORDS_VERSION}`,
      `import_browser:${STARTER_RECORDS_VERSION}`,
    )
    .first();
  if (marked) return false;
  const { rows, revision } = await readDatabase(db);
  if (!rows.workspace_meta.length) return false;
  const bank = decodeGreenhouses(rows);
  const updated = addStarterRecords(bank);
  await commit(
    db,
    revision,
    '7478d74b-0a0a-41b5-a0dd-c36844834f7a',
    STARTER_RECORDS_VERSION,
    actor,
    STARTER_RECORDS_VERSION,
    rows,
    updated.length ? { ...rows, ...encodeGreenhouses(bank) } : rows,
  );
  return true;
}
