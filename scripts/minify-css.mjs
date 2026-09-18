/**
 * Regenerates assets/css/<name>.min.css from assets/css/<name>.css
 *
 * Only files that already have a .min.css sibling are rebuilt, so the set of
 * committed artifacts stays exactly as it is today. Pass --all to also create
 * .min.css for a new source file.
 *
 * lightningcss is used rather than a legacy minifier because these stylesheets
 * contain native CSS nesting (template-casestudy.css nests `img` inside
 * .casestudy_logo_inspirations_image_4). Older minifiers parse that as a syntax
 * error and silently drop the nested rule. The browser targets below are
 * deliberately conservative so nesting is flattened into plain selectors,
 * which also widens browser support versus shipping the nested source.
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { transform } from 'lightningcss';
import { ROOT, task, info, warn, fail, sizeOf, savings, hasFlag,
  isCli,
} from './lib/util.mjs';

const CSS_DIR = path.join(ROOT, 'assets', 'css');

// lightningcss encodes versions as major << 16
const v = (major) => major << 16;
const TARGETS = {
  safari: v(15),
  chrome: v(100),
  firefox: v(100),
  edge: v(100),
};

export async function minifyCss({ all = false, only = null } = {}) {
  const t = task('minify css');
  const entries = (await readdir(CSS_DIR)).filter(
    (f) => f.endsWith('.css') && !f.endsWith('.min.css'),
  );
  const targets = only ? entries.filter((f) => f === path.basename(only)) : entries;

  let failed = 0;
  let built = 0,
    skipped = 0,
    before = 0,
    after = 0;
  const outputs = [];

  for (const name of targets) {
    const src = path.join(CSS_DIR, name);
    const out = path.join(CSS_DIR, `${name.slice(0, -4)}.min.css`);
    const outExists = (await sizeOf(out)) > 0;

    if (!outExists && !all) {
      skipped++;
      info(`skip ${name} (no .min.css sibling; use --all to create one)`);
      continue;
    }

    const source = await readFile(src);
    let result;
    try {
      result = transform({
        filename: name,
        code: source,
        minify: true,
        targets: TARGETS,
        errorRecovery: false,
      });
    } catch (err) {
      failed++;
      fail(`${name}: ${String(err.message).split('\n')[0]}`);
      continue;
    }
    for (const w of result.warnings || []) warn(`${name}: ${w.message ?? w}`);

    await writeFile(out, result.code);
    before += source.byteLength;
    after += result.code.byteLength;
    built++;
    outputs.push(out);
    info(`${name} -> ${path.basename(out)}  ${savings(source.byteLength, result.code.byteLength)}`);
  }

  if (skipped) warn(`${skipped} source(s) skipped`);
  t.done(`${built} file(s), ${savings(before, after)}`);
  return { built, skipped, outputs, failed };
}

if (isCli(import.meta.url)) {
  const { failed } = await minifyCss({ all: hasFlag('all') });
  if (failed) process.exitCode = 1;
}
