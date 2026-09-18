/**
 * Regenerates assets/js/<name>.min.js from assets/js/<name>.js
 *
 * Only files that already have a .min.js sibling are rebuilt, so the set of
 * committed artifacts stays exactly as it is today. Pass --all to also create
 * .min.js for a new source file.
 *
 * Top-level names are never mangled or dropped: main.js declares `smoother`
 * at top level and casestudy.js reads it from the shared script scope, so
 * renaming or tree-shaking top-level bindings would break the site.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { minify } from 'terser';
import { ROOT, task, info, warn, fail, sizeOf, savings, hasFlag,
  isCli,
} from './lib/util.mjs';

const JS_DIR = path.join(ROOT, 'assets', 'js');

const TERSER_OPTIONS = {
  ecma: 2020,
  compress: {
    toplevel: false, // keep cross-file globals (smoother) alive
    drop_console: false,
    passes: 2,
  },
  mangle: {
    toplevel: false, // never rename cross-file globals
  },
  format: { comments: false },
  sourceMap: false,
};

export async function minifyJs({ all = false, only = null } = {}) {
  const t = task('minify js');
  const entries = (await readdir(JS_DIR)).filter((f) => f.endsWith('.js') && !f.endsWith('.min.js'));
  const targets = only ? entries.filter((f) => f === path.basename(only)) : entries;

  let failed = 0;
  let built = 0,
    skipped = 0,
    before = 0,
    after = 0;
  const outputs = [];

  for (const name of targets) {
    const src = path.join(JS_DIR, name);
    const out = path.join(JS_DIR, `${name.slice(0, -3)}.min.js`);
    const outExists = (await sizeOf(out)) > 0;

    if (!outExists && !all) {
      skipped++;
      info(`skip ${name} (no .min.js sibling; use --all to create one)`);
      continue;
    }

    const code = await readFile(src, 'utf8');
    const result = await minify(code, TERSER_OPTIONS);
    if (!result.code) {
      failed++;
      fail(`${name}: terser returned no output`);
      continue;
    }
    const sizeBefore = Buffer.byteLength(code);
    await writeFile(out, result.code);
    const sizeAfter = Buffer.byteLength(result.code);
    before += sizeBefore;
    after += sizeAfter;
    built++;
    outputs.push(out);
    info(`${name} -> ${path.basename(out)}  ${savings(sizeBefore, sizeAfter)}`);
  }

  if (skipped) warn(`${skipped} source(s) skipped`);
  t.done(`${built} file(s), ${savings(before, after)}`);
  return { built, skipped, outputs, failed };
}

if (isCli(import.meta.url)) {
  const { failed } = await minifyJs({ all: hasFlag('all') });
  if (failed) process.exitCode = 1;
}
