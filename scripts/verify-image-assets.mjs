import { readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import assert from 'node:assert/strict';

// Validate actual production bytes, not just source paths or HTTP 200. WebP
// returned as octet-stream can fail in embedded previews despite being present.
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const expected = new Map();
const bundleDirectory = process.argv[2] ?? 'dist/client';
for (const [directory, count] of [
  ['assets', 5],
  ['illustrations', 6],
  ['farm-objects', 10],
]) {
  const files = (await readdir(join('public', directory))).filter((file) => file.endsWith('.webp'));
  assert.equal(files.length, count, `Verify every ${directory} image.`);
  for (const file of files) {
    const bytes = await readFile(join('public', directory, file));
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    expected.set(hash(bytes), `${directory}/${file}`);
  }
}
const found = new Map();
for (const file of await readdir(bundleDirectory, { recursive: true })) {
  if (!file.endsWith('.js')) continue;
  const code = await readFile(join(bundleDirectory, file), 'utf8');
  for (const match of code.matchAll(/data:image\/webp;base64,([A-Za-z0-9+/=]+)/g)) {
    const digest = hash(Buffer.from(match[1], 'base64'));
    if (expected.has(digest)) found.set(expected.get(digest), file);
  }
}
for (const file of expected.values())
  assert(found.has(file), `Original image must be embedded with image/webp MIME: ${file}`);
assert.equal(
  expected.size,
  21,
  'Verify five existing assets, six illustration sizes, and ten farm objects.',
);
console.log(
  JSON.stringify({
    images: [...found.keys()],
    chunks: [...new Set(found.values())],
    bundleDirectory,
    result:
      'All original image bytes preserved as image/webp data URLs; no relative URL or image fetch required.',
  }),
);
