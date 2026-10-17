// Delivery encoding only. Keep the generated originals for future design work.
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
const assets = JSON.parse(await readFile('docs/design/farm-object-prompts.json', 'utf8'));
await mkdir('public/farm-objects', { recursive: true });
for (const { name, source, delivery } of assets) {
  const original = await readFile(source);
  const meta = await sharp(original).metadata();
  if (!meta.hasAlpha) throw new Error(`Missing transparency: ${name}`);
  await sharp(original)
    .resize({ width: 320, height: 320, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 100 })
    .toFile(delivery);
  console.log(name, meta.width, meta.height);
}
