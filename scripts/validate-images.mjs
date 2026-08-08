/**
 * validate-images.mjs
 *
 * Build output validation for FNDN-03 (images) and FNDN-04 (fonts).
 * Runs against the dist/ directory after `npm run build`.
 *
 * Checks:
 *   FNDN-03a  Responsive srcset present in HTML output
 *   FNDN-03b  WebP or AVIF formats generated in _astro/
 *   FNDN-03c  No hardcoded /assets/images paths in HTML
 *   FNDN-03d  No external Unsplash URLs in HTML
 *   FNDN-04a  No Google Fonts import in HTML or CSS
 *   FNDN-04b  Self-hosted .woff2 font files in _astro/
 *
 * Exit code 0 = all checks pass, 1 = at least one failure.
 */

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = join(process.cwd(), 'dist');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Recursively collect all files under `dir` matching an extension filter.
 * @param {string} dir
 * @param {string[]} extensions  e.g. ['.html', '.css']
 * @returns {string[]}
 */
function collectFiles(dir, extensions = []) {
  const results = [];
  if (!existsSync(dir)) return results;

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, extensions));
    } else if (extensions.length === 0 || extensions.includes(extname(entry.name).toLowerCase())) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Count files under `dir` that match any of the given extensions.
 */
function countFilesByExt(dir, extensions) {
  return collectFiles(dir, extensions).length;
}

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

let failures = 0;

function pass(id, message) {
  console.log(`  PASS  ${id}: ${message}`);
}

function fail(id, message) {
  console.log(`  FAIL  ${id}: ${message}`);
  failures++;
}

function info(message) {
  console.log(`        ${message}`);
}

// Guard: dist/ must exist
if (!existsSync(DIST)) {
  console.error('ERROR: dist/ directory not found. Run `npm run build` first.');
  process.exit(1);
}

console.log('Image & Font Validation (FNDN-03 / FNDN-04)\n');

// Collect HTML and CSS files once.
// dist/tools/ is the standalone Task Command app (copied from public/tools/);
// it legitimately loads Google Fonts + Firebase CDNs and is not part of the
// Astro-built site, so it is excluded from these checks.
const TOOLS_DIR = join(DIST, 'tools');
const notTools = (f) => !f.startsWith(TOOLS_DIR);
const htmlFiles = collectFiles(DIST, ['.html']).filter(notTools);
const cssFiles = collectFiles(DIST, ['.css']).filter(notTools);
const astroDir = join(DIST, '_astro');

// --- FNDN-03a: Responsive srcset present ---
{
  let srcsetCount = 0;
  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('srcset=')) srcsetCount++;
  }
  if (srcsetCount > 0) {
    pass('FNDN-03a', `Responsive srcset found in ${srcsetCount} HTML file(s)`);
  } else {
    fail('FNDN-03a', 'No HTML files contain srcset= attributes');
  }
}

// --- FNDN-03b: WebP or AVIF formats generated ---
{
  const modernCount = countFilesByExt(astroDir, ['.webp', '.avif']);
  if (modernCount > 0) {
    pass('FNDN-03b', `${modernCount} WebP/AVIF image(s) found in dist/_astro/`);
  } else {
    fail('FNDN-03b', 'No WebP or AVIF images found in dist/_astro/');
  }
}

// --- FNDN-03c: No hardcoded /assets/images paths ---
{
  let hardcodedFiles = [];
  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('src="/assets/images')) {
      hardcodedFiles.push(file.replace(DIST, 'dist'));
    }
  }
  if (hardcodedFiles.length === 0) {
    pass('FNDN-03c', 'No hardcoded /assets/images paths found');
  } else {
    fail('FNDN-03c', `${hardcodedFiles.length} file(s) contain hardcoded /assets/images paths`);
    for (const f of hardcodedFiles) info(`  -> ${f}`);
  }
}

// --- FNDN-03d: No external Unsplash URLs ---
{
  let unsplashFiles = [];
  for (const file of htmlFiles) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('unsplash.com')) {
      unsplashFiles.push(file.replace(DIST, 'dist'));
    }
  }
  if (unsplashFiles.length === 0) {
    pass('FNDN-03d', 'No external Unsplash URLs found');
  } else {
    fail('FNDN-03d', `${unsplashFiles.length} file(s) contain unsplash.com references`);
    for (const f of unsplashFiles) info(`  -> ${f}`);
  }
}

// --- FNDN-04a: No Google Fonts import ---
{
  const allTextFiles = [...htmlFiles, ...cssFiles];
  let googleFontsFiles = [];
  for (const file of allTextFiles) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('fonts.googleapis.com')) {
      googleFontsFiles.push(file.replace(DIST, 'dist'));
    }
  }
  if (googleFontsFiles.length === 0) {
    pass('FNDN-04a', 'No Google Fonts imports found');
  } else {
    fail('FNDN-04a', `${googleFontsFiles.length} file(s) still reference fonts.googleapis.com`);
    for (const f of googleFontsFiles) info(`  -> ${f}`);
  }
}

// --- FNDN-04b: Self-hosted font files ---
{
  const woff2Count = countFilesByExt(astroDir, ['.woff2']);
  if (woff2Count > 0) {
    pass('FNDN-04b', `${woff2Count} self-hosted .woff2 font file(s) found`);
  } else {
    fail('FNDN-04b', 'No .woff2 font files found in dist/_astro/');
  }
}

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------

console.log('');
if (failures === 0) {
  console.log('All checks passed.');
  process.exit(0);
} else {
  console.log(`${failures} check(s) failed.`);
  process.exit(1);
}
