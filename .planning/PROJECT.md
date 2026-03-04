# The Caddie Chat

## What This Is

A personal storytelling website for Joe Stoehner — caddie, Evans Scholar, and storyteller. The site showcases first-person narratives from PGA Tour caddying, golden age golf course architecture, and photography from inside the ropes. The goal is a bold, immersive visual experience that matches the caliber of the stories and photography.

## Core Value

The site must be visually stunning — jaw-dropping UI with immersive animations, smooth transitions, and premium micro-interactions that make visitors stop scrolling and feel like they're inside the story.

## Requirements

### Validated

<!-- Existing site already delivers these -->

- ✓ Homepage with hero, about section, stats, and content navigation — existing
- ✓ Chronicles section with individual caddie story pages (Viktor Hovland, Tyrrell Hatton, Matt Fitzpatrick, Beauty or Burden, Uphill Challenge) — existing
- ✓ Courses section with golden age golf trip and 8 individual course pages (Friar's Head, Winged Foot, Mountain Ridge, Essex County, Stonewall, Hollywood, Francis A. Byrne, North Jersey) — existing
- ✓ Camera Roll photography gallery — existing
- ✓ Responsive mobile navigation — existing
- ✓ StoekMedia.com cross-link in navigation — existing

### Active

- [ ] Bold, immersive visual experience with cinematic feel
- [ ] Smooth scroll animations and reveal effects
- [ ] Page transitions between sections
- [ ] Premium micro-interactions (hover states, cursors, loading states)
- [ ] Parallax and depth effects using existing photography
- [ ] Typography upgrade — editorial/magazine-quality type system
- [ ] Enhanced story reading experience with better layout and image presentation
- [ ] Polished navigation with smooth transitions
- [ ] Overall visual cohesion — consistent animation language across all pages

### Out of Scope

- User accounts / authentication — pure content site, no login
- Comments or discussion — read-only experience
- Newsletter signup — not in v1
- CMS integration — content stays as files for now
- New content creation — focus is upgrading the visual experience of existing content

## Context

- Existing static HTML/CSS/JS site lives in `thecaddiechat/` subdirectory
- Custom domain: thecaddiechat.com (CNAME file present, likely GitHub Pages)
- Rich photography collection already exists — courses, tournaments, travel
- Site structure: Chronicles (caddie stories), Courses (golden age golf), Camera Roll (photo galleries)
- Current site has basic scroll reveal animations and clean layout but lacks the immersive polish desired
- Joe has color/style ideas but no finalized brand identity — open to design direction
- ~20 HTML pages total across all sections
- No build tools currently — vanilla HTML/CSS/JS

## Constraints

- **Hosting**: GitHub Pages (CNAME already configured for thecaddiechat.com)
- **Content**: Must preserve all existing content and URLs — this is an upgrade, not a content rewrite
- **Performance**: Heavy on photography — images must load fast despite being high quality
- **Approach**: Can be a fresh rebuild with modern tooling or an upgrade of the existing static site — whichever delivers the most immersive result

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Rebuild vs. upgrade existing HTML | Need to determine if modern framework is needed for the animation/interaction goals, or if vanilla JS can deliver | — Pending |
| Design direction — colors, typography, overall aesthetic | Joe has ideas but nothing finalized — research should inform this | — Pending |

---
*Last updated: 2026-03-04 after initialization*
