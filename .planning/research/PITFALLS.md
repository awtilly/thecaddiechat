# Domain Pitfalls

**Domain:** Immersive, animation-heavy photography/storytelling website
**Project:** The Caddie Chat — rebuild of static HTML site with ~20 pages, 68+ high-quality images, deployed to GitHub Pages
**Researched:** 2026-03-04
**Confidence:** HIGH (based on codebase analysis and established web performance knowledge)

---

## Critical Pitfalls

Mistakes that cause rewrites, catastrophic performance issues, or fundamentally broken user experience.

### Pitfall 1: Shipping Full-Resolution Photography Without an Image Pipeline

**What goes wrong:** The site has 68+ images (likely growing) served as raw JPGs with no responsive sizing, no modern format conversion, and no build-time optimization. On a photography-heavy site, unoptimized images are the single largest performance killer. A single course page (e.g., Friar's Head) loads 8 high-resolution photos. If each averages 1-3 MB, that is 8-24 MB per page load. On mobile LTE, that is 10-30 seconds of loading before a visitor sees the story.

**Why it happens:** The current site is vanilla HTML with no build tools. Images are referenced as raw `.jpg` files with no `srcset`, no `<picture>` element, no WebP/AVIF fallbacks. The `loading="lazy"` attribute is used on some course pages (good), but the hero on index.html loads a full-resolution image eagerly with no size hints. There is also no `width`/`height` set on images, which means the browser cannot reserve layout space and causes Cumulative Layout Shift (CLS).

**Consequences:**
- Core Web Vitals fail: LCP (Largest Contentful Paint) will be 5-15 seconds on slower connections
- GitHub Pages has no CDN image optimization (no Vercel Image Optimization, no Cloudflare Polish)
- Mobile users abandon — 53% of mobile users leave pages that take over 3 seconds to load
- Google Search rankings penalized (Core Web Vitals are a ranking factor)
- The "immersive" experience becomes a "waiting" experience

**Warning signs:**
- Lighthouse Performance score below 50
- LCP above 4 seconds on 4G throttled connection
- Images larger than 200 KB in Network tab
- No `.webp` or `.avif` files in the assets directory

**Prevention:**
1. Add a build step (even a simple script) that generates responsive image sizes (400w, 800w, 1200w, 1600w) and converts to WebP + AVIF
2. Use `<picture>` elements with `srcset` and `sizes` attributes on every image
3. Set explicit `width` and `height` attributes on all `<img>` tags to prevent CLS
4. Hero images: preload with `<link rel="preload" as="image">` for above-the-fold content
5. Gallery/article images: use `loading="lazy"` and `decoding="async"` universally
6. Target: no individual image over 150 KB at its displayed size; hero images under 250 KB

**Phase mapping:** Phase 1 (Foundation) — this must be solved before any animation work. Animations on top of slow-loading images make everything worse, not better.

**Detection:** Run `npx lighthouse https://thecaddiechat.com --only-categories=performance` after deployment.

---

### Pitfall 2: Animation Overload Killing Mobile Performance

**What goes wrong:** Sites chasing "immersive" add animations to everything — scroll reveals, parallax, hover effects, page transitions, micro-interactions, cursor effects — and the cumulative cost on mobile devices causes jank, battery drain, and a worse experience than having no animations at all.

**Why it happens:** The project brief explicitly calls for "smooth scroll animations, parallax and depth effects, premium micro-interactions, page transitions, and cinematic feel." This is a shopping list that, if implemented naively, creates a GPU-thrashing nightmare on mid-range phones. The current site already has parallax on the hero (scroll-driven `transform` on the background image), scroll-reveal observers, staggered card delays, and counter animations. Adding GSAP ScrollTrigger, page transitions, custom cursors, and more parallax layers on top of this without a performance budget will compound the problem.

**Consequences:**
- Sub-30 FPS scrolling on mobile (should be 60 FPS)
- Battery drain causing users to close the tab
- Layout thrashing from JavaScript-driven scroll handlers (the current parallax uses `window.scrollY` in a scroll listener without `requestAnimationFrame` throttling)
- "Immersive" becomes "laggy" — the exact opposite of the goal

**Warning signs:**
- Chrome DevTools Performance panel shows frames exceeding 16ms during scroll
- `will-change` applied to more than 3-4 elements simultaneously
- JavaScript scroll listeners firing without RAF throttling or passive flags
- Total animation JavaScript bundle exceeding 50 KB gzipped
- Users reporting "choppy" scrolling on iPhones or budget Android

**Prevention:**
1. Establish a performance budget: target 60 FPS scrolling, sub-3s LCP, under 100 KB total JS
2. Prefer CSS-only animations (`@keyframes`, CSS `transition`) over JavaScript-driven animations
3. Use `IntersectionObserver` for reveals (already done) and CSS `scroll-timeline`/`animation-timeline` for scroll-linked effects where supported
4. If using GSAP, use `ScrollTrigger` with `scrub` carefully — batch animations, avoid per-element triggers
5. Reduce animation scope on mobile: the current site already disables reveals on mobile (`isMobile` check at line 71 of main.js) — extend this philosophy to all heavy effects
6. Use `prefers-reduced-motion` media query (already partially implemented) as a hard gate on all animations
7. Never animate `width`, `height`, `top`, `left`, `margin`, or `padding` — only `transform` and `opacity`
8. Limit `will-change` usage — it promotes elements to their own compositor layers, consuming GPU memory

**Phase mapping:** Phase 2 (Animation System) — define the animation vocabulary and performance guardrails before implementing any individual animations. Test on a real mid-range phone (not just Chrome DevTools throttling).

---

### Pitfall 3: Page Transitions Breaking the Back Button, Deep Links, and SEO

**What goes wrong:** The project wants "page transitions between sections." On a multi-page static site (which this is — 20 separate HTML files on GitHub Pages), page transitions require either: (a) converting to a Single Page Application with client-side routing, or (b) using the View Transitions API. Option (a) is a massive architectural change that breaks deep links, SEO, and the browser back button if done wrong. Option (b) is the correct modern approach but has browser support limitations.

**Why it happens:** Developers see sites like Apple's product pages or Awwwards winners with smooth page transitions and assume they need a framework like Next.js, Nuxt, or Astro with client-side navigation. For a content site that is primarily text and photography, this adds enormous complexity for a polish feature. The existing site works perfectly with standard navigation — each page is its own HTML file with a clean URL structure that GitHub Pages serves directly.

**Consequences:**
- SPA approach: breaks the back button if history management is wrong, loses server-rendered HTML for SEO, requires JavaScript for navigation (bad for accessibility), vastly increases build complexity
- View Transitions API: only works in Chromium browsers as of early 2026 (Firefox has partial support, Safari is behind) — meaning 30-40% of visitors see nothing
- Both approaches: break `loading="lazy"` expectations, complicate analytics tracking, make caching harder

**Warning signs:**
- Planning to "convert to React/Next.js" primarily for page transitions
- Anchor tags being replaced with `onclick` handlers and `fetch()`
- Browser back button not working during development
- URLs not updating when navigating between pages
- Google Search Console showing indexing issues after launch

**Prevention:**
1. Use the View Transitions API with progressive enhancement — add `@view-transition { navigation: auto; }` in CSS and define `view-transition-name` on persistent elements (nav, hero images, page titles). This gives smooth transitions in Chrome/Edge while falling back to normal navigation in other browsers.
2. Do NOT convert to an SPA just for transitions. The multi-page architecture is correct for this content site.
3. If a build tool like Astro is adopted, use its built-in View Transitions support with `<ClientRouter />` which handles the complexity properly.
4. Keep every page as a fully functional standalone HTML document that works without JavaScript.
5. Test with JavaScript disabled to verify content accessibility.

**Phase mapping:** Phase 3 or later (Polish) — page transitions are a progressive enhancement, not a foundation. Get the content, images, and core animations right first.

---

### Pitfall 4: GitHub Pages Constraints Creating Performance Ceilings

**What goes wrong:** GitHub Pages is a static file host with significant limitations that constrain what an "immersive" site can achieve. No server-side processing, no edge functions, no image CDN, no HTTP/2 push, limited cache control, and a soft bandwidth limit. Teams build locally against localhost speeds and are shocked when the deployed site is materially slower.

**Why it happens:** The project constraint specifies GitHub Pages hosting (CNAME already configured). This is fine for static content, but it means every optimization must happen at build time, not at request time. There is no Vercel-style image optimization, no server-side rendering, no edge caching rules. The CDN backing GitHub Pages (Fastly) serves files with generic cache headers that the developer cannot customize.

**Consequences:**
- No responsive image generation on the fly — must pre-generate all sizes at build time
- No Brotli compression control — GitHub Pages serves gzip but not Brotli
- No custom `Cache-Control` headers — browser caching behavior is not configurable
- No HTTP header customization (no `Link: rel=preload`, no custom `Content-Security-Policy`)
- Repository size limit: GitHub recommends repos under 1 GB; with 68+ high-res images plus generated responsive variants, this can balloon quickly
- Bandwidth limit: 100 GB/month soft limit; a single page with 10 MB of images hit by moderate traffic could approach this

**Warning signs:**
- Repository size exceeding 500 MB
- Build artifacts (generated image sizes) committed to git
- Deployed site LCP significantly slower than localhost
- GitHub warning emails about repository size or bandwidth

**Prevention:**
1. Use a build pipeline (GitHub Actions) that optimizes images as part of deployment, storing optimized versions only in the deployed branch (e.g., `gh-pages`), not in the source branch
2. Consider an external image CDN (Cloudinary free tier, imgix, or even Unsplash-hosted where applicable — the Camera Roll page already uses Unsplash URLs) for the heaviest images
3. Implement aggressive client-side caching via Service Worker — since GitHub Pages headers are not configurable, a Service Worker can cache assets with custom strategies
4. Keep source images out of the git history — use `.gitignore` for originals and store them separately, or use Git LFS
5. Measure deployed performance, not localhost performance, as the source of truth

**Phase mapping:** Phase 1 (Foundation) — hosting constraints inform every subsequent decision about image pipeline, build tools, and animation approach.

---

### Pitfall 5: Inline Styles and Page-Scoped CSS Creating Maintenance Chaos

**What goes wrong:** The current codebase has a single global `style.css` (475 lines) PLUS substantial inline `<style>` blocks in individual pages. The Friar's Head page alone has 130 lines of page-specific CSS embedded in the `<head>`. As the rebuild adds animations, new components, and more pages, this pattern creates CSS that is impossible to maintain, debug, or keep consistent. Duplicate selectors across pages will produce subtle visual inconsistencies that erode the "cohesive animation language" goal.

**Why it happens:** Without a build tool or component system, the natural path of least resistance is to add `<style>` blocks to individual pages. The Friar's Head page defines `.course-hero-image`, `.inline-image`, `.full-bleed-image`, `.image-pair`, `.memorabilia`, `.lightbox`, and `.pull-quote` — all of which are reusable patterns that should be shared across the 8+ course pages. If each course page has its own copy, a design change requires editing 8+ files.

**Consequences:**
- Visual inconsistency between pages that should look identical
- Bug fixes in one page's CSS not propagated to others
- Animation timing and easing values diverging across pages (breaking "consistent animation language" goal)
- Increasing difficulty adding new pages or content
- Large CSS payload per page (the global stylesheet loads plus the inline block)

**Warning signs:**
- Same CSS class names defined in multiple files with slightly different values
- Inline `<style>` blocks exceeding 50 lines in any page
- Inline `style=""` attributes on HTML elements (the current site has several, e.g., `style="margin-top: 2rem;"` on line 62 of index.html, `style="font-family: var(--font-display)..."` repeated on heading elements)
- Difficulty answering "what does `.pull-quote` look like?" without checking multiple files

**Prevention:**
1. Adopt a build tool (even a simple one like PostCSS or a CSS bundler) that allows splitting CSS into logical files (`_hero.css`, `_article.css`, `_gallery.css`, `_animations.css`) and combining them
2. Move all inline `<style>` blocks into shared CSS files during the rebuild
3. Eliminate all inline `style=""` attributes — use utility classes or component classes
4. Define animation design tokens in CSS custom properties: `--ease-standard`, `--duration-enter`, `--duration-exit`, `--parallax-ratio`, etc.
5. If adopting a framework like Astro, use its scoped component styles that compile to unique class names

**Phase mapping:** Phase 1 (Foundation) — CSS architecture must be established before building new components on top of it. Retroactively refactoring CSS is painful and error-prone.

---

## Moderate Pitfalls

### Pitfall 6: Cumulative Layout Shift (CLS) From Images Without Dimensions

**What goes wrong:** Images without explicit `width` and `height` attributes cause the page to "jump" as they load. On a photography-heavy site, this means the text the user is reading suddenly shifts down by 400 pixels when an inline image loads above it. This is one of the most frustrating UX issues on content sites.

**Why it happens:** The current HTML uses `<img>` tags without `width`/`height` on most images. CSS `aspect-ratio` is used on some containers (`.course-hero-image img` has `aspect-ratio: 21/9`), which helps, but inconsistently. Article inline images have no dimension hints at all.

**Prevention:**
1. Add `width` and `height` attributes to every `<img>` tag (the browser uses these to calculate aspect ratio before the image loads)
2. Use CSS `aspect-ratio` on image containers as a belt-and-suspenders approach
3. For the gallery/lightbox, use placeholder divs with the correct aspect ratio that the image replaces
4. Use `content-visibility: auto` on below-fold sections to help rendering performance

**Phase mapping:** Phase 1 (Foundation) — must be part of the HTML structure from the start.

---

### Pitfall 7: Font Loading Flash (FOIT/FOUT) Breaking the Editorial Feel

**What goes wrong:** The site loads two Google Fonts (Playfair Display and DM Sans) via a blocking `@import url()` in CSS. This is the slowest possible way to load web fonts. On slow connections, the page either shows invisible text for 1-3 seconds (Flash of Invisible Text / FOIT) or shows system fonts that suddenly swap to the design fonts (Flash of Unstyled Text / FOUT). Either one destroys the premium editorial feel on first impression.

**Why it happens:** The current CSS line 6: `@import url('https://fonts.googleapis.com/css2?family=...')` is render-blocking. The browser must download the CSS file, then discover the font files, then download those. This creates a waterfall that delays text rendering.

**Prevention:**
1. Self-host the fonts (download Playfair Display and DM Sans WOFF2 files) — eliminates the extra DNS lookup and connection to fonts.googleapis.com
2. Use `font-display: swap` in `@font-face` declarations (Google Fonts adds this, but self-hosting gives full control)
3. Preload the most critical font weight: `<link rel="preload" href="/fonts/playfair-display-500.woff2" as="font" type="font/woff2" crossorigin>`
4. Subset fonts to only needed characters (Latin) to reduce file size by 50-70%
5. Use `size-adjust` in the `@font-face` for the fallback font to minimize layout shift during swap

**Phase mapping:** Phase 1 (Foundation) — typography is foundational to the editorial aesthetic.

---

### Pitfall 8: Parallax and Scroll Effects Broken on iOS Safari

**What goes wrong:** iOS Safari handles scroll events, `position: fixed`, `backdrop-filter`, `overflow: hidden`, and `100vh` differently from every other browser. The current site already has workarounds for some of these (the `100dvh` usage, the mobile nav backdrop-filter removal comment), but the rebuild's more ambitious animation goals will encounter more Safari-specific issues. Parallax effects using `transform` on scroll often stutter or break entirely on iOS because of Safari's unique scroll event throttling and compositing behavior.

**Why it happens:** iOS Safari fires scroll events after the scroll completes (not during), making JavaScript-driven scroll animations appear to "catch up" in a jerky motion. It also has an elastic bounce scroll behavior and a dynamically resizing viewport (as the address bar hides/shows) that breaks `100vh`-based calculations. The `backdrop-filter` CSS property creates a containing block that breaks `position: fixed` children — the current site has a comment about this exact issue (line 436 of style.css).

**Prevention:**
1. Use CSS `scroll-timeline` / `animation-timeline` for scroll-linked animations instead of JavaScript scroll listeners — these are compositor-driven and work smoothly on Safari
2. For parallax, use the CSS `perspective` + `translateZ` technique on a scroll container instead of JavaScript-driven transforms
3. Always use `100dvh` (dynamic viewport height) instead of `100vh` for full-screen sections — already partially implemented
4. Test every animation on a real iPhone, not just Safari devtools
5. Provide a graceful degradation path: if scroll-linked animations stutter, disable them entirely rather than showing broken animation
6. For the existing parallax in `main.js` (lines 120-134), wrap scroll transforms in `requestAnimationFrame` and consider disabling on iOS entirely

**Phase mapping:** Phase 2 (Animation System) — Safari testing must be part of the animation development workflow, not an afterthought.

---

### Pitfall 9: Lightbox Implementation Without Touch Gestures or Accessibility

**What goes wrong:** The current lightbox (seen on the Friar's Head page) is a custom implementation with basic keyboard support and click-to-close. For an immersive photography site, a lightbox that does not support pinch-to-zoom, swipe-to-navigate, touch drag, or proper focus trapping is a broken experience on the primary consumption device (mobile phones). Additionally, the current implementation uses `onclick` attributes on HTML elements, which is an accessibility anti-pattern — screen readers cannot navigate these "clickable" figures.

**Why it happens:** Custom lightboxes are deceptively simple to start (show/hide a div) but extremely hard to finish properly. Touch gesture handling, focus management, scroll locking without content shift, image preloading for smooth navigation, and animation between images all add significant complexity.

**Prevention:**
1. Use an established lightbox library (GLightbox, PhotoSwipe 5, or similar) that handles touch gestures, accessibility, and animation out of the box
2. If building custom: implement proper focus trapping (tab key cycles within lightbox), `role="dialog"`, `aria-modal="true"`, and return focus to trigger element on close
3. Add swipe-to-navigate with proper inertia and rubber-banding feel
4. Support pinch-to-zoom on images (critical for photography appreciation)
5. Replace `onclick` attributes with event listeners and make trigger elements keyboard-accessible (`<button>` or `role="button" tabindex="0"`)
6. Preload adjacent images in the gallery for instant navigation

**Phase mapping:** Phase 2 or 3 (Interactive Components) — the lightbox is a core feature for a photography site and deserves proper implementation.

---

### Pitfall 10: Deploying Animations Without a Design System (Inconsistent Motion)

**What goes wrong:** The project brief calls for "consistent animation language across all pages." Without a defined motion design system (standardized easing curves, durations, distance values, and stagger patterns), each page or component ends up with subtly different animation feel. One page has 0.4s ease transitions while another uses 0.8s cubic-bezier. The result is a site that feels cobbled together rather than cohesive.

**Why it happens:** The current CSS already shows this drift: the nav uses `transition: all 0.4s ease`, buttons use `transition: all 0.4s ease`, card images use `transition: transform 0.8s ease`, the hero uses `animation: heroZoom 20s ease forwards`, and hover effects use `transition: transform 0.3s ease`. There is no system — just individual values picked per element.

**Prevention:**
1. Define a motion token system in CSS custom properties:
   ```css
   :root {
     --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
     --ease-enter: cubic-bezier(0, 0, 0.2, 1);
     --ease-exit: cubic-bezier(0.4, 0, 1, 1);
     --ease-expressive: cubic-bezier(0.22, 1, 0.36, 1);
     --duration-fast: 200ms;
     --duration-normal: 400ms;
     --duration-slow: 800ms;
     --duration-cinematic: 1200ms;
     --distance-sm: 8px;
     --distance-md: 24px;
     --distance-lg: 48px;
   }
   ```
2. Document which easing + duration combination is used for which type of interaction (hover, reveal, transition, parallax)
3. Apply tokens to all existing and new animations
4. Review animation consistency across pages as part of QA

**Phase mapping:** Phase 1/2 boundary — define tokens in Phase 1 (Foundation), enforce them in Phase 2 (Animation System).

---

## Minor Pitfalls

### Pitfall 11: Google Fonts @import Blocking First Paint

**What goes wrong:** The `@import url(...)` at the top of `style.css` is render-blocking. The browser downloads `style.css`, discovers the `@import`, then makes another request to Google Fonts, which returns yet another CSS file with `@font-face` rules, which triggers font file downloads. This is a 4-hop waterfall before any text renders.

**Prevention:** Move to `<link rel="preconnect" href="https://fonts.googleapis.com">` plus `<link rel="stylesheet" href="...">` in the HTML `<head>` (parallel loading), or self-host fonts. Self-hosting is preferred for this project.

**Phase mapping:** Phase 1 (Foundation).

---

### Pitfall 12: No Build Tool Making Iteration Slow and Error-Prone

**What goes wrong:** With 20 HTML pages sharing the same nav, footer, and head boilerplate, any change to shared elements requires editing 20 files. This is already a maintenance burden and will become worse as the rebuild adds shared animation scripts, more CSS, and potentially shared interactive components.

**Prevention:** Adopt a minimal static site generator (Astro, Eleventy/11ty, or even a simple HTML include system via a build script). Astro is the strongest choice because it outputs zero JavaScript by default (preserving the static site nature), supports components, handles image optimization, and has built-in View Transitions support.

**Phase mapping:** Phase 1 (Foundation) — the build tool decision affects everything downstream.

---

### Pitfall 13: Scroll Hijacking Destroying the Reading Experience

**What goes wrong:** "Immersive" sites often implement scroll hijacking — overriding the browser's native scroll behavior to create snapping, controlled scroll speeds, or horizontal scrolling sections. On a long-form storytelling site, this is actively hostile to readers. People read at their own pace. Hijacking scroll breaks muscle memory, trackpad momentum scrolling, accessibility tools, and the back button's scroll position memory.

**Prevention:**
1. Never override `scroll-behavior` with JavaScript that changes scroll speed or snaps to sections
2. Use CSS `scroll-snap` only on explicit gallery/carousel contexts, never on the main page scroll
3. Parallax effects should be subtle additive motion, not scroll-speed modifiers
4. Test that the browser's "scroll to text fragment" feature still works
5. The rule of thumb: if the user cannot scroll smoothly from top to bottom at their chosen speed, the implementation is wrong

**Phase mapping:** Phase 2 (Animation System) — this is a design philosophy constraint that must be agreed upon before animation work begins.

---

### Pitfall 14: Camera Roll Gallery Using External Unsplash URLs in Production

**What goes wrong:** The Camera Roll page (`/camera-roll/index.html`) currently loads all images from `images.unsplash.com`. These are placeholder images, not Joe's actual photography. If this ships to production, the core value proposition of the site (Joe's original photography) is undermined. Additionally, external image URLs are a dependency — Unsplash could change their URL structure, rate-limit requests, or go down.

**Prevention:**
1. Replace all Unsplash placeholder URLs with actual photography before launch
2. Self-host all photography assets (no external image dependencies for core content)
3. Create a checklist of all placeholder content that needs replacement

**Phase mapping:** Phase 3 or 4 (Content Integration) — after the design system and components are built, swap in real content.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Foundation / Build Tool Setup | Choosing too heavy a framework (Next.js, SvelteKit) for a content site that needs zero client-side JS for core functionality | Use Astro or 11ty; output static HTML. If using Astro, use `client:visible` or `client:idle` directives sparingly. |
| Foundation / Image Pipeline | Generating too many image variants and bloating the repo/deploy | Generate 3-4 sizes max per image (400w, 800w, 1200w, 1600w). Use AVIF with WebP fallback. Automate in CI, not committed to repo. |
| Animation System / Parallax | Using a heavy animation library (GSAP ~30KB min) when CSS can handle 80% of the effects | Start with CSS-only animations. Add GSAP only for effects CSS cannot achieve (timeline sequences, morphing). |
| Animation System / Scroll Reveals | Revealing everything on scroll creates "animation fatigue" — nothing feels special when everything animates | Be selective: animate section entrances and key images. Leave body text, nav, and footer static. |
| Interactive Components / Lightbox | Building custom instead of using a battle-tested library | Use PhotoSwipe 5 (7KB gzipped, touch-native, accessible, supports zoom). |
| Polish / Page Transitions | Spending weeks on cross-browser transition polish for diminishing returns | Use View Transitions API with `@view-transition { navigation: auto; }` — 3 lines of CSS for 60% of browsers. Accept no transition for the rest. |
| Polish / Custom Cursor | Custom cursor effects break on touch devices, have lag on high-DPI screens, and annoy more users than they delight | Skip custom cursors entirely. Invest that effort in better hover states and micro-interactions within content. |
| Content / SEO | Animations hiding content from search engine crawlers | Ensure all text content is in the DOM on page load (not injected via JS). Use semantic HTML. animations should reveal existing content, not create it. |
| Deployment / GitHub Pages | Cache invalidation — GitHub Pages CDN caches aggressively and updates can take 5-10 minutes to propagate | Use cache-busting filenames (hash in filename) for CSS/JS. Accept that image cache invalidation is not controllable. |

---

## The Overarching Meta-Pitfall

**The biggest risk for this project is prioritizing animation spectacle over content experience.** The Caddie Chat has genuinely compelling stories and beautiful photography. The writing is strong. The photography is evocative. The rebuild should make the content more impactful, not compete with it. Every animation should serve one of these purposes:

1. **Guide attention** — draw the eye to the next piece of content
2. **Create continuity** — smooth the transition between content sections
3. **Add depth** — make the photography feel more present and tangible
4. **Reward interaction** — make hover and click feel responsive and premium

If an animation does not serve one of these purposes, cut it. The best immersive sites feel effortless, not animated. The animations should be invisible in the sense that the user feels the quality without consciously noticing the technique.

---

## Sources

- Codebase analysis: `/thecaddiechat/assets/css/style.css` (475 lines), `/thecaddiechat/assets/js/main.js` (136 lines), 19 HTML pages examined
- CSS `scroll-timeline` and `animation-timeline` specifications: CSS Scroll-driven Animations specification (W3C)
- View Transitions API: MDN Web Docs, Chrome Developers documentation
- Core Web Vitals thresholds: web.dev (Google)
- GitHub Pages limits: GitHub documentation (1 GB repo soft limit, 100 GB/month bandwidth)
- Image format support: caniuse.com (AVIF ~92% support, WebP ~97% support as of 2026)
- iOS Safari scroll behavior: WebKit blog, extensive community documentation of scroll event throttling
- Confidence: HIGH for all critical and moderate pitfalls (based on direct codebase evidence and well-established web platform knowledge)
