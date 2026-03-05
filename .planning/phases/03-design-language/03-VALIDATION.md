---
phase: 3
slug: design-language
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Astro Build (npm run build) + URL Validation |
| **Config file** | astro.config.mjs |
| **Quick run command** | `npm run build` |
| **Full suite command** | `npm run build && npm run validate-urls` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run build && npm run validate-urls`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | VISL-01 | smoke | `npm run build` | N/A | ⬜ pending |
| 3-01-02 | 01 | 1 | VISL-01 | smoke | `npm run build` | N/A | ⬜ pending |
| 3-01-03 | 01 | 1 | ANIM-04 | smoke | `npm run build` | N/A | ⬜ pending |
| 3-01-04 | 01 | 1 | ANIM-04 | smoke | `npm run build` | N/A | ⬜ pending |
| 3-02-01 | 02 | 2 | VISL-01 | manual | Visual inspection | N/A | ⬜ pending |
| 3-02-02 | 02 | 2 | VISL-01 | manual | Visual inspection | N/A | ⬜ pending |
| 3-02-03 | 02 | 2 | ANIM-04 | manual | Visual inspection | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements.* No test framework changes needed. The project already has `npm run build` and `npm run validate-urls` which serve as the automated validation layer.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Typography hierarchy looks magazine-quality | VISL-01 | Visual/aesthetic judgment | Open a chronicle page, verify distinct visual hierarchy for headlines, subheads, body, captions |
| Drop cap renders correctly cross-browser | VISL-01 | Cross-browser rendering | Check ::first-letter drop cap in Chrome, Firefox, Safari |
| Pull quotes have editorial styling | VISL-01 | Visual/aesthetic judgment | Check pull-quote elements in chronicle pages |
| Motion feels intentional and branded | ANIM-04 | Subjective motion quality | Hover elements, trigger reveals; motion should feel smooth and intentional |
| prefers-reduced-motion disables all motion | ANIM-04 | Requires OS/browser setting toggle | Toggle reduced-motion in devtools, verify all animations/transitions are instant |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
