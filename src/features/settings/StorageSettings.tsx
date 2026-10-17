import { displayLabel } from '../../i18n/display';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Field } from '../../components/ui';
import { exportSqlite, inspectBackup, restoreBackup, storageInfo } from '../../store/persistence';
type Backup = Awaited<ReturnType<typeof inspectBackup>>;
export function StorageSettings({ onRestored }: { onRestored?: () => void }) {
  const [info, setInfo] = useState<Awaited<ReturnType<typeof storageInfo>>>();
  const [backup, setBackup] = useState<Backup>();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [message, setMessage] = useState('');
  const [persistent, setPersistent] = useState<boolean | null>(null);
  const refresh = async () => {
    setInfo(await storageInfo());
    setPersistent((await navigator.storage?.persisted?.()) ?? false);
  };
  useEffect(() => {
    void refresh().catch((e) => setError(e.message));
  }, []);
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await action();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Storage unavailable.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="settings-grid">
      <Card
        title={'Data in this browser'}
        subtitle={'SQLite stores greenhouses, transactions, and settings on this device.'}
      >
        <dl className="settings-facts">
          <div>
            <dt>Location</dt>
            <dd>This browser</dd>
          </div>
          <div>
            <dt>Database size</dt>
            <dd>
              {displayLabel(info ? `${(info.bytes / 1024 / 1024).toFixed(2)} MB` : 'Checking…')}
            </dd>
          </div>
          <div>
            <dt>Last saved</dt>
            <dd>
              {displayLabel(
                info?.savedAt
                  ? new Date(info.savedAt).toLocaleString('en-GB', { timeZone: 'Asia/Jakarta' }) +
                      ' WIB'
                  : 'Not saved yet',
              )}
            </dd>
          </div>
        </dl>
        <p>
          Records remain available after a reload. Other browsers and devices have separate data.
          Download a backup before switching devices or clearing site data.
        </p>
        <div className="form-footer">
          <Button
            disabled={busy || !info?.bytes}
            tone="primary"
            onClick={() =>
              run(async () => {
                await exportSqlite();
                setMessage('SQLite backup downloaded. Keep it in a safe place.');
              })
            }
          >
            Download backup
          </Button>
          {persistent !== true && (
            <Button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const granted = await navigator.storage?.persist?.();
                  setPersistent(!!granted);
                  setMessage(
                    granted
                      ? 'Persistent storage enabled.'
                      : 'The browser has not granted persistent storage. Continue downloading backups regularly.',
                  );
                })
              }
            >
              Protect storage
            </Button>
          )}
        </div>
        {persistent && (
          <p className="micro muted">
            Persistent storage is enabled. Manually clearing site data still deletes the database.
          </p>
        )}
        {displayLabel(
          message && (
            <p role="status" className="settings-saved">
              {message}
            </p>
          ),
        )}
        {displayLabel(
          error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          ),
        )}
      </Card>
      <Card title={'Restore backup'} subtitle={'Select a .sqlite backup downloaded from Vigor.'}>
        <div className="form-stack">
          <Field label={'Backup file'}>
            <input
              type="file"
              accept=".sqlite,.db,application/vnd.sqlite3"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                setBackup(undefined);
                if (file) void run(async () => setBackup(await inspectBackup(file)));
              }}
            />
          </Field>
          {backup && (
            <Alert title={'Review before restoring'}>
              <p>
                {displayLabel(backup.filename)}: {backup.greenhouseCount} greenhouses, profile{' '}
                {displayLabel(backup.ownerName)}.
              </p>
              <p>
                This will replace the current workspace. A pre-restore copy is saved automatically.
              </p>
              <div className="form-footer">
                <Button disabled={busy} onClick={() => setBackup(undefined)}>
                  Cancel
                </Button>
                <Button
                  disabled={busy}
                  tone="primary"
                  onClick={() =>
                    run(async () => {
                      await restoreBackup(backup.bytes, backup.generation);
                      setBackup(undefined);
                      setMessage('Backup restored. Workspace updated.');
                      onRestored?.();
                    })
                  }
                >
                  Restore this backup
                </Button>
              </div>
            </Alert>
          )}
          {info?.hasPrevious && (
            <Button
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await exportSqlite(true);
                  setMessage('Pre-restore copy downloaded.');
                })
              }
            >
              Download pre-restore copy
            </Button>
          )}
          <p className="micro muted">
            File integrity, relationships, and balances are checked before replacing data. No
            records are sent to a server.
          </p>
        </div>
      </Card>
    </div>
  );
}
