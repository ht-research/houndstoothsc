import { readdir, stat, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Directories never touched by any task. */
export const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'scripts', '.vscode', '.claude']);

const C = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

export const color = (name, s) => `${C[name] || ''}${s}${C.reset}`;
export const rel = (p) => path.relative(ROOT, p) || '.';

export function task(name) {
  const started = process.hrtime.bigint();
  console.log(color('cyan', `\n> ${name}`));
  return {
    done(summary) {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      console.log(color('green', `  done`) + color('dim', ` - ${summary} (${ms.toFixed(0)}ms)`));
    },
  };
}

export const info = (s) => console.log(color('dim', `  ${s}`));
export const warn = (s) => console.log(color('yellow', `  ! ${s}`));
export const fail = (s) => console.error(color('red', `  x ${s}`));

/** Recursively list files under dir, skipping SKIP_DIRS and any dir named in skipNames. */
export async function walk(dir, { skipNames = new Set() } = {}) {
  const out = [];
  async function recurse(current) {
    let entries;
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIRS.has(entry.name) || skipNames.has(entry.name)) continue;
        await recurse(full);
      } else if (entry.isFile() && entry.name !== '.DS_Store') {
        out.push(full);
      }
    }
  }
  await recurse(dir);
  return out.sort();
}

export async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

export async function mtime(file) {
  try {
    return (await stat(file)).mtimeMs;
  } catch {
    return -1;
  }
}

export async function sizeOf(file) {
  try {
    return (await stat(file)).size;
  } catch {
    return 0;
  }
}

export function kb(bytes) {
  return `${(bytes / 1024).toFixed(1)}kB`;
}

/** "12.3kB -> 4.1kB (-67%)" */
export function savings(before, after) {
  const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  return `${kb(before)} -> ${kb(after)} (${pct >= 0 ? '-' : '+'}${Math.abs(pct)}%)`;
}

export const hasFlag = (name) => process.argv.includes(`--${name}`);

/**
 * True when this module is the script node was asked to run.
 * Compared via pathToFileURL because a raw `file://` + path template does not
 * percent-encode, so any space or non-ASCII character in the project path makes
 * the comparison silently false and turns the task into a no-op.
 */
export function isCli(moduleUrl) {
  if (!process.argv[1]) return false;
  return moduleUrl === pathToFileURL(process.argv[1]).href;
}
