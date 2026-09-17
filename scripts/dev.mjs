/**
 * Dev server with hot reload.
 *
 * The pages load assets/css/*.min.css and assets/js/*.min.js, so editing a
 * source file has to run through the minifier before the browser sees it.
 * Each watcher therefore rebuilds the single changed file, then tells
 * browser-sync what to do:
 *
 *   *.css   -> rebuild .min.css, then stream it (style injection, no reload)
 *   *.js    -> rebuild .min.js, then full reload
 *   *.html  -> full reload
 *   images  -> convert to webp, then full reload
 *
 * Serves on port 5500 by default; PORT env var overrides it. browser-sync's
 * own control-panel UI is pinned to PORT + 1 rather than its default 3001, so
 * the dev server never squats on an unrelated port.
 */
import path from 'node:path';
import chokidar from 'chokidar';
import browserSyncModule from 'browser-sync';
import { minifyCss } from './minify-css.mjs';
import { minifyJs } from './minify-js.mjs';
import { imagesToWebp } from './images-to-webp.mjs';
import { ROOT, color, info, fail, rel } from './lib/util.mjs';

const PORT = Number(process.env.PORT || 5500);
const UI_PORT = Number(process.env.UI_PORT || PORT + 1);
const bs = browserSyncModule.create();

const CSS_DIR = path.join(ROOT, 'assets', 'css');
const JS_DIR = path.join(ROOT, 'assets', 'js');
const IMG_DIR = path.join(ROOT, 'assets', 'images');

const WATCH_OPTS = { ignoreInitial: true, awaitWriteFinish: { stabilityThreshold: 150 } };

/** Serialise rebuilds so two rapid saves cannot interleave writes. */
let queue = Promise.resolve();
const enqueue = (fn) => (queue = queue.then(fn).catch((err) => fail(err.message)));

bs.init(
  {
    server: { baseDir: ROOT },
    port: PORT,
    ui: { port: UI_PORT },
    open: false,
    notify: false,
    ghostMode: false,
    logLevel: 'info',
    logPrefix: 'houndstooth',
    // .html pages are hand-authored; serve them without caching so edits show up
    middleware: [
      (req, res, next) => {
        if (req.url && req.url.endsWith('.html')) res.setHeader('Cache-Control', 'no-store');
        next();
      },
    ],
  },
  () => {
    console.log(color('green', `\nServing ${ROOT}`));
    console.log(color('cyan', `  http://127.0.0.1:${PORT}/`));
    info(`browser-sync ui on http://127.0.0.1:${UI_PORT}/`);
    info('watching css, js, html and images - saves rebuild and reload automatically');
  },
);

// ── stylesheets: rebuild the .min.css the pages load, then inject ────────────
chokidar
  .watch(path.join(CSS_DIR, '*.css'), WATCH_OPTS)
  .on('all', (event, file) => {
    if (file.endsWith('.min.css')) return; // our own output
    enqueue(async () => {
      info(`css changed: ${rel(file)}`);
      const { outputs } = await minifyCss({ only: file });
      // hand browser-sync the generated artifact: given a .css path it injects
      // the new styles in place instead of reloading the page
      if (outputs.length) bs.reload(outputs.map((f) => path.relative(ROOT, f)));
      else bs.reload();
    });
  });

// ── scripts: rebuild the .min.js, then reload ───────────────────────────────
chokidar.watch(path.join(JS_DIR, '*.js'), WATCH_OPTS).on('all', (event, file) => {
  if (file.endsWith('.min.js')) return;
  enqueue(async () => {
    info(`js changed: ${rel(file)}`);
    await minifyJs({ only: file });
    bs.reload();
  });
});

// ── pages ───────────────────────────────────────────────────────────────────
chokidar
  .watch([path.join(ROOT, '*.html'), path.join(ROOT, '*', '*.html')], WATCH_OPTS)
  .on('all', (event, file) => {
    info(`html changed: ${rel(file)}`);
    bs.reload();
  });

// ── images: generate the webp sibling, then reload ──────────────────────────
chokidar
  .watch(path.join(IMG_DIR, '**', '*.{png,jpg,jpeg}'), {
    ...WATCH_OPTS,
    ignored: (p) => p.split(path.sep).includes('webp'),
  })
  .on('all', (event, file) => {
    if (event === 'unlink') return;
    enqueue(async () => {
      info(`image changed: ${rel(file)}`);
      await imagesToWebp({ only: file });
      bs.reload();
    });
  });

const shutdown = () => {
  console.log(color('dim', '\nstopping dev server'));
  bs.exit();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
