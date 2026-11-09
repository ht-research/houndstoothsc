# Houndstooth site

A hand-authored static site: `index.html` plus one folder per case study
(`houndstooth-*/index.html`), with shared assets in `assets/`. There is no
framework and no bundler — the folder you see is the site that ships.

## Commands

```bash
npm install     # once
npm start       # dev server with hot reload on http://127.0.0.1:5500
npm run build   # convert images to webp + minify css/js, in place
```

`PORT=3000 npm start` serves on a different port. browser-sync's control panel
runs on `PORT + 1` (5501 by default); `UI_PORT` overrides it.

## How the build works

Everything is written **in place**, next to its source, because that is what the
pages already reference (`main.css` -> `main.min.css`, which is the file the
HTML loads). Nothing generates HTML and there is no `dist/` — the repo root
stays directly servable.

| step | input | output |
| --- | --- | --- |
| images | `assets/images/<project>/<name>.png` | `assets/images/<project>/webp/<name>.webp` |
| css | `assets/css/<name>.css` | `assets/css/<name>.min.css` |
| js | `assets/js/<name>.js` | `assets/js/<name>.min.js` |

Run a single step with `npm run build:img`, `build:css` or `build:js`.

Only sources that **already have a `.min` sibling** are rebuilt, so the set of
committed artifacts stays as it is. Add `-- --all` to create a `.min` file for a
new source. Vendor libraries (`gsap.min.js`, `flickity.min.js`, …) exist only as
`.min.js` with no source, so they are never touched.

### Flags

```bash
npm run build -- --all                        # also create missing .min files
npm run build:img -- --force                  # re-encode every image
npm run build:img -- --force --quality=90     # ...at a specific webp quality
```

Image conversion is incremental: a `.webp` is only re-encoded when its source is
newer. The committed webp files were originally encoded near-lossless, so a
`--force` pass at the default quality (82) shrinks them substantially — that is a
visual call, which is why it never happens automatically.

## Hot reload

`npm start` watches sources and does the right thing per file type:

- **css** — rebuilds the `.min.css` and injects it, no page reload
- **js** — rebuilds the `.min.js`, then reloads
- **html** — reloads
- **png/jpg** — writes the `webp` sibling, then reloads

## Notes for editors

- Edit the **unminified** source (`main.css`, `casestudy.js`); the `.min` files
  are generated. Editing a `.min` file directly will be overwritten by the next
  build.
- `assets/js/main.js` declares a top-level `smoother` that `casestudy.js` reads
  from the shared script scope. The JS minifier is configured never to mangle or
  drop top-level names — keep it that way.
- `assets/css/template-casestudy.css` uses native CSS nesting. The CSS step
  (lightningcss) flattens it for older browsers; a legacy minifier would
  silently drop the nested rule.
