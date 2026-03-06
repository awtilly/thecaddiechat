# Roadmap: The Caddie Chat

## Overview

Transform The Caddie Chat from a vanilla HTML/CSS/JS site into a cinematic, immersive Astro-powered experience. The journey moves from rebuilding the foundation (Astro migration, content collections, CI/CD), through performance optimization (image pipeline, fonts), establishing the design language (typography system, motion tokens), building the core scroll-driven animation experience (GSAP, Lenis, parallax, page transitions), and finishing with a visual polish pass that brings consistency and premium interactions across all 19+ pages.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Astro Migration** - Rebuild site on Astro with content collections, shared layouts, CI/CD, and URL preservation (completed 2026-03-04)
- [x] **Phase 2: Image & Font Performance** - Image optimization pipeline and self-hosted fonts for fast photography loading (completed 2026-03-05)
- [x] **Phase 3: Design Language** - Magazine-quality typography system and motion design tokens (completed 2026-03-05)
- [x] **Phase 4: Cinematic Animation** - GSAP + Lenis scroll experience, parallax heroes, scroll storytelling, and page transitions (completed 2026-03-05)
- [ ] **Phase 5: Visual Polish & Cohesion** - Premium hover states and consistent animation language across all pages

## Phase Details

### Phase 1: Astro Migration
**Goal**: Visitors see the same content at the same URLs, now served from a modern Astro build deployed via GitHub Actions
**Depends on**: Nothing (first phase)
**Requirements**: FNDN-01, FNDN-02, FNDN-05, FNDN-06
**Success Criteria** (what must be TRUE):
  1. Site is live at thecaddiechat.com via GitHub Pages, deployed automatically on push
  2. All 19+ pages render with correct content using Astro component layouts (BaseLayout, PageLayout, CardGrid)
  3. Every existing URL works without redirects or 404s -- visiting any old link lands on the correct page
  4. Content lives in MDX files organized as Astro content collections, not raw HTML
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Scaffold Astro project, create layouts/components, port CSS, set up CI/CD
- [x] 01-02-PLAN.md — Migrate all content to MDX, create routes, validate URLs, visual verification

### Phase 2: Image & Font Performance
**Goal**: Photography loads fast with modern formats and responsive sizing, and fonts render without layout shift or render-blocking imports
**Depends on**: Phase 1
**Requirements**: FNDN-03, FNDN-04
**Success Criteria** (what must be TRUE):
  1. Images serve responsive srcset with WebP/AVIF formats and blur-up placeholders -- no full-resolution JPEG served to mobile
  2. Fonts are self-hosted and load without visible flash of unstyled text or layout shift
  3. Lighthouse performance score is 90+ on a representative course page and chronicle page
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Validation script, Fontsource font self-hosting, Astro responsive image config
- [x] 02-02-PLAN.md — Migrate all components and pages from raw img tags to Astro Image/Picture
- [x] 02-03-PLAN.md — Rewrite Camera Roll page with local photography and film roll gallery

### Phase 3: Design Language
**Goal**: The site has a distinctive editorial voice through typography and a defined motion vocabulary that all future animations follow
**Depends on**: Phase 2
**Requirements**: VISL-01, ANIM-04
**Success Criteria** (what must be TRUE):
  1. Typography hierarchy is visually distinct and magazine-quality -- headlines, subheads, body, captions, and pull quotes each have clear styling
  2. Motion design tokens (easing curves, durations, distances) are defined and importable for use across all pages
  3. A chronicle story page reads like a magazine feature with proper typographic rhythm and spacing
**Plans**: 2 plans

Plans:
- [x] 03-01-PLAN.md — Define typography scale, motion tokens, and transition shorthands as CSS custom properties in global.css; import Playfair Display true italic
- [x] 03-02-PLAN.md — Apply tokens to ArticleLayout (drop cap, editorial pull quotes), CourseLayout, PageLayout, and Nav; visual verification

### Phase 4: Cinematic Animation
**Goal**: Scrolling through the site feels cinematic -- content reveals elegantly, heroes have parallax depth, stories unfold as scroll-driven sequences, and page navigation is seamless
**Depends on**: Phase 3
**Requirements**: ANIM-01, ANIM-02, ANIM-03, ANIM-05, TRNS-01
**Success Criteria** (what must be TRUE):
  1. Smooth scroll via Lenis is active on all pages -- scrolling feels fluid and controlled
  2. Content sections reveal with scroll-triggered animations as the user scrolls down any page
  3. Homepage hero has parallax depth layers with cinematic entrance animation using GSAP
  4. Chronicle and course pages have scroll-driven storytelling sequences where images and text animate in relationship to scroll position
  5. Navigating between pages uses View Transitions with smooth crossfade -- no hard page loads
**Plans**: 3 plans

Plans:
- [x] 04-01-PLAN.md — Install GSAP + Lenis, add ClientRouter for View Transitions, initialize smooth scroll and global scroll-reveal system, migrate all component scripts to astro:page-load lifecycle
- [x] 04-02-PLAN.md — Replace Hero CSS animations with GSAP timeline + ScrollTrigger parallax, add scroll-driven storytelling animations to article page images and pull quotes
- [x] 04-03-PLAN.md — Gap closure: migrate Lightbox.astro from DOMContentLoaded to astro:page-load lifecycle

### Phase 5: Visual Polish & Cohesion
**Goal**: Every interaction feels premium, and the animation language is consistent from homepage to deepest course page
**Depends on**: Phase 4
**Requirements**: VISL-02, VISL-03
**Success Criteria** (what must be TRUE):
  1. Cards, links, and navigation elements all have polished hover states with smooth transitions
  2. A visitor browsing from homepage through chronicles to courses to camera roll experiences a unified animation style -- no jarring inconsistencies
  3. Navigation transitions feel smooth and intentional, with visual feedback on interaction
**Plans**: 3 plans

Plans:
- [x] 05-01-PLAN.md — Migrate 6 UI components to motion tokens, add cursor:pointer to cards, fix CourseItem hover, add Footer underline animation, global focus-visible rule, article body link styles
- [x] 05-02-PLAN.md — Migrate 5 MDX image components and 4 page files to motion tokens, verify zero hard-coded transitions remain
- [ ] 05-03-PLAN.md — Gap closure: replace last 2 hard-coded transitions in Breadcrumb.astro and ArticleNav.astro with motion tokens

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Astro Migration | 2/2 | Complete   | 2026-03-04 |
| 2. Image & Font Performance | 3/3 | Complete | 2026-03-05 |
| 3. Design Language | 2/2 | Complete   | 2026-03-05 |
| 4. Cinematic Animation | 3/3 | Complete | 2026-03-05 |
| 5. Visual Polish & Cohesion | 2/3 | In Progress | - |
