# Phase 3: Design Language - Research

**Researched:** 2026-03-05
**Domain:** Magazine-quality typography system and CSS motion design tokens
**Confidence:** HIGH

## Summary

Phase 3 establishes the editorial design language for The Caddie Chat through two distinct deliverables: a magazine-quality typography hierarchy and a motion design token system. The site already has the right fonts installed (Playfair Display Variable for display, DM Sans Variable for body) and a warm cream/forest green editorial palette. What's missing is (1) systematic typography -- the codebase has 40+ ad-hoc font-size declarations with no shared scale or rhythm, and (2) codified motion -- 30+ transition/animation declarations use inconsistent durations (0.3s-0.8s) and all use the generic `ease` keyword with no shared tokens.

The approach is pure CSS custom properties in `global.css` -- no additional dependencies needed. Typography tokens define a fluid modular scale using `clamp()`. Motion tokens define easing curves, durations, and distances as `--motion-*` custom properties. Both token sets are then applied to the existing ArticleLayout (chronicles) to create the magazine-feature reading experience described in the success criteria.

**Primary recommendation:** Define all typography and motion tokens as CSS custom properties in `src/styles/global.css`, then apply them to ArticleLayout for the chronicle story page transformation. No new npm packages needed.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISL-01 | Magazine-quality typography system with proper hierarchy | Fluid type scale using clamp(), editorial elements (drop caps, pull quotes, blockquotes), typography tokens as CSS custom properties, applied to ArticleLayout and CourseLayout |
| ANIM-04 | Motion design system defined (easing tokens, duration tokens, distance tokens) | CSS custom property motion tokens (--ease-*, --duration-*, --distance-*) in global.css, importable by any component, with GSAP-compatible cubic-bezier values for Phase 4 |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Custom Properties | Native | Typography and motion design tokens | Zero dependencies, works in all modern browsers, Astro scoped styles inherit from :root |
| @fontsource-variable/playfair-display | ^5.2.8 | Display/headline font | Already installed. Variable weight 400-900, italic axis |
| @fontsource-variable/dm-sans | ^5.2.8 | Body/UI font | Already installed. Variable weight 100-1000, optical size axis 9-40 |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| CSS clamp() | Native | Fluid responsive typography | Every font-size token -- scales continuously between mobile and desktop |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS custom properties | Sass variables | Sass compiles away at build time -- can't be overridden at runtime or in component scopes. CSS properties cascade naturally through Astro's scoped styles |
| Fluid clamp() | Media query breakpoints | Breakpoints create jumps between sizes; clamp() scales continuously. Already used for major headings in the codebase |
| Hand-crafted tokens | Open Props / Design Tokens W3C | Over-engineering for a 19-page content site. Adds dependency for what amounts to 30 CSS variables |

**Installation:**
```bash
# No new packages needed. All tools are native CSS.
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── styles/
│   └── global.css         # ADD typography tokens, motion tokens to existing :root
├── layouts/
│   ├── ArticleLayout.astro  # MODIFY: apply typography tokens, add drop cap, enhance pull quotes
│   └── CourseLayout.astro   # MODIFY: apply typography tokens (already has drop cap)
└── components/
    └── (no new components needed)
```

### Pattern 1: Typography Scale as CSS Custom Properties
**What:** Define a fluid modular type scale using `clamp()` values stored in `--font-size-*` custom properties on `:root`.
**When to use:** Everywhere a `font-size` is declared.
**Example:**
```css
/* Source: Fluid Type Scale pattern (utopia.fyi / smashingmagazine.com) */
/* Major Third ratio (1.25) with 16px base, 320px-1280px viewport */
:root {
  /* Type scale -- fluid between 320px and 1280px viewports */
  --font-size-xs:    clamp(0.64rem, 0.59rem + 0.24vw, 0.80rem);   /* 10-13px: meta labels */
  --font-size-sm:    clamp(0.80rem, 0.74rem + 0.30vw, 1.00rem);   /* 13-16px: captions */
  --font-size-base:  clamp(1.00rem, 0.93rem + 0.38vw, 1.25rem);   /* 16-20px: body text */
  --font-size-md:    clamp(1.25rem, 1.16rem + 0.47vw, 1.56rem);   /* 20-25px: large body */
  --font-size-lg:    clamp(1.56rem, 1.45rem + 0.59vw, 1.95rem);   /* 25-31px: h3 */
  --font-size-xl:    clamp(1.95rem, 1.81rem + 0.73vw, 2.44rem);   /* 31-39px: h2 */
  --font-size-2xl:   clamp(2.44rem, 2.27rem + 0.92vw, 3.05rem);   /* 39-49px: h1 article */
  --font-size-3xl:   clamp(3.05rem, 2.83rem + 1.15vw, 3.81rem);   /* 49-61px: page titles */
  --font-size-4xl:   clamp(3.81rem, 3.54rem + 1.44vw, 4.77rem);   /* 61-76px: hero */

  /* Line heights per purpose */
  --leading-tight:   1.1;    /* display headings */
  --leading-snug:    1.25;   /* subheadings */
  --leading-normal:  1.5;    /* UI text */
  --leading-relaxed: 1.7;    /* body copy */
  --leading-loose:   1.9;    /* long-form reading (articles) */

  /* Tracking (letter-spacing) */
  --tracking-tight:  -0.02em;  /* large display type */
  --tracking-normal: 0;        /* body text */
  --tracking-wide:   0.1em;    /* buttons, labels */
  --tracking-wider:  0.15em;   /* small caps, meta */
  --tracking-widest: 0.25em;   /* kickers, section labels */

  /* Measure (max line width) */
  --measure-narrow:  45ch;   /* captions, sidebars */
  --measure-normal:  65ch;   /* body text optimal */
  --measure-wide:    75ch;   /* body text max */
}
```

### Pattern 2: Motion Design Tokens as CSS Custom Properties
**What:** Define easing curves, durations, and distances as `--motion-*` custom properties. Easings are stored as cubic-bezier values that map to GSAP equivalents for Phase 4 compatibility.
**When to use:** Every `transition` and `animation` declaration.
**Example:**
```css
/* Source: Norton Design System pattern, Material Design 3 pattern, GSAP easing equivalents */
:root {
  /* Easing curves */
  --ease-out:        cubic-bezier(0.22, 1, 0.36, 1);    /* GSAP power2.out — primary deceleration */
  --ease-in:         cubic-bezier(0.55, 0.055, 0.675, 0.19); /* GSAP power2.in — acceleration */
  --ease-in-out:     cubic-bezier(0.65, 0, 0.35, 1);    /* GSAP power2.inOut — symmetric */
  --ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);     /* GSAP expo.out — cinematic deceleration */
  --ease-out-back:   cubic-bezier(0.34, 1.56, 0.64, 1); /* slight overshoot for playful elements */

  /* Durations */
  --duration-instant: 100ms;   /* micro-feedback: focus rings, color changes */
  --duration-fast:    200ms;   /* hover states, small transitions */
  --duration-normal:  350ms;   /* element transitions, reveals */
  --duration-slow:    600ms;   /* large element transitions, image reveals */
  --duration-slower:  900ms;   /* entrance animations, scroll reveals */

  /* Distances (translateY values for reveal animations) */
  --distance-sm:     12px;    /* subtle micro-movements */
  --distance-md:     24px;    /* standard reveal offset */
  --distance-lg:     40px;    /* dramatic entrance (current .reveal uses 40px) */

  /* Composed shorthand helpers */
  --transition-color:   color var(--duration-fast) var(--ease-out);
  --transition-hover:   all var(--duration-fast) var(--ease-out);
  --transition-reveal:  opacity var(--duration-slow) var(--ease-out),
                        transform var(--duration-slow) var(--ease-out);
  --transition-image:   transform var(--duration-slower) var(--ease-out);
}

/* Accessibility: disable motion globally */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast:    0ms;
    --duration-normal:  0ms;
    --duration-slow:    0ms;
    --duration-slower:  0ms;
    --distance-sm:     0px;
    --distance-md:     0px;
    --distance-lg:     0px;
  }
}
```

### Pattern 3: Editorial Article Styling (Magazine Feature)
**What:** Apply typography tokens to create magazine-quality reading experience with drop caps, refined pull quotes, proper vertical rhythm, and clear hierarchy.
**When to use:** ArticleLayout.astro (chronicles) and CourseLayout.astro (courses).
**Example:**
```css
/* Drop cap for article opening paragraph */
.article-body > p:first-child::first-letter {
  font-family: var(--font-display);
  font-size: var(--font-size-4xl);
  float: left;
  line-height: 0.8;
  margin-right: 0.08em;
  margin-top: 0.05em;
  color: var(--color-accent);
  font-weight: 700;
}

/* Pull quote — centered editorial breakout */
.article-body .pull-quote {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-style: italic;
  color: var(--color-accent);
  line-height: var(--leading-snug);
  text-align: center;
  padding: var(--space-lg) var(--space-md);
  margin: var(--space-lg) calc(var(--space-md) * -1);
  border-top: 1.5px solid var(--color-border-strong);
  border-bottom: 1.5px solid var(--color-border-strong);
  max-width: none; /* break out of article measure */
}
```

### Anti-Patterns to Avoid
- **Magic number font sizes:** Never use `font-size: 1.15rem` or `font-size: 0.78rem` directly. Always reference a `--font-size-*` token. Current codebase has 40+ unique font sizes with no shared scale.
- **Generic `ease` keyword:** CSS `ease` is `cubic-bezier(0.25, 0.1, 0.25, 1)` which feels generic and sluggish. Use named easing tokens that convey intent (`--ease-out` for most UI, `--ease-out-expo` for cinematic elements).
- **Inconsistent durations:** The codebase uses 0.3s, 0.4s, 0.5s, 0.6s, 0.8s, 1s with no pattern. Consolidate to 5 named duration tokens.
- **Faux italic for Playfair Display:** The site uses `font-style: italic` on Playfair Display in 18+ places, but only imports the upright (normal) variant. Browser synthesizes faux italic which looks inferior. Must import `@fontsource-variable/playfair-display/wght-italic.css` for true italic.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Fluid type scale | Manual clamp() calculations for each element | Systematic scale with ratio (Major Third 1.25) | Ad-hoc sizes create visual disharmony; a ratio-based scale ensures mathematical consistency |
| Responsive font sizes | Media query breakpoints per heading level | clamp() tokens | Breakpoints create discrete jumps; clamp() is continuous and requires zero media queries |
| Motion accessibility | Per-component prefers-reduced-motion checks | Single @media rule zeroing all duration/distance tokens | Current site only checks in 2 places; token approach gives instant global coverage |
| Easing functions | Trial-and-error cubic-bezier per animation | Named tokens mapped to GSAP equivalents | Phase 4 adds GSAP; using compatible easings now means zero rework later |
| Drop cap positioning | Complex JavaScript-based drop cap | CSS `::first-letter` pseudo-element with float | Playfair Display works well with float-based drop caps; `initial-letter` still lacks Firefox support |

**Key insight:** This phase adds ZERO new npm dependencies. Everything is native CSS custom properties applied to existing files. The value comes from systematizing what already exists.

## Common Pitfalls

### Pitfall 1: Breaking Existing Visual Appearance During Token Migration
**What goes wrong:** Replacing inline font sizes and transitions with token references changes the actual values, making the site look different than before.
**Why it happens:** The new type scale values don't match the old ad-hoc values exactly (e.g., old `1.8rem` h2 doesn't map to any scale step).
**How to avoid:** Define tokens FIRST, then apply them in a separate pass. For each element, choose the nearest scale step and visually verify. Accept that some elements will shift slightly -- this is intentional improvement, not regression.
**Warning signs:** A component looks noticeably different (larger/smaller) after token application. Check before/after screenshots.

### Pitfall 2: Playfair Display Faux Italic
**What goes wrong:** Browser synthesizes italic by slanting the upright glyphs, which looks crude compared to the true italic design (different letterforms, not just slanted).
**Why it happens:** BaseLayout only imports `@fontsource-variable/playfair-display` (the `index.css` which is upright-only). The italic CSS file (`wght-italic.css`) exists in node_modules but is not imported.
**How to avoid:** Add `import '@fontsource-variable/playfair-display/wght-italic.css'` to BaseLayout.astro frontmatter. This loads the true italic variant.
**Warning signs:** Italic Playfair text looks merely slanted rather than having redesigned letterforms. Compare letter shapes like 'a', 'e', 'g' between upright and italic -- true italic has distinctly different shapes.

### Pitfall 3: Drop Cap Cross-Browser Inconsistency
**What goes wrong:** `::first-letter` drop caps render at different vertical positions in Chrome, Firefox, and Safari due to font metrics handling.
**Why it happens:** Different browsers calculate the first-letter box differently, especially with web fonts. `line-height` on `::first-letter` doesn't behave consistently across engines.
**How to avoid:** Use `float: left` with explicit `line-height` below 1 (e.g., 0.8), `margin-top` fine-tuning (0.05em-0.1em), and keep `font-size` in rem not em. Test in Chrome, Firefox, and Safari. The CourseLayout already has a working drop cap pattern that can be adapted.
**Warning signs:** Drop cap letter sitting too high or too low, text wrapping incorrectly beside it.

### Pitfall 4: Motion Tokens Not Reaching Scoped Styles
**What goes wrong:** Components with `<style>` blocks (Astro scoped styles) can't use `var(--motion-*)` tokens.
**Why it happens:** Astro scopes styles to components by default. However, CSS custom properties defined in `:root` ARE accessible from scoped styles because they inherit through the DOM.
**How to avoid:** This is actually NOT a problem -- CSS custom properties inherit naturally. Just define them in `:root` in `global.css` and they're available everywhere. This is the correct architecture.
**Warning signs:** Only if tokens are defined in a scoped `<style>` block rather than in `:root` or `<style is:global>`.

### Pitfall 5: Overriding Existing CSS Custom Properties
**What goes wrong:** The CLAUDE.md rule says "Do NOT rename or remove existing variables in `:root`". Adding new variables is fine, but accidentally modifying `--font-display` or `--font-body` could break things.
**Why it happens:** Typography token work naturally touches font-related variables.
**How to avoid:** Only ADD new `--font-size-*`, `--leading-*`, `--tracking-*`, `--measure-*`, `--ease-*`, `--duration-*`, `--distance-*` variables. NEVER modify or remove existing `--color-*`, `--font-display`, `--font-body`, `--space-*`, `--max-width`, or `--nav-height` variables.
**Warning signs:** Existing components change appearance unexpectedly after global.css edits.

## Code Examples

Verified patterns from the existing codebase and official sources:

### Importing Playfair Display Italic
```typescript
// Source: Fontsource docs (fontsource.org/fonts/playfair-display/install)
// In src/layouts/BaseLayout.astro frontmatter:
import '@fontsource-variable/playfair-display';
import '@fontsource-variable/playfair-display/wght-italic.css'; // ADD THIS
import '@fontsource-variable/dm-sans';
```

### Applying Typography Tokens to Article Body
```css
/* Source: Existing ArticleLayout.astro pattern, enhanced with tokens */
.article-body p {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
  line-height: var(--leading-loose);
  margin-bottom: 1.5em;
  max-width: var(--measure-wide);
}
.article-body h2 {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: 500;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  margin-top: 3em;
  margin-bottom: 0.75em;
  color: var(--color-text-primary);
}
.article-body h3 {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 500;
  line-height: var(--leading-snug);
  margin-top: 2em;
  margin-bottom: 0.5em;
  color: var(--color-text-primary);
}
```

### Applying Motion Tokens to Existing Transitions
```css
/* BEFORE (current codebase pattern): */
.nav-links a { transition: color 0.3s ease; }
.content-card { transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease; }
.reveal { transition: opacity 0.8s ease, transform 0.8s ease; }
.content-card-image img { transition: transform 0.8s ease; }

/* AFTER (tokenized): */
.nav-links a { transition: var(--transition-color); }
.content-card { transition: var(--transition-hover); }
.reveal { transition: var(--transition-reveal); }
.content-card-image img { transition: var(--transition-image); }
```

### Accessible Motion Reset
```css
/* Source: Verified pattern from project skill (ui-ux-pro-max) */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant: 0ms;
    --duration-fast:    0ms;
    --duration-normal:  0ms;
    --duration-slow:    0ms;
    --duration-slower:  0ms;
    --distance-sm:     0px;
    --distance-md:     0px;
    --distance-lg:     0px;
  }
  /* Disable all CSS animations */
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### DM Sans Optical Size Usage
```css
/* Source: Fontsource docs -- DM Sans has opsz axis 9-40 */
/* Small text (captions, meta labels) -- use smaller optical size for better legibility */
.caption-text {
  font-family: var(--font-body);
  font-variation-settings: 'opsz' 14;
}
/* Large display text using DM Sans -- use larger optical size */
.display-body {
  font-family: var(--font-body);
  font-variation-settings: 'opsz' 32;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static font sizes per breakpoint | Fluid clamp() scaling | 2022-2023 (browser support universal) | No media queries for type; scales continuously |
| Hard-coded transition values | CSS custom property motion tokens | 2023-2024 (design systems adoption) | Consistent motion across components; single-point reduced-motion |
| Google Fonts CDN import | Fontsource self-hosted | Already done in Phase 2 | No FOUT, no external dependency; variable axes available |
| `ease` keyword everywhere | Named cubic-bezier tokens | Industry standard | Intentional, branded motion feel; GSAP compatibility |
| `initial-letter` for drop caps | `::first-letter` with float | 2024+ (`initial-letter` still Firefox-unsupported) | `::first-letter` is the safe cross-browser approach |
| `@property` for typed CSS vars | Not needed yet | Future consideration | Would enable transitions of custom properties; not required for token definition |

**Deprecated/outdated:**
- `initial-letter` CSS property: Only supported in Safari (as of March 2026). Do NOT use for drop caps. Use `::first-letter` with float instead.
- Separate Google Fonts import link: Already removed in Phase 2. Fontsource self-hosting is in place.

## Open Questions

1. **Exact type scale values: should we use Major Third (1.25) or Perfect Fourth (1.333)?**
   - What we know: The current codebase uses clamp() for headings with various min/max values. Article h1 goes up to 3.5rem, page titles up to 5.5rem, hero up to 7rem.
   - What's unclear: Whether Major Third provides enough contrast between heading levels for the editorial feel, or if Perfect Fourth's wider range is needed.
   - Recommendation: Start with Major Third (1.25). The range from 0.64rem to 4.77rem covers all existing needs. If headings feel too similar during visual review, bump to 1.333.

2. **Should motion tokens be migrated across ALL components in Phase 3 or just the global patterns?**
   - What we know: 30+ components have hard-coded transition values. Migrating all of them is mechanical but touches many files.
   - What's unclear: Whether the planner should include full migration or defer component-level migration to Phase 5 (Visual Polish).
   - Recommendation: Define tokens globally and migrate the core patterns (global.css reveal, buttons, nav, article/course layouts). Defer per-component card/post transitions to Phase 5 where each component gets a polish pass anyway.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Astro Build (npm run build) + URL Validation |
| Config file | astro.config.mjs |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npm run validate-urls` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VISL-01 | Typography tokens defined in global.css | smoke | `npm run build` (catches CSS syntax errors) | N/A (existing file) |
| VISL-01 | Article page renders with proper typography | manual | Visual inspection of chronicle page | N/A |
| VISL-01 | Drop cap renders on article opening paragraph | manual | Visual inspection in Chrome + Firefox | N/A |
| VISL-01 | Pull quotes have editorial styling | manual | Visual inspection of chronicle with pull-quote div | N/A |
| ANIM-04 | Motion tokens defined in global.css | smoke | `npm run build` | N/A |
| ANIM-04 | Motion tokens importable/usable from components | smoke | `npm run build` (verifies CSS variable references resolve) | N/A |
| ANIM-04 | prefers-reduced-motion disables all motion | manual | Toggle reduced-motion in browser devtools | N/A |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npm run validate-urls`
- **Phase gate:** Full suite green + visual inspection of a chronicle page

### Wave 0 Gaps
None -- existing build infrastructure covers all phase requirements. No test framework changes needed. Visual verification is the primary validation method for typography and motion design work.

## Sources

### Primary (HIGH confidence)
- Fontsource Playfair Display Variable: axes are weight (400-900) and italic (0/1). Package installed, upright-only currently imported.
- Fontsource DM Sans Variable: axes are weight (100-1000), optical size (9-40), and italic (0/1). Package installed, upright-only currently imported.
- Codebase audit: 40+ unique font-size values, 30+ unique transition declarations, 18 uses of font-style: italic on Playfair Display
- Norton Design System motion tokens (wwnorton.github.io/design-system/docs/foundations/motion/) -- duration and easing token structure
- GSAP to CSS cubic-bezier mapping (github.com/Dexdot gist) -- easeOutPower2: cubic-bezier(0.25, 0.46, 0.45, 0.94), easeOutPower3: cubic-bezier(0.215, 0.610, 0.355, 1)

### Secondary (MEDIUM confidence)
- Smashing Magazine fluid typography with clamp() (smashingmagazine.com/2022/01/modern-fluid-typography-css-clamp/)
- Utopia.fyi CSS modular scales (utopia.fyi/blog/css-modular-scales/)
- Material Design 3 motion easing tokens (m3.material.io/styles/motion/easing-and-duration/tokens-specs)
- Adrian Roselli accessible drop caps (adrianroselli.com/2019/10/accessible-drop-caps.html)

### Tertiary (LOW confidence)
- `initial-letter` CSS property browser support claim (only Safari). Should verify on caniuse.com before ruling it out entirely, though the ::first-letter fallback is safe regardless.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new dependencies; purely CSS custom properties on existing fonts and styles
- Architecture: HIGH - Pattern is well-established (design tokens as CSS custom properties) and verified against existing codebase structure
- Pitfalls: HIGH - Identified from direct codebase audit (faux italic issue, 40+ ad-hoc sizes, inconsistent durations)
- Typography scale: MEDIUM - Exact ratio and clamp() values should be visually verified during implementation
- Motion tokens: HIGH - Easing cubic-bezier values verified against GSAP equivalents for Phase 4 compatibility

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable domain -- CSS and typography don't change rapidly)
