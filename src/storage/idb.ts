export interface StoredFile {
  bytes: Uint8Array;
  generation: number;
  savedAt: string;
}
export class StorageConflict extends Error {
  status = 409;
  constructor() {
    super(
      'Data changed in another tab. The latest records have been loaded; review and save again.',
    );
  }
}
export interface FileStore {
  read(key?: string): Promise<StoredFile | undefined>;
  save(bytes: Uint8Array, generation: number, keepPrevious?: boolean): Promise<StoredFile>;
}
/** IndexedDB's readwrite transaction is the cross-tab compare-and-swap boundary. */
export class IndexedDbFiles implements FileStore {
  constructor(
    private factory: IDBFactory,
    private name = 'vigor-sqlite-v1',
  ) {}
  private open(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = this.factory.open(this.name, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('files');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error('Browser storage unavailable.'));
      request.onblocked = () => reject(new Error('Close other Vigor tabs, then try again.'));
    });
  }
  async read(key = 'workspace'): Promise<StoredFile | undefined> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const request = tx.objectStore('files').get(key);
      tx.oncomplete = () => {
        db.close();
        resolve(request.result);
      };
      tx.onabort = tx.onerror = () => {
        db.close();
        reject(tx.error ?? new Error('Could not read browser data.'));
      };
    });
  }
  async save(bytes: Uint8Array, generation: number, keepPrevious = false): Promise<StoredFile> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      const files = tx.objectStore('files');
      const request = files.get('workspace');
      const saved = { bytes, generation: generation + 1, savedAt: new Date().toISOString() };
      let conflict = false;
      request.onsuccess = () => {
        const current: StoredFile | undefined = request.result;
        if ((current?.generation ?? 0) !== generation) {
          conflict = true;
          tx.abort();
          return;
        }
        if (keepPrevious && current) files.put(current, 'before-restore');
        files.put(saved, 'workspace');
      };
      tx.oncomplete = () => {
        db.close();
        resolve(saved);
      };
      tx.onabort = () => {
        db.close();
        reject(
          conflict
            ? new StorageConflict()
            : new Error(
                'Changes were not saved. Check storage space and site permissions, then try again. Previous records are intact.',
              ),
        );
      };
    });
  }
}
