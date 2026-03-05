---
phase: 2
slug: image-font-performance
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-04
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro build validation + custom scripts |
| **Config file** | `astro.config.mjs` |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run validate-urls && node scripts/validate-images.mjs` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run validate-urls && node scripts/validate-images.mjs`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-00-01 | 00 | 0 | FNDN-03, FNDN-04 | setup | `node scripts/validate-images.mjs` | W0 creates | pending |
| 02-01-01 | 01 | 1 | FNDN-03 | smoke | `npm run build && grep -rl 'srcset=' dist/**/*.html` | W0 | pending |
| 02-01-02 | 01 | 1 | FNDN-03 | smoke | `npm run build && ls dist/_astro/*.avif dist/_astro/*.webp` | W0 | pending |
| 02-01-03 | 01 | 1 | FNDN-03 | regression | `npm run build && ! grep -r 'src="/assets/images' dist/` | W0 | pending |
| 02-02-01 | 02 | 1 | FNDN-04 | regression | `npm run build && ! grep -r 'fonts.googleapis.com' dist/` | W0 | pending |
| 02-02-02 | 02 | 1 | FNDN-04 | smoke | `npm run build && ls dist/_astro/*.woff2` | W0 | pending |
| 02-03-01 | 03 | 2 | FNDN-03 | regression | `npm run build && ! grep -r 'unsplash.com' dist/` | W0 | pending |

*Status: pending · green · red · flaky*

---

## Wave 0 Requirements

- [ ] `scripts/validate-images.mjs` — validates FNDN-03a through FNDN-03d and FNDN-04a/b after build
- [ ] No framework install needed — validation uses build output inspection

*Existing infrastructure: `npm run validate-urls` covers URL preservation (URL-01).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lighthouse performance 90+ | PERF-01 | Requires deployed site + browser | Run Lighthouse on representative course page and chronicle page after deployment |
| No visible FOUT/layout shift | FNDN-04 | Visual verification needed | Load pages on throttled connection, verify no text reflow |
| Camera Roll lightbox works | FNDN-03 | Interaction testing | Click gallery images, verify lightbox opens with correct image |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
