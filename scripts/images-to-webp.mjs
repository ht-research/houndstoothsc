/**
 * Converts every raster image under assets/images/ into a WebP sibling,
 * following the layout this repo already uses:
 *
 *   assets/images/<project>/<name>.png  ->  assets/images/<project>/webp/<name>.webp
 *
 * Incremental by default: a source is only re-encoded when its .webp is
 * missing or older than the source. Pass --force to re-encode everything.
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import {
  ROOT,
  walk,
  task,
  info,
  warn,
  fail,
  ensureDir,
  mtime,
  savings,
  hasFlag,
  rel,
  isCli,
} from './lib/util.mjs';

const IMG_DIR = path.join(ROOT, 'assets', 'images');
const CONVERTIBLE = new Set(['.png', '.jpg', '.jpeg']);

/**
 * Files that must stay in their original format because something references
 * them by exact name and WebP would not be a valid substitute.
 */
const KEEP_ORIGINAL = [
  /^favicon-/i,
  /^apple-touch-icon/i,
  /^thumbnail_web/i, // og:image — crawlers want jpeg/png
];

/**
 * Encoder quality. The webp files committed to this repo were originally
 * encoded near-lossless, so re-encoding at this quality shrinks them by
 * 5-15x. That is a visual decision, so nothing is re-encoded unless the
 * source is newer or --force is passed. Override per run:
 *   npm run build:img -- --force --quality=90
 */
const QUALITY = (() => {
  const flag = process.argv.find((a) => a.startsWith('--quality='));
  const value = Number(flag ? flag.split('=')[1] : process.env.WEBP_QUALITY);
  return Number.isFinite(value) && value > 0 && value <= 100 ? value : 82;
})();

export async function imagesToWebp({ force = false, only = null } = {}) {
  const t = task(`images -> webp (q${QUALITY})`);

  // skip the webp/ output folders themselves so we never re-encode our own output
  const files = only
    ? [path.resolve(only)]
    : (await walk(IMG_DIR, { skipNames: new Set(['webp']) })).filter((f) =>
        CONVERTIBLE.has(path.extname(f).toLowerCase()),
      );

  let failed = 0;
  let converted = 0,
    fresh = 0,
    ignored = 0,
    before = 0,
    after = 0;

  for (const src of files) {
    const base = path.basename(src, path.extname(src));
    if (KEEP_ORIGINAL.some((re) => re.test(path.basename(src)))) {
      ignored++;
      continue;
    }

    const out = path.join(path.dirname(src), 'webp', `${base}.webp`);
    const [srcTime, outTime] = await Promise.all([mtime(src), mtime(out)]);
    if (!force && outTime >= srcTime && outTime !== -1) {
      fresh++;
      continue;
    }

    try {
      const input = await readFile(src);
      const encoded = await sharp(input).webp({ quality: QUALITY, effort: 5 }).toBuffer();
      await ensureDir(path.dirname(out));
      await writeFile(out, encoded);
      before += input.byteLength;
      after += encoded.byteLength;
      converted++;
      info(`${rel(src)} -> ${path.basename(out)}  ${savings(input.byteLength, encoded.byteLength)}`);
    } catch (err) {
      failed++;
      fail(`${rel(src)}: ${err.message}`);
    }
  }

  if (ignored) info(`${ignored} file(s) kept in original format (favicons, og:image)`);
  if (fresh) info(`${fresh} webp already up to date`);
  t.done(
    converted ? `${converted} converted, ${savings(before, after)}` : 'nothing to convert',
  );
  return { converted, fresh, ignored, failed };
}

if (isCli(import.meta.url)) {
  const { failed } = await imagesToWebp({ force: hasFlag('force') });
  if (failed) process.exitCode = 1;
}
