# Phase 1: Astro Migration - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the existing vanilla HTML/CSS/JS site on Astro with content collections, shared layouts, CI/CD via GitHub Actions, and full URL preservation. Visitors see the same content at the same URLs, now served from a modern Astro build. No visual redesign — this is a foundation migration.

</domain>

<decisions>
## Implementation Decisions

### Project Structure
- Astro project lives at the repo root (package.json, astro.config.mjs, src/ all top-level)
- Existing thecaddiechat/ site archived to an `original-site` git branch, then removed from main
- Generate a CLAUDE.md at repo root with Astro conventions and project coding standards
- Package manager: Claude's discretion (pick best fit)

### Content Collection Design
- **Chronicles**: Rich frontmatter — title, description, date, heroImage, meta line (e.g. "BMW Championship Practice Round"), next/prev navigation links. Body is pure MDX prose with image components.
- **Courses**: Rich frontmatter — title, description, architect, year, location, heroImage, courseNumber. Body uses custom MDX components (`<FullBleed>`, `<ImagePair>`, `<Memorabilia>`, `<InlineImage>`, `<FeaturedImage>`) for the various image layouts.
- **Camera Roll**: Standalone Astro page for now (not a collection). Only one gallery page currently — can become a collection later if needed.
- **Images**: Live in `src/assets/images/` preserving existing folder structure (chronicles/, courses/, etc.) — inside `src/` so Astro's image pipeline can process them in Phase 2.

### Styling Strategy
- Global base CSS file for variables, resets, typography, and shared utilities
- Component-specific styles (nav, hero, cards, article, course layouts) moved into scoped `<style>` blocks in their Astro components
- Preserve all existing CSS custom properties (colors, fonts, spacing) exactly — no cleanup or renaming. Phase 3 (Design Language) handles refinements.
- Course page inline `<style>` blocks absorbed into their respective Astro components

### JavaScript Migration
- Port each JS concern into its owning Astro component (nav toggle → Nav component, scroll reveals → shared script, counter animation → Stats component, lightbox → Lightbox component, hero parallax → Hero component)
- Use Astro `<script>` tags (client-side) rather than a single global script file

### Deploy & URL Strategy
- GitHub Actions deploys to GitHub Pages on push to main
- CNAME file moved to `public/CNAME` so it's included in build output
- `trailingSlash: 'always'` and `output: 'static'` in Astro config — matches existing directory-based URL structure exactly
- All existing URLs preserved without redirects (FNDN-06)
- `/courses/` (index) and `/courses/golden-age-golf/` (trip hub) remain as separate pages

### Claude's Discretion
- Package manager choice (npm vs pnpm)
- Exact Astro component granularity beyond the main layouts (BaseLayout, PageLayout, CardGrid)
- CLAUDE.md content and conventions
- How to structure the golden-age-golf hub page (standalone page vs dynamic route)
- Error page (404) design

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `style.css`: 800+ lines of well-structured CSS with custom properties — the variable system ports directly to global.css
- `main.js`: Self-contained vanilla JS for nav, reveals, counters, parallax, lightbox — each maps cleanly to an Astro component
- HTML structure: Consistent patterns across pages (nav, footer, article-header, content-card, course-hero) — natural component boundaries

### Established Patterns
- `.reveal` class + IntersectionObserver for scroll animations — port as a shared client script
- `.container` wrapper with max-width 1280px — global utility
- `.section-pad` / `.section-pad-lg` spacing classes — global utility
- `.content-card` pattern used on homepage and section indexes — CardGrid component
- `.article-header` + `.article-body` + `.article-nav` — ArticleLayout component
- Course pages use inline `<style>` for page-specific layouts (course-hero, inline-image, full-bleed-image, image-pair, memorabilia, lightbox)

### Integration Points
- Google Fonts import (`Playfair Display` + `DM Sans`) currently in CSS — will need to stay as external import until Phase 2 self-hosts fonts
- CNAME file for thecaddiechat.com custom domain
- GitHub Pages deployment configuration
- 19 HTML pages across 4 sections that all need Astro equivalents

</code_context>

<specifics>
## Specific Ideas

No specific requirements — open to standard Astro approaches. The key constraint is visual parity: the migrated site should look and behave identically to the current site.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 01-astro-migration*
*Context gathered: 2026-03-04*
