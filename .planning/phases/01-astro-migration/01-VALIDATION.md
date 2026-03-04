---
phase: 1
slug: astro-migration
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro build (schema validation) + custom URL validator |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && node scripts/validate-urls.mjs` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && node scripts/validate-urls.mjs`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FNDN-01 | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FNDN-02 | smoke | `npm run build` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FNDN-05 | manual-only | Push to main, verify deployment | N/A | ⬜ pending |
| 01-02-02 | 02 | 1 | FNDN-06 | integration | `node scripts/validate-urls.mjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `package.json` — Astro project initialized with build script
- [ ] `scripts/validate-urls.mjs` — checks dist/ output contains all 19 expected URL paths as directories with index.html files
- [ ] Astro build completes successfully — prerequisite for all validation

*Justification: Astro's build process IS the primary validation tool. A successful `npm run build` proves schema validity, static path generation, image resolution, and layout rendering. The URL validator confirms FNDN-06.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub Actions deploys to Pages | FNDN-05 | Requires actual GitHub push + Pages deployment | Push to main, check Actions tab, verify site loads at thecaddiechat.com |
| Visual parity with original site | All | Subjective visual comparison | Open original and migrated side-by-side, compare each page type (homepage, chronicle, course, camera-roll) |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
