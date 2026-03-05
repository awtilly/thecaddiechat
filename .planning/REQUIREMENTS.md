# Requirements: The Caddie Chat

**Defined:** 2026-03-04
**Core Value:** Jaw-dropping, immersive visual experience that makes the photography and stories feel cinematic

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FNDN-01**: Site rebuilt on Astro with reusable component layouts (BaseLayout, PageLayout, CardGrid)
- [x] **FNDN-02**: All existing content migrated from HTML to MDX with content collections
- [ ] **FNDN-03**: Image optimization pipeline generating responsive srcset, WebP/AVIF formats, and blur-up placeholders
- [x] **FNDN-04**: Fonts self-hosted (eliminate Google Fonts render-blocking import)
- [x] **FNDN-05**: GitHub Actions CI/CD pipeline deploying to GitHub Pages on push
- [x] **FNDN-06**: All existing URLs preserved (no broken links)

### Animation

- [ ] **ANIM-01**: Scroll-reveal animations — content elegantly appears as user scrolls
- [ ] **ANIM-02**: Smooth scroll behavior via Lenis across all pages
- [ ] **ANIM-03**: GSAP-powered cinematic hero animations with parallax depth
- [ ] **ANIM-04**: Motion design system defined (easing tokens, duration tokens, distance tokens)
- [ ] **ANIM-05**: Scroll-driven storytelling sequences on chronicle and course pages

### Transitions

- [ ] **TRNS-01**: View Transitions API for smooth cross-page navigation

### Visual Polish

- [ ] **VISL-01**: Magazine-quality typography system with proper hierarchy
- [ ] **VISL-02**: Premium hover states on cards, links, and navigation elements
- [ ] **VISL-03**: Consistent visual language and animation style across all 19+ pages

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Interactive Components

- **INTC-01**: Touch-friendly photo lightbox with swipe-to-navigate and pinch-to-zoom
- **INTC-02**: Shared element transitions (images morphing between list and detail views)
- **INTC-03**: Micro-interactions — subtle feedback animations on every interaction

### Content Expansion

- **CONT-01**: Newsletter signup integration
- **CONT-02**: CMS integration for easier content publishing

## Out of Scope

| Feature | Reason |
|---------|--------|
| User accounts / authentication | Pure content site — no login needed |
| Comments or discussion | Read-only experience, not a community platform |
| Dark mode | Single visual identity, optimized for photography |
| WebGL / 3D effects | Would compete with photography rather than serve it |
| Auto-playing video | Distracting, increases load time |
| Scroll hijacking | Destroys reading experience on long-form content |
| Custom cursor | Breaks on touch devices, diminishing returns |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FNDN-01 | Phase 1: Astro Migration | Complete |
| FNDN-02 | Phase 1: Astro Migration | Complete |
| FNDN-03 | Phase 2: Image & Font Performance | Pending |
| FNDN-04 | Phase 2: Image & Font Performance | Complete |
| FNDN-05 | Phase 1: Astro Migration | Complete |
| FNDN-06 | Phase 1: Astro Migration | Complete |
| ANIM-01 | Phase 4: Cinematic Animation | Pending |
| ANIM-02 | Phase 4: Cinematic Animation | Pending |
| ANIM-03 | Phase 4: Cinematic Animation | Pending |
| ANIM-04 | Phase 3: Design Language | Pending |
| ANIM-05 | Phase 4: Cinematic Animation | Pending |
| TRNS-01 | Phase 4: Cinematic Animation | Pending |
| VISL-01 | Phase 3: Design Language | Pending |
| VISL-02 | Phase 5: Visual Polish & Cohesion | Pending |
| VISL-03 | Phase 5: Visual Polish & Cohesion | Pending |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0

---
*Requirements defined: 2026-03-04*
*Last updated: 2026-03-05 after plan 02-01 completion*
