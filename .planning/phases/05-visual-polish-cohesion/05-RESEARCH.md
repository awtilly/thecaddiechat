# Phase 5: Visual Polish & Cohesion - Research

**Researched:** 2026-03-05
**Domain:** CSS transitions, hover states, animation consistency, accessibility
**Confidence:** HIGH

## Summary

Phase 5 addresses the final two v1 requirements: premium hover states (VISL-02) and consistent visual language across all 19 pages (VISL-03). The codebase already has a well-defined motion token system (Phase 3) with easing curves, durations, and transition shorthands in `global.css`. However, the audit reveals that most components do NOT use these tokens -- they use hard-coded values like `transition: transform 0.8s ease` instead of `var(--transition-image)` or `var(--ease-out)`. Additionally, there are zero focus-visible styles anywhere in the codebase, which is both an accessibility gap and a polish issue.

The work divides naturally into two concerns: (1) standardize all existing transitions to use the motion token system, and (2) add missing premium interactions (link underline animations, card hover polish, focus-visible states, nav active-page indicator). No new libraries are needed. This is pure CSS polish using the existing design system tokens, with minor enhancements to hover behavior patterns.

**Primary recommendation:** Migrate all hard-coded transition values to motion tokens from `global.css`, then add missing premium hover/focus states using those same tokens for guaranteed consistency.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VISL-02 | Premium hover states on cards, links, and navigation elements | Audit identified 6 components with hard-coded transitions needing token migration; 3 link types missing hover animations; zero focus-visible styles; cards missing cursor:pointer |
| VISL-03 | Consistent visual language and animation style across all 19+ pages | Found 25 hard-coded transition declarations vs only 7 using tokens; 4 different easing functions in use; inconsistent hover patterns (some scale, some opacity, some both); footer links use different transition than nav links |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| CSS Custom Properties | N/A | Motion tokens already defined in global.css | Already in place from Phase 3 -- `--duration-*`, `--ease-*`, `--transition-*` |
| Astro scoped styles | 5.18 | Component-level CSS | Already the project pattern |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| GSAP (existing) | 3.14.2 | ScrollTrigger animations only | Already handles scroll reveals and storytelling -- do NOT add GSAP-driven hover states |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| CSS-only hover states | GSAP hover animations | CSS is simpler, more performant, and correct for this use case. GSAP hover would add unnecessary JS overhead |
| Individual component tokens | A CSS utility class system | Would require changing HTML markup across 19 pages -- too invasive for polish phase |

## Architecture Patterns

### Pattern 1: Token Migration (Hard-Coded to Design System)
**What:** Replace all hard-coded `transition: X 0.3s ease` declarations with motion tokens
**When to use:** Every component with transitions
**Example:**
```css
/* BEFORE -- hard-coded values scattered across components */
.content-card {
  transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease;
}
.content-card-image img {
  transition: transform 0.8s ease;
}

/* AFTER -- using Phase 3 motion tokens */
.content-card {
  transition: border-color var(--duration-fast) var(--ease-out),
              transform var(--duration-fast) var(--ease-out),
              box-shadow var(--duration-fast) var(--ease-out);
}
.content-card-image img {
  transition: var(--transition-image);
}
```

### Pattern 2: Focus-Visible States
**What:** Add keyboard-accessible focus indicators that don't interfere with mouse interaction
**When to use:** All interactive elements (links, buttons, cards)
**Example:**
```css
/* Global focus-visible base in global.css */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* Card-specific focus-visible */
.content-card:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-color: var(--color-accent);
}
```

### Pattern 3: Link Hover Underline Animation (for article/nav links)
**What:** Animated underline that reveals on hover using scaleX transform
**When to use:** Nav already has this pattern -- extend to footer links and breadcrumb links
**Example:**
```css
/* Nav already uses this pattern -- apply consistently */
.footer-links a::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 100%;
  height: 1.5px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform var(--duration-normal) var(--ease-out);
}
.footer-links a:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}
```

### Anti-Patterns to Avoid
- **Mixing `ease` with token-based easing:** The generic `ease` keyword produces `cubic-bezier(0.25, 0.1, 0.25, 1)` which differs from `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`. Using both creates inconsistent feel.
- **Adding GSAP-powered hover animations:** Hover states should be CSS-only. GSAP is for scroll-driven animations only. Adding JS-driven hovers would break on touch, add complexity, and fight with the existing CSS transitions.
- **Scale transforms on text-heavy cards:** Cards with text content (PostCard, ContentCard) should NOT scale the entire card on hover -- only the image. Scaling the whole card creates a janky feeling with text.
- **Layout-shifting hover states:** CourseItem currently shifts padding on hover (`padding-left: var(--space-sm)`). This is a known anti-pattern -- it shifts content position and can affect scroll position with Lenis.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Transition timing consistency | Per-component hardcoded values | `var(--duration-fast)`, `var(--transition-hover)`, etc. | Already defined in Phase 3 tokens |
| Hover underline animation | Custom per-link implementation | Copy Nav.astro `::after` pattern | Already proven to work with View Transitions |
| Reduced motion handling | Per-component `@media` queries | Existing global `@media (prefers-reduced-motion)` that zeros all duration tokens | Already handles all token-based transitions automatically |
| Focus ring styling | Per-component focus states | Single `:focus-visible` rule in global.css | Consistent, accessible, one place to maintain |

**Key insight:** Phase 3 already built the motion design system with tokens and shorthands. The problem is that most components were written BEFORE Phase 3 and never migrated to use those tokens. This phase is primarily a migration, not new design work.

## Common Pitfalls

### Pitfall 1: Breaking View Transitions with CSS Changes
**What goes wrong:** Changing transition properties on elements that participate in Astro View Transitions can cause double-animation effects or flickering during page navigation.
**Why it happens:** Astro's ClientRouter applies its own transition animations during page swap. If an element has CSS `transition: all` and also participates in a View Transition, both fire simultaneously.
**How to avoid:** Use specific properties in transitions (`border-color`, `transform`, `box-shadow`) instead of `all`. The existing `--transition-hover: all var(--duration-fast) var(--ease-out)` token uses `all` -- use it only on elements that do NOT participate in view transitions.
**Warning signs:** Elements flash, animate twice, or stutter during page navigation.

### Pitfall 2: Lenis Scroll Interference from Layout-Shifting Hovers
**What goes wrong:** Hover states that change element height or position (padding, margin changes) cause Lenis smooth scroll to recalculate, creating jitter.
**Why it happens:** Lenis caches scroll height. When hover changes layout, the cached height becomes stale.
**How to avoid:** Use only `transform`, `opacity`, `box-shadow`, `border-color`, and `color` for hover effects. Never change `padding`, `margin`, `height`, or `width` on hover. The CourseItem component currently violates this with its `padding-left` hover change.
**Warning signs:** Scrolling becomes jerky when cursor hovers over elements during scroll.

### Pitfall 3: Inconsistent Hover Behavior on Touch Devices
**What goes wrong:** `:hover` states on touch devices "stick" after tapping, creating a confusing UI where elements remain in hover state.
**Why it happens:** Touch devices fire hover on tap and don't clear it until the user taps elsewhere.
**How to avoid:** Keep hover effects purely visual (color, opacity, shadow changes). Avoid hover effects that imply a different interactive state. The existing `@media (hover: none)` in Lightbox.astro shows awareness of this -- but no other component accounts for it.
**Warning signs:** On mobile, tapping a card leaves it in a visually "stuck" hover state.

### Pitfall 4: `prefers-reduced-motion` Not Covering New Animations
**What goes wrong:** New hover transitions don't respect the reduced-motion preference.
**Why it happens:** The global reduced-motion rule zeros duration tokens but only covers `animation-duration`. CSS `transition` properties using tokens will have `0ms` duration (good), but any NEW hard-coded transitions won't be covered.
**How to avoid:** Always use motion tokens. Never hard-code transition durations. The global rule at line 92-107 of global.css already handles this for token-based transitions.
**Warning signs:** Users with reduced-motion preference still see transitions on new elements.

## Code Examples

### Complete Token Migration Map

Every hard-coded transition in the codebase and its token replacement:

```
ContentCard.astro:
  BEFORE: transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease
  AFTER:  transition: border-color var(--duration-fast) var(--ease-out),
                      transform var(--duration-fast) var(--ease-out),
                      box-shadow var(--duration-fast) var(--ease-out)

  BEFORE: transition: transform 0.8s ease  (image)
  AFTER:  transition: var(--transition-image)

PostCard.astro:
  BEFORE: transition: border-color 0.4s ease, transform 0.4s ease, box-shadow 0.4s ease
  AFTER:  transition: border-color var(--duration-fast) var(--ease-out),
                      transform var(--duration-fast) var(--ease-out),
                      box-shadow var(--duration-fast) var(--ease-out)

  BEFORE: transition: transform 0.8s ease  (image)
  AFTER:  transition: var(--transition-image)

FeaturedPost.astro:
  BEFORE: transition: transform 0.8s ease  (image)
  AFTER:  transition: var(--transition-image)

CourseItem.astro:
  BEFORE: transition: background 0.3s ease, padding 0.3s ease
  AFTER:  transition: background var(--duration-fast) var(--ease-out),
                      color var(--duration-fast) var(--ease-out)
  NOTE:   Remove padding hover (layout shift). Replace with background + subtle accent.

  BEFORE: transition: transform 0.5s ease  (thumb image)
  AFTER:  transition: var(--transition-image)

  BEFORE: transition: color 0.3s ease, transform 0.3s ease  (arrow)
  AFTER:  transition: color var(--duration-fast) var(--ease-out),
                      transform var(--duration-fast) var(--ease-out)

Footer.astro:
  BEFORE: transition: color 0.3s ease
  AFTER:  transition: var(--transition-color)

  BEFORE: transition: color 0.3s  (social)
  AFTER:  transition: var(--transition-color)

Lightbox.astro:
  BEFORE: transition: color 0.3s ease  (close, nav buttons)
  AFTER:  transition: var(--transition-color)

camera-roll/index.astro:
  BEFORE: transition: opacity 0.3s ease  (grid images)
  AFTER:  transition: opacity var(--duration-fast) var(--ease-out)

courses/index.astro:
  BEFORE: transition: opacity 0.5s ease  (dozer scene)
  AFTER:  transition: opacity var(--duration-normal) var(--ease-out)

golden-age-golf/index.astro:
  BEFORE: transition: color 0.3s ease  (section label link)
  AFTER:  transition: var(--transition-color)

index.astro (homepage):
  BEFORE: transition: transform 0.8s ease  (intro image)
  AFTER:  transition: var(--transition-image)

MDX Components:
  InlineImage: transition: opacity 0.3s ease -> opacity var(--duration-fast) var(--ease-out)
  FullBleed:   transition: transform 0.8s ease -> var(--transition-image)
  FeaturedImage: transition: opacity 0.3s ease -> opacity var(--duration-fast) var(--ease-out)
  ImagePair:   transition: transform 0.6s ease, opacity 0.3s ease
               -> transform var(--duration-slow) var(--ease-out), opacity var(--duration-fast) var(--ease-out)
  Memorabilia: transition: transform 0.4s ease, opacity 0.3s ease
               -> transform var(--duration-fast) var(--ease-out), opacity var(--duration-fast) var(--ease-out)
```

### Focus-Visible Global Rule

```css
/* Add to global.css after the button styles */
:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}

/* Remove default outline for mouse users */
:focus:not(:focus-visible) {
  outline: none;
}

/* Cards get a more prominent treatment */
.content-card:focus-visible,
.post-card:focus-visible,
.featured-post:focus-visible,
.course-item:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 4px;
}
```

### Article Body In-Content Link Styles

```css
/* Add to ArticleLayout and CourseLayout global styles */
.article-body a,
.course-body a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-color: rgba(45, 90, 63, 0.3);
  transition: var(--transition-color), text-decoration-color var(--duration-fast) var(--ease-out);
}
.article-body a:hover,
.course-body a:hover {
  color: var(--color-accent-light);
  text-decoration-color: var(--color-accent-light);
}
```

### Read-More Arrow Animation (for ContentCard, PostCard)

```css
/* Animate the arrow indicator on card hover */
.content-card-link,
.read-more {
  transition: var(--transition-color);
}
.content-card:hover .content-card-link,
.post-card:hover .read-more {
  color: var(--color-accent-light);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `:focus` with outline | `:focus-visible` only | Widely supported since 2022 | Mouse users don't see focus rings; keyboard users do |
| `transition: all` catch-all | Specific property transitions | CSS best practice | Prevents unintended property animations, better perf |
| `ease` generic keyword | Named easing curves / tokens | Project Phase 3 | Consistent cinematic feel across all interactions |
| Scale entire card on hover | Scale only image within card | UX best practice | Prevents text jank, feels more premium |

**Deprecated/outdated:**
- Generic `ease` keyword: All components should use `--ease-out` or other named tokens
- `:focus` without `:focus-visible`: Modern approach targets only keyboard navigation

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Build validation (Astro build) + URL validation script |
| Config file | `scripts/validate-urls.mjs` |
| Quick run command | `npm run build` |
| Full suite command | `npm run build && npm run validate-urls` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| VISL-02 | Cards, links, nav have hover states | manual-only | Visual inspection in browser | N/A |
| VISL-02 | Focus-visible states on interactive elements | manual-only | Tab through page in browser | N/A |
| VISL-03 | No hard-coded transition values remain | unit | `grep -r "transition:.*[0-9].*ease" src/ --include="*.astro" --include="*.css"` | N/A - one-liner |
| VISL-03 | Build succeeds with all changes | smoke | `npm run build` | Yes |
| VISL-03 | All 19 URLs preserved | smoke | `npm run validate-urls` | Yes |

### Sampling Rate
- **Per task commit:** `npm run build`
- **Per wave merge:** `npm run build && npm run validate-urls`
- **Phase gate:** Full build green + visual inspection across page types

### Wave 0 Gaps
None -- existing build and URL validation infrastructure covers all automated requirements. Visual verification is inherently manual for hover/focus states.

## Open Questions

1. **CourseItem padding-shift hover -- preserve or replace?**
   - What we know: The current hover shifts `padding-left` and `padding-right`, which causes layout reflow and can interfere with Lenis smooth scroll
   - What's unclear: Whether the user considers this an intentional design choice or a rough draft
   - Recommendation: Replace with `background` + `border-left: 3px solid var(--color-accent)` hover pattern using transform for the accent instead of padding shift. This preserves the "indent" visual cue without layout reflow

2. **Nav active-page indicator**
   - What we know: Nav links have hover underline but no indication of which page is currently active
   - What's unclear: Whether this is in scope for VISL-02/VISL-03 or would be considered a new feature
   - Recommendation: Include it as part of "navigation elements have polished hover states" (VISL-02 success criterion 1). A persistent underline on the current page link is standard polish

## Inventory of Interactive Elements Requiring Polish

### Cards (3 components)
| Component | Current Hover | Cursor | Issues |
|-----------|--------------|--------|--------|
| ContentCard | border-color, translateY(-4px), box-shadow, image scale(1.06) | Missing | Hard-coded transitions; no cursor:pointer |
| PostCard | border-color, translateY(-3px), box-shadow, image scale(1.05) | Missing | Hard-coded transitions; no cursor:pointer; inconsistent translateY with ContentCard |
| FeaturedPost | image scale(1.04) only | Missing | No card-level hover; hard-coded transition; no cursor:pointer |

### Navigation (2 components)
| Component | Current Hover | Issues |
|-----------|--------------|--------|
| Nav links | color change + underline scaleX animation | Uses tokens (good). No active-page indicator |
| Footer links | color change only | Hard-coded transition; no underline animation (inconsistent with Nav) |

### Course List (1 component)
| Component | Current Hover | Issues |
|-----------|--------------|--------|
| CourseItem | background, padding shift, number color, image scale, arrow translate+color | Hard-coded transitions; padding shift causes layout reflow |

### Images (5 MDX components + 2 pages)
| Component | Current Hover | Issues |
|-----------|--------------|--------|
| FullBleed | image scale(1.015) | Hard-coded transition |
| InlineImage | opacity 0.92 | Hard-coded transition |
| FeaturedImage | opacity 0.92 | Hard-coded transition |
| ImagePair | scale(1.03) + opacity 0.92 | Hard-coded transition |
| Memorabilia | translateY(-4px) + opacity 0.92 | Hard-coded transition |
| Camera Roll grid | opacity 0.85 | Hard-coded transition |
| Homepage intro image | scale(1.03) | Hard-coded transition |

### Other Interactive
| Element | Current Hover | Issues |
|---------|--------------|--------|
| .btn / .btn-primary | Uses tokens (good) | Already polished |
| Breadcrumb links | color change | Uses tokens in ArticleLayout; hard-coded in Breadcrumb component |
| ArticleNav links | color change | Hard-coded transition |
| Lightbox buttons | color change | Hard-coded transitions |
| Social icon (footer) | color change | Hard-coded transition |
| Section-label links | color change | Uses tokens in CourseLayout; hard-coded in golden-age-golf page |

## Sources

### Primary (HIGH confidence)
- Codebase audit -- all 18 components, 4 layouts, 8 pages, global.css examined directly
- `global.css` lines 65-88 -- motion token system already in place from Phase 3
- Phase 3 decisions in STATE.md -- confirms token system design intent

### Secondary (MEDIUM confidence)
- UI/UX Pro Max skill -- animation guidelines (150-300ms micro-interactions, transform/opacity preference)
- `:focus-visible` browser support -- universally supported in modern browsers since 2022

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - No new libraries needed; purely CSS token migration using existing system
- Architecture: HIGH - Patterns already proven in Nav.astro and global.css; extending, not inventing
- Pitfalls: HIGH - Lenis scroll interference and View Transition conflicts are well-documented in Phase 4 experience

**Research date:** 2026-03-05
**Valid until:** 2026-04-05 (stable -- no external dependencies to change)
