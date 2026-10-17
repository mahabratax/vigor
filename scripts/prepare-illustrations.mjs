// Delivery encoding only. Original generated PNGs remain unchanged in design-assets.
import sharp from 'sharp';
import { mkdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
const scenes = ['greenhouse', 'irrigation', 'inspection', 'harvest', 'resources'];
await mkdir('public/illustrations', { recursive: true });
for (const name of scenes) {
  const source = join('design-assets/illustrations', `${name}.png`);
  const original = await readFile(source);
  const meta = await sharp(original).metadata();
  if (!meta.hasAlpha) throw new Error(`Missing transparent background: ${name}`);
  await sharp(original)
    .resize({ width: 480, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 100 })
    .toFile(`public/illustrations/${name}.webp`);
  if (name === 'greenhouse')
    await sharp(original)
      .resize({ width: 1280, withoutEnlargement: true })
      .webp({ quality: 88, alphaQuality: 100 })
      .toFile('public/illustrations/greenhouse-large.webp');
  console.log(name, meta.width, meta.height);
}
