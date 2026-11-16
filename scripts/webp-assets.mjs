import { readFile, writeFile, mkdir, readdir, stat, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = path.join(root, 'apps/game-client/public');
const configPath = path.join(root, 'assets/webp-assets.json');
const args = process.argv.slice(2);
const option = (name) => args[args.indexOf(name) + 1];
function inside(base, relative) {
  const resolved = path.resolve(base, relative);
  if (!resolved.startsWith(base + path.sep)) throw new Error(`Path outside ${base}: ${relative}`);
  return resolved;
}
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : path.join(dir, e.name)))).flat();
}
const config = JSON.parse(await readFile(configPath, 'utf8'));
if (args.includes('--check')) {
  const bad = (await walk(publicRoot)).filter(file => /\.(png|jpe?g|gif|bmp|tiff?)$/i.test(file));
  if (bad.length) throw new Error(`Runtime raster assets must be WebP. Keep masters in assets/source and run assets:add:\n${bad.join('\n')}`);
  for (const asset of config.assets) await stat(inside(publicRoot, asset.output));
  const sourceFiles = (await walk(path.join(root, 'apps/game-client/src'))).filter(file => /\.(ts|css|html)$/.test(file));
  for (const file of sourceFiles) {
    if (/\/art\/[^\s"'<>`]*\.(png|jpe?g|gif)\b/i.test(await readFile(file, 'utf8'))) {
      throw new Error(`Legacy raster reference in ${file}`);
    }
  }
  console.log('Asset check passed: runtime rasters are WebP and configured outputs exist.');
  process.exit(0);
}
let added;
if (args.includes('--input')) {
  const input = path.resolve(option('--input'));
  const output = option('--output');
  if (!args.includes('--output') || !output?.endsWith('.webp')) throw new Error('--output art/name.webp is required');
  inside(publicRoot, output);
  if (config.assets.some(a => a.output === output)) throw new Error('Output already registered; edit its existing manifest entry and run assets:build.');
  const ext = path.extname(input).toLowerCase();
  if (!['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) throw new Error('Use a static PNG, JPEG or WebP source. Animated assets need an explicit atlas workflow.');
  const source = `assets/source/runtime/${output.replace(/\.webp$/, ext)}`;
  const destination = inside(path.join(root, 'assets/source'), source.slice('assets/source/'.length));
  await mkdir(path.dirname(destination), { recursive: true });
  if (input !== destination) await copyFile(input, destination, 1);
  added = { source, output, quality: args.includes('--quality') ? Number(option('--quality')) : 0.88 };
  if (args.includes('--width')) added.width = Number(option('--width'));
  config.assets.push(added);
}
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge', headless: true });
const report = [];
try {
  const page = await browser.newPage();
  for (const asset of added ? [added] : config.assets) {
    if (!(asset.quality > 0 && asset.quality <= 1)) throw new Error(`Invalid quality: ${asset.output}`);
    if (asset.width !== undefined && (!Number.isInteger(asset.width) || asset.width < 1)) throw new Error('Width must be a positive integer');
    const sources = asset.frames || [asset.source];
    const images = await Promise.all(sources.map(async source => {
      const file = inside(path.join(root, 'assets/source'), source.slice('assets/source/'.length));
      if (!source.startsWith('assets/source/')) throw new Error('Sources must be retained in assets/source');
      const bytes = await readFile(file);
      const mime = /\.webp$/i.test(source) ? 'image/webp' : /\.jpe?g$/i.test(source) ? 'image/jpeg' : 'image/png';
      return `data:${mime};base64,${bytes.toString('base64')}`;
    }));
    const result = await page.evaluate(async ({ asset, images }) => {
      const decoded = await Promise.all(images.map(async src => { const image = new Image(); image.src = src; await image.decode(); return image; }));
      const canvas = document.createElement('canvas');
      const columns = asset.columns || 1;
      const sourceWidth = decoded[0].naturalWidth * columns;
      canvas.width = Math.min(asset.width || sourceWidth, sourceWidth);
      canvas.height = Math.round(decoded[0].naturalHeight * Math.ceil(decoded.length / columns) * canvas.width / sourceWidth);
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      const cellWidth = canvas.width / columns;
      const cellHeight = decoded[0].naturalHeight * cellWidth / decoded[0].naturalWidth;
      decoded.forEach((image, i) => ctx.drawImage(image, i % columns * cellWidth, Math.floor(i / columns) * cellHeight, cellWidth, cellHeight));
      const data = canvas.toDataURL('image/webp', asset.quality);
      if (!data.startsWith('data:image/webp;base64,')) throw new Error('Browser does not support WebP encoding');
      const check = new Image(); check.src = data; await check.decode();
      if (check.naturalWidth !== canvas.width || check.naturalHeight !== canvas.height) throw new Error('Encoded dimensions differ');
      return { data: data.split(',')[1], width: canvas.width, height: canvas.height };
    }, { asset, images });
    const output = inside(publicRoot, asset.output);
    await mkdir(path.dirname(output), { recursive: true });
    const bytes = Buffer.from(result.data, 'base64');
    await writeFile(output, bytes);
    report.push({ output: asset.output, width: result.width, height: result.height, bytes: bytes.length, rgbaBytes: result.width * result.height * 4 });
  }
  if (added) await writeFile(configPath, JSON.stringify(config, null, 2) + '\n');
  console.table(report);
} finally {
  await browser.close();
}
