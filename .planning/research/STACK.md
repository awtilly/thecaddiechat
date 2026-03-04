# Technology Stack

**Project:** The Caddie Chat — Immersive Content/Portfolio Website Rebuild
**Researched:** 2026-03-04
**Research Mode:** Ecosystem (Stack dimension)

> **Note on verification:** Web search and WebFetch tools were unavailable during this research. All version numbers and recommendations are based on training data (cutoff May 2025). Versions should be verified against npm/official docs before installation. Confidence levels reflect this limitation.

---

## Recommended Stack

### Core Framework

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Astro** | ^5.x | Static site generator, page framework | Purpose-built for content sites. Ships zero JS by default, which is critical for a photography-heavy site where every KB matters. "Islands architecture" lets you sprinkle interactivity (animations, galleries) without the overhead of a full SPA. Outputs static HTML that deploys directly to GitHub Pages. Content Collections give you typed, file-based content management without a CMS. The existing ~19 HTML pages map perfectly to Astro's file-based routing. | MEDIUM — v5 was in development as of training cutoff; verify current stable version |
| **Astro + GitHub Pages adapter** | `@astrojs/sitemap` | Deployment | Astro has first-class static output (`output: 'static'`), which is the default. No adapter needed for GitHub Pages — just build and deploy the `dist/` folder. GitHub Actions workflow handles the build. | HIGH |

**Why Astro over alternatives:**

| Considered | Why Not |
|------------|---------|
| **Next.js** | Overkill. Next is a React framework designed for web apps with server-side rendering, API routes, and dynamic data. This is a content site with 19 static pages. Next would add React's runtime (~40KB min), hydration overhead, and complexity (App Router, Server Components) that deliver zero value here. |
| **Gatsby** | Declining ecosystem. GraphQL data layer adds unnecessary complexity for a site this size. Plugin ecosystem has stagnated. Community has largely moved to Astro or Next. |
| **Hugo / 11ty** | Both are excellent SSGs, but lack Astro's component model. Hugo uses Go templates (unfamiliar DX). 11ty is closer but doesn't have Astro's island architecture for selective hydration of interactive components (lightboxes, animated galleries). |
| **Vanilla HTML (upgrade in place)** | Could work for animations (just add GSAP), but the 19 pages share nav, footer, head tags — massive duplication. No component reuse, no image optimization pipeline, no content collections. Every shared element change requires editing 19 files. |
| **SvelteKit** | Good framework, but its strengths (reactive state, stores, transitions) are overkill for mostly-static content pages. Astro can use Svelte components as islands if needed. |

### Animation & Interaction

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **GSAP** (GreenSock) | ^3.12 | Core animation engine | The undisputed standard for professional web animation. Used by Apple, Nike, Awwwards winners. Nothing else matches its performance, timeline control, and scroll-driven animation capabilities. The `ScrollTrigger` plugin is specifically what makes "cinematic" scroll experiences possible. Free for non-commercial use (this qualifies). | HIGH |
| **GSAP ScrollTrigger** | (bundled with GSAP) | Scroll-driven animations | Parallax, reveal-on-scroll, pinning sections, scrub-based animations. This replaces the existing IntersectionObserver code with something far more powerful and precise. Handles all the "cinematic feel" requirements: parallax hero, staggered reveals, scroll-linked opacity/transforms. | HIGH |
| **GSAP ScrollSmoother** | (GSAP premium plugin) | Smooth scroll wrapper | Creates the buttery-smooth scroll feel seen on premium portfolio sites. Normalizes scroll across browsers and devices. **Note:** This is a premium/Club GSAP plugin. Evaluate whether the free ScrollTrigger alone achieves the desired feel before committing to the paid tier. | MEDIUM — licensing needs verification |

**Why GSAP over alternatives:**

| Considered | Why Not |
|------------|---------|
| **Framer Motion** | React-only. Not usable with Astro's zero-JS-by-default philosophy without hydrating everything. Great for React apps, wrong tool for content sites. |
| **Motion One / Motion** | Lighter alternative, but lacks ScrollTrigger's power. No scroll-scrubbing, no pinning, no timeline sequencing. Good for simple entrance animations, insufficient for "cinematic" scroll experiences. |
| **Lenis** | Smooth scroll library only — not an animation engine. Could complement GSAP but adds another dependency. GSAP ScrollSmoother covers this if using Club GSAP. **If staying free-tier GSAP, Lenis is a good addition for smooth scrolling.** |
| **CSS scroll-driven animations** | Emerging browser API (scroll-timeline). Not yet universally supported. Cannot achieve the complex sequenced effects GSAP handles. Good for simple parallax in the future, not ready for production cinematic experiences. |
| **Locomotive Scroll** | Was popular 2020-2022, has fallen behind. Maintenance has slowed. GSAP ScrollTrigger does everything it did, better. |

### Image Optimization

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Astro `<Image />` component** | (built into Astro) | Automatic image optimization | Astro's built-in image component handles responsive srcsets, WebP/AVIF conversion, lazy loading, and width/height attributes (preventing CLS). This is critical — the site is photography-heavy and currently serves unoptimized full-size images. | HIGH |
| **`astro:assets`** | (built into Astro) | Image import and processing pipeline | Processes images at build time. Generates multiple sizes, modern formats. No runtime cost. Works with Sharp under the hood. | HIGH |
| **Sharp** | (Astro dependency) | Image processing engine | Installed automatically with Astro. Handles the actual WebP/AVIF encoding, resizing. Fastest Node.js image processor. | HIGH |

**This is the single biggest performance win.** The current site loads full-resolution JPEGs directly. Astro's image pipeline will dramatically reduce payload without any manual work.

### CSS & Styling

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Vanilla CSS with custom properties** | — | Core styling | The existing CSS is well-structured with custom properties (design tokens). No reason to add a CSS framework or utility library. Astro scopes component CSS automatically. Keep the existing approach, modernize with `@layer`, nesting (now widely supported), and `container` queries. | HIGH |
| **Google Fonts (self-hosted)** | — | Typography | Currently loading Playfair Display + DM Sans from Google Fonts CDN. Self-host via `fontsource` packages for better performance (no external DNS lookup, no render-blocking request). | HIGH |
| **`@fontsource/playfair-display`** | latest | Display/heading font | Self-hosted version of current font. Import only needed weights. | HIGH |
| **`@fontsource/dm-sans`** | latest | Body font | Self-hosted version of current font. | HIGH |

**Why no Tailwind:**

Tailwind is excellent for component-heavy web apps where many developers touch the same codebase. For a single-developer content site with an established design language (custom properties, consistent spacing scale), Tailwind adds build complexity and a learning curve without proportional benefit. The existing CSS custom property system is clean and maintainable.

### Content Management

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Astro Content Collections** | (built into Astro) | Structured content with type safety | Define schemas for Chronicles, Courses, Camera Roll. Get TypeScript validation, frontmatter typing, and query APIs. Content lives as Markdown/MDX files in `src/content/`. | HIGH |
| **MDX** | `@astrojs/mdx` | Rich content with components | Lets story pages use custom components (pull quotes, image grids, full-bleed photos) inside Markdown. Write prose in Markdown, embed interactive elements where needed. | HIGH |

**Why file-based content, not a headless CMS:**

The project explicitly says "content stays as files for now" and is out-of-scope for CMS integration. Astro Content Collections give CMS-like structure (schemas, validation, querying) with zero infrastructure. If a CMS is desired later, Astro integrates with Storyblok, Contentful, Sanity — but that is a future decision.

### View Transitions

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Astro View Transitions** | `astro:transitions` | Page transition animations | Built-in to Astro. Uses the native View Transitions API with a fallback for unsupported browsers. Enables cinematic cross-page transitions (hero image morphing between list and detail view, nav persisting across pages) without a SPA framework. This directly addresses the "page transitions between sections" requirement. | HIGH |

This is a major differentiator for Astro in this use case. No other SSG offers built-in cross-page transitions with this level of polish.

### Lightbox / Gallery

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **GLightbox** | ^3.3 | Fullscreen image viewing | Lightweight (~10KB), no dependencies, touch-friendly. For the Camera Roll and course photography galleries. Supports swipe, zoom, captions. | MEDIUM — verify latest version |

**Alternatives considered:**

| Library | Why Not |
|---------|---------|
| **PhotoSwipe** | More features but heavier (~20KB). Overkill for this use case. |
| **Fancybox** | jQuery legacy, commercial license requirements. |
| **Custom lightbox** | Unnecessary work when GLightbox covers the requirements. |

### Build & Deploy

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Vite** | (bundled with Astro) | Build tool / dev server | Astro uses Vite internally. Instant HMR in development, optimized production builds. No configuration needed. | HIGH |
| **GitHub Actions** | — | CI/CD pipeline | Automated build + deploy to GitHub Pages on push. Astro has an official GitHub Pages deployment guide. The workflow builds the static site and deploys `dist/` to the `gh-pages` branch or via GitHub Pages artifact. | HIGH |
| **pnpm** | ^9.x | Package manager | Faster than npm, strict dependency resolution, disk-efficient. Better for a project that will accumulate animation/image dependencies. | MEDIUM — npm works fine too, pnpm is a preference |

### Development Quality

| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **TypeScript** | ^5.x | Type safety for components and content schemas | Astro has first-class TypeScript support. Content Collections use TypeScript schemas (via Zod) to validate frontmatter. Catches errors at build time. | HIGH |
| **Prettier** | ^3.x | Code formatting | Consistent formatting across .astro, .mdx, .css, .ts files. Use `prettier-plugin-astro` for .astro file support. | HIGH |

---

## Supporting Libraries (Use As Needed)

| Library | Version | Purpose | When to Use | Confidence |
|---------|---------|---------|-------------|------------|
| **Lenis** | ^1.x | Smooth scroll | If not using GSAP ScrollSmoother (paid). Lenis + GSAP ScrollTrigger is the standard free-tier combo for smooth, cinematic scrolling. | MEDIUM |
| **Swiper** | ^11.x | Touch-friendly carousels/sliders | If any content sections need horizontal scrolling (e.g., course photo carousels). Don't use unless actually needed. | MEDIUM |
| **@vercel/og** or **satori** | latest | Open Graph image generation | For auto-generating social share images for each story/course. Nice-to-have, not MVP. | LOW |
| **astro-icon** | ^1.x | SVG icon component | Clean way to use SVG icons in Astro components. Better than inline SVG strings. | MEDIUM |

---

## What NOT to Use

| Technology | Why Not |
|------------|---------|
| **React / Vue / Svelte (as primary)** | No SPA framework needed. Astro renders everything at build time. If a specific interactive widget needs a framework, use Astro islands to hydrate only that component — but start with vanilla JS + GSAP first. |
| **Tailwind CSS** | Adds complexity without proportional value for a solo-dev content site with an established design system. The existing CSS custom properties are clean and maintainable. |
| **jQuery** | 2025. No. |
| **Webpack** | Vite (bundled with Astro) is strictly better for this use case. |
| **Three.js / WebGL** | Tempting for "wow factor" but wrong for a photography content site. Heavy runtime, poor mobile performance, accessibility nightmare. The photography IS the visual impact — don't compete with it using 3D effects. |
| **Contentful / Sanity / Strapi** | Out of scope per project requirements. Content stays as files. |
| **animate.css / AOS** | Basic CSS animation libraries that GSAP completely supersedes. AOS is effectively what the current IntersectionObserver code does — GSAP ScrollTrigger replaces it with far more control. |
| **Bootstrap / Foundation** | CSS frameworks solving problems this site doesn't have. The existing CSS is purpose-built and better. |
| **Sass / Less** | CSS nesting is now natively supported in browsers. Custom properties handle theming. Sass adds a build step for features CSS now has natively. |

---

## Architecture Overview

```
thecaddiechat/
  src/
    components/        # Shared UI (Nav, Footer, Hero, ImageGrid, PullQuote)
    layouts/           # Page shells (BaseLayout, ArticleLayout, GalleryLayout)
    content/
      chronicles/      # MDX files with frontmatter (title, date, hero, tags)
      courses/         # MDX files with course data (name, architect, year, images)
      camera-roll/     # MDX or data files for photo collections
    pages/             # File-based routing (mirrors current URL structure)
      index.astro
      chronicles/
        index.astro
        [slug].astro   # Dynamic route from content collection
      courses/
        index.astro
        golden-age-golf/index.astro
        [slug].astro
      camera-roll/
        index.astro
    styles/
      global.css       # Design tokens, reset, base styles
      animations.css   # GSAP-related utility classes
    scripts/
      animations.ts    # GSAP ScrollTrigger setup, shared animation functions
      gallery.ts       # Lightbox initialization
  public/
    images/            # Photography (processed by Astro image pipeline)
    CNAME              # GitHub Pages custom domain
  astro.config.mjs     # Astro configuration
  tsconfig.json
  package.json
```

---

## GitHub Pages Deployment

The deployment pipeline:

1. Push to `main` branch
2. GitHub Actions workflow triggers
3. `pnpm install && pnpm build` generates static `dist/`
4. `dist/` deployed to GitHub Pages (via `actions/deploy-pages`)
5. CNAME file in `public/` preserves custom domain

Astro's `astro.config.mjs`:
```javascript
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thecaddiechat.com',
  integrations: [mdx(), sitemap()],
  image: {
    // Sharp handles WebP/AVIF generation
    service: { entrypoint: 'astro/assets/services/sharp' }
  }
});
```

---

## Installation

```bash
# Initialize Astro project
pnpm create astro@latest

# Core integrations
pnpm add @astrojs/mdx @astrojs/sitemap

# Animation
pnpm add gsap

# Smooth scroll (if not using GSAP Club/ScrollSmoother)
pnpm add lenis

# Self-hosted fonts
pnpm add @fontsource/playfair-display @fontsource/dm-sans

# Lightbox
pnpm add glightbox

# Dev dependencies
pnpm add -D prettier prettier-plugin-astro typescript
```

---

## GSAP Licensing Note

GSAP's core library and ScrollTrigger are free for most uses. The "no-charge" license covers sites that don't charge users for access (this site qualifies). ScrollSmoother, MorphSVG, and other premium plugins require a GSAP Club membership (~$99/year for an indie license).

**Recommendation:** Start with free GSAP + ScrollTrigger + Lenis for smooth scrolling. Only evaluate GSAP Club if the free tier doesn't achieve the desired scroll feel. The free tier is sufficient for 90% of immersive scroll effects.

---

## Migration Strategy from Current Site

The rebuild is not an in-place upgrade — it's a fresh Astro project that absorbs the existing content:

1. **Extract content** from HTML into MDX files with frontmatter
2. **Move images** to `src/assets/images/` (or `public/images/`) for Astro's pipeline
3. **Rebuild layouts** as Astro components (Nav, Footer become shared components)
4. **Preserve URLs** — Astro's file-based routing can match the existing `/chronicles/viktor-hovland/` structure exactly
5. **Port CSS** — the existing custom properties and design tokens transfer directly into `global.css`
6. **Replace** IntersectionObserver reveals with GSAP ScrollTrigger animations
7. **Add** View Transitions for cross-page navigation

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Astro as framework choice | HIGH | Well-established as the leading content-site SSG. Perfect fit for static, content-heavy, GitHub Pages deployment. |
| GSAP for animation | HIGH | Industry standard. No credible alternative for scroll-driven cinematic effects. |
| Image optimization via Astro | HIGH | Built-in, uses Sharp, well-documented. |
| Specific version numbers | MEDIUM | Based on training data (May 2025). Verify with `npm view [package] version` before installing. |
| Lenis for smooth scroll | MEDIUM | Popular pairing with GSAP. Verify it's still actively maintained. |
| GLightbox | MEDIUM | Good choice at time of training data. Verify maintenance status. |
| GSAP licensing details | MEDIUM | Free tier terms were stable but should be re-verified on gsap.com. |

---

## Sources

- Astro documentation (astro.build/docs) — framework capabilities, Content Collections, View Transitions, Image component
- GSAP documentation (gsap.com/docs) — ScrollTrigger, licensing, plugin ecosystem
- Direct analysis of existing site codebase (19 HTML pages, CSS custom properties, vanilla JS)
- Project requirements from `.planning/PROJECT.md`

*All version recommendations should be verified against npm before installation, as training data has a May 2025 cutoff.*
