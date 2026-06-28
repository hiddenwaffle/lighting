// Build script for the "lighting" game.
//
// Replaces the original gulp + browserify + tsify toolchain (which no longer
// installs on modern Node) with esbuild. Behaviour mirrors the old gulpfile:
//   - copy everything in src/static/** into the output dir
//   - bundle src/scripts/main.ts (TypeScript) into <outdir>/bundle.js
//   - optionally watch sources and serve over HTTP
//
// Usage:
//   node scripts/build.mjs                    one-off build into dist/
//   node scripts/build.mjs --serve --watch    dev server with live rebuilds
//   node scripts/build.mjs --deploy           build into docs/ (the GitHub Pages dir)
//
// GitHub Pages serves the committed docs/ directory, so `--deploy` builds there;
// commit docs/ to publish. Without --deploy everything targets gitignored dist/.
//
// The vendored libraries (three.js, Tween.js, howler.js, OBJ/MTL loaders) live
// in src/static and are loaded via <script> tags, so they are copied verbatim
// and are NOT part of the bundle.

import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, rmSync, watch as fsWatch } from 'fs';

const watch = process.argv.includes('--watch');
const serve = process.argv.includes('--serve');
const deploy = process.argv.includes('--deploy');
const OUTDIR = deploy ? 'docs' : 'dist';
const PORT = 8080;

// Copy vendored libs / assets / index.html into OUTDIR. Skip macOS .DS_Store junk.
// `clean` wipes OUTDIR first (initial build); without it we just overwrite, so a
// static re-copy during `--watch` does not clobber the freshly built bundle.js.
function copyStatic({ clean = false } = {}) {
  if (clean) {
    rmSync(OUTDIR, { recursive: true, force: true });
    mkdirSync(OUTDIR, { recursive: true });
  }
  cpSync('src/static', OUTDIR, { recursive: true, filter: (src) => !src.endsWith('.DS_Store') });
}

copyStatic({ clean: true });

const ctx = await esbuild.context({
  entryPoints: ['src/scripts/main.ts'],
  bundle: true,
  outfile: `${OUTDIR}/bundle.js`,
  target: 'es2015',
  sourcemap: !deploy, // external map for dev/dist; keep the published docs/ build lean
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
    const { port } = await ctx.serve({ servedir: OUTDIR, port: PORT });
    console.log(`Serving http://localhost:${port} (Ctrl+C to stop)`);
  }
} else {
  await ctx.rebuild();
  await ctx.dispose();
  console.log(`Build complete -> ${OUTDIR}/`);
}
