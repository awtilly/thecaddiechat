# Research Summary: The Caddie Chat

**Domain:** Immersive personal content/portfolio website (photography, storytelling, course reviews)
**Researched:** 2026-03-04
**Overall confidence:** HIGH (stack choices are well-established patterns; version numbers need verification)

## Executive Summary

The Caddie Chat is a ~19-page static content site showcasing golf photography, caddie stories, and course reviews. The existing site is vanilla HTML/CSS/JS with basic scroll reveals and parallax. The goal is a cinematic, immersive rebuild with premium animations, page transitions, and magazine-quality presentation — while staying on GitHub Pages.

The standard stack for this category of site in 2025 is **Astro + GSAP + Lenis**. Astro is the dominant static site generator for content-focused sites, shipping zero JS by default while enabling selective interactivity through its "islands" architecture. GSAP with ScrollTrigger is the undisputed industry standard for scroll-driven cinematic animations — no alternative comes close for the level of control needed. Lenis provides the smooth scroll behavior that ties the experience together.

The single biggest technical win is Astro's built-in image optimization pipeline. The current site serves unoptimized full-resolution JPEGs. Astro's `<Image />` component will automatically generate responsive srcsets, WebP/AVIF formats, and proper width/height attributes — dramatically improving load times for a photography-heavy site without any manual work.

Astro's built-in View Transitions (using the native browser API with fallbacks) directly solve the "page transitions between sections" requirement without adding a SPA framework. This is a unique capability among SSGs and a key reason Astro wins over alternatives like Hugo or 11ty for this project.

## Key Findings

**Stack:** Astro (SSG) + GSAP/ScrollTrigger (animation) + Lenis (smooth scroll) + MDX (content) + vanilla CSS with existing design tokens
**Architecture:** File-based content collections with Astro, component-based layouts, GSAP animations initialized per-page
**Critical pitfall:** Over-animating and competing with the photography. The images ARE the visual impact — animations should serve the content, not overshadow it.

## Implications for Roadmap

Based on research, suggested phase structure:

1. **Foundation & Migration** - Set up Astro project, migrate content from HTML to MDX, build shared layouts/components, deploy to GitHub Pages
   - Addresses: Component reuse, URL preservation, basic site structure
   - Avoids: Trying to animate before the foundation is solid

2. **Image Pipeline & Performance** - Implement Astro image optimization, self-host fonts, establish performance baseline
   - Addresses: Photography loading speed, Core Web Vitals
   - Avoids: Building animations on top of slow-loading images

3. **Animation System** - Integrate GSAP + ScrollTrigger + Lenis, build the cinematic scroll experience, page transitions
   - Addresses: Parallax, scroll reveals, hero animations, page transitions
   - Avoids: Animation-first thinking that ignores content readability

4. **Polish & Micro-interactions** - Premium hover states, cursor effects, loading states, navigation transitions, visual cohesion pass
   - Addresses: The "jaw-dropping" finish, micro-interactions, consistent animation language
   - Avoids: Scope creep into features (newsletters, CMS) before the visual experience is complete

**Phase ordering rationale:**
- Foundation MUST come first — cannot add animations without the component structure
- Images before animations — animations on slow-loading images create a terrible experience
- Core animations before micro-interactions — get the scroll storytelling right first, then polish edges
- Each phase produces a deployable site (progressive enhancement)

**Research flags for phases:**
- Phase 1: Standard Astro setup patterns, unlikely to need deeper research
- Phase 3: Likely needs deeper research into specific GSAP patterns (pinning, scrub timelines, view transitions interplay)
- Phase 4: May need research into specific micro-interaction patterns and cursor effects

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Astro + GSAP is the established standard for this site category |
| Features | HIGH | Table stakes for content/portfolio sites are well-understood |
| Architecture | HIGH | Astro's file-based routing and content collections are well-documented |
| Pitfalls | MEDIUM | Based on common patterns; project-specific pitfalls may emerge |
| Version numbers | MEDIUM | Training data cutoff May 2025; verify before installation |

## Gaps to Address

- Exact current versions of all packages (npm verification needed before Phase 1)
- GSAP Club licensing: whether ScrollSmoother is needed or if free Lenis suffices
- GLightbox maintenance status — may need to evaluate alternatives if abandoned
- Specific View Transitions patterns for Astro + GSAP interplay (phase-specific research in Phase 3)
- Image count and total size of existing photography (impacts build time decisions)
