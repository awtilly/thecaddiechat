---
phase: 4
slug: cinematic-animation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-05
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual visual + build validation |
| **Config file** | none — existing build infrastructure |
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
| 04-01-01 | 01 | 1 | ANIM-02 | build | `npm run build` | ✅ | ⬜ pending |
| 04-01-02 | 01 | 1 | ANIM-01 | build | `npm run build` | ✅ | ⬜ pending |
| 04-01-03 | 01 | 1 | TRNS-01 | build+urls | `npm run build && npm run validate-urls` | ✅ | ⬜ pending |
| 04-02-01 | 02 | 2 | ANIM-03 | build | `npm run build` | ✅ | ⬜ pending |
| 04-02-02 | 02 | 2 | ANIM-05 | build | `npm run build` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements. No test framework install needed.

- [x] `npm run build` — confirms no build errors from GSAP/Lenis imports
- [x] `npm run validate-urls` — confirms all 19 pages render

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Smooth scroll feel across all pages | ANIM-02 | Scroll feel is subjective/perceptual | Open dev server, scroll on homepage, listing, and article pages. Scrolling should feel fluid with gentle momentum. |
| Content reveals on scroll | ANIM-01 | Visual animation quality cannot be automated | Scroll down any page. Content sections should fade/slide into view as they enter the viewport. |
| Hero parallax + entrance animation | ANIM-03 | Parallax depth and cinematic timing are visual | Load homepage. Hero text should animate in sequentially. Scrolling should show background parallax movement. |
| Scroll-driven storytelling | ANIM-05 | Image/text animation relationship is visual | Open a course or chronicle article. Images should animate into view as scroll reveals them. |
| View Transitions crossfade | TRNS-01 | Page transition smoothness is visual | Click between pages. Transition should be a smooth crossfade, no hard page reloads. |
| prefers-reduced-motion respected | ANIM-01/02/03/05 | System setting interaction | Enable reduced motion in OS settings. Reload. All animations should be disabled. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
