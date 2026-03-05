---
phase: 05-visual-polish-cohesion
plan: 01
subsystem: ui
tags: [css-tokens, motion, accessibility, focus-visible, hover-states, transitions]

# Dependency graph
requires:
  - phase: 03-design-language
    provides: "Motion tokens (durations, easings, composed shorthands) in global.css"
  - phase: 04-cinematic-animation
    provides: "GSAP/Lenis animation stack that motion tokens must not conflict with"
provides:
  - "All 6 UI components using motion token system for consistent animation timing"
  - "Global :focus-visible keyboard accessibility rule"
  - "Animated underline hover pattern on Footer links (matching Nav)"
  - "Styled in-content link hover states for ArticleLayout and CourseLayout"
  - "CourseItem non-layout-shifting hover (border-left accent)"
affects: [05-02-PLAN]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Motion token usage: var(--duration-fast) var(--ease-out) for fast hover states"
    - "var(--transition-image) shorthand for image scale transitions"
    - "var(--transition-color) shorthand for color-only transitions"
    - "::after scaleX underline animation pattern (Nav + Footer)"
    - "Global :focus-visible with outline-offset: 3px for keyboard users"

key-files:
  created: []
  modified:
    - src/components/ContentCard.astro
    - src/components/PostCard.astro
    - src/components/FeaturedPost.astro
    - src/components/CourseItem.astro
    - src/components/Footer.astro
    - src/components/Lightbox.astro
    - src/styles/global.css
    - src/layouts/ArticleLayout.astro
    - src/layouts/CourseLayout.astro

key-decisions:
  - "Used specific property transitions on cards (not transition: all) to avoid View Transition interference"
  - "CourseItem border-left: 3px solid transparent base with border-left-color on hover replaces padding shift"
  - "Global :focus-visible rule with outline-offset: 3px -- no per-component overrides needed"
  - "Footer StoekMedia link excluded from underline via :global(.nav-stoek::after) { display: none }"

patterns-established:
  - "Motion token migration pattern: replace 0.Xs ease with var(--duration-*) var(--ease-out)"
  - "Article body link style: accent-colored underline with offset, hover brightens"

requirements-completed: [VISL-02, VISL-03]

# Metrics
duration: 2min
completed: 2026-03-05
---

# Phase 5 Plan 1: Interaction Polish Summary

**Motion token migration across 6 UI components with focus-visible accessibility, Footer animated underlines, and article body link hover states**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-05T23:41:23Z
- **Completed:** 2026-03-05T23:44:15Z
- **Tasks:** 2
- **Files modified:** 9

## Accomplishments
- Migrated all hard-coded transition values (0.3s ease, 0.4s ease, 0.5s ease, 0.8s ease) to CSS custom property tokens across 6 components
- Added cursor:pointer to 4 card components (ContentCard, PostCard, FeaturedPost, CourseItem)
- Fixed CourseItem layout-shifting hover by replacing padding-left/right shift with border-left accent color
- Added animated underline hover on Footer links matching the existing Nav pattern
- Added global :focus-visible rule for keyboard accessibility with accent-colored outline
- Added styled hover states for in-content links in both ArticleLayout and CourseLayout

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate 6 UI components to motion tokens and fix hover patterns** - `2a65b4f` (feat)
2. **Task 2: Add global focus-visible rule and article body link styles** - `8b23dc0` (feat)

## Files Created/Modified
- `src/components/ContentCard.astro` - Token-based transitions, cursor:pointer
- `src/components/PostCard.astro` - Token-based transitions, cursor:pointer
- `src/components/FeaturedPost.astro` - Token-based image transition, cursor:pointer
- `src/components/CourseItem.astro` - Token transitions, border-left accent hover, cursor:pointer
- `src/components/Footer.astro` - Token transitions, animated underline hover, StoekMedia exclusion
- `src/components/Lightbox.astro` - Token-based color transitions on close/nav buttons
- `src/styles/global.css` - :focus-visible and :focus:not(:focus-visible) rules
- `src/layouts/ArticleLayout.astro` - .article-body a hover styles with accent color
- `src/layouts/CourseLayout.astro` - .course-body a hover styles with accent color

## Decisions Made
- Used specific property transitions (border-color, transform, box-shadow) on ContentCard and PostCard instead of `transition: all` to prevent interference with Astro View Transitions
- CourseItem hover changed from padding shift (which caused layout reflow interfering with Lenis smooth scroll) to border-left accent color
- Single global :focus-visible rule with outline-offset: 3px provides consistent keyboard focus across all interactive elements without per-component overrides
- Footer StoekMedia link excluded from underline animation using :global(.nav-stoek::after) { display: none } -- consistent with how Nav handles it

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All 6 UI components now use the motion token system consistently
- Focus-visible accessibility is globally handled
- Ready for Plan 05-02 (remaining visual polish and cohesion work)

## Self-Check: PASSED

All 10 files verified present. Both task commits (2a65b4f, 8b23dc0) verified in git history.

---
*Phase: 05-visual-polish-cohesion*
*Completed: 2026-03-05*
