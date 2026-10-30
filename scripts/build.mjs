/**
 * Production build. Everything is written in place, so the repo root stays
 * exactly as it is today and remains directly servable — no dist/ copy, no
 * generated HTML.
 *
 *   1. every png/jpg -> webp sibling in that folder's webp/ subdirectory
 *   2. assets/css/*.css -> *.min.css   (the files the pages actually load)
 *   3. assets/js/*.js   -> *.min.js
 *
 * Flags: --force re-encodes every image, --all also creates .min files for
 * sources that do not have one yet.
 */
import { imagesToWebp } from './images-to-webp.mjs';
import { minifyCss } from './minify-css.mjs';
import { minifyJs } from './minify-js.mjs';
import { color, hasFlag } from './lib/util.mjs';

const started = Date.now();

const img = await imagesToWebp({ force: hasFlag('force') });
const css = await minifyCss({ all: hasFlag('all') });
const js = await minifyJs({ all: hasFlag('all') });

const failed = (img.failed || 0) + (css.failed || 0) + (js.failed || 0);
const summary =
  `${((Date.now() - started) / 1000).toFixed(1)}s` +
  color('dim', ` — ${img.converted} webp, ${css.built} css, ${js.built} js`);

if (failed) {
  // exit non-zero so CI cannot go green on a build that dropped files
  console.log(color('red', `\nBuild finished with ${failed} failure(s) in ${summary}`));
  process.exitCode = 1;
} else {
  console.log(color('green', `\nBuild finished in ${summary}`));
}
