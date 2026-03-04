---
phase: 01-astro-migration
plan: 02
subsystem: content
tags: [astro, mdx, content-collections, images, routes, url-preservation]

# Dependency graph
requires:
  - phase: 01-astro-migration/01
    provides: "Astro project scaffold, layouts, components, MDX shortcodes, content schemas, global CSS"
provides:
  - "5 chronicle MDX content files with typed frontmatter and full prose"
  - "8 course MDX content files with MDX custom components (FullBleed, ImagePair, InlineImage, FeaturedImage, Memorabilia)"
  - "73 images copied to src/assets/images/ with directory structure"
  - "Dynamic routes for chronicles and courses via getStaticPaths + getCollection"
  - "Chronicles and courses listing pages"
  - "Golden Age Golf hub page and Camera Roll standalone page"
  - "All 19 URLs validated present in dist/ output"
  - "Visual parity confirmed with original vanilla HTML site"
affects: [02-image-performance, 03-design-language]

# Tech tracking
tech-stack:
  added: []
  patterns: [mdx-content-migration, dynamic-routes-with-collections, mdx-component-injection]

key-files:
  created:
    - src/content/chronicles/viktor-hovland.mdx
    - src/content/chronicles/tyrrell-hatton.mdx
    - src/content/chronicles/matt-fitzpatrick.mdx
    - src/content/chronicles/beauty-or-burden.mdx
    - src/content/chronicles/uphill-challenge.mdx
    - src/content/courses/stonewall.mdx
    - src/content/courses/francis-a-byrne.mdx
    - src/content/courses/mountain-ridge.mdx
    - src/content/courses/essex-county.mdx
    - src/content/courses/north-jersey.mdx
    - src/content/courses/hollywood.mdx
    - src/content/courses/winged-foot.mdx
    - src/content/courses/friars-head.mdx
    - src/pages/chronicles/index.astro
    - src/pages/chronicles/[...slug].astro
    - src/pages/courses/index.astro
    - src/pages/courses/golden-age-golf/index.astro
    - src/pages/courses/[...slug].astro
    - src/pages/camera-roll/index.astro
  modified:
    - src/pages/index.astro

key-decisions:
  - "Image paths in frontmatter use relative ../../assets/images/ references for Astro image pipeline"
  - "MDX body images use import() expressions for dynamic Astro optimization"
  - "Course route injects all 5 MDX components via Content components prop"
  - "entry.id used for getStaticPaths params (Astro 5 Content Layer API)"

patterns-established:
  - "MDX frontmatter heroImage references relative image imports for Astro optimization"
  - "Dynamic routes: getCollection + getStaticPaths with entry.id as slug param"
  - "Course MDX: FullBleed/ImagePair/InlineImage/FeaturedImage/Memorabilia for rich image layouts"
  - "Standalone pages (golden-age-golf, camera-roll) query collections for data but live as static .astro files"

requirements-completed: [FNDN-02, FNDN-06]

# Metrics
duration: ~25min
completed: 2026-03-04
---

# Phase 1 Plan 02: Content Migration Summary

**13 MDX content files (5 chronicles + 8 courses), 73 images, 6 page routes, and all 19 URLs validated -- full content migration from vanilla HTML to Astro content collections with user-confirmed visual parity**

## Performance

- **Duration:** ~25 min (across multiple sessions including visual verification)
- **Started:** 2026-03-04T19:45:00Z
- **Completed:** 2026-03-04T20:17:09Z
- **Tasks:** 3 (2 automated + 1 human-verify checkpoint)
- **Files created/modified:** 110

## Accomplishments

- Copied 73 images to src/assets/images/ preserving chronicles/ and courses/ directory structure
- Created all 5 chronicle MDX files with valid frontmatter (title, description, date, heroImage, meta, prev/next) and complete prose content extracted from original HTML
- Created all 8 course MDX files with valid frontmatter (title, description, architect, year, location, heroImage, courseNumber, style, prev/next) and full prose using FullBleed, ImagePair, InlineImage, FeaturedImage, and Memorabilia MDX components
- Built 6 page routes: chronicles listing, courses listing, golden-age-golf hub, camera-roll, dynamic chronicle route ([...slug]), dynamic course route ([...slug])
- Dynamic routes use getStaticPaths with getCollection, passing entry data to ArticleLayout and CourseLayout
- Course dynamic route injects all 5 MDX shortcode components via Content components prop
- All 19 URLs validated present in dist/ output via validate-urls.mjs script (18/18 content URLs + homepage)
- User confirmed visual parity with original vanilla HTML site

## Task Commits

Each task was committed atomically:

1. **Task 1: Copy images + create MDX content files** - `7da5b39` (feat)
2. **Task 2: Create page routes + validate URLs** - `b11e267` (feat)
3. **Task 3: Visual parity verification** - Human-verify checkpoint, user approved (no code changes)

## Files Created/Modified

### Images (73 files)
- `src/assets/images/chronicles/` - Hero and inline images for 5 chronicle articles
- `src/assets/images/courses/` - Hero, inline, full-bleed, and memorabilia images for 8 course articles

### Chronicle MDX (5 files)
- `src/content/chronicles/viktor-hovland.mdx` - BMW Championship practice round story
- `src/content/chronicles/tyrrell-hatton.mdx` - LIV Golf Invitational story
- `src/content/chronicles/matt-fitzpatrick.mdx` - Northern Trust story
- `src/content/chronicles/beauty-or-burden.mdx` - Looping at Baltusrol essay
- `src/content/chronicles/uphill-challenge.mdx` - Uphill challenge essay

### Course MDX (8 files)
- `src/content/courses/stonewall.mdx` - Course 01, Gil Hanse, Elverson PA
- `src/content/courses/francis-a-byrne.mdx` - Course 02, Francis A. Byrne
- `src/content/courses/mountain-ridge.mdx` - Course 03, Mountain Ridge
- `src/content/courses/essex-county.mdx` - Course 04, Essex County
- `src/content/courses/north-jersey.mdx` - Course 05, North Jersey CC
- `src/content/courses/hollywood.mdx` - Course 06, Hollywood GC
- `src/content/courses/winged-foot.mdx` - Course 07, Winged Foot GC
- `src/content/courses/friars-head.mdx` - Course 08, Coore & Crenshaw masterpiece

### Page Routes (6 files)
- `src/pages/chronicles/index.astro` - Chronicles listing with FeaturedPost + PostCards
- `src/pages/chronicles/[...slug].astro` - Dynamic chronicle article route
- `src/pages/courses/index.astro` - Courses listing with CourseItem components
- `src/pages/courses/golden-age-golf/index.astro` - Golden Age Golf hub with course grid
- `src/pages/courses/[...slug].astro` - Dynamic course article route with MDX component injection
- `src/pages/camera-roll/index.astro` - Camera Roll gallery page

### Modified
- `src/pages/index.astro` - Updated homepage with live content links

## Decisions Made

- **Image paths use relative imports:** Frontmatter heroImage uses `../../assets/images/` relative paths so Astro's image pipeline can optimize them at build time
- **MDX body images use import() expressions:** Dynamic imports in JSX attributes let Astro process inline images through the optimization pipeline
- **Course route injects MDX components:** All 5 MDX shortcode components passed via `components` prop on `<Content>` render, enabling custom image layouts in course MDX
- **entry.id for slugs:** Following Astro 5 Content Layer API, getStaticPaths uses entry.id (not entry.slug) as the route parameter

## Deviations from Plan

None - plan executed exactly as written. All content was migrated from the 13 source HTML files, all images copied, all routes created, and URL validation passed on first verification run.

## Issues Encountered

None - build succeeded cleanly and all 19 URLs validated on the first attempt.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 1 (Astro Migration) is now complete -- all 19 pages render at original URLs from Astro content collections
- Ready for Phase 2 (Image & Font Performance) to add responsive srcset, WebP/AVIF conversion, blur-up placeholders, and self-hosted fonts
- All images are already in src/assets/images/ where Astro's image pipeline can process them
- Hero component images (currently in public/) can be migrated to src/assets/ and use the `<Image>` component in Phase 2

## Self-Check: PASSED

- All 19 key files (13 MDX + 6 routes) verified present on disk
- Both task commits (7da5b39, b11e267) found in git log
- 34 chronicle images and 62 course images present in src/assets/images/
- SUMMARY.md created at .planning/phases/01-astro-migration/01-02-SUMMARY.md

---
*Phase: 01-astro-migration*
*Completed: 2026-03-04*
