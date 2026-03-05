# Phase 4: Cinematic Animation - Research

**Researched:** 2026-03-05
**Domain:** Scroll animation, smooth scrolling, parallax, view transitions (GSAP + Lenis + Astro)
**Confidence:** HIGH

## Summary

Phase 4 adds cinematic motion to The Caddie Chat: smooth scrolling via Lenis, scroll-triggered content reveals and parallax via GSAP ScrollTrigger, a GSAP-powered hero entrance sequence, scroll-driven storytelling on article pages, and Astro View Transitions for seamless cross-page navigation. The project already has a complete motion design system (Phase 3 tokens: easing curves, durations, distances) and basic CSS scroll reveals + hero animations that will be replaced by the GSAP-powered versions.

All three core libraries (GSAP, Lenis, Astro ClientRouter) are free, well-documented, and actively maintained. GSAP is now 100% free following Webflow's acquisition -- the GSAP Club licensing concern noted in STATE.md is resolved. The primary integration challenge is coordinating GSAP ScrollTrigger cleanup with Astro View Transitions lifecycle events, which has a documented solution pattern using `gsap.context()` + `astro:page-load` / `astro:after-swap` events.

**Primary recommendation:** Install GSAP + Lenis, initialize them in BaseLayout with proper View Transitions lifecycle hooks, then layer animations from global (smooth scroll, scroll reveals) to page-specific (hero parallax, storytelling sequences).

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ANIM-01 | Scroll-reveal animations -- content elegantly appears as user scrolls | GSAP ScrollTrigger.batch() replaces current IntersectionObserver `.reveal` system with staggered, eased reveals |
| ANIM-02 | Smooth scroll behavior via Lenis across all pages | Lenis initialized in BaseLayout, synced to GSAP ticker, destroyed/recreated on View Transitions navigation |
| ANIM-03 | GSAP-powered cinematic hero animations with parallax depth | GSAP timeline for hero entrance (replacing CSS @keyframes), ScrollTrigger scrub for parallax background + content fade |
| ANIM-05 | Scroll-driven storytelling sequences on chronicle and course pages | ScrollTrigger on MDX image components (FullBleed, FeaturedImage, InlineImage) for reveal-on-scroll and subtle parallax |
| TRNS-01 | View Transitions API for smooth cross-page navigation | Astro `<ClientRouter />` in BaseLayout head, with GSAP context cleanup on `astro:after-swap` |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gsap | ^3.12 | Animation engine, ScrollTrigger plugin | Industry standard for scroll-driven animation; now 100% free; directly compatible with motion tokens already in global.css |
| lenis | ^1.3 | Smooth scroll | Lightweight (no DOM wrapper), works with native scroll, proven GSAP ScrollTrigger integration; project already decided on Lenis over ScrollSmoother |
| astro:transitions | (built-in) | View Transitions | Built into Astro 5; `<ClientRouter />` component provides crossfade navigation with zero additional dependencies |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| gsap/ScrollTrigger | (included with gsap) | Scroll-linked animation triggers | Every scroll-reveal, parallax, and storytelling animation |
| lenis/dist/lenis.css | (included with lenis) | Required Lenis styles | Must be imported alongside Lenis JS initialization |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Lenis | GSAP ScrollSmoother | ScrollSmoother wraps DOM in fixed container, breaking position:fixed elements (Nav uses position:fixed). Lenis preserves native DOM. Both now free. |
| GSAP ScrollTrigger | CSS scroll-driven animations | CSS `animation-timeline: scroll()` lacks Safari support and cannot orchestrate complex sequences |
| Astro ClientRouter | Barba.js | Barba adds another dependency for page transitions; Astro's built-in solution is zero-config and handles prefetching |

**Installation:**
```bash
npm install gsap lenis
```

No additional Astro packages needed -- `astro:transitions` is built into Astro 5.

## Architecture Patterns

### Recommended Script Architecture

```
src/
  layouts/
    BaseLayout.astro     # <ClientRouter /> in <head>, GSAP+Lenis init in <script>
  components/
    Hero.astro           # Hero-specific GSAP timeline (replaces CSS @keyframes)
    Nav.astro            # Keep existing scroll listener, migrate from DOMContentLoaded to astro:page-load
    StatsRow.astro       # Migrate counter animation to astro:page-load
  components/mdx/
    FullBleed.astro      # Add data-scroll-reveal class for ScrollTrigger
    FeaturedImage.astro  # Add data-scroll-reveal class for ScrollTrigger
    InlineImage.astro    # Add data-scroll-reveal class for ScrollTrigger
  styles/
    global.css           # Existing motion tokens (no changes needed)
```

### Pattern 1: Global GSAP + Lenis Initialization (BaseLayout)

**What:** Single initialization point for smooth scroll and ScrollTrigger, with View Transitions lifecycle management.
**When to use:** Always -- this is the foundation all other animations depend on.
**Example:**

```astro
<!-- BaseLayout.astro <head> -->
<ClientRouter />

<!-- BaseLayout.astro <body> end -->
<script>
  import gsap from 'gsap';
  import { ScrollTrigger } from 'gsap/ScrollTrigger';
  import Lenis from 'lenis';
  import 'lenis/dist/lenis.css';

  gsap.registerPlugin(ScrollTrigger);

  let lenis: Lenis | null = null;
  let ctx: gsap.Context | null = null;

  function initAnimations() {
    // Create Lenis smooth scroll
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis?.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Create GSAP context for cleanup
    ctx = gsap.context(() => {
      // Global scroll-reveal animations
      ScrollTrigger.batch('[data-scroll-reveal]', {
        onEnter: (batch) => gsap.to(batch, {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: true,
        }),
        start: 'top 85%',
        once: true,
      });
    });
  }

  function cleanupAnimations() {
    ctx?.revert();
    ctx = null;
    lenis?.destroy();
    lenis = null;
  }

  // Astro View Transitions lifecycle
  document.addEventListener('astro:page-load', () => {
    initAnimations();
  });

  document.addEventListener('astro:before-swap', () => {
    cleanupAnimations();
  });
</script>
```

### Pattern 2: Page-Specific Animation Context

**What:** Animations scoped to specific pages (homepage hero, article storytelling) using route checks.
**When to use:** When a page has unique animations not shared globally.
**Example:**

```typescript
// Inside astro:page-load handler
document.addEventListener('astro:page-load', () => {
  const isHome = window.location.pathname === '/';
  const isArticle = window.location.pathname.match(/^\/(chronicles|courses)\/[^/]+\/$/);

  if (isHome) {
    initHeroAnimations(); // parallax, entrance timeline
  }
  if (isArticle) {
    initStorytellingAnimations(); // image reveals, text parallax
  }
});
```

### Pattern 3: Hero Parallax with GSAP ScrollTrigger

**What:** Replace the current vanilla JS parallax in Hero.astro with GSAP ScrollTrigger scrub.
**When to use:** Homepage hero section.
**Example:**

```typescript
function initHeroAnimations() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // Parallax background
  gsap.to('.hero-bg img', {
    yPercent: 20,
    scale: 1.1,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  // Content fade-out on scroll
  gsap.to('.hero-content', {
    opacity: 0,
    y: 80,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: '60% top',
      scrub: true,
    },
  });
}
```

### Pattern 4: Storytelling Scroll Sequences (Article Pages)

**What:** Images and pull quotes animate into view as scroll position reveals them, creating a narrative rhythm.
**When to use:** Chronicle and course article pages.
**Example:**

```typescript
function initStorytellingAnimations() {
  // Full-bleed images: scale up from slightly smaller
  gsap.utils.toArray('.full-bleed-image').forEach((el) => {
    gsap.from(el as Element, {
      scale: 0.95,
      opacity: 0,
      duration: 1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el as Element,
        start: 'top 80%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Pull quotes: slide in from left
  gsap.utils.toArray('.pull-quote').forEach((el) => {
    gsap.from(el as Element, {
      x: -30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el as Element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Inline images: fade and rise
  gsap.utils.toArray('.inline-image, .featured-image').forEach((el) => {
    gsap.from(el as Element, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el as Element,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}
```

### Anti-Patterns to Avoid

- **Scroll hijacking:** Lenis should smooth scrolling, NOT change scroll direction or lock scroll position. The requirements explicitly list "scroll hijacking" as Out of Scope.
- **DOMContentLoaded with View Transitions:** ALL scripts must use `astro:page-load` instead of `DOMContentLoaded`, because bundled scripts only run once with View Transitions enabled.
- **Forgetting cleanup:** Every GSAP animation must be inside a `gsap.context()` that gets reverted on `astro:before-swap`. Without this, ScrollTrigger instances accumulate and break on subsequent navigations.
- **Over-animating:** Keep reveals subtle (opacity + small translateY). The photography should be the star, not the animations competing with it.
- **Pinned sections on mobile:** ScrollTrigger pinning can cause janky behavior on mobile Safari. Avoid `pin: true` entirely -- it is not needed for any requirement.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Smooth scrolling | Custom requestAnimationFrame scroll interceptor | Lenis | Safari 60fps cap, iOS touch events, momentum tuning -- deceptively complex |
| Scroll-linked parallax | Vanilla scroll event + translateY math (currently in Hero.astro) | GSAP ScrollTrigger with `scrub` | Proper cleanup, performance optimization, progress-based rather than pixel-based |
| Scroll reveal | IntersectionObserver with manual CSS classes (currently in Nav.astro) | GSAP ScrollTrigger.batch() | Batching, staggering, easing, and cleanup all handled automatically |
| Page transitions | Manual DOM manipulation or fetch-and-swap | Astro `<ClientRouter />` | Built-in prefetching, accessibility (route announcement), reduced-motion support, browser fallback |
| Animation cleanup on navigation | Manual tracking of all animation references | `gsap.context()` | Automatically reverts all GSAP tweens, ScrollTriggers, and event listeners created within the context |

**Key insight:** The current codebase has hand-rolled versions of scroll reveals (IntersectionObserver in Nav.astro), hero parallax (vanilla scroll in Hero.astro), and counter animations (vanilla rAF in StatsRow.astro). All of these will be replaced by GSAP-powered equivalents that participate in the same lifecycle and cleanup system.

## Common Pitfalls

### Pitfall 1: ScrollTrigger Breaks on Second Navigation
**What goes wrong:** Animations work on first page load but fail or auto-play when navigating back to the same page via View Transitions.
**Why it happens:** ScrollTrigger instances from the previous visit are not cleaned up; they reference stale DOM elements and miscalculate scroll positions.
**How to avoid:** Use `gsap.context()` for ALL animations. Call `ctx.revert()` in the `astro:before-swap` event handler -- this kills all ScrollTriggers, tweens, and listeners created within the context.
**Warning signs:** Animations firing immediately on page load instead of on scroll; ScrollTrigger markers appearing at wrong positions.

### Pitfall 2: Lenis + ScrollTrigger Desync
**What goes wrong:** ScrollTrigger triggers at wrong scroll positions because it reads native scrollY while Lenis provides smoothed values.
**Why it happens:** Lenis and ScrollTrigger must share the same scroll position source.
**How to avoid:** Sync them explicitly: `lenis.on('scroll', ScrollTrigger.update)` and add Lenis to GSAP ticker: `gsap.ticker.add((time) => lenis.raf(time * 1000))`. Disable GSAP lag smoothing: `gsap.ticker.lagSmoothing(0)`.
**Warning signs:** Animations triggering slightly too early or too late; jerky scroll-linked parallax.

### Pitfall 3: Flash of Unstyled Content (FOUC) on Animated Elements
**What goes wrong:** Elements meant to animate in (opacity: 0 -> 1) briefly flash visible before the animation initializes.
**Why it happens:** HTML renders before JavaScript executes. Elements are visible at their default state before GSAP sets them to opacity: 0.
**How to avoid:** Set initial hidden state in CSS (not JavaScript): add `[data-scroll-reveal] { opacity: 0; transform: translateY(var(--distance-md)); }` to global.css. The existing `.reveal` class already does this and can be repurposed.
**Warning signs:** Content briefly appears then disappears before sliding in.

### Pitfall 4: Mobile Performance with Too Many ScrollTriggers
**What goes wrong:** Page becomes janky on mobile with many scroll-linked animations.
**Why it happens:** Each ScrollTrigger recalculates on every scroll event; mobile GPUs are weaker.
**How to avoid:** Use `ScrollTrigger.batch()` instead of individual triggers for repeated elements. Use `once: true` for reveal animations (no need to re-trigger). Limit scrubbed (continuously calculated) animations to hero parallax only. Use `toggleActions: 'play none none none'` (fire once, don't reverse on scroll back).
**Warning signs:** Frame drops on scroll, especially on iOS Safari.

### Pitfall 5: Lenis Breaks Position:Fixed Elements (It Doesn't, But ScrollSmoother Does)
**What goes wrong:** Developers confuse Lenis behavior with ScrollSmoother.
**Why it happens:** ScrollSmoother wraps content in a fixed container, breaking position:fixed. Lenis does NOT do this -- it uses native scroll.
**How to avoid:** Use Lenis (already decided). The fixed Nav component will work perfectly without modifications.
**Warning signs:** None with Lenis. Only relevant if someone mistakenly switches to ScrollSmoother.

### Pitfall 6: prefers-reduced-motion Not Respected
**What goes wrong:** Users with motion sensitivity see all animations.
**Why it happens:** GSAP animations bypass the CSS `prefers-reduced-motion` media query that Phase 3 set up.
**How to avoid:** Check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before initializing animations. Skip Lenis smooth scroll and all GSAP animations when true. The existing CSS token zeroing (Phase 3) handles CSS animations, but GSAP needs explicit checking.
**Warning signs:** Accessibility complaints; animations playing despite system motion settings.

### Pitfall 7: `html { scroll-behavior: smooth }` Conflicts with Lenis
**What goes wrong:** Double-smoothing creates sluggish, over-dampened scroll feel.
**Why it happens:** CSS `scroll-behavior: smooth` and Lenis both try to smooth scroll -- they compound.
**How to avoid:** Remove `scroll-behavior: smooth` from `html` in global.css when Lenis is active. Lenis replaces this functionality entirely.
**Warning signs:** Scroll feeling overly slow or "floaty."

## Code Examples

### Complete BaseLayout Integration

```astro
---
import { ClientRouter } from 'astro:transitions';
import '../styles/global.css';
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css';
import '@fontsource-variable/dm-sans';

interface Props {
  title: string;
  description?: string;
}
const { title, description } = Astro.props;
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <ClientRouter />
</head>
<body>
  <slot />
  <script>
    import gsap from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';
    import Lenis from 'lenis';
    import 'lenis/dist/lenis.css';

    gsap.registerPlugin(ScrollTrigger);

    let lenis: Lenis | null = null;
    let ctx: gsap.Context | null = null;

    function init() {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // Smooth scroll (skip for reduced motion)
      if (!prefersReduced) {
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((time: number) => { lenis?.raf(time * 1000); });
        gsap.ticker.lagSmoothing(0);
      }

      // GSAP animation context
      ctx = gsap.context(() => {
        if (prefersReduced) return;

        // Global scroll reveals
        gsap.set('[data-scroll-reveal]', { opacity: 0, y: 24 });
        ScrollTrigger.batch('[data-scroll-reveal]', {
          onEnter: (batch: Element[]) => gsap.to(batch, {
            opacity: 1, y: 0,
            stagger: 0.1, duration: 0.8,
            ease: 'power2.out', overwrite: true,
          }),
          start: 'top 85%',
          once: true,
        });
      });
    }

    function cleanup() {
      ctx?.revert();
      ctx = null;
      lenis?.destroy();
      lenis = null;
    }

    document.addEventListener('astro:page-load', init);
    document.addEventListener('astro:before-swap', cleanup);
  </script>
</body>
</html>
```

### Hero Entrance Timeline (Replace CSS @keyframes)

```typescript
// In Hero.astro <script> tag
document.addEventListener('astro:page-load', () => {
  if (window.location.pathname !== '/') return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

  tl.from('.hero-kicker', { opacity: 0, y: 16, duration: 0.6 }, 0.3)
    .from('.hero-line', { opacity: 0, y: 50, duration: 0.9, stagger: 0.2 }, 0.5)
    .from('.hero-sub', { opacity: 0, y: 16, duration: 0.6 }, 1.2)
    .from('.hero-cta', { opacity: 0, y: 16, duration: 0.6 }, 1.4)
    .from('.hero-meta', { opacity: 0, duration: 0.6 }, 1.6)
    .from('.hero-scroll', { opacity: 0, duration: 0.6 }, 2.0);
}, { once: false });
```

### Migrating Existing Scripts

Current scripts use `DOMContentLoaded`. Migration pattern:

```typescript
// BEFORE (breaks with View Transitions):
document.addEventListener('DOMContentLoaded', () => { ... });

// AFTER (works with View Transitions):
document.addEventListener('astro:page-load', () => { ... }, { once: false });
```

Affected files:
- `Nav.astro` -- scroll class toggling, mobile menu, scroll reveals
- `StatsRow.astro` -- counter animation
- `Hero.astro` -- parallax scroll handler

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| GSAP Club membership for ScrollTrigger/SplitText | All GSAP plugins free | 2024 (Webflow acquisition) | No licensing concern; resolves STATE.md blocker |
| `<ViewTransitions />` component | `<ClientRouter />` component | Astro 5.0 (late 2024) | Import name changed; same `astro:transitions` module |
| `@studio-freight/lenis` npm package | `lenis` npm package | 2024 | Package renamed; old name deprecated |
| IntersectionObserver for scroll reveals | GSAP ScrollTrigger.batch() | Ongoing best practice | Better performance, stagger control, cleanup integration |
| CSS `scroll-behavior: smooth` | Lenis smooth scroll | Ongoing best practice | Much more control over feel, duration, easing |

**Deprecated/outdated:**
- `@studio-freight/lenis`: Use `lenis` package instead
- `ViewTransitions` import: Use `ClientRouter` from `astro:transitions`
- GSAP Club/paid tier: No longer exists; all plugins free

## Open Questions

1. **Lenis autoRaf vs manual GSAP ticker integration**
   - What we know: Lenis v1.3+ supports `autoRaf: true` for standalone use. However, when syncing with GSAP ScrollTrigger, manual ticker integration is required.
   - What's unclear: Whether `autoRaf: true` can coexist with GSAP ticker sync or if it must be disabled.
   - Recommendation: Use manual integration (do NOT set `autoRaf: true`) when GSAP is involved. The GSAP ticker drives both Lenis and ScrollTrigger from a single animation loop.

2. **Counter animation migration strategy**
   - What we know: StatsRow has a custom rAF counter animation using IntersectionObserver. This could stay vanilla or be migrated to GSAP.
   - What's unclear: Whether migrating to GSAP adds meaningful value vs just switching the event listener.
   - Recommendation: Migrate to `astro:page-load` but keep the vanilla counter animation. It works well and doesn't need GSAP. Only the IntersectionObserver trigger should be replaced with ScrollTrigger for consistency.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Manual visual + build validation |
| Config file | None (static site -- no unit test framework) |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npm run validate-urls` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ANIM-01 | Content sections reveal on scroll with animation | manual-only | Visual inspection in dev server | N/A |
| ANIM-02 | Smooth scroll via Lenis active on all pages | manual-only | Visual inspection -- scroll feel is subjective | N/A |
| ANIM-03 | Homepage hero has parallax + GSAP entrance | manual-only | Visual inspection of hero on homepage | N/A |
| ANIM-05 | Scroll-driven storytelling on article pages | manual-only | Visual inspection on course/chronicle pages | N/A |
| TRNS-01 | View Transitions crossfade between pages | manual-only | Click between pages, observe transition | N/A |

**Justification for manual-only:** Animation behavior is visual and subjective. Automated tests cannot verify "feels cinematic" or "smooth scroll feel." Build validation confirms no regressions; URL validation confirms all 19 pages render. Visual inspection is the only meaningful validation for animation quality.

### Sampling Rate
- **Per task commit:** `npm run build` (confirms no build errors from GSAP/Lenis imports or script changes)
- **Per wave merge:** `npm run build && npm run validate-urls` (confirms all 19 pages still render)
- **Phase gate:** Full build + URL validation + manual scroll-through of all page types (homepage, listing, article)

### Wave 0 Gaps
None -- existing build infrastructure covers compilation validation. No test framework needed for animation verification.

## Sources

### Primary (HIGH confidence)
- [Astro View Transitions docs](https://docs.astro.build/en/guides/view-transitions/) -- ClientRouter setup, lifecycle events, persistence, fallback
- [Astro View Transitions API reference](https://docs.astro.build/en/reference/modules/astro-transitions/) -- ClientRouter import, fade/slide utilities
- [GSAP ScrollTrigger docs](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) -- Plugin API, batch(), create(), cleanup
- [Lenis GitHub README](https://github.com/darkroomengineering/lenis) -- API, GSAP integration pattern, configuration
- [GSAP pricing page](https://gsap.com/pricing/) -- All plugins free (Webflow acquisition)

### Secondary (MEDIUM confidence)
- [Enhancing Astro View Transitions with GSAP](https://vaskopavic.com/blog/enhancing-astro-view-transitions-with-gsap-animations/) -- gsap.context() cleanup pattern with astro:page-load/after-swap
- [GSAP + Astro View Transitions guide](https://www.launchfa.st/blog/gsap-astro-view-transitions) -- Script structure, global GSAP setup in layout
- [GSAP forum: ScrollTrigger + Astro VT compatibility](https://gsap.com/community/forums/topic/40950-compatibility-with-gsap-scrolltrigger-astro-view-transitiosn-api/) -- Known issues and workarounds
- [astro-gsap-lenis reference repo](https://github.com/helm78/astro-gsap-lenis) -- Working integration example

### Tertiary (LOW confidence)
- [ScrollSmoother vs Lenis comparison](https://zuncreative.com/blog/smooth_scroll_meditation/) -- Feature comparison (opinion piece; verified against official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- All libraries verified via official docs; versions confirmed via npm; licensing confirmed free
- Architecture: HIGH -- Integration pattern verified across multiple sources (official docs, community, working repos); consistent solution pattern
- Pitfalls: HIGH -- Known issues documented in GSAP forums with verified solutions; existing codebase has hand-rolled versions that demonstrate exactly what needs replacing
- Code examples: MEDIUM -- Patterns synthesized from multiple sources; specific class names matched to actual codebase selectors

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (30 days -- all three libraries are stable)
