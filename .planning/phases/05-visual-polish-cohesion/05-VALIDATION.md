---
phase: 5
slug: visual-polish-cohesion
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Build validation (Astro build) + URL validation script |
| **Config file** | `scripts/validate-urls.mjs` |
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
| 05-01-01 | 01 | 1 | VISL-03 | smoke | `npm run build` | Yes | ⬜ pending |
| 05-01-02 | 01 | 1 | VISL-03 | unit | `grep -r "transition:.*[0-9].*ease" src/ --include="*.astro" --include="*.css"` | N/A - one-liner | ⬜ pending |
| 05-02-01 | 02 | 1 | VISL-02 | manual-only | Visual inspection in browser | N/A | ⬜ pending |
| 05-02-02 | 02 | 1 | VISL-02 | manual-only | Tab through page in browser | N/A | ⬜ pending |
| 05-XX-XX | XX | X | VISL-03 | smoke | `npm run validate-urls` | Yes | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

- Build validation (`npm run build`) already in place
- URL validation (`npm run validate-urls`) already in place
- No new test framework needed -- visual hover/focus states are inherently manual verification

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Cards, links, nav have polished hover states | VISL-02 | Visual/interaction quality cannot be automated | Hover each card type, nav link, footer link; verify smooth transitions with consistent timing |
| Focus-visible states on interactive elements | VISL-02 | Keyboard interaction testing | Tab through all pages; verify visible focus ring on cards, links, nav elements |
| Consistent animation feel across pages | VISL-03 | Subjective consistency evaluation | Browse homepage → chronicles → courses → camera roll; verify no jarring timing differences |
| No stuck hover states on touch | VISL-02 | Requires touch device testing | Tap cards on mobile; verify no persistent hover state |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
