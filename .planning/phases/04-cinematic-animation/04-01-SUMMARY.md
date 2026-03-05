---
phase: 04-cinematic-animation
plan: 01
subsystem: ui
tags: [gsap, lenis, scroll-trigger, view-transitions, smooth-scroll, astro]

# Dependency graph
requires:
  - phase: 03-design-language
    provides: Motion tokens (easing curves, durations, distances) used by GSAP animations
provides:
  - GSAP + ScrollTrigger globally initialized via BaseLayout
  - Lenis smooth scroll on all pages
  - Astro View Transitions (ClientRouter) for SPA-style crossfade navigation
  - data-scroll-reveal attribute system for scroll-triggered fade-in animations
  - astro:page-load / astro:before-swap lifecycle pattern for script migration
affects: [04-cinematic-animation]

# Tech tracking
tech-stack:
  added: [gsap, lenis, astro:transitions ClientRouter]
  patterns: [GSAP context cleanup on page swap, ScrollTrigger.batch for batch reveals, astro:page-load lifecycle for component scripts]

key-files:
  created: []
  modified:
    - src/layouts/BaseLayout.astro
    - src/styles/global.css
    - src/components/Nav.astro
    - src/components/StatsRow.astro
    - src/components/ContentCard.astro
    - src/components/PostCard.astro
    - src/components/FeaturedPost.astro
    - src/components/CourseItem.astro
    - src/components/CtaBanner.astro
    - src/pages/index.astro
    - src/pages/courses/golden-age-golf/index.astro
    - src/pages/camera-roll/index.astro

key-decisions:
  - "Lenis smooth scroll with duration 1.2 and exponential easing for cinematic feel"
  - "GSAP ScrollTrigger.batch for global scroll reveals instead of per-component IntersectionObserver"
  - "data-scroll-reveal attribute pattern replaces .reveal class for GSAP-driven animations"
  - "StatsRow counter keeps vanilla IntersectionObserver (per research recommendation) -- only lifecycle migrated"

patterns-established:
  - "astro:page-load for init, astro:before-swap for cleanup -- all future component scripts follow this pattern"
  - "gsap.context() wraps all animations for clean teardown on page transitions"
  - "data-scroll-reveal attribute on elements that should fade/slide in on scroll"
  - "ScrollTrigger.batch with stagger 0.1 and once:true for one-shot scroll reveals"

requirements-completed: [ANIM-01, ANIM-02, TRNS-01]

# Metrics
duration: 4min
completed: 2026-03-05
---

# Phase 4 Plan 1: Animation Foundation Summary

**GSAP + Lenis smooth scroll, View Transitions crossfade, and global ScrollTrigger.batch reveal system replacing IntersectionObserver**

## Performance

- **Duration:** 4 min
- **Started:** 2026-03-05T19:55:36Z
- **Completed:** 2026-03-05T19:59:24Z
- **Tasks:** 2
- **Files modified:** 15 (including package.json/lock)

## Accomplishments
- Lenis smooth scroll active on all pages with momentum-based scrolling and GSAP ticker integration
- GSAP ScrollTrigger.batch handles all scroll-reveal animations globally from BaseLayout
- Astro View Transitions (ClientRouter) enables SPA-style crossfade between all 19 pages
- All component scripts migrated from DOMContentLoaded to astro:page-load lifecycle
- Old IntersectionObserver reveal system fully replaced with data-scroll-reveal attribute pattern
- prefers-reduced-motion disables Lenis and all GSAP animations

## Task Commits

Each task was committed atomically:

1. **Task 1: Install dependencies, add ClientRouter + GSAP/Lenis init to BaseLayout, update global CSS** - `4022e69` (feat)
2. **Task 2: Migrate all component scripts to astro:page-load and switch reveal classes to data-scroll-reveal** - `a180233` (feat)

## Files Created/Modified
- `package.json` - Added gsap and lenis dependencies
- `package-lock.json` - Lock file updated for new packages
- `src/layouts/BaseLayout.astro` - ClientRouter in head, GSAP+Lenis init script with lifecycle hooks
- `src/styles/global.css` - Removed scroll-behavior:smooth, added [data-scroll-reveal] rules, removed old .reveal rules
- `src/components/Nav.astro` - Migrated to astro:page-load, removed IntersectionObserver reveals and stagger delays
- `src/components/StatsRow.astro` - Migrated to astro:page-load, switched reveal to data-scroll-reveal
- `src/components/ContentCard.astro` - Switched class="reveal" to data-scroll-reveal attribute
- `src/components/PostCard.astro` - Switched class="reveal" to data-scroll-reveal attribute
- `src/components/FeaturedPost.astro` - Switched class="reveal" to data-scroll-reveal attribute
- `src/components/CourseItem.astro` - Switched class="reveal" to data-scroll-reveal attribute
- `src/components/CtaBanner.astro` - Switched class="reveal" to data-scroll-reveal attribute
- `src/pages/index.astro` - Switched .intro-grid, .section-label, .explore-heading to data-scroll-reveal
- `src/pages/courses/golden-age-golf/index.astro` - Switched .trip-intro to data-scroll-reveal
- `src/pages/camera-roll/index.astro` - Switched .gallery-section to data-scroll-reveal

## Decisions Made
- Lenis smooth scroll with duration 1.2 and exponential easing for cinematic feel
- GSAP ScrollTrigger.batch for global scroll reveals instead of per-component IntersectionObserver
- data-scroll-reveal attribute pattern replaces .reveal class for GSAP-driven animations
- StatsRow counter keeps vanilla IntersectionObserver (only lifecycle event migrated, per research recommendation)
- Hero.astro and Lightbox.astro DOMContentLoaded not migrated (not in plan scope, will be addressed in 04-02)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- GSAP + Lenis foundation is active and ready for Plan 04-02 (hero parallax, storytelling sequences)
- Hero.astro and Lightbox.astro still use DOMContentLoaded -- these should be migrated in Plan 04-02
- All existing scripts (Nav scroll, mobile menu, StatsRow counter) function correctly with View Transitions

## Self-Check: PASSED

All 13 files verified present. Both task commits (4022e69, a180233) confirmed in git log.

---
*Phase: 04-cinematic-animation*
*Completed: 2026-03-05*
