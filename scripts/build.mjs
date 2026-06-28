// Build script for the "lighting" game.
//
// Replaces the original gulp + browserify + tsify toolchain (which no longer
// installs on modern Node) with esbuild. Behaviour mirrors the old gulpfile:
//   - copy everything in src/static/** into dist/
//   - bundle src/scripts/main.ts (TypeScript) into dist/bundle.js
//   - optionally watch sources and serve dist/ over HTTP
//
// Usage:
//   node scripts/build.mjs            one-off production-ish build
//   node scripts/build.mjs --serve --watch   dev server with live rebuilds
//
// The vendored libraries (three.js, Tween.js, howler.js, OBJ/MTL loaders) live
// in src/static and are loaded via <script> tags, so they are copied verbatim
// and are NOT part of the bundle.

import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync, watch as fsWatch } from 'fs';

const watch = process.argv.includes('--watch');
const serve = process.argv.includes('--serve');
const PORT = 8080;

// Copy vendored libs / assets / index.html into dist. Skip macOS .DS_Store junk.
// `clean` wipes dist first (initial build); without it we just overwrite, so a
// static re-copy during `--watch` does not clobber the freshly built bundle.js.
function copyStatic({ clean = false } = {}) {
  if (clean) {
    rmSync('dist', { recursive: true, force: true });
    mkdirSync('dist', { recursive: true });
  }
  cpSync('src/static', 'dist', { recursive: true, filter: (src) => !src.endsWith('.DS_Store') });
}

copyStatic({ clean: true });

const ctx = await esbuild.context({
  entryPoints: ['src/scripts/main.ts'],
  bundle: true,
  outfile: 'dist/bundle.js',
  target: 'es2015',
  sourcemap: true,
  logLevel: 'info',
});

if (watch || serve) {
  await ctx.rebuild();
  if (watch) {
    await ctx.watch();
    console.log('Watching src/scripts for changes...');
    // esbuild only watches the TS graph, so watch src/static separately and
    // re-copy (overwrite, no clean) when vendored libs / assets / html change.
    fsWatch('src/static', { recursive: true }, () => {
      try { copyStatic(); } catch (e) { console.error('static re-copy failed:', e.message); }
    });
    console.log('Watching src/static for changes...');
  }
  if (serve) {
    const { port } = await ctx.serve({ servedir: 'dist', port: PORT });
    console.log(`Serving http://localhost:${port} (Ctrl+C to stop)`);
  }
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log('Build complete -> dist/');
}
