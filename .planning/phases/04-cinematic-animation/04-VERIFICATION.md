---
phase: 04-cinematic-animation
verified: 2026-03-05T20:55:00Z
status: human_needed
score: 11/11 must-haves verified
re_verification:
  previous_status: gaps_found
  previous_score: 10/11
  gaps_closed:
    - "Lightbox.astro migrated from DOMContentLoaded to astro:page-load with { once: false } -- Lightbox re-initializes correctly after View Transitions SPA navigation"
  gaps_remaining: []
  regressions: []
human_verification:
  - test: "Navigate from homepage to any course article page (e.g. /courses/stonewall/), then navigate back and navigate to a different course page. Click an image on the second course page."
    expected: "Lightbox opens and shows the image with caption. Navigation arrows work."
    why_human: "Cannot verify Lightbox re-initialization after SPA navigation programmatically -- requires actual browser navigation sequence."
  - test: "Load homepage and scroll down. Observe hero text sequence timing."
    expected: "Kicker fades in first, then h1 lines stagger in one by one, then sub/cta/meta/scroll indicator in sequence. Background slowly zooms as you scroll past hero."
    why_human: "GSAP timeline sequence and parallax feel cannot be verified statically."
  - test: "Load any article page (e.g. /chronicles/viktor-hovland/). Scroll through it slowly."
    expected: "Pull quotes slide in from left as they enter viewport. Images with data-scroll-reveal fade and rise into view."
    why_human: "Runtime scroll-triggered animation behavior cannot be verified statically."
  - test: "Visit site with OS motion preference set to 'Reduce Motion'."
    expected: "All hero elements visible immediately (no invisible elements on load). No smooth scroll momentum. No parallax. Scroll-reveal elements visible at rest."
    why_human: "prefers-reduced-motion runtime behavior requires browser simulation."
---

# Phase 4: Cinematic Animation Verification Report

**Phase Goal:** Scrolling through the site feels cinematic -- content reveals elegantly, heroes have parallax depth, stories unfold as scroll-driven sequences, and page navigation is seamless
**Verified:** 2026-03-05T20:55:00Z
**Status:** human_needed
**Re-verification:** Yes -- after gap closure (Plan 04-03: Lightbox lifecycle migration)

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Smooth scroll via Lenis is active -- scrolling feels fluid with momentum on all pages | VERIFIED | `src/layouts/BaseLayout.astro` lines 129-136: `new Lenis({ duration: 1.2, easing: ... })`, ticker integration, `lagSmoothing(0)`. Conditional on `!prefersReduced`. |
| 2 | Content sections with data-scroll-reveal fade/slide into view as user scrolls down | VERIFIED | `global.css` line 127: `[data-scroll-reveal] { opacity: 0; transform: translateY(var(--distance-md)); }`. BaseLayout lines 143-154: `ScrollTrigger.batch('[data-scroll-reveal]', ...)` animates to `opacity:1, y:0`. 14 source files use the attribute. |
| 3 | Page navigation uses View Transitions crossfade -- no hard page reloads | VERIFIED | `BaseLayout.astro` line 2: `import { ClientRouter } from 'astro:transitions'`, line 23: `<ClientRouter />` in head. |
| 4 | All existing scripts (Nav scroll detection, mobile menu, StatsRow counter, Lightbox) work after View Transitions navigation | VERIFIED | Nav.astro line 245: `astro:page-load, { once: false }` -- WIRED. StatsRow.astro line 66: `astro:page-load, { once: false }` -- WIRED. Lightbox.astro line 98: `astro:page-load`, line 197: `{ once: false }` -- MIGRATED (gap closed). Zero `DOMContentLoaded` references remain in src/. |
| 5 | prefers-reduced-motion disables Lenis smooth scroll and all GSAP animations | VERIFIED | BaseLayout line 125: `window.matchMedia('(prefers-reduced-motion: reduce)').matches` -- Lenis init skipped when true. `ctx = gsap.context(() => { if (prefersReduced) return; ... })` -- all GSAP animations skipped. Hero.astro `@media (prefers-reduced-motion: reduce)` sets all hero elements to `opacity:1; transform:none`. global.css line 158: mobile `[data-scroll-reveal] { opacity:1; transform:none }`. |
| 6 | Homepage hero text animates in with a sequenced GSAP timeline on page load | VERIFIED | BaseLayout lines 38-88: `initHeroAnimations()` defines full GSAP timeline with sequenced `.from()` calls for kicker, hero-line, sub, cta, meta, scroll. Line 161: called when `path === '/'`. Hero.astro CSS: all elements set to `opacity:0` (no CSS animations). No `heroZoom`, `heroLineIn`, or `heroFadeIn` keyframes in Hero.astro. |
| 7 | Scrolling past the hero shows parallax background movement and content fade-out | VERIFIED | BaseLayout lines 53-88: `gsap.to('.hero-bg img', { yPercent:20, scale:1.1, scrollTrigger:{scrub:true} })` and `gsap.to('.hero-content', { opacity:0, y:80, scrollTrigger:{scrub:true} })`. |
| 8 | FullBleed images on article pages scale up from slightly smaller as they scroll into view | VERIFIED | BaseLayout lines 93-105: `gsap.from(element, { scale:0.95, duration:1, scrollTrigger:... })` iterating `.full-bleed-image`. FullBleed.astro line 12: `data-scroll-reveal` on figure root. Dispatcher on line 166: fires for `/(chronicles|courses)/[^/]+/$`. |
| 9 | Inline and featured images on article pages fade and rise into view on scroll | VERIFIED | FeaturedImage.astro line 12: `data-scroll-reveal`. InlineImage.astro line 12: `data-scroll-reveal`. Both caught by global `ScrollTrigger.batch`. |
| 10 | Pull quotes on article pages slide in from the left on scroll | VERIFIED | BaseLayout lines 108-121: `gsap.from(element, { x:-30, opacity:0, scrollTrigger:... })` for `.article-body blockquote, .course-body blockquote`. ArticleLayout lines 144-145: blockquote CSS `opacity:0; transform:translateX(-30px)` with `@media (prefers-reduced-motion)` override. CourseLayout lines 229-231: same. |
| 11 | prefers-reduced-motion disables all hero and storytelling animations | VERIFIED | `initHeroAnimations()` and `initStorytellingAnimations()` called inside `gsap.context(() => { if (prefersReduced) return; })`. CSS fallbacks on hero elements and blockquotes ensure visibility at rest. global.css motion tokens zeroed at lines 92-107. |

**Score:** 11/11 truths verified

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/layouts/BaseLayout.astro` | GSAP + Lenis init, ClientRouter, lifecycle cleanup, initHeroAnimations, initStorytellingAnimations | VERIFIED | All present: `import Lenis`, `ClientRouter` in head, `astro:page-load` init, `astro:before-swap` cleanup, both dispatcher functions defined and called. |
| `src/styles/global.css` | `[data-scroll-reveal]` hidden state, mobile override, scroll-behavior removed | VERIFIED | Line 127: `[data-scroll-reveal] { opacity:0; transform:translateY(...) }`. Line 158: mobile override `opacity:1; transform:none`. No `scroll-behavior: smooth` anywhere in file. |
| `src/components/Nav.astro` | Migrated to astro:page-load, IntersectionObserver removed | VERIFIED | Line 245: `document.addEventListener('astro:page-load', () => { ... }, { once: false })`. No IntersectionObserver in script. |
| `src/components/StatsRow.astro` | astro:page-load lifecycle, data-scroll-reveal attribute | VERIFIED | Line 16: `data-scroll-reveal` on root div. Line 66: `astro:page-load, { once: false }`. |
| `src/components/Hero.astro` | GSAP-initialized (CSS opacity:0), no @keyframes, no script block | VERIFIED | No CSS @keyframes (heroZoom, heroLineIn, heroFadeIn absent). No `<script>` tag. Hero elements set to `opacity:0` in CSS for GSAP to animate from. Reduced-motion block shows all elements immediately. |
| `src/components/mdx/FullBleed.astro` | data-scroll-reveal attribute | VERIFIED | Line 12: `<figure class="full-bleed-image" data-scroll-reveal>` |
| `src/components/mdx/FeaturedImage.astro` | data-scroll-reveal attribute | VERIFIED | Line 12: `<figure class="featured-image" data-scroll-reveal>` |
| `src/components/mdx/InlineImage.astro` | data-scroll-reveal attribute | VERIFIED | Line 12: `<figure class="inline-image" data-scroll-reveal>` |
| `src/layouts/ArticleLayout.astro` | .article-body wrapper, blockquote CSS hidden state, reduced-motion override | VERIFIED | Line 42: `<div class="article-body">` wraps slot. Lines 144-152: blockquote `opacity:0; transform:translateX(-30px)` with `@media (prefers-reduced-motion)` override. |
| `src/layouts/CourseLayout.astro` | .course-body wrapper, blockquote CSS hidden state, reduced-motion override | VERIFIED | Line 79: `<article class="course-body">` wraps slot. Lines 228-237: blockquote `opacity:0; transform:translateX(-30px)` with `@media (prefers-reduced-motion)` override. |
| `src/components/Lightbox.astro` | Migrated to astro:page-load lifecycle | VERIFIED | Line 98: `document.addEventListener('astro:page-load', () => {`. Line 197: `}, { once: false });`. Zero DOMContentLoaded references remain anywhere in src/. Gap closed by Plan 04-03. |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `BaseLayout.astro` | lenis + gsap | npm imports in script tag | WIRED | Lines 28-31: `import gsap from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`, `import Lenis from 'lenis'`, `import 'lenis/dist/lenis.css'`. package.json: `gsap: ^3.14.2`, `lenis: ^1.3.18`. |
| `BaseLayout.astro` | astro:transitions | ClientRouter in head | WIRED | Line 2 frontmatter: `import { ClientRouter } from 'astro:transitions'`. Line 23: `<ClientRouter />` in `<head>`. |
| `BaseLayout.astro` | GSAP ScrollTrigger lifecycle | astro:page-load init, astro:before-swap cleanup | WIRED | Line 178: `document.addEventListener('astro:page-load', init)`. Line 179: `document.addEventListener('astro:before-swap', cleanup)`. cleanup() calls `ctx?.revert()` and `lenis?.destroy()`. |
| `Nav.astro` | View Transitions lifecycle | astro:page-load replaces DOMContentLoaded | WIRED | Line 245: `document.addEventListener('astro:page-load', () => { ... }, { once: false })`. |
| `Hero.astro` | BaseLayout GSAP context | initHeroAnimations called from BaseLayout page-load handler | WIRED | BaseLayout line 38-88: `initHeroAnimations()` defined. Line 161: called when `path === '/'`. Hero.astro has no script, all animation driven from BaseLayout. |
| `BaseLayout.astro` | article storytelling | Route-based animation dispatcher in astro:page-load | WIRED | Line 166: `if (path.match(/^\/(chronicles|courses)\/[^/]+\/$/)`) calls `initStorytellingAnimations()`. |
| `FullBleed.astro` | GSAP ScrollTrigger | data-scroll-reveal attribute triggering batch animation | WIRED | data-scroll-reveal on figure root (line 12). BaseLayout ScrollTrigger.batch targets `[data-scroll-reveal]` globally. |
| `Lightbox.astro` | View Transitions lifecycle | astro:page-load replaces DOMContentLoaded | WIRED | Line 98: `astro:page-load`. Line 197: `{ once: false }`. Gap closed by Plan 04-03 (commit abac356). Zero DOMContentLoaded remains in src/. |

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| ANIM-01 | 04-01 | Scroll-reveal animations -- content elegantly appears as user scrolls | SATISFIED | `[data-scroll-reveal]` pattern on 14 source files. `ScrollTrigger.batch` in BaseLayout animates them. Build verified (19 pages). |
| ANIM-02 | 04-01 | Smooth scroll behavior via Lenis across all pages | SATISFIED | `new Lenis()` in BaseLayout `init()`, registered with GSAP ticker, active on all 19 pages via BaseLayout. |
| ANIM-03 | 04-02 | GSAP-powered cinematic hero animations with parallax depth | SATISFIED | `initHeroAnimations()` with GSAP timeline and ScrollTrigger parallax/scrub in BaseLayout. Hero CSS @keyframes removed. |
| ANIM-05 | 04-02 | Scroll-driven storytelling sequences on chronicle and course pages | SATISFIED | `initStorytellingAnimations()` dispatched on article route match. Full-bleed scale, blockquote slide-in, plus image fade-rise via data-scroll-reveal. |
| TRNS-01 | 04-01, 04-03 | View Transitions API for smooth cross-page navigation | SATISFIED | ClientRouter active. Nav, StatsRow, and Lightbox all migrated to astro:page-load. Zero DOMContentLoaded in src/. All component scripts work after SPA navigation. |

No orphaned requirements -- all five requirement IDs (ANIM-01, ANIM-02, ANIM-03, ANIM-05, TRNS-01) are accounted for and satisfied.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| None | -- | -- | -- | No anti-patterns detected. All components use correct lifecycle events. No stubs or placeholder implementations found. |

---

### Human Verification Required

All automated checks pass. The following items require browser testing to confirm runtime behavior.

#### 1. Lightbox Re-initialization After SPA Navigation

**Test:** Navigate from the homepage to /courses/stonewall/ using the site nav (SPA navigation, not hard refresh). Click an image (confirm lightbox opens). Press Escape. Navigate back to homepage via the nav. Navigate to /courses/winged-foot/. Click an image.
**Expected:** Lightbox opens and is fully functional on the second course page -- images are clickable, arrows navigate, Escape closes.
**Why human:** Requires a real browser navigation sequence with View Transitions to confirm the astro:page-load listener fires correctly on each navigation.

#### 2. Hero Timeline Sequence

**Test:** Load the homepage (clear cache). Observe the hero text sequence timing.
**Expected:** Kicker fades in at ~0.3s, h1 lines stagger in one-by-one starting at ~0.5s with 0.2s between each, sub at ~1.2s, CTA at ~1.4s, meta at ~1.6s, scroll indicator at ~2.0s. Feels choreographed and cinematic rather than simultaneous.
**Why human:** GSAP timeline sequence and easing feel cannot be verified statically.

#### 3. Hero Parallax on Scroll

**Test:** Load the homepage. Slowly scroll past the hero section.
**Expected:** Background image moves slower than scroll (parallax) and slightly scales up. Hero text/CTA fades out and moves up as you scroll. Scroll indicator fades out quickly.
**Why human:** ScrollTrigger scrub animation is runtime behavior.

#### 4. Article Storytelling Animations

**Test:** Load /courses/stonewall/ or any chronicle. Scroll slowly through the article.
**Expected:** Pull quotes slide in from the left as they enter the viewport. Full-bleed images scale up from slightly smaller. Inline/featured images fade and rise into view. Animations feel smooth and editorial.
**Why human:** Scroll-triggered animation behavior requires runtime scroll interaction.

#### 5. Reduced Motion Accessibility

**Test:** Set OS/browser to Reduce Motion. Load the homepage.
**Expected:** Hero is fully visible immediately (no invisible elements on page load). No smooth scroll momentum. No parallax movement while scrolling. Pull quotes and data-scroll-reveal elements visible at rest without animation.
**Why human:** prefers-reduced-motion runtime behavior requires browser/OS setting change.

---

### Re-verification Summary

**Gap closed:** The single blocking gap from the initial verification is resolved. `Lightbox.astro` was migrated from `DOMContentLoaded` to `astro:page-load` with `{ once: false }` by Plan 04-03 (commit abac356). Verification confirms:

- `src/components/Lightbox.astro` line 98: `astro:page-load`
- `src/components/Lightbox.astro` line 197: `{ once: false }`
- `grep -r "DOMContentLoaded" src/` returns zero results -- no component uses the old lifecycle

**No regressions:** All 10 previously-passing truths continue to pass. Build completes cleanly (19 pages, 5.49s). All key links wired. All requirements satisfied.

**Remaining for human:** Four human verification items were carried over from the initial verification (hero timeline, parallax, article storytelling, reduced motion) plus one new item for the Lightbox fix itself. All automated checks pass -- phase goal is fully implemented. Human testing confirms the cinematic feel cannot be verified statically.

---

*Verified: 2026-03-05T20:55:00Z*
*Verifier: Claude (gsd-verifier)*
