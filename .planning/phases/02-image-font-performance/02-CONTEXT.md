# Phase 2: Image & Font Performance - Context

**Gathered:** 2026-03-04
**Status:** Ready for planning

<domain>
## Phase Boundary

Image optimization pipeline generating responsive srcset with WebP/AVIF formats and blur-up placeholders across all pages. Self-hosted fonts replacing the render-blocking Google Fonts import, with no visible flash of unstyled text or layout shift. Camera Roll page migrated from Unsplash placeholders to real photography. Lighthouse performance score 90+ on representative pages.

</domain>

<decisions>
## Implementation Decisions

### Camera Roll Content
- Replace all Unsplash placeholder images with actual photography from user's collection
- Photos will be provided by user into `src/assets/images/camera-roll/`
- Categories (currently International, Cities, PGA Tour) are flexible — restructure based on what photos are provided
- Gallery interaction approach (lightbox vs visual grid) is Claude's discretion based on photo count and existing lightbox component

### Claude's Discretion
- Image loading experience (blur-up, dominant color, skeleton, or other placeholder strategy)
- Hero image strategy (homepage, golden-age-golf, course/chronicle pages — currently raw `<img>` tags)
- Font loading behavior (FOIT vs FOUT vs font-display: optional)
- Responsive image breakpoints and sizes
- Camera Roll category organization based on provided photos
- Camera Roll gallery interaction pattern (lightbox exists in codebase via Lightbox.astro)

</decisions>

<specifics>
## Specific Ideas

- User will add their actual Camera Roll photography to `src/assets/images/camera-roll/` before or during execution — plan should account for a photo handoff step
- Current Unsplash URLs are purely placeholder — no attachment to those specific images or categories

</specifics>

<code_context>
## Existing Code Insights

### Reusable Assets
- `InlineImage.astro`, `FullBleed.astro`, `FeaturedImage.astro`, `ImagePair.astro`, `Memorabilia.astro`: Already use `import { Image } from 'astro:assets'` — partial optimization exists for MDX content
- `Lightbox.astro`: Existing lightbox component with `data-lightbox` attribute pattern — reusable for Camera Roll
- `content.config.ts`: Content collections already use `image()` schema type for heroImage fields

### Established Patterns
- MDX image components accept `ImageMetadata` props and render via Astro `<Image>` — this pattern should extend to any new image handling
- Hero component (Hero.astro) uses hardcoded `<img src="/assets/images/...">` — needs migration to Astro Image
- Homepage index.astro and golden-age-golf/index.astro also use raw `<img>` tags for standalone images
- CSS custom properties `--font-display` and `--font-body` reference Playfair Display and DM Sans — font swap must preserve these variable names

### Integration Points
- `src/styles/global.css` line 6: Google Fonts `@import` to be replaced with self-hosted `@font-face` declarations
- `src/pages/camera-roll/index.astro`: Complete rewrite from external URLs to local Astro Image components
- `Hero.astro`: Migrate from raw `<img>` to Astro `<Image>` with priority loading
- 96 images across `src/assets/images/` (chronicles/ and courses/) already positioned for pipeline processing

</code_context>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02-image-font-performance*
*Context gathered: 2026-03-04*
