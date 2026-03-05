---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 04-02-PLAN.md
last_updated: "2026-03-05T20:05:04Z"
last_activity: 2026-03-05 -- Completed Plan 04-02 (Hero & Storytelling Animations)
progress:
  total_phases: 5
  completed_phases: 4
  total_plans: 9
  completed_plans: 9
  percent: 100
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-03-04)

**Core value:** Jaw-dropping, immersive visual experience that makes visitors stop scrolling and feel inside the story
**Current focus:** Phase 4 -- Cinematic Animation (GSAP + Lenis + View Transitions)

## Current Position

Phase: 4 of 5 (Cinematic Animation) -- COMPLETE
Plan: 2 of 2 in current phase (2 complete)
Status: Phase 04 complete, ready for Phase 05
Last activity: 2026-03-05 -- Completed Plan 04-02 (Hero & Storytelling Animations)

Progress: [==========] 100%

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 8 min
- Total execution time: 1.09 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Astro Migration | 2/2 | 35 min | 18 min |
| 2. Image & Font Performance | 3/3 | 16 min | 5 min |
| 3. Design Language | 2/2 | 10 min | 5 min |
| 4. Cinematic Animation | 2/2 | 7 min | 4 min |

**Recent Trend:**
- Last 5 plans: 8min, 2min, 8min, 4min, 3min
- Trend: Stable fast

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Roadmap: Astro + GSAP + Lenis stack confirmed (from research)
- Roadmap: Foundation split into migration (Phase 1) and performance (Phase 2) for clean delivery boundaries
- Roadmap: Typography + motion tokens (Phase 3) established before animation work (Phase 4)
- 01-01: npm chosen as package manager (simplest, widest GitHub Actions support)
- 01-01: Lightbox uses data-lightbox attribute for explicit opt-in
- 01-01: ImagePair uses slot pattern wrapping InlineImage children
- 01-02: Image paths in frontmatter use relative ../../assets/images/ references for Astro image pipeline
- 01-02: MDX body images use import() expressions for dynamic Astro optimization
- 01-02: Course route injects all 5 MDX components via Content components prop
- 01-02: entry.id used for getStaticPaths params (Astro 5 Content Layer API)
- 02-01: Used Astro 5.18 stable image config properties (layout/responsiveStyles) instead of experimental prefixes
- 02-01: Fontsource Variable fonts imported in BaseLayout frontmatter for automatic inclusion on every page
- 02-02: Picture component used for full-width hero images (Hero, golden-age-golf) with avif/webp formats
- 02-02: Image component used for constrained card thumbnails and layout heroes with priority loading
- 02-02: MDX FullBleed uses layout=full-width while InlineImage/FeaturedImage/Memorabilia use layout=constrained
- 02-03: import.meta.glob with eager loading for bulk camera roll image import (133 images)
- 02-03: Film roll groups derived from first 9 digits of filename prefix
- 02-03: Generic "Roll N" labels accepted -- no custom category names needed
- 02-03: Limited Image widths to [400, 800, 1200] to keep build time manageable with 133 images
- 03-01: Major Third 1.25 ratio for type scale (range 0.64rem-4.77rem covers all existing needs)
- 03-01: Motion easing tokens use GSAP-compatible cubic-bezier values for Phase 4 compatibility
- 03-01: Transition shorthands composed from duration and easing tokens for DRY usage
- 03-02: Drop cap uses font-size-4xl token with fine-tuned line-height 0.8 for Playfair Display at large sizes
- 03-02: Pull quotes get editorial border-top/border-bottom with color-border-strong for visual weight
- 03-02: Nav typography sizes kept as-is (intentionally specific); only motion values tokenized
- 04-01: Lenis smooth scroll with duration 1.2 and exponential easing for cinematic feel
- 04-01: GSAP ScrollTrigger.batch for global scroll reveals instead of per-component IntersectionObserver
- 04-01: data-scroll-reveal attribute pattern replaces .reveal class for GSAP-driven animations
- 04-01: StatsRow counter keeps vanilla IntersectionObserver (only lifecycle migrated, per research)
- 04-02: Hero entrance uses gsap.from() with absolute timeline positions for choreographed reveal
- 04-02: Storytelling animations layer per-element effects on top of global scroll-reveal batch
- 04-02: Pull quotes start CSS-hidden (opacity:0, translateX:-30px) to prevent FOUC before GSAP initializes

### Pending Todos

None yet.

### Blockers/Concerns

- ~~GSAP Club licensing decision (ScrollSmoother vs free Lenis)~~ RESOLVED: Using free Lenis for smooth scroll + free GSAP ScrollTrigger
- ~~Hero.astro and Lightbox.astro still use DOMContentLoaded -- should be migrated in 04-02~~ RESOLVED: Hero.astro script removed entirely (GSAP handles from BaseLayout); Lightbox.astro remains as-is (separate concern)

## Session Continuity

Last session: 2026-03-05T20:05:04Z
Stopped at: Completed 04-02-PLAN.md
Resume file: None
