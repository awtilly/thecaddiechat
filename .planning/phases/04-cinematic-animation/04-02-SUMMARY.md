---
phase: 04-cinematic-animation
plan: 02
subsystem: ui
tags: [gsap, scrolltrigger, animation, parallax, lenis, scroll-reveal]

# Dependency graph
requires:
  - phase: 04-cinematic-animation plan 01
    provides: GSAP + Lenis foundation, ScrollTrigger.batch, data-scroll-reveal pattern
provides:
  - GSAP timeline hero entrance with sequenced element reveals
  - ScrollTrigger parallax on hero background and content fade-out
  - Scroll-driven storytelling animations for article images and pull quotes
  - Page-specific animation dispatcher pattern (route-based init)
affects: [05-progressive-enhancement]

# Tech tracking
tech-stack:
  added: []
  patterns: [page-specific animation dispatchers, initHeroAnimations/initStorytellingAnimations functions, data-scroll-reveal on MDX components, blockquote initial hidden state with GSAP reveal]

key-files:
  created: []
  modified:
    - src/components/Hero.astro
    - src/layouts/BaseLayout.astro
    - src/components/mdx/FullBleed.astro
    - src/components/mdx/FeaturedImage.astro
    - src/components/mdx/InlineImage.astro
    - src/layouts/ArticleLayout.astro
    - src/layouts/CourseLayout.astro

key-decisions:
  - "Hero entrance uses gsap.from() for each element with absolute timeline positions for choreographed reveal"
  - "Storytelling animations layer per-element effects on top of global scroll-reveal batch"
  - "Pull quotes start CSS-hidden (opacity:0, translateX:-30px) to prevent FOUC before GSAP initializes"

patterns-established:
  - "Page-specific animation dispatchers: route-based if/match in gsap.context callback"
  - "initHeroAnimations/initStorytellingAnimations: named functions for page-specific GSAP work"
  - "Blockquote hidden-by-default pattern: CSS sets initial hidden state, GSAP animates visible"

requirements-completed: [ANIM-03, ANIM-05]

# Metrics
duration: 3min
completed: 2026-03-05
---

# Phase 4 Plan 2: Hero & Storytelling Animations Summary

**GSAP timeline hero entrance with ScrollTrigger parallax, plus scroll-driven image reveals and pull quote slide-ins on article pages**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-05T20:02:05Z
- **Completed:** 2026-03-05T20:05:04Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Homepage hero entrance is now a choreographed GSAP timeline (kicker, h1 lines, sub, cta, meta, scroll indicator sequenced)
- Hero background has ScrollTrigger parallax (yPercent + scale on scrub) with content fade-out on scroll
- Article pages have scroll-driven storytelling: full-bleed images scale up, inline/featured images fade-rise, pull quotes slide in from left
- All animations respect prefers-reduced-motion (CSS fallback shows elements immediately)

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace Hero CSS animations with GSAP timeline and ScrollTrigger parallax** - `29423d1` (feat)
2. **Task 2: Add scroll-driven storytelling animations to MDX image components and article layouts** - `855c438` (feat)

## Files Created/Modified
- `src/components/Hero.astro` - Stripped CSS @keyframes and vanilla scroll handler, kept structural styles with opacity:0 for GSAP
- `src/layouts/BaseLayout.astro` - Added initHeroAnimations(), initStorytellingAnimations(), and page-specific dispatchers
- `src/components/mdx/FullBleed.astro` - Added data-scroll-reveal attribute
- `src/components/mdx/FeaturedImage.astro` - Added data-scroll-reveal attribute
- `src/components/mdx/InlineImage.astro` - Added data-scroll-reveal attribute
- `src/layouts/ArticleLayout.astro` - Added blockquote initial hidden state and reduced-motion override
- `src/layouts/CourseLayout.astro` - Added blockquote initial hidden state and reduced-motion override

## Decisions Made
- Hero entrance uses gsap.from() with absolute timeline positions for choreographed reveal rather than relative stagger
- Storytelling animations layer per-element GSAP effects on top of the global ScrollTrigger.batch (FullBleed gets scale, blockquotes get directional slide)
- Pull quotes start CSS-hidden to prevent FOUC before GSAP initializes, with prefers-reduced-motion showing them immediately

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 4 (Cinematic Animation) is now complete with all 2 plans delivered
- GSAP + Lenis foundation, global scroll reveals, hero entrance timeline, article storytelling, and accessibility fallbacks all in place
- Ready for Phase 5 (Progressive Enhancement)

## Self-Check: PASSED

All 7 modified files verified present. Both task commits (29423d1, 855c438) verified in git log.

---
*Phase: 04-cinematic-animation*
*Completed: 2026-03-05*
