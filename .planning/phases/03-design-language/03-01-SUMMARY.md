---
phase: 03-design-language
plan: 01
subsystem: ui
tags: [css-custom-properties, typography, motion-tokens, fluid-type, clamp, playfair-display, accessibility, reduced-motion]

# Dependency graph
requires:
  - phase: 02-image-font-performance
    provides: Fontsource self-hosted Playfair Display and DM Sans in BaseLayout
provides:
  - Typography scale tokens (--font-size-xs through --font-size-4xl) as CSS custom properties
  - Line-height, tracking, and measure tokens as CSS custom properties
  - Motion tokens (easing, duration, distance, transition shorthands) as CSS custom properties
  - prefers-reduced-motion global reset for all motion tokens
  - Playfair Display true italic variant loaded via wght-italic.css
affects: [03-02-PLAN, phase-04, phase-05]

# Tech tracking
tech-stack:
  added: []
  patterns: [fluid-type-scale-clamp, css-motion-tokens, reduced-motion-token-reset, transition-shorthand-composition]

key-files:
  created: []
  modified:
    - src/styles/global.css
    - src/layouts/BaseLayout.astro

key-decisions:
  - "Major Third 1.25 ratio chosen for type scale (range 0.64rem-4.77rem covers all existing needs)"
  - "Motion easing tokens use GSAP-compatible cubic-bezier values for Phase 4 compatibility"
  - "Transition shorthands composed from duration and easing tokens for DRY usage"

patterns-established:
  - "Token naming: --font-size-{step}, --leading-{name}, --tracking-{name}, --measure-{name}"
  - "Motion naming: --ease-{type}, --duration-{speed}, --distance-{size}, --transition-{purpose}"
  - "Reduced motion: override tokens to zero in @media query rather than per-component checks"

requirements-completed: [VISL-01, ANIM-04]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 3 Plan 01: Design Tokens Summary

**Fluid typography scale (9 steps, Major Third 1.25) and motion token system (5 easings, 5 durations, 3 distances) as CSS custom properties with global reduced-motion reset and Playfair Display true italic**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T15:18:12Z
- **Completed:** 2026-03-05T15:20:14Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Defined complete typography token system: 9 fluid font sizes, 5 line heights, 5 tracking values, 3 measure values
- Defined complete motion token system: 5 easing curves (GSAP-compatible), 5 durations, 3 distances, 4 composed transition shorthands
- Added prefers-reduced-motion media query that zeroes all duration/distance tokens globally
- Updated global patterns (.reveal, .btn, .btn-arrow, fadeInUp) to use token references instead of magic values
- Imported Playfair Display true italic variant (wght-italic.css) for proper italic rendering across 18+ uses

## Task Commits

Each task was committed atomically:

1. **Task 1: Define typography and motion tokens in global.css** - `e1bc0bd` (feat)
2. **Task 2: Import Playfair Display true italic variant** - `f7f49ef` (feat)

## Files Created/Modified
- `src/styles/global.css` - Added 55 CSS custom properties (typography scale, line heights, tracking, measure, easing, durations, distances, transition shorthands) to :root block; added prefers-reduced-motion media query; updated .reveal, .btn, .btn-arrow, fadeInUp to use token references
- `src/layouts/BaseLayout.astro` - Added wght-italic.css import for Playfair Display true italic variant

## Decisions Made
- Major Third (1.25) ratio for type scale -- range 0.64rem to 4.77rem covers all existing use cases from meta labels to hero text
- GSAP-compatible cubic-bezier values for easing tokens -- enables zero rework when Phase 4 adds GSAP animations
- Composed transition shorthands (--transition-color, --transition-hover, --transition-reveal, --transition-image) for DRY usage across components

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- All tokens defined and ready for Plan 02 to apply them to ArticleLayout, CourseLayout, PageLayout, and Nav
- Playfair Display true italic available for any font-style: italic usage
- Global patterns already using token references; component-level migration deferred to Plan 02

## Self-Check: PASSED

All files exist, both commits verified, all token groups present in global.css (9 font-size, 5 leading, 5 tracking, 3 measure, 5+ ease, 5+ duration, 3+ distance, 4+ transition tokens), prefers-reduced-motion query present, wght-italic import present.

---
*Phase: 03-design-language*
*Completed: 2026-03-05*
