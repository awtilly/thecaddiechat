# Architecture Patterns

**Domain:** Immersive content/portfolio website (photography-heavy storytelling)
**Researched:** 2026-03-04

## Recommended Architecture

### Overview

The site should follow a **component-based static architecture with layered animation orchestration**. This means a static site generator (Astro) produces pre-rendered HTML pages, with a thin client-side animation layer that progressively enhances the experience. Content lives as structured data (Astro content collections or Markdown with frontmatter), images pass through a build-time optimization pipeline, and animations are orchestrated by a dedicated scroll/transition engine (GSAP + ScrollTrigger).

The architecture separates concerns into five layers:

```
+-----------------------------------------------------+
|  LAYER 5: PAGE TRANSITIONS (View Transitions API)   |
|  Smooth crossfades between routes, persistent nav    |
+-----------------------------------------------------+
|  LAYER 4: ANIMATION ORCHESTRATION (GSAP/ScrollTrigger)|
|  Scroll-driven reveals, parallax, timeline sequences |
+-----------------------------------------------------+
|  LAYER 3: INTERACTIVE COMPONENTS (Vanilla JS Islands)|
|  Lightbox, gallery, mobile nav, counter animations   |
+-----------------------------------------------------+
|  LAYER 2: PRESENTATION (CSS + Astro Components)      |
|  Layout, typography, color, responsive design         |
+-----------------------------------------------------+
|  LAYER 1: CONTENT & DATA (Markdown/MDX + Images)     |
|  Stories, course pages, gallery data, image assets    |
+-----------------------------------------------------+
```

### Why This Architecture

The existing site is already well-structured vanilla HTML/CSS/JS with ~20 pages. A full SPA framework (React, Next.js) would be overkill -- it adds bundle weight, hydration cost, and complexity for what is fundamentally a content site. Astro is purpose-built for this: it outputs zero JavaScript by default, lets you add interactive "islands" only where needed, and has first-class support for image optimization and the View Transitions API (for cinematic page transitions).

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Content Layer** | Markdown/MDX files with frontmatter define all page content, metadata, and image references | Build pipeline reads this to generate pages |
| **Image Pipeline** | Build-time optimization: srcset generation, WebP/AVIF conversion, blur placeholders, lazy loading attributes | Content Layer provides source images; Presentation Layer consumes optimized output |
| **Layout System** | Astro layout components: BaseLayout, ArticleLayout, CourseLayout, GalleryLayout | Wraps all pages; provides nav, footer, head tags, shared CSS |
| **Page Templates** | Astro page components for each route type: homepage, chronicle, course detail, course list, camera roll | Consumes content data; renders into Layout; triggers Animation Layer |
| **Animation Engine** | GSAP + ScrollTrigger orchestration: scroll reveals, parallax, hero sequences, image entrances | Reads DOM after page render; listens to scroll/resize events |
| **Transition Layer** | Astro View Transitions: crossfade between pages, persistent navigation, morph animations | Intercepts navigation; coordinates with Animation Engine for cleanup/re-init |
| **Interactive Islands** | Standalone JS modules: lightbox, mobile nav, stat counters, gallery filters | Self-contained; mount on specific DOM elements; no shared state needed |
| **Design Tokens** | CSS custom properties: colors, typography, spacing, animation timings | Consumed by all CSS; single source of truth for visual consistency |

### Data Flow

```
Content Creation Flow:
  Markdown files → Astro Content Collections → Build-time rendering → Static HTML

Image Flow:
  Source JPGs (assets/) → Astro <Image> component → Build-time resize/format/compress
    → Multiple srcset outputs (WebP + fallback) → Blur placeholder (inline base64)
    → Lazy loading via native loading="lazy" + IntersectionObserver

Page Render Flow:
  Route request → Astro serves static HTML (pre-rendered)
    → CSS loads (critical inlined, rest async)
    → JS loads (deferred): animation-engine.js + page-specific islands
    → GSAP ScrollTrigger initializes, reads DOM, sets up scroll-driven animations
    → User scrolls → animations fire based on viewport intersection

Page Transition Flow:
  User clicks internal link → View Transitions API intercepts
    → Old page content fades/slides out
    → New page HTML swaps in (Astro handles this)
    → GSAP re-initializes for new page content
    → New page animations begin (hero entrance, scroll reveals)
```

## Component Architecture Details

### 1. Content Layer

Store content as Astro content collections with typed frontmatter schemas:

```
src/
  content/
    chronicles/
      viktor-hovland.mdx
      tyrrell-hatton.mdx
      matt-fitzpatrick.mdx
      beauty-or-burden.mdx
      uphill-challenge.mdx
    courses/
      friars-head.mdx
      winged-foot.mdx
      mountain-ridge.mdx
      essex-county.mdx
      stonewall.mdx
      hollywood.mdx
      francis-a-byrne.mdx
      north-jersey.mdx
    gallery/
      gallery-data.json  (or individual .md files per collection)
    config.ts  (content collection schemas)
```

Each content file has frontmatter defining metadata:
```yaml
---
title: "Friar's Head"
subtitle: "Coore & Crenshaw's modern masterpiece"
section: "Golden Age Golf"
courseNumber: 8
architect: "Coore & Crenshaw"
opened: 2002
location: "Baiting Hollow, NY"
style: "Private"
heroImage: "./images/hero-clubhouse-bluff.jpg"
prevCourse: { slug: "winged-foot", name: "Winged Foot GC" }
nextCourse: null
galleryImages:
  - src: "./images/group-bluff-sound.jpg"
    alt: "The foursome on the bluff..."
    caption: "The foursome on the bluff. Long Island Sound behind us."
---

The body content here as Markdown/MDX...
```

**Why content collections:** The existing site has ~20 pages of handwritten HTML with duplicated nav, footer, and layout code. Content collections extract the actual content into structured files, eliminate duplication, and make the site maintainable. Adding a new chronicle or course becomes "add a Markdown file" instead of "copy-paste an HTML template and hope you get all the nav links right."

### 2. Image Pipeline

This is the single most impactful architectural decision for performance. The existing site serves raw JPGs at full resolution with no format optimization, no srcset, and no blur placeholders.

**Architecture:**
- Source images live in `src/assets/images/` (co-located with content or centralized)
- Astro's built-in `<Image>` and `<Picture>` components handle build-time processing
- Output: WebP (primary) + JPEG fallback, multiple widths (400, 800, 1200, 1600, 2000px), LQIP blur placeholders
- Lazy loading: `loading="lazy"` for below-fold, `loading="eager"` for hero/above-fold
- Aspect ratio containers prevent layout shift (CLS)

**Critical for immersive feel:** Blur-up loading creates a cinematic reveal effect. Image appears as a dreamy blur, then sharpens into full resolution. This turns a performance optimization into a design feature.

### 3. Layout System

```
src/
  layouts/
    BaseLayout.astro       # HTML shell, head tags, nav, footer, view transitions
    ArticleLayout.astro    # Chronicle story pages (narrow reading column)
    CourseLayout.astro      # Course detail pages (hero image, metadata, reading column)
    GalleryLayout.astro     # Camera roll (masonry/grid photography layout)
    SectionLayout.astro     # Section landing pages (chronicles list, courses list)
```

**BaseLayout** is the root. It provides:
- HTML document structure, meta tags, Open Graph
- Global CSS (design tokens, typography, reset)
- Navigation component (shared across all pages)
- Footer component
- View Transitions directive (`<ViewTransitions />`)
- Global script loading (animation engine, common islands)

**Composition pattern:** `CourseLayout` extends `BaseLayout`, adding course-specific structure (hero image slot, metadata bar, reading column, course navigation). Content from the MDX file fills slots within this layout.

### 4. Animation Engine

The animation system is a standalone module that GSAP + ScrollTrigger powers. It should be structured as a registry pattern:

```typescript
// animation-engine.ts

// Registry of animation creators, keyed by CSS selector or data attribute
const animations = {
  '[data-reveal]': createRevealAnimation,
  '[data-parallax]': createParallaxAnimation,
  '[data-hero]': createHeroSequence,
  '[data-counter]': createCounterAnimation,
  '[data-image-reveal]': createImageRevealAnimation,
  '[data-stagger]': createStaggerAnimation,
};

// Called on initial page load AND after each View Transition
export function initAnimations() {
  // Kill any existing ScrollTrigger instances (prevents memory leaks on navigation)
  ScrollTrigger.getAll().forEach(t => t.kill());

  // Register all animations for elements currently in DOM
  for (const [selector, creator] of Object.entries(animations)) {
    document.querySelectorAll(selector).forEach(el => creator(el));
  }

  ScrollTrigger.refresh();
}

// Hook into Astro View Transitions lifecycle
document.addEventListener('astro:page-load', initAnimations);
document.addEventListener('astro:after-swap', () => {
  // After DOM swap, before animations — good place to reset scroll position handling
  ScrollTrigger.getAll().forEach(t => t.kill());
});
```

**Animation types and their DOM contract:**

| Data Attribute | Effect | Options via `data-*` |
|---------------|--------|---------------------|
| `data-reveal` | Fade-in + slide-up on scroll entry | `data-reveal-delay="0.2"`, `data-reveal-direction="left"` |
| `data-parallax` | Element moves at different scroll rate | `data-parallax-speed="0.3"` |
| `data-hero` | Orchestrated entrance sequence (staggered children) | `data-hero-stagger="0.15"` |
| `data-counter` | Animated number count-up | `data-count="8"`, `data-suffix="+"` |
| `data-image-reveal` | Wipe/clip-path reveal on scroll | `data-image-reveal-direction="left"` |
| `data-stagger` | Children animate in sequence | `data-stagger-delay="0.08"` |

**Why GSAP + ScrollTrigger:** GSAP is the industry standard for web animation. ScrollTrigger specifically solves the "scroll-driven animation" problem that IntersectionObserver handles only crudely. The existing site already uses IntersectionObserver for basic reveals -- ScrollTrigger replaces this with scrub-linked parallax, pin-based storytelling sections, and progress-based animation that the IO API cannot do. GSAP's timeline system also enables sequenced entrance animations (hero text lines appearing in order) that CSS animation-delay handles awkwardly.

**Reduced motion:** The animation engine must check `prefers-reduced-motion` and disable all scroll-driven effects, parallax, and complex sequences when active. The existing site already respects this -- the architecture must preserve that.

### 5. Page Transition Layer

Astro's View Transitions API integration provides SPA-like page transitions without a client-side router or JavaScript framework. This is the key to the "cinematic feel" between pages.

**How it works:**
1. User clicks an internal link
2. Astro intercepts the navigation (no full page reload)
3. New page HTML is fetched
4. Matching elements with `transition:name` attributes morph between old/new positions
5. Non-matching content crossfades

**Transition types for this site:**

| Transition | Pages | Effect |
|-----------|-------|--------|
| **Crossfade** | Default between any pages | Smooth opacity swap, 300-400ms |
| **Nav persist** | All pages | Navigation stays fixed, does not animate |
| **Hero morph** | Course card on list --> course hero image | Card image morphs into full-width hero |
| **Slide** | Prev/Next course navigation | Content slides left/right |

**View Transition names to assign:**
- `transition:name="nav"` on the navigation (persists across all pages)
- `transition:name="hero-{slug}"` on course card images and course hero images (enables morph)
- `transition:name="main-content"` on the main content area (enables crossfade)

### 6. Interactive Islands

Small, self-contained JavaScript modules that hydrate specific DOM elements:

| Island | Purpose | Mount Point | Dependencies |
|--------|---------|-------------|--------------|
| `lightbox.ts` | Full-screen image viewer with prev/next, keyboard nav, touch gestures | `[data-lightbox-group]` elements | None (vanilla JS) |
| `mobile-nav.ts` | Hamburger menu, slide-out panel, overlay | `.nav-toggle` | None |
| `gallery-filter.ts` | Category filtering for Camera Roll | `.gallery-filter` buttons | None |
| `image-loader.ts` | Progressive blur-up loading effect | `img[data-src]` or `<Picture>` elements | None |
| `smooth-scroll.ts` | Scroll-to-anchor with easing | `a[href^="#"]` | Optional: GSAP (for consistent easing) |

**Island loading strategy:** These should load with `<script>` tags at the end of the body, deferred. They do not need framework hydration -- they are vanilla TypeScript modules that query the DOM and attach event listeners. Astro's `client:load` or `client:visible` directives are unnecessary here because these are not framework components.

### 7. Design Token System

All visual decisions centralized in CSS custom properties. The existing site already does this well with `:root` variables. The architecture formalizes and extends it:

```css
:root {
  /* Color palette */
  --color-bg: #f7f4ef;
  --color-surface: #edeae4;
  --color-accent: #2d5a3f;
  /* ... existing tokens preserved ... */

  /* Animation tokens (NEW) */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);
  --duration-fast: 200ms;
  --duration-normal: 400ms;
  --duration-slow: 800ms;
  --duration-reveal: 1000ms;

  /* Transition tokens (NEW) */
  --transition-page: 350ms;

  /* Typography scale (formalized) */
  --text-xs: 0.7rem;
  --text-sm: 0.8rem;
  --text-base: 1rem;
  --text-lg: 1.1rem;
  --text-xl: 1.4rem;
  --text-2xl: clamp(2rem, 4vw, 3.2rem);
  --text-hero: clamp(3.2rem, 8vw, 7rem);
}
```

## Project File Structure

```
thecaddiechat/
  src/
    assets/
      images/
        chronicles/        # Chronicle photography
        courses/           # Course photography
        gallery/           # Camera roll photography
    components/
      Nav.astro            # Navigation (shared, persistent across transitions)
      Footer.astro         # Footer (shared)
      Hero.astro           # Full-viewport hero with parallax image
      ContentCard.astro    # Card component for section landing pages
      CourseCard.astro     # Course list item with number + arrow
      GalleryCard.astro    # Photography collection card with overlay
      ImageFigure.astro    # Inline article image with caption
      FullBleedImage.astro # Edge-to-edge image with gradient caption
      ImagePair.astro      # Side-by-side image layout
      PullQuote.astro      # Stylized blockquote
      StatRow.astro        # Animated counter statistics
      Breadcrumb.astro     # Section > Page breadcrumb
      Lightbox.astro       # Lightbox container + script island
    content/
      chronicles/          # MDX story files
      courses/             # MDX course files
      config.ts            # Content collection schemas (Zod)
    layouts/
      BaseLayout.astro     # Root layout: HTML, head, nav, footer, transitions
      ArticleLayout.astro  # Narrow reading column for chronicles
      CourseLayout.astro   # Course detail: hero, metadata, reading column
      GalleryLayout.astro  # Grid-based photography layout
      SectionLayout.astro  # Section landing page (list of content)
    pages/
      index.astro          # Homepage
      chronicles/
        index.astro        # Chronicles landing (list)
        [...slug].astro    # Dynamic route: individual chronicle
      courses/
        index.astro        # Courses section landing
        golden-age-golf/
          index.astro      # Golden Age Golf trip landing
        [...slug].astro    # Dynamic route: individual course
      camera-roll/
        index.astro        # Camera Roll gallery
    scripts/
      animation-engine.ts  # GSAP + ScrollTrigger orchestration
      lightbox.ts          # Lightbox island
      mobile-nav.ts        # Mobile navigation island
      gallery-filter.ts    # Gallery category filtering
    styles/
      global.css           # Design tokens, reset, base typography
      components.css       # Component-specific styles (or scoped in .astro files)
  public/
    CNAME                  # GitHub Pages custom domain
    fonts/                 # Self-hosted fonts (if moving off Google Fonts CDN)
  astro.config.mjs         # Astro configuration
  package.json
```

## Patterns to Follow

### Pattern 1: Scroll-Linked Animation Registration

**What:** Animations declared in HTML via data attributes, registered and managed by a central engine.

**When:** Any element that should animate on scroll entry or during scroll.

**Why:** Decouples animation behavior from component structure. Adding animation to any element is a one-attribute change, not a code change. The engine handles lifecycle (init, cleanup on navigation, reduced motion).

```html
<!-- In any Astro component -->
<h2 data-reveal data-reveal-delay="0.1">Section Title</h2>
<p data-reveal data-reveal-delay="0.2">Body text appears after heading.</p>
<img data-image-reveal data-image-reveal-direction="left" src="..." />
```

### Pattern 2: Content-Driven Pages via Collections

**What:** Pages generated from structured Markdown/MDX files via Astro's content collections and dynamic routes.

**When:** All chronicle and course pages.

**Why:** Eliminates the current duplication where each page is a standalone HTML file with copy-pasted nav/footer/styles. Content authors (Joe) edit Markdown instead of HTML. Layout changes propagate automatically.

```typescript
// src/pages/courses/[...slug].astro
---
import { getCollection } from 'astro:content';
import CourseLayout from '../../layouts/CourseLayout.astro';

export async function getStaticPaths() {
  const courses = await getCollection('courses');
  return courses.map(course => ({
    params: { slug: course.slug },
    props: { course },
  }));
}

const { course } = Astro.props;
const { Content } = await course.render();
---
<CourseLayout {...course.data}>
  <Content />
</CourseLayout>
```

### Pattern 3: Progressive Image Loading

**What:** Images load with a blur-up effect: tiny blurred placeholder shown immediately, full image fades in when loaded.

**When:** All photography on the site (hero images, inline article images, gallery cards).

**Why:** Photography is the centerpiece of this site. The transition from blur to sharp creates a premium feel while solving the performance problem of 67+ high-resolution images. It turns a technical constraint into a design moment.

### Pattern 4: View Transition Coordination

**What:** Animations and interactive islands clean up before page swap and re-initialize after.

**When:** Every page navigation.

**Why:** Without cleanup, GSAP ScrollTrigger instances accumulate and cause memory leaks and ghost animations. Without re-initialization, new page content has no animations. The `astro:before-swap` and `astro:page-load` lifecycle events are the coordination points.

## Anti-Patterns to Avoid

### Anti-Pattern 1: Framework-Component-Per-Element

**What:** Using React/Vue/Svelte components for every interactive element (lightbox, nav toggle, gallery filter).

**Why bad:** Each framework component requires hydration JavaScript, increasing bundle size. For a content site with 5-6 interactive behaviors, vanilla JS islands are lighter and faster. The site needs ~3KB of interaction code, not ~40KB+ of React runtime.

**Instead:** Vanilla TypeScript modules that mount on DOM elements. No framework needed for this level of interactivity.

### Anti-Pattern 2: Animation in CSS Only

**What:** Trying to achieve all animation effects through CSS `@keyframes`, `transition`, and `animation-delay`.

**Why bad:** CSS animations cannot respond to scroll position (only viewport entry via `:has()` or `@starting-style` which have limited browser support). Cannot coordinate multi-element timelines. Cannot do scrubbed parallax. Cannot pin elements during scroll. The existing site already hits this ceiling with its basic `reveal` class approach.

**Instead:** CSS for simple hover states and micro-interactions (button hover, image zoom on hover, nav transitions). GSAP for scroll-driven animations, entrance sequences, and parallax.

### Anti-Pattern 3: Single Monolithic CSS File

**What:** One `style.css` file containing all styles for all pages, including page-specific styles (currently each course page has its own `<style>` block).

**Why bad:** Every page loads CSS for every other page. More importantly, style conflicts become likely as the site grows. The current Friar's Head page has ~130 lines of page-specific CSS in a `<style>` tag -- this pattern does not scale.

**Instead:** Astro component scoped styles (automatic with `.astro` files) plus a global stylesheet for design tokens and shared utilities. Page-specific styles live in the page/layout component, scoped automatically.

### Anti-Pattern 4: Inline JavaScript in HTML

**What:** `<script>` blocks with `onclick` handlers and inline functions in each HTML page (as currently exists on course pages for lightbox functionality).

**Why bad:** Duplicated across pages, not cacheable, not minified, no error handling, global scope pollution.

**Instead:** Shared island modules loaded once, configured via data attributes. The lightbox island reads `data-lightbox-group` and `data-lightbox-src` from the DOM rather than relying on global functions.

## Scalability Considerations

| Concern | At 20 pages (current) | At 50 pages | At 200+ pages |
|---------|----------------------|-------------|---------------|
| **Build time** | <10 seconds | 15-30 seconds (image processing) | 1-3 minutes; consider incremental builds |
| **Image storage** | ~67 images, ~200MB | ~200 images, ~600MB | Git LFS required; consider image CDN |
| **CSS complexity** | Single global + scoped | Same pattern holds | Same pattern holds |
| **Content management** | Edit Markdown files | Edit Markdown files | May want a headless CMS (Decap CMS for Git-based) |
| **Animation performance** | No concerns | No concerns | Audit ScrollTrigger count per page; batch similar animations |
| **GitHub Pages limits** | Well within 1GB limit | Monitor repository size | May need Cloudflare Pages or Netlify for larger sites |

## Suggested Build Order (Dependencies)

The component dependencies dictate what must be built first:

```
Phase 1: Foundation (no dependencies)
  ├── Design Tokens (global.css)
  ├── BaseLayout.astro (HTML shell, nav, footer)
  ├── Content collection schemas (config.ts)
  └── Image pipeline configuration (astro.config.mjs)

Phase 2: Content Migration (depends on Phase 1)
  ├── Convert existing HTML content to Markdown/MDX files
  ├── ArticleLayout.astro + CourseLayout.astro
  ├── Page templates ([...slug].astro routes)
  └── Verify all content renders correctly without animation

Phase 3: Core Components (depends on Phase 1)
  ├── Hero.astro
  ├── ContentCard.astro
  ├── CourseCard.astro
  ├── ImageFigure.astro, FullBleedImage.astro, ImagePair.astro
  └── StatRow.astro, PullQuote.astro, Breadcrumb.astro

Phase 4: Animation System (depends on Phases 2 & 3)
  ├── GSAP + ScrollTrigger integration
  ├── Animation engine with registry pattern
  ├── Scroll reveal animations
  ├── Hero entrance sequences
  └── Parallax effects on images

Phase 5: Page Transitions (depends on Phase 4)
  ├── Astro View Transitions setup
  ├── Transition coordination with animation engine
  ├── Page crossfade effects
  └── Hero image morph transitions

Phase 6: Interactive Islands (can parallelize with Phases 4-5)
  ├── Lightbox (refactored from existing inline JS)
  ├── Mobile navigation
  ├── Gallery filtering (Camera Roll)
  └── Progressive image loading effects

Phase 7: Polish & Performance (depends on all above)
  ├── Image optimization audit
  ├── Font loading strategy (preload, font-display: swap)
  ├── Core Web Vitals testing
  ├── Reduced motion audit
  └── GitHub Pages deployment configuration
```

**Key dependency insight:** Content migration (Phase 2) and component creation (Phase 3) can partially overlap, but the animation system (Phase 4) must wait until pages are rendering their final DOM structure -- otherwise animations target elements that will change, requiring rework. View Transitions (Phase 5) must come after the animation engine because the transition lifecycle hooks manage animation cleanup.

## Sources

- Existing site analysis: `/Users/joestoehner/Desktop/GitHub/thecaddiechat/thecaddiechat/` (19 HTML pages, 1 CSS file, 1 JS file, ~67 images)
- Astro architecture: Islands Architecture, Content Collections, View Transitions API, Image optimization -- based on established Astro patterns (training data, MEDIUM confidence)
- GSAP + ScrollTrigger: Industry-standard animation library for scroll-driven effects -- based on established patterns (training data, HIGH confidence)
- View Transitions API: CSS-based page transitions with JavaScript coordination -- based on established web platform API (training data, HIGH confidence)

**Confidence note:** The architectural patterns described here (static site generation, content collections, scroll-driven animation, view transitions) are well-established and stable. The specific Astro APIs (content collections, View Transitions integration) should be verified against current Astro documentation during implementation, as API details may have evolved since training data cutoff.
