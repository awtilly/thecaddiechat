# Phase 2: Image & Font Performance - Research

**Researched:** 2026-03-04
**Domain:** Astro image optimization pipeline, font self-hosting, responsive images
**Confidence:** HIGH

## Summary

This phase has two clear workstreams: (1) migrating all images to use Astro's built-in `<Image>` and `<Picture>` components with responsive srcset, modern formats (WebP/AVIF), and layout-aware sizing; and (2) replacing the render-blocking Google Fonts `@import` in `global.css` with self-hosted `@font-face` declarations using Fontsource. A third workstream is the Camera Roll page rewrite from Unsplash placeholder URLs to the 133 real photographs already present in `src/assets/images/camera-roll/`.

The project is running Astro 5.18.0, which includes the **stable** responsive images feature (shipped in 5.10.0). This means `layout`, `widths`, `priority`, `fit`, and `position` props are all available on `<Image>` and `<Picture>` without any experimental flags. The MDX image components (InlineImage, FullBleed, FeaturedImage, Memorabilia) already use `import { Image } from 'astro:assets'` -- they just need the `layout` prop and format configuration added. The bigger effort is fixing the 12+ instances of raw `<img>` tags across Hero.astro, homepage, golden-age-golf, CourseLayout, ArticleLayout, and listing card components.

**Primary recommendation:** Enable responsive images globally via `image.layout: 'constrained'` and `image.responsiveStyles: true` in `astro.config.mjs`, use `<Picture>` with `formats={['avif', 'webp']}` for all image components, install Fontsource packages for Playfair Display and DM Sans, and rewrite the Camera Roll page to use a grid of Astro `<Image>` components with the existing Lightbox.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Replace all Unsplash placeholder images with actual photography from user's collection
- Photos will be provided by user into `src/assets/images/camera-roll/`
- Categories (currently International, Cities, PGA Tour) are flexible -- restructure based on what photos are provided

### Claude's Discretion
- Image loading experience (blur-up, dominant color, skeleton, or other placeholder strategy)
- Hero image strategy (homepage, golden-age-golf, course/chronicle pages -- currently raw `<img>` tags)
- Font loading behavior (FOIT vs FOUT vs font-display: optional)
- Responsive image breakpoints and sizes
- Camera Roll category organization based on provided photos
- Camera Roll gallery interaction pattern (lightbox exists in codebase via Lightbox.astro)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FNDN-03 | Image optimization pipeline generating responsive srcset, WebP/AVIF formats, and blur-up placeholders | Astro 5.18 `<Picture>` component with `formats={['avif', 'webp']}`, `layout` prop for automatic srcset/sizes generation, CSS blur-up placeholder via low-quality inline data URI |
| FNDN-04 | Fonts self-hosted (eliminate Google Fonts render-blocking import) | Fontsource variable font packages for Playfair Display and DM Sans with `font-display: swap`, preload critical font files |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` (built-in) | 5.18.0 (installed) | `<Image>`, `<Picture>`, `getImage()` from `astro:assets` | Native Astro image pipeline, zero additional dependencies, Sharp-based processing |
| `@fontsource-variable/playfair-display` | latest | Self-hosted Playfair Display variable font (woff2) | Fontsource is the standard for self-hosting Google Fonts in modern JS frameworks; variable font covers all needed weights (400-700) and italic in one file |
| `@fontsource-variable/dm-sans` | latest | Self-hosted DM Sans variable font (woff2) | Same approach; variable font covers weights 300-600 + italic in one file |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `sharp` | (Astro dependency) | Image processing engine | Already included with Astro; handles WebP/AVIF conversion, resizing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Fontsource packages | Manual woff2 files from google-webfonts-helper | Fontsource has better Astro integration (import auto-generates @font-face), maintained package updates; manual download is more work for same result |
| Astro `<Picture>` | `@unpic/astro` | Unpic is for remote/CDN images; local images are better served by Astro's native pipeline |
| CSS blur-up placeholder | `astro-imagetools` | Third-party; Astro's built-in pipeline handles 95% of needs without extra dependency |

**Installation:**
```bash
npm install @fontsource-variable/playfair-display @fontsource-variable/dm-sans
```

No other packages needed. Astro's image pipeline and Sharp are already installed.

## Architecture Patterns

### Image Component Migration Map

Every raw `<img>` in the codebase must be migrated. Here is the complete inventory:

| Component/Page | Current Pattern | Migration Target | Priority |
|----------------|----------------|------------------|----------|
| `Hero.astro` | `<img src="/assets/images/...">` hardcoded path | `<Picture>` with `priority` prop, `layout="full-width"` | HIGH (broken path, above-fold) |
| `index.astro` intro-image | `<img src="/assets/images/...">` hardcoded path | `<Image>` with import, `layout="constrained"` | HIGH (broken path, above-fold) |
| `index.astro` ContentCard images | `image="/assets/images/..."` string prop | Refactor to accept `ImageMetadata`, use `<Image>` | HIGH (broken paths) |
| `golden-age-golf/index.astro` | `<img src="/assets/images/...">` hardcoded path | `<Picture>` with import, `layout="full-width"` | HIGH (broken path, above-fold) |
| `CourseLayout.astro` hero | `<img src={heroImage.src}>` bypassing optimization | `<Image>` component with `priority`, `layout="full-width"` | HIGH (above-fold, bypasses format conversion) |
| `ArticleLayout.astro` hero | `<img src={heroImage.src}>` bypassing optimization | `<Image>` component with `priority`, `layout="constrained"` | HIGH (above-fold) |
| `ContentCard.astro` | `<img src={image}>` string prop | Accept `ImageMetadata`, use `<Image>` with `layout="constrained"` | MEDIUM |
| `FeaturedPost.astro` | `<img src={image}>` string prop | Accept `ImageMetadata`, use `<Image>` with `layout="constrained"` | MEDIUM |
| `PostCard.astro` | `<img src={image}>` string prop | Accept `ImageMetadata`, use `<Image>` with `layout="constrained"` | MEDIUM |
| `CourseItem.astro` | `<img src={image}>` string prop | Accept `ImageMetadata`, use `<Image>` with `layout="constrained"` | MEDIUM |
| `camera-roll/index.astro` | External Unsplash URLs | Local imports + `<Image>` gallery | HIGH (complete rewrite) |
| `Lightbox.astro` | `<img>` for display (expected) | Keep raw `<img>` -- lightbox displays full-res src at runtime | LOW (keep as-is) |
| MDX components (5) | Already use `<Image>` from `astro:assets` | Add `layout="constrained"` prop | LOW (already partially optimized) |

### Recommended Astro Config Changes
```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://thecaddiechat.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [mdx()],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
});
```

### Pattern 1: Hero/Above-Fold Images with Picture Component
**What:** Use `<Picture>` for hero images to serve AVIF > WebP > JPEG fallback chain with responsive srcset
**When to use:** Full-width hero banners, large featured images above the fold
**Example:**
```astro
---
// Source: https://docs.astro.build/en/reference/modules/astro-assets/
import { Picture } from 'astro:assets';
import heroImage from '../assets/images/courses/friars-head/hero-clubhouse-bluff.jpg';
---
<Picture
  src={heroImage}
  alt="Friar's Head clubhouse perched on the bluff at golden hour"
  formats={['avif', 'webp']}
  layout="full-width"
  priority
/>
```

The `priority` prop (added in astro@5.10.0) automatically sets `loading="eager"`, `decoding="sync"`, and `fetchpriority="high"` -- exactly what above-fold hero images need.

### Pattern 2: Content/Card Images with Constrained Layout
**What:** Use `<Image>` with `layout="constrained"` for images in cards, inline content, and thumbnails
**When to use:** Any image that should scale down but not exceed its natural size
**Example:**
```astro
---
// Source: https://docs.astro.build/en/guides/images/
import { Image } from 'astro:assets';

interface Props {
  src: ImageMetadata;
  alt: string;
}
const { src, alt } = Astro.props;
---
<Image
  src={src}
  alt={alt}
  layout="constrained"
  loading="lazy"
/>
```

### Pattern 3: Passing ImageMetadata Through Components
**What:** Card components need to accept `ImageMetadata` instead of string URLs
**When to use:** ContentCard, PostCard, FeaturedPost, CourseItem -- all listing components
**Example:**
```astro
---
// ContentCard.astro - BEFORE
interface Props {
  image: string;  // was a URL string
}
---
<img src={image} alt={title} loading="lazy">

---
// ContentCard.astro - AFTER
import { Image } from 'astro:assets';
interface Props {
  image: ImageMetadata;  // now typed ImageMetadata
}
---
<Image src={image} alt={title} layout="constrained" loading="lazy" />
```

Callers must pass the full ImageMetadata object:
```astro
<!-- BEFORE: string path -->
<ContentCard image={course.data.heroImage.src} ... />

<!-- AFTER: ImageMetadata object -->
<ContentCard image={course.data.heroImage} ... />
```

### Pattern 4: Camera Roll Gallery with Bulk Imports
**What:** Import many images from a directory for the gallery page
**When to use:** Camera Roll page with 133 images
**Example:**
```astro
---
import { Image } from 'astro:assets';

// Import all images from camera-roll directory using glob
const cameraRollImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/camera-roll/*.jpg',
  { eager: true }
);

// Convert to sorted array
const images = Object.entries(cameraRollImages)
  .map(([path, module]) => ({
    src: module.default,
    filename: path.split('/').pop()?.replace('.jpg', '') || '',
  }))
  .sort((a, b) => a.filename.localeCompare(b.filename));
---
```

### Pattern 5: Font Self-Hosting via Fontsource
**What:** Replace Google Fonts @import with Fontsource variable font packages
**When to use:** Any project migrating from Google Fonts CDN to self-hosted
**Example:**
```astro
---
// In BaseLayout.astro (loaded on every page)
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/dm-sans';
---
```

```css
/* In global.css - REMOVE this line: */
/* @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&display=swap'); */

/* UPDATE font-family references: */
:root {
  --font-display: 'Playfair Display Variable', Georgia, serif;
  --font-body: 'DM Sans Variable', -apple-system, sans-serif;
}
```

Note: Variable font family names use "Variable" suffix per Fontsource convention.

### Anti-Patterns to Avoid
- **Passing heroImage.src to components:** This extracts the processed URL string and bypasses Astro's `<Image>` optimization. Always pass the full `ImageMetadata` object.
- **Using `public/` for images that need optimization:** Images in `public/` are served as-is, no format conversion or resizing. All optimizable images belong in `src/assets/images/`.
- **Hardcoded `/assets/images/...` paths in components:** These don't resolve to anything in the build (no `public/assets/images/` exists). Must use imports from `src/assets/images/`.
- **Preloading all fonts:** Only preload the two critical font files (regular weight for each family). Let other weights/styles load normally.
- **Using `@import` for Google Fonts in CSS:** This is render-blocking. Fontsource bundles fonts with the build, eliminating the network request entirely.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Responsive image srcset | Manual `<picture>` with hand-written srcsets and media queries | Astro `<Picture>` with `layout` prop | Astro auto-generates optimal breakpoints, handles format negotiation, generates correct `sizes` attributes |
| WebP/AVIF conversion | ImageMagick scripts or custom Sharp pipelines | Astro's built-in image service (Sharp) | Already configured, handles caching in `node_modules/.astro`, produces optimized output at build time |
| Font subsetting | Custom fonttools scripts to subset fonts | Fontsource variable font packages | Fontsource ships pre-optimized woff2 files with latin subset; variable fonts eliminate need for per-weight files |
| Blur-up placeholders | Custom build step to generate tiny base64 thumbnails | CSS blur technique with Astro's generated low-res srcset variants | Astro generates multiple widths; smallest can serve as blur-up source. Alternatively use `background-color` with dominant color |
| Image gallery grid | Custom masonry/grid logic for Camera Roll | CSS Grid with `aspect-ratio` + Astro `<Image>` | CSS Grid handles responsive layouts natively; Astro handles image optimization |

**Key insight:** Astro 5.18 has all the image optimization primitives built in. The work is purely about wiring existing components to use them correctly, not building new infrastructure.

## Common Pitfalls

### Pitfall 1: heroImage.src Bypasses Optimization
**What goes wrong:** The CourseLayout and ArticleLayout currently render `<img src={heroImage.src}>`. Even though `heroImage` is an `ImageMetadata` object from the content collection schema, extracting `.src` gives only the processed URL string -- no srcset, no format conversion, no responsive sizing.
**Why it happens:** The content collection `image()` schema correctly resolves frontmatter image paths to ImageMetadata objects. But the layout templates destructure only `.src` and render a plain `<img>`.
**How to avoid:** Pass the entire `heroImage` object to `<Image>` or `<Picture>`. The component handles everything.
**Warning signs:** Built HTML shows `<img src="/_astro/hero.hash.jpg">` with no `srcset` attribute.

### Pitfall 2: Broken Hardcoded Image Paths
**What goes wrong:** Hero.astro, homepage, and golden-age-golf use paths like `src="/assets/images/courses/friars-head/hero-clubhouse-bluff.jpg"`. There is no `public/assets/images/` directory, so these return 404 in production.
**Why it happens:** These paths were written as if images lived in `public/`, but all images were placed in `src/assets/images/` during Phase 1 migration.
**How to avoid:** Import images from `src/assets/images/` and pass them to `<Image>` or `<Picture>` components.
**Warning signs:** Browser DevTools shows 404 for image requests on homepage and golden-age-golf page.

### Pitfall 3: Camera Roll Build Time with 133 Large Images
**What goes wrong:** 507MB of camera roll images (many 3000-5000px wide, 3-6MB each) will dramatically increase build time when processed through Sharp.
**Why it happens:** Astro processes every image at every breakpoint at build time for static sites. With `layout="constrained"` and default breakpoints `[640, 750, 828, 1080, 1280, 1668, 2048, 2560]`, that's up to 8 variants per image times 133 images = 1,064 image processing operations.
**How to avoid:** Use a more limited set of widths for gallery thumbnails: `widths={[400, 800, 1200]}` and `sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"`. Only generate full-size variants for the lightbox view. Consider whether the user might want to reduce source image resolution before import.
**Warning signs:** `npm run build` takes more than 5 minutes.

### Pitfall 4: Fontsource Variable Font Family Name
**What goes wrong:** After switching to Fontsource, text renders in fallback fonts because the CSS custom property still references `'Playfair Display'` but the variable font registers as `'Playfair Display Variable'`.
**Why it happens:** Fontsource variable font packages use a different font-family name than the static versions. The `Variable` suffix distinguishes them.
**How to avoid:** Update the CSS custom properties in `:root` to use the Variable font names. Test visually after the change.
**Warning signs:** Text renders in Georgia/system sans-serif instead of the custom fonts.

### Pitfall 5: Lightbox Src Mismatch After Image Optimization
**What goes wrong:** The Lightbox component collects image `src` values from the DOM at runtime. After migrating to `<Image>`/`<Picture>`, the rendered `src` becomes a hashed `/_astro/` path. If the lightbox tries to use the original path, it fails.
**Why it happens:** The lightbox reads `imgEl.src` from the DOM, which should still work since it reads the rendered attribute. But if `<Picture>` is used, the visible `<img>` inside the `<picture>` element is what gets the hash path, and that should work fine.
**How to avoid:** Verify lightbox still works after migration. The `data-lightbox` attribute pattern should continue to work since the lightbox queries `img[data-lightbox]` and reads the rendered `.src` property.
**Warning signs:** Lightbox opens but shows broken image or wrong resolution.

### Pitfall 6: Font-Display and Layout Shift
**What goes wrong:** Using `font-display: swap` causes visible text reflow (FOUT) when the custom font loads and has different metrics than the fallback.
**Why it happens:** Playfair Display (serif) and Georgia (fallback) have different x-heights, letter spacing, and line heights. When the web font loads, text reflows.
**How to avoid:** Fontsource uses `font-display: swap` by default, which is the recommended approach (visible text immediately, swap when loaded). To further minimize CLS: preload the two critical font files (regular weight for each family) in `<head>`. The small CLS from font swap is acceptable -- it's far better than invisible text (FOIT).
**Warning signs:** Lighthouse reports CLS > 0.1 attributed to font loading.

## Code Examples

### Complete Hero.astro Migration
```astro
---
// Source: https://docs.astro.build/en/reference/modules/astro-assets/
import { Picture } from 'astro:assets';
import heroImg from '../assets/images/courses/friars-head/hero-clubhouse-bluff.jpg';
---
<section class="hero">
  <div class="hero-bg">
    <Picture
      src={heroImg}
      alt="Friar's Head clubhouse perched on the bluff at golden hour"
      formats={['avif', 'webp']}
      layout="full-width"
      priority
    />
  </div>
  <!-- rest of hero content unchanged -->
</section>
```

### Complete CourseLayout Hero Migration
```astro
---
import { Image } from 'astro:assets';
// heroImage is already ImageMetadata from content collection schema
const { heroImage, title } = Astro.props;
---
{heroImage && (
  <div class="course-hero-image">
    <Image
      src={heroImage}
      alt={title}
      layout="full-width"
      priority
    />
  </div>
)}
```

### Font Migration in BaseLayout.astro
```astro
---
// BaseLayout.astro
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/dm-sans';
---
<html lang="en">
  <head>
    <!-- Fontsource injects @font-face rules automatically -->
    <!-- Preload critical font files for faster rendering -->
    <slot name="head" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

### Camera Roll Glob Import Pattern
```astro
---
import { Image } from 'astro:assets';

// Glob import all camera roll images
const allImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/camera-roll/*.jpg',
  { eager: true }
);

// Group by film roll prefix (first 9 digits)
const rolls = new Map<string, { src: ImageMetadata; filename: string }[]>();
for (const [path, module] of Object.entries(allImages)) {
  const filename = path.split('/').pop()!.replace('.jpg', '');
  const rollId = filename.substring(0, 9);
  if (!rolls.has(rollId)) rolls.set(rollId, []);
  rolls.get(rollId)!.push({ src: module.default, filename });
}

// Sort each roll's images by filename
for (const images of rolls.values()) {
  images.sort((a, b) => a.filename.localeCompare(b.filename));
}
---
```

Note: The 133 camera roll images have filenames like `000001740001.jpg` through `000900120037.jpg`. The first 9 digits appear to be roll/collection IDs:
- `000001740` = 37 images
- `000127100` = 35 images
- `000609500` / `000609510` = 22 images (possibly same roll)
- `000900120` = 37 images

This natural grouping can serve as the gallery's category structure.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `experimental.responsiveImages` flag | Stable `image.layout` config | Astro 5.10.0 (2025) | No experimental flag needed; layout/priority/fit props are stable API |
| `<Image>` only outputs single format | `<Picture>` outputs AVIF + WebP + fallback | Astro 3.x+ | Multi-format delivery with automatic browser negotiation |
| Manual `widths` + `sizes` on every image | `layout` prop auto-generates srcset/sizes | Astro 5.10.0 | Dramatically simpler responsive image code |
| Google Fonts `@import` in CSS | Fontsource npm packages | 2023+ standard | Eliminates render-blocking third-party request, fonts bundled with build |
| Static font files per weight | Variable fonts (single woff2 per family) | Google Fonts v2 / Fontsource | Smaller total download, continuous weight range, fewer HTTP requests |

**Deprecated/outdated:**
- `@astrojs/image` integration: Removed in Astro 3.0; use built-in `astro:assets` instead
- `experimental.assets`: Graduated to stable in Astro 3.0
- `experimental.responsiveImages`: Graduated to stable in Astro 5.10.0

## Open Questions

1. **Camera Roll category labels**
   - What we know: Images group into 4 film rolls by filename prefix (37, 35, 22, 37 images)
   - What's unclear: What subject/location each roll represents (user hasn't provided category metadata)
   - Recommendation: During execution, ask user to name each roll or use generic "Roll 1", "Roll 2" labels. Plan should include a handoff step for category naming.

2. **Camera Roll image quality and resolution**
   - What we know: Source images are ~3130x2075px, 3-6MB each. Total 507MB. These are film scans (Noritsu scanner EXIF data).
   - What's unclear: Whether user wants to serve them at full resolution in lightbox, or if downscaling is acceptable
   - Recommendation: Generate gallery thumbnails at max 1200px wide, serve original resolution only in lightbox. This balances quality with build time.

3. **Build time impact**
   - What we know: 133 camera roll images + 96 existing images = 229 total images to process
   - What's unclear: Exact build time on the deployment machine (GitHub Actions)
   - Recommendation: Monitor build time after implementation. If it exceeds 5 minutes, consider reducing breakpoint count or pre-optimizing source images.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Astro build validation (no separate test framework) |
| Config file | `astro.config.mjs` |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npm run validate-urls` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FNDN-03a | Images serve responsive srcset | smoke | `npm run build && grep -l 'srcset=' dist/**/*.html` | Wave 0: script needed |
| FNDN-03b | WebP/AVIF formats generated | smoke | `npm run build && ls dist/_astro/*.avif dist/_astro/*.webp \| wc -l` | Wave 0: script needed |
| FNDN-03c | No raw `<img src="/assets/images` in output | regression | `npm run build && ! grep -r 'src="/assets/images' dist/` | Wave 0: script needed |
| FNDN-03d | No external Unsplash URLs in output | regression | `npm run build && ! grep -r 'unsplash.com' dist/` | Wave 0: script needed |
| FNDN-04a | No Google Fonts import in output | regression | `npm run build && ! grep -r 'fonts.googleapis.com' dist/` | Wave 0: script needed |
| FNDN-04b | Font files are self-hosted in build | smoke | `npm run build && ls dist/_astro/*.woff2 \| wc -l` | Wave 0: script needed |
| PERF-01 | Lighthouse performance 90+ | manual | Run Lighthouse on deployed site | Manual only |
| URL-01 | All 19 URLs preserved | regression | `npm run validate-urls` | Exists |

### Sampling Rate
- **Per task commit:** `npm run build` (validates schema, routes, rendering)
- **Per wave merge:** `npm run build && npm run validate-urls`
- **Phase gate:** Full build + URL validation + manual Lighthouse check

### Wave 0 Gaps
- [ ] `scripts/validate-images.mjs` -- validates FNDN-03a through FNDN-03d and FNDN-04a/b after build
- [ ] No framework install needed -- validation uses build output inspection

## Sources

### Primary (HIGH confidence)
- [Astro Images Guide](https://docs.astro.build/en/guides/images/) -- Image/Picture component usage, responsive images, format support
- [Astro Image API Reference](https://docs.astro.build/en/reference/modules/astro-assets/) -- Complete props reference for Image/Picture, layout types, priority, getImage()
- [Astro Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/) -- image.layout, image.responsiveStyles, image.breakpoints config
- [Astro 5.10 Blog Post](https://astro.build/blog/astro-5100/) -- Responsive images stable release, priority prop, fit/position props
- [Astro Fonts Guide](https://docs.astro.build/en/guides/fonts/) -- Self-hosting fonts, @font-face, preloading
- [Fontsource Playfair Display](https://fontsource.org/fonts/playfair-display/install) -- Package name, variable font axes, CSS family name
- [Fontsource DM Sans](https://fontsource.org/fonts/dm-sans/install) -- Package name, variable font axes, CSS family name

### Secondary (MEDIUM confidence)
- [@fontsource-variable/playfair-display npm](https://www.npmjs.com/package/@fontsource-variable/playfair-display) -- Package version, import syntax
- [@fontsource-variable/dm-sans npm](https://www.npmjs.com/package/@fontsource-variable/dm-sans) -- Package version, import syntax
- [Astro Responsive Images Reference](https://docs.astro.build/en/reference/experimental-flags/responsive-images/) -- Layout options details (note: page title still says "experimental" but feature is stable in 5.10+)

### Tertiary (LOW confidence)
- Camera roll image grouping by filename prefix -- inferred from file listing, not confirmed by user

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- Astro built-in image pipeline is well-documented and stable at 5.18.0; Fontsource is the standard approach for self-hosted fonts
- Architecture: HIGH -- Image component patterns verified against official Astro docs; migration map based on direct codebase inspection
- Pitfalls: HIGH -- Broken image paths confirmed by inspecting built output; font naming conventions verified via Fontsource docs
- Camera Roll: MEDIUM -- File structure and grouping inferred from filenames; category organization requires user input

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (Astro image API is stable; 30-day window is conservative)
