---
phase: 01-astro-migration
plan: 01
subsystem: infra
tags: [astro, mdx, github-actions, css, components]

# Dependency graph
requires:
  - phase: none
    provides: "First phase - no dependencies"
provides:
  - "Astro 5 project with build infrastructure"
  - "4 layout components (Base, Page, Article, Course)"
  - "13 UI components with ported styles and scripts"
  - "5 MDX shortcode components for course image layouts"
  - "Content collection schemas for chronicles and courses"
  - "GitHub Actions CI/CD workflow for Pages deployment"
  - "Global CSS with all existing custom properties"
  - "CLAUDE.md project conventions"
  - "URL validation script for 19 routes"
affects: [01-02, 02-image-performance]

# Tech tracking
tech-stack:
  added: [astro@5.18, "@astrojs/mdx@4.3"]
  patterns: [content-layer-api, glob-loader, scoped-styles, component-scripts]

key-files:
  created:
    - package.json
    - astro.config.mjs
    - src/content.config.ts
    - src/styles/global.css
    - src/layouts/BaseLayout.astro
    - src/layouts/PageLayout.astro
    - src/layouts/ArticleLayout.astro
    - src/layouts/CourseLayout.astro
    - src/components/Nav.astro
    - src/components/Hero.astro
    - src/components/Lightbox.astro
    - src/components/mdx/FullBleed.astro
    - src/components/mdx/ImagePair.astro
    - src/components/mdx/InlineImage.astro
    - src/components/mdx/FeaturedImage.astro
    - src/components/mdx/Memorabilia.astro
    - src/pages/index.astro
    - src/pages/404.astro
    - .github/workflows/deploy.yml
    - CLAUDE.md
    - scripts/validate-urls.mjs
  modified: []

key-decisions:
  - "npm chosen as package manager (simplest, widest GitHub Actions support)"
  - "thecaddiechat/ not archived to branch (it has its own .git repo, already preserved)"
  - "Added .gitignore for node_modules, dist, .astro, and thecaddiechat/"
  - "Hero images use plain img tags (not Astro Image) since they reference public/ paths for now"
  - "Lightbox collects images via data-lightbox attribute on img elements"
  - "ImagePair component uses slot pattern wrapping InlineImage children (no sub-component syntax)"

patterns-established:
  - "BaseLayout > PageLayout/ArticleLayout/CourseLayout hierarchy"
  - "Component-scoped styles with :global() for MDX content reach"
  - "Client-side scripts in <script> tags per component (not global JS file)"
  - "data-lightbox attribute on images to opt into lightbox collection"
  - "Content Layer API with glob() loader and Zod schemas"

requirements-completed: [FNDN-01, FNDN-05]

# Metrics
duration: 10min
completed: 2026-03-04
---

# Phase 1 Plan 01: Scaffold & Components Summary

**Astro 5 project with 4 layouts, 18 components, MDX shortcodes, global CSS, CI/CD workflow, and content schemas -- a buildable skeleton ready for content migration**

## Performance

- **Duration:** 10 min
- **Started:** 2026-03-04T19:29:17Z
- **Completed:** 2026-03-04T19:39:15Z
- **Tasks:** 2
- **Files modified:** 37

## Accomplishments

- Scaffolded complete Astro 5 project at repo root with Astro + @astrojs/mdx
- Created all 4 layouts (BaseLayout, PageLayout, ArticleLayout, CourseLayout) with correct hierarchy and ported styles
- Built 13 UI components and 5 MDX shortcode components with styles and scripts ported from the existing vanilla site
- Ported all 475 lines of global CSS preserving every custom property, reset, utility, and animation
- Configured GitHub Actions deploy workflow with withastro/action@v5
- Defined content collection schemas for chronicles and courses with Zod validation
- Created full homepage with Hero, intro section, stats row, content cards, and CTA
- Created 404 error page
- Added URL validation script checking all 19 expected routes
- Established CLAUDE.md with project conventions

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Astro project** - `7ba882d` (feat)
2. **Task 2: Create all layouts and components** - `87d3436` (feat)

## Files Created/Modified

### Infrastructure
- `package.json` - Astro 5 project with @astrojs/mdx dependency
- `package-lock.json` - npm lockfile
- `tsconfig.json` - TypeScript config extending astro/strict
- `astro.config.mjs` - Astro config with trailingSlash, static output, MDX
- `src/content.config.ts` - Chronicle and course collection schemas with Zod
- `.gitignore` - Excludes node_modules, dist, .astro, thecaddiechat/
- `.github/workflows/deploy.yml` - GitHub Actions workflow for Pages deployment

### Styles
- `src/styles/global.css` - All custom properties, resets, typography, animations, utilities

### Layouts
- `src/layouts/BaseLayout.astro` - HTML shell with head, meta, global CSS
- `src/layouts/PageLayout.astro` - Standard page with Nav, page-header, Footer
- `src/layouts/ArticleLayout.astro` - Chronicle article with hero, body, prev/next nav
- `src/layouts/CourseLayout.astro` - Course article with course-hero, metadata, lightbox

### Components
- `src/components/Nav.astro` - Fixed nav with mobile toggle, scroll behavior
- `src/components/Footer.astro` - Site footer with links and social
- `src/components/Hero.astro` - Homepage hero with parallax, animations
- `src/components/ContentCard.astro` - Homepage content card
- `src/components/CardGrid.astro` - 3-column card grid container
- `src/components/PostCard.astro` - Chronicle listing card
- `src/components/FeaturedPost.astro` - Featured chronicle card
- `src/components/StatsRow.astro` - Animated counter row
- `src/components/CtaBanner.astro` - Call-to-action section
- `src/components/CourseItem.astro` - Course list row with thumbnail
- `src/components/Breadcrumb.astro` - Breadcrumb navigation
- `src/components/ArticleNav.astro` - Prev/next article navigation
- `src/components/Lightbox.astro` - Image lightbox with keyboard support

### MDX Components
- `src/components/mdx/FullBleed.astro` - Full-viewport-width image
- `src/components/mdx/ImagePair.astro` - Side-by-side image grid
- `src/components/mdx/InlineImage.astro` - Inline figure with caption
- `src/components/mdx/FeaturedImage.astro` - Featured image with caption line
- `src/components/mdx/Memorabilia.astro` - Centered memorabilia display

### Pages
- `src/pages/index.astro` - Homepage with all sections
- `src/pages/404.astro` - Error page

### Other
- `public/CNAME` - Custom domain: thecaddiechat.com
- `public/favicon.svg` - Golf flag favicon in SVG
- `scripts/validate-urls.mjs` - URL validation for all 19 routes
- `CLAUDE.md` - Project conventions document

## Decisions Made

- **npm as package manager:** Simplest option for a 2-dependency project, widest GitHub Actions support, zero config
- **thecaddiechat/ directory preserved in-place:** The directory has its own .git repo and is excluded via .gitignore rather than archived to a branch (it was never tracked in the main repo)
- **.gitignore added:** Auto-fixed missing critical file (Rule 2) to exclude build artifacts and the nested original site
- **Lightbox uses data-lightbox attribute:** Images opt in via data-lightbox attribute rather than collecting all images, giving MDX components explicit control
- **ImagePair uses slot pattern:** Wraps child InlineImage components via slot rather than sub-component syntax (not supported in Astro MDX)
- **Hero images reference public/ paths:** Until image assets are moved to src/assets/ in Plan 02, hero component uses string paths

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added .gitignore**
- **Found during:** Task 1
- **Issue:** No .gitignore existed, causing node_modules/, dist/, .astro/, and .DS_Store to show as untracked
- **Fix:** Created .gitignore with standard Astro exclusions plus thecaddiechat/ directory
- **Files modified:** .gitignore
- **Verification:** git status shows clean working tree after staging
- **Committed in:** 7ba882d (Task 1 commit)

**2. [Rule 3 - Blocking] thecaddiechat/ not archived to branch**
- **Found during:** Task 1 Step 1
- **Issue:** Plan specified archiving thecaddiechat/ to original-site branch, but the directory is untracked (has its own .git) and was never part of the main repo's tracked files
- **Fix:** Created original-site branch as a reference point, excluded thecaddiechat/ via .gitignore instead of trying to git rm an untracked directory
- **Impact:** None -- the original site is fully preserved in its own git repo
- **Committed in:** 7ba882d (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (1 missing critical, 1 blocking)
**Impact on plan:** Both fixes were necessary for correct operation. No scope creep.

## Issues Encountered

- `npm create astro` interactive prompt refused to initialize in non-empty directory -- manually created project files instead of using the scaffolding CLI
- Empty content collection warnings during build are expected and harmless (content comes in Plan 02)

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- All layouts and components are ready for Plan 02 content migration
- Content collection schemas are defined and validated (empty collections warn but don't error)
- Directory structure exists for chronicles/, courses/ content and images
- URL validation script is ready to verify all 19 routes after Plan 02 populates content
- Hero component currently uses hardcoded public/ image paths that Plan 02 will update when images move to src/assets/

## Self-Check: PASSED

- All 34 files verified as present on disk
- Both task commits (7ba882d, 87d3436) found in git log
- `npm run build` completes successfully (2 pages built)

---
*Phase: 01-astro-migration*
*Completed: 2026-03-04*
