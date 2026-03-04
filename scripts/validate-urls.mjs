#!/usr/bin/env node

/**
 * URL Validation Script for The Caddie Chat
 *
 * Checks the dist/ directory after build to verify all 19 expected URL paths
 * exist as directories containing index.html files.
 *
 * Usage: node scripts/validate-urls.mjs
 * Exit 0: All URLs found
 * Exit 1: Missing URLs listed
 */

import { existsSync } from 'node:fs';
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
];

console.log(`Validating ${EXPECTED_URLS.length} URLs in dist/...\n`);

const missing = [];
const found = [];

for (const url of EXPECTED_URLS) {
  // Convert URL path to file path: /chronicles/ -> dist/chronicles/index.html
  const urlPath = url === '/' ? '' : url.replace(/^\//, '').replace(/\/$/, '');
  const filePath = join(DIST_DIR, urlPath, 'index.html');

  if (existsSync(filePath)) {
    found.push(url);
    console.log(`  FOUND  ${url}`);
  } else {
    missing.push(url);
    console.log(`  MISSING  ${url}  (expected: ${filePath})`);
  }
}

console.log(`\n${found.length}/${EXPECTED_URLS.length} URLs found.`);

if (missing.length > 0) {
  console.error(`\nERROR: ${missing.length} URLs missing:`);
  for (const url of missing) {
    console.error(`  - ${url}`);
  }
  process.exit(1);
} else {
  console.log('\nAll URLs validated successfully.');
  process.exit(0);
}
