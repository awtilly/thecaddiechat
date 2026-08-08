#!/usr/bin/env node

/**
 * URL Validation Script for The Caddie Chat
 *
 * Checks the dist/ directory after build, in both directions:
 *   1. Every expected URL exists as a directory containing index.html
 *   2. No unexpected page URLs appear in dist/ (catches accidental
 *      renames/additions -- update EXPECTED_URLS deliberately instead)
 * Also verifies the 404 page and CNAME made it into the build.
 *
 * The expected list mirrors the "Key URLs" section in CLAUDE.md --
 * keep the two in sync when pages are added.
 *
 * Usage: node scripts/validate-urls.mjs
 * Exit 0: dist/ matches the expected URL set
 * Exit 1: mismatches listed
 */

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const DIST_DIR = join(process.cwd(), 'dist');

const EXPECTED_URLS = [
  '/',
  '/chronicles/',
  '/chronicles/viktor-hovland/',
  '/chronicles/tyrrell-hatton/',
  '/chronicles/matt-fitzpatrick/',
  '/chronicles/beauty-or-burden/',
  '/chronicles/uphill-challenge/',
  '/chronicles/nicklaus-20-majors-design-empire/',
  '/courses/',
  '/courses/golden-age-golf/',
  '/courses/stonewall/',
  '/courses/francis-a-byrne/',
  '/courses/mountain-ridge/',
  '/courses/essex-county/',
  '/courses/north-jersey/',
  '/courses/hollywood/',
  '/courses/winged-foot/',
  '/courses/friars-head/',
  '/camera-roll/',
  '/field-notes/',
  '/tarmac/', // noindex + excluded from sitemap, but the page must still build
];

// Extra files that must exist in dist/ (not directory-style pages)
const EXPECTED_FILES = ['404.html', 'CNAME', 'robots.txt', 'sitemap-index.xml'];

// dist/ directories that are assets, not pages
const NON_PAGE_DIRS = new Set(['_astro', 'data', 'tools']);

/** Collect every URL in dist/ that renders as a page (has an index.html). */
function collectActualUrls(dir, prefix = '/') {
  const urls = [];
  if (existsSync(join(dir, 'index.html'))) urls.push(prefix);
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (prefix === '/' && NON_PAGE_DIRS.has(entry.name)) continue;
    urls.push(...collectActualUrls(join(dir, entry.name), `${prefix}${entry.name}/`));
  }
  return urls;
}

if (!existsSync(DIST_DIR)) {
  console.error('ERROR: dist/ directory not found. Run `npm run build` first.');
  process.exit(1);
}

console.log(`Validating ${EXPECTED_URLS.length} URLs in dist/...\n`);

const actual = new Set(collectActualUrls(DIST_DIR));
const expected = new Set(EXPECTED_URLS);

const missing = EXPECTED_URLS.filter((u) => !actual.has(u));
const unexpected = [...actual].filter((u) => !expected.has(u)).sort();
const missingFiles = EXPECTED_FILES.filter((f) => !existsSync(join(DIST_DIR, f)));

for (const url of EXPECTED_URLS) {
  console.log(`  ${actual.has(url) ? 'FOUND  ' : 'MISSING'}  ${url}`);
}

console.log(`\n${EXPECTED_URLS.length - missing.length}/${EXPECTED_URLS.length} expected URLs found.`);

let failed = false;

if (missing.length > 0) {
  failed = true;
  console.error(`\nERROR: ${missing.length} expected URL(s) missing from dist/:`);
  for (const url of missing) console.error(`  - ${url}`);
}

if (unexpected.length > 0) {
  failed = true;
  console.error(`\nERROR: ${unexpected.length} unexpected page URL(s) in dist/ (add to EXPECTED_URLS + CLAUDE.md if intentional):`);
  for (const url of unexpected) console.error(`  - ${url}`);
}

if (missingFiles.length > 0) {
  failed = true;
  console.error(`\nERROR: expected file(s) missing from dist/: ${missingFiles.join(', ')}`);
}

if (failed) {
  process.exit(1);
}

console.log('All URLs validated successfully.');
process.exit(0);
