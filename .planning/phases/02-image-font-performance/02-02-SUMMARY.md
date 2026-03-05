---
phase: 02-image-font-performance
plan: 02
subsystem: ui
tags: [astro-image, astro-picture, responsive-images, srcset, avif, webp, image-optimization]

# Dependency graph
requires:
  - phase: 02-image-font-performance
    provides: Astro responsive image config (layout constrained, responsive styles) and build validation script
provides:
  - All components and layouts migrated from raw <img> to Astro Image/Picture components
  - Responsive srcset generation across all 18 HTML pages
  - AVIF/WebP modern format delivery via Picture component on hero images
  - ImageMetadata type contracts on all card components (ContentCard, PostCard, FeaturedPost, CourseItem)
  - MDX image components with explicit layout props for responsive srcset
affects: [02-03-camera-roll, 03-design-language, 04-animation]

# Tech tracking
tech-stack:
  added: []
  patterns: [picture-component-for-hero-images, image-component-for-card-thumbnails, image-metadata-prop-pattern, layout-prop-on-mdx-image-components]

key-files:
  created: []
  modified: [src/components/Hero.astro, src/components/ContentCard.astro, src/components/PostCard.astro, src/components/FeaturedPost.astro, src/components/CourseItem.astro, src/layouts/CourseLayout.astro, src/layouts/ArticleLayout.astro, src/pages/index.astro, src/pages/courses/index.astro, src/pages/courses/golden-age-golf/index.astro, src/pages/chronicles/index.astro, src/components/mdx/InlineImage.astro, src/components/mdx/FullBleed.astro, src/components/mdx/FeaturedImage.astro, src/components/mdx/Memorabilia.astro]

key-decisions:
  - "Picture component used for full-width hero images (Hero, golden-age-golf) to serve avif/webp source sets"
  - "Image component used for constrained card thumbnails and layout heroes with priority loading"
  - "MDX FullBleed uses layout=full-width while InlineImage/FeaturedImage/Memorabilia use layout=constrained"

patterns-established:
  - "Hero images: Use Picture with formats=['avif','webp'] layout=full-width priority for above-fold heroes"
  - "Card images: Accept ImageMetadata prop, use Image with loading=lazy for below-fold cards"
  - "Page callers: Import images in frontmatter, pass ImageMetadata objects (not string paths or .src extraction)"
  - "MDX components: Explicit layout prop on Image for responsive srcset generation"

requirements-completed: [FNDN-03]

# Metrics
duration: 5min
completed: 2026-03-05
---

# Phase 2 Plan 2: Image Migration Summary

**Migrated all raw img tags to Astro Image/Picture components with responsive srcset, AVIF/WebP delivery, and priority loading -- zero hardcoded image paths remain in built output**

## Performance

- **Duration:** 5 min
- **Started:** 2026-03-05T02:36:23Z
- **Completed:** 2026-03-05T02:41:26Z
- **Tasks:** 2
- **Files modified:** 15

## Accomplishments
- Every raw `<img>` tag across components, layouts, and pages replaced with Astro Image or Picture components
- Hero images (homepage, golden-age-golf, course layout, article layout) load with priority and serve AVIF/WebP via Picture
- Card components (ContentCard, PostCard, FeaturedPost, CourseItem) accept ImageMetadata type and lazy-load
- All page callers import images and pass ImageMetadata objects instead of string URL paths
- MDX image components have explicit layout props generating responsive srcset in built output
- Build validation passes all FNDN-03 checks: 18 HTML files with srcset, 853 WebP/AVIF images, zero hardcoded paths

## Task Commits

Each task was committed atomically:

1. **Task 1: Migrate Hero, layout heroes, and card components** - `c8ddad6` (feat)
2. **Task 2: Update page callers and MDX layout props** - `f985e6e` (feat)

## Files Created/Modified
- `src/components/Hero.astro` - Picture component with avif/webp formats and priority loading
- `src/components/ContentCard.astro` - Image component, ImageMetadata type prop
- `src/components/PostCard.astro` - Image component, ImageMetadata type prop
- `src/components/FeaturedPost.astro` - Image component, ImageMetadata type prop
- `src/components/CourseItem.astro` - Image component, optional ImageMetadata type prop
- `src/layouts/CourseLayout.astro` - Image component with full-width layout and priority
- `src/layouts/ArticleLayout.astro` - Image component with constrained layout and priority
- `src/pages/index.astro` - Image imports for intro and ContentCard images
- `src/pages/chronicles/index.astro` - Pass heroImage object instead of .src string
- `src/pages/courses/index.astro` - Import hero image for FeaturedPost
- `src/pages/courses/golden-age-golf/index.astro` - Picture for series hero, pass heroImage to CourseItem
- `src/components/mdx/InlineImage.astro` - Added layout="constrained"
- `src/components/mdx/FullBleed.astro` - Added layout="full-width"
- `src/components/mdx/FeaturedImage.astro` - Added layout="constrained"
- `src/components/mdx/Memorabilia.astro` - Added layout="constrained"

## Decisions Made
- Used Picture component (not Image) for full-width hero images on homepage and golden-age-golf page, providing avif and webp source alternatives with jpg fallback
- Used Image component with layout="full-width" and priority for layout hero images (CourseLayout, ArticleLayout) since they don't need multi-format source sets but do need responsive srcset
- MDX FullBleed gets layout="full-width" since it spans the viewport, while InlineImage/FeaturedImage/Memorabilia get layout="constrained" for their container-bound display

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All FNDN-03 image optimization checks now pass (srcset, WebP/AVIF, no hardcoded paths, no Unsplash URLs)
- Image pipeline fully operational for Plan 02-03 (Camera Roll) which will add gallery images
- Existing CSS selectors (.hero-bg img, .series-hero img, .course-hero-image img, etc.) continue to work with Picture/Image rendered output since CSS descendant selectors match nested img inside picture elements
- Lightbox.astro intentionally retains raw img for runtime full-resolution display (out of scope per plan)

## Self-Check: PASSED

- FOUND: src/components/Hero.astro
- FOUND: src/components/ContentCard.astro
- FOUND: src/components/PostCard.astro
- FOUND: src/components/FeaturedPost.astro
- FOUND: src/components/CourseItem.astro
- FOUND: src/layouts/CourseLayout.astro
- FOUND: src/layouts/ArticleLayout.astro
- FOUND: 02-02-SUMMARY.md
- FOUND: commit c8ddad6 (Task 1)
- FOUND: commit f985e6e (Task 2)

---
*Phase: 02-image-font-performance*
*Completed: 2026-03-05*
