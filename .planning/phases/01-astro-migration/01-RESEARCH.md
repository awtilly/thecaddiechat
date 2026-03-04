# Phase 1: Astro Migration - Research

**Researched:** 2026-03-04
**Domain:** Astro 5 static site generation, MDX content collections, GitHub Pages CI/CD
**Confidence:** HIGH

## Summary

This phase migrates a vanilla HTML/CSS/JS site (19 pages, 68 images, 475-line CSS, 136-line JS) to Astro 5 with MDX content collections. The existing site is well-structured with consistent component boundaries (nav, footer, hero, article-header, content-card, course layouts) making it an ideal migration candidate. The site has two distinct content types (chronicles and courses) with different layouts and frontmatter needs, plus standalone pages (homepage, camera-roll, courses index, golden-age-golf hub).

Astro 5's Content Layer API with `glob()` loader provides exactly what this project needs: type-safe collections with Zod schemas, MDX support for rich content with custom components, and static output for GitHub Pages. The existing CSS custom property system ports cleanly to a global stylesheet with component-scoped overrides. Course pages have significant inline `<style>` blocks (120+ lines each) that will be absorbed into Astro components.

**Primary recommendation:** Use Astro 5 (latest stable) with `@astrojs/mdx`, two content collections (chronicles, courses), `glob()` loader, `trailingSlash: 'always'`, and `build.format: 'directory'` to match existing URL structure. Use npm as package manager for simplicity and widest GitHub Actions support.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Astro project lives at the repo root (package.json, astro.config.mjs, src/ all top-level)
- Existing thecaddiechat/ site archived to an `original-site` git branch, then removed from main
- Generate a CLAUDE.md at repo root with Astro conventions and project coding standards
- **Chronicles**: Rich frontmatter -- title, description, date, heroImage, meta line. Body is pure MDX prose with image components.
- **Courses**: Rich frontmatter -- title, description, architect, year, location, heroImage, courseNumber. Body uses custom MDX components (`<FullBleed>`, `<ImagePair>`, `<Memorabilia>`, `<InlineImage>`, `<FeaturedImage>`) for image layouts.
- **Camera Roll**: Standalone Astro page for now (not a collection).
- **Images**: Live in `src/assets/images/` preserving existing folder structure (chronicles/, courses/, etc.)
- Global base CSS file for variables, resets, typography, and shared utilities
- Component-specific styles moved into scoped `<style>` blocks in Astro components
- Preserve all existing CSS custom properties exactly -- no cleanup or renaming
- Course page inline `<style>` blocks absorbed into their respective Astro components
- Port each JS concern into its owning Astro component using `<script>` tags
- GitHub Actions deploys to GitHub Pages on push to main
- CNAME file moved to `public/CNAME`
- `trailingSlash: 'always'` and `output: 'static'` in Astro config
- All existing URLs preserved without redirects (FNDN-06)
- `/courses/` (index) and `/courses/golden-age-golf/` (trip hub) remain as separate pages

### Claude's Discretion
- Package manager choice (npm vs pnpm)
- Exact Astro component granularity beyond the main layouts (BaseLayout, PageLayout, CardGrid)
- CLAUDE.md content and conventions
- How to structure the golden-age-golf hub page (standalone page vs dynamic route)
- Error page (404) design

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| FNDN-01 | Site rebuilt on Astro with reusable component layouts (BaseLayout, PageLayout, CardGrid) | Astro 5 layouts, component architecture, and project structure documented below |
| FNDN-02 | All existing content migrated from HTML to MDX with content collections | Content Layer API with glob() loader, Zod schemas, MDX integration, custom component patterns documented |
| FNDN-05 | GitHub Actions CI/CD pipeline deploying to GitHub Pages on push | Official withastro/action@v5, complete workflow YAML, CNAME handling documented |
| FNDN-06 | All existing URLs preserved (no broken links) | trailingSlash: 'always', build.format: 'directory', directory-based routing strategy documented |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| astro | ^5.18 | Static site framework | Content Layer API, MDX support, static output, official GitHub Pages action |
| @astrojs/mdx | ^4.3 | MDX support in Astro | Required for content collections with custom components in MDX files |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sharp | (bundled) | Image processing | Automatically used by Astro's image service at build time |
| typescript | ^5.x | Type safety | Included with Astro, used for content config and schema validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| npm | pnpm | pnpm is faster and more disk-efficient, but npm has widest ecosystem support, zero config, and GitHub Actions auto-detects lockfiles for either. npm is the simpler choice for a solo-developer content site. |

**Recommendation (Claude's Discretion -- Package Manager):** Use **npm**. The project is small (2 dependencies), install speed is negligible, and npm requires no additional tooling. The `withastro/action@v5` GitHub Action auto-detects `package-lock.json`.

**Installation:**
```bash
npm create astro@latest -- --template minimal
npm install @astrojs/mdx
```

## Architecture Patterns

### Recommended Project Structure
```
/ (repo root)
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actions workflow
├── public/
│   ├── CNAME                    # thecaddiechat.com
│   └── favicon.svg              # Site favicon
├── src/
│   ├── assets/
│   │   └── images/              # Processed images (Astro pipeline)
│   │       ├── chronicles/
│   │       │   ├── viktor-hovland/
│   │       │   ├── tyrrell-hatton/
│   │       │   └── matt-fitzpatrick/
│   │       └── courses/
│   │           ├── friars-head/
│   │           ├── winged-foot/
│   │           ├── stonewall/
│   │           ├── mountain-ridge/
│   │           ├── essex-county/
│   │           ├── north-jersey/
│   │           ├── hollywood/
│   │           └── francis-a-byrne/
│   ├── components/
│   │   ├── Nav.astro             # Fixed nav with mobile toggle
│   │   ├── Footer.astro          # Site footer
│   │   ├── Hero.astro            # Homepage hero with parallax
│   │   ├── CardGrid.astro        # 3-col content cards (homepage)
│   │   ├── ContentCard.astro     # Individual content card
│   │   ├── PostCard.astro        # Chronicle list card
│   │   ├── FeaturedPost.astro    # Featured chronicle card
│   │   ├── StatsRow.astro        # Animated counter row
│   │   ├── CtaBanner.astro       # Call-to-action section
│   │   ├── CourseItem.astro      # Course list row item
│   │   ├── Breadcrumb.astro      # Breadcrumb navigation
│   │   ├── ArticleNav.astro      # Prev/next article navigation
│   │   ├── Lightbox.astro        # Image lightbox (course pages)
│   │   └── mdx/                  # MDX shortcode components
│   │       ├── FullBleed.astro   # Full-viewport-width image
│   │       ├── ImagePair.astro   # Side-by-side image grid
│   │       ├── InlineImage.astro # Inline figure with caption
│   │       ├── FeaturedImage.astro # Featured image with styled caption
│   │       └── Memorabilia.astro # Centered memorabilia display
│   ├── content/
│   │   ├── chronicles/           # MDX chronicle articles
│   │   │   ├── viktor-hovland.mdx
│   │   │   ├── tyrrell-hatton.mdx
│   │   │   ├── matt-fitzpatrick.mdx
│   │   │   ├── beauty-or-burden.mdx
│   │   │   └── uphill-challenge.mdx
│   │   └── courses/              # MDX course articles
│   │       ├── stonewall.mdx
│   │       ├── francis-a-byrne.mdx
│   │       ├── mountain-ridge.mdx
│   │       ├── essex-county.mdx
│   │       ├── north-jersey.mdx
│   │       ├── hollywood.mdx
│   │       ├── winged-foot.mdx
│   │       └── friars-head.mdx
│   ├── layouts/
│   │   ├── BaseLayout.astro      # HTML shell: head, meta, global CSS, body wrapper
│   │   ├── PageLayout.astro      # Standard page: nav + page-header + slot + footer
│   │   └── ArticleLayout.astro   # Article page: nav + article-header + slot + article-nav + footer
│   ├── pages/
│   │   ├── index.astro           # Homepage
│   │   ├── 404.astro             # Custom 404 page
│   │   ├── camera-roll/
│   │   │   └── index.astro       # Camera Roll standalone page
│   │   ├── chronicles/
│   │   │   ├── index.astro       # Chronicles listing page
│   │   │   └── [...slug].astro   # Dynamic chronicle article pages
│   │   └── courses/
│   │       ├── index.astro       # Courses listing page
│   │       ├── golden-age-golf/
│   │       │   └── index.astro   # Golden Age Golf hub (standalone page)
│   │       └── [...slug].astro   # Dynamic course detail pages
│   └── styles/
│       └── global.css            # CSS variables, resets, typography, shared utilities
├── src/content.config.ts         # Content collection definitions
├── astro.config.mjs              # Astro configuration
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── CLAUDE.md                     # Project conventions
```

### Pattern 1: Content Collection Configuration
**What:** Define chronicles and courses collections with Zod schemas and glob() loader
**When to use:** Always -- this is the foundation of the content architecture

```typescript
// src/content.config.ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const chronicles = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/chronicles' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    heroImage: image(),
    meta: z.string(),              // e.g. "BMW Championship Practice Round"
    prev: z.object({
      slug: z.string(),
      title: z.string(),
    }).optional(),
    next: z.object({
      slug: z.string(),
      title: z.string(),
    }).optional(),
  }),
});

const courses = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/courses' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    architect: z.string(),
    year: z.number(),
    location: z.string(),
    heroImage: image(),
    courseNumber: z.string(),       // "01" through "08"
    style: z.string().optional(),   // "Private", "Public", etc.
    prev: z.object({
      slug: z.string(),
      title: z.string(),
    }).optional(),
    next: z.object({
      slug: z.string(),
      title: z.string(),
    }).optional(),
  }),
});

export const collections = { chronicles, courses };
```

### Pattern 2: Dynamic Routes from Content Collections
**What:** Generate static pages from collection entries using `getStaticPaths()`
**When to use:** For chronicle and course detail pages

```astro
---
// src/pages/chronicles/[...slug].astro
import { getCollection, render } from 'astro:content';
import ArticleLayout from '../../layouts/ArticleLayout.astro';

export async function getStaticPaths() {
  const chronicles = await getCollection('chronicles');
  return chronicles.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<ArticleLayout frontmatter={entry.data}>
  <Content />
</ArticleLayout>
```

### Pattern 3: MDX Custom Components via Content Render
**What:** Pass custom image layout components to MDX `<Content />` at render time
**When to use:** Course pages that use `<FullBleed>`, `<ImagePair>`, `<InlineImage>`, `<FeaturedImage>`, `<Memorabilia>`

```astro
---
// src/pages/courses/[...slug].astro
import { getCollection, render } from 'astro:content';
import CourseLayout from '../../layouts/CourseLayout.astro';
import FullBleed from '../../components/mdx/FullBleed.astro';
import ImagePair from '../../components/mdx/ImagePair.astro';
import InlineImage from '../../components/mdx/InlineImage.astro';
import FeaturedImage from '../../components/mdx/FeaturedImage.astro';
import Memorabilia from '../../components/mdx/Memorabilia.astro';

export async function getStaticPaths() {
  const courses = await getCollection('courses');
  return courses.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);

const mdxComponents = {
  FullBleed,
  ImagePair,
  InlineImage,
  FeaturedImage,
  Memorabilia,
};
---
<CourseLayout frontmatter={entry.data}>
  <Content components={mdxComponents} />
</CourseLayout>
```

### Pattern 4: Astro Config for GitHub Pages with Custom Domain
**What:** Configuration that preserves URL structure and supports custom domain
**When to use:** Always -- this is the project's astro.config.mjs

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://thecaddiechat.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [mdx()],
});
```

### Pattern 5: GitHub Actions Deployment Workflow
**What:** CI/CD pipeline using official Astro action
**When to use:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: withastro/action@v5

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

### Pattern 6: Client-Side Scripts in Astro Components
**What:** Port vanilla JS into component-scoped `<script>` tags
**When to use:** Nav toggle, scroll reveals, counter animation, parallax, lightbox

```astro
<!-- Example: Nav.astro with mobile toggle -->
<nav class="nav">
  <div class="container">
    <a href="/" class="nav-logo">The Caddie <span>Chat</span></a>
    <ul class="nav-links">
      <li><a href="/chronicles/">Chronicles</a></li>
      <li><a href="/courses/">Courses</a></li>
      <li><a href="/camera-roll/">Camera Roll</a></li>
      <li><a href="https://stoekmedia.com" target="_blank" rel="noopener" class="nav-stoek">
        <span class="stoek">Stoek</span><span class="media">Media.com</span>
      </a></li>
    </ul>
    <button class="nav-toggle" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  </div>
</nav>

<style>
  /* Component-scoped nav styles here */
</style>

<script>
  // Runs once per page, handles nav scroll + mobile toggle
  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.querySelector('.nav');
    // ... nav logic ported from main.js
  });
</script>
```

### Anti-Patterns to Avoid
- **Putting images in `public/`:** Images must be in `src/assets/images/` so Astro's image pipeline can process them in Phase 2. Using `public/` bypasses optimization.
- **Using legacy content collection API:** Do NOT use the old `type: 'content'` syntax. Use the Astro 5 Content Layer API with `glob()` loader and `src/content.config.ts`.
- **Single global script file:** Do NOT create one `main.js` in public. Each JS concern belongs in its owning Astro component's `<script>` tag.
- **Relative CSS/JS paths:** Astro handles asset bundling. Use `import` statements for CSS and let Astro handle paths. Do NOT use `../../assets/css/style.css` relative paths in HTML.
- **Setting `base` in astro.config:** With a custom domain (thecaddiechat.com), do NOT set `base`. Only set `site`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Content type safety | Manual frontmatter parsing | Zod schemas via `defineCollection()` | Catches missing/wrong frontmatter at build time, provides TypeScript types |
| Static route generation | Manual page creation for each entry | `getStaticPaths()` with `getCollection()` | Automatically generates routes from collection, type-safe |
| GitHub Pages deployment | Custom build scripts | `withastro/action@v5` | Auto-detects package manager, handles build + artifact upload |
| MDX processing | Custom markdown parser | `@astrojs/mdx` integration | Handles frontmatter, component imports, remark/rehype plugins |
| Image metadata | Manual width/height extraction | Astro's `image()` schema helper | Validates paths, extracts dimensions, prevents CLS |
| URL trailing slash handling | Custom redirect logic | `trailingSlash: 'always'` config | Astro generates correct directory structure automatically |

**Key insight:** Astro's Content Layer API with Zod schemas eliminates an entire class of "content doesn't match template" bugs that plague manual static site migrations. Every frontmatter field is validated at build time.

## Common Pitfalls

### Pitfall 1: Content Config File Location
**What goes wrong:** Collection queries return empty arrays, types don't work
**Why it happens:** Config file placed at `src/content/config.ts` (Astro 4 location) instead of `src/content.config.ts` (Astro 5 location at project root's src/)
**How to avoid:** File MUST be `src/content.config.ts` (at the src directory root, NOT inside src/content/)
**Warning signs:** `getCollection()` returns empty array, no TypeScript autocomplete on collection names

### Pitfall 2: Image Paths in MDX Frontmatter
**What goes wrong:** Build fails with "image not found" errors
**Why it happens:** Image paths in frontmatter are relative to the MDX file, not to the project root. The `image()` schema helper resolves paths relative to the content file.
**How to avoid:** Use relative paths from the MDX file: `heroImage: ../../assets/images/courses/friars-head/hero-clubhouse-bluff.jpg`
**Warning signs:** Build error mentioning unresolved image path

### Pitfall 3: trailingSlash + Static File Endpoints
**What goes wrong:** Dev server returns 404 for non-HTML assets, or redirects file requests
**Why it happens:** `trailingSlash: 'always'` can interfere with static file requests in dev mode
**How to avoid:** This primarily affects dev mode. For this project (pure static site with no API endpoints), the issue is minimal. Test in production build (`astro build && astro preview`) to verify.
**Warning signs:** 301 redirects on asset requests in dev server logs

### Pitfall 4: MDX Component Props vs HTML Element Overrides
**What goes wrong:** Custom components don't render, or HTML elements aren't replaced
**Why it happens:** Confusion between passing named custom components (like `<FullBleed>`) vs overriding default HTML elements (like `blockquote`). These use different mechanisms.
**How to avoid:** For named custom components used explicitly in MDX (`<FullBleed>`, `<ImagePair>`), pass them via the `components` prop on `<Content />`. For HTML element overrides (like custom `<blockquote>`), map them in the same `components` object using lowercase HTML tag names.
**Warning signs:** Components render as plain text or don't appear

### Pitfall 5: Scoped Styles Bleeding or Not Applying
**What goes wrong:** Styles from parent components don't reach MDX-rendered content, or styles leak between components
**How to avoid:** Astro scopes `<style>` blocks by default. For styles that MUST apply to MDX-rendered child content (like `.article-body p` or `.course-body h2`), use `:global()` selector within the scoped style block, or use `is:global` on the style tag. Alternatively, put content-body styles in the global CSS file.
**Warning signs:** MDX content renders unstyled despite styles being in the layout component

### Pitfall 6: URL Mismatch Between Collection IDs and Existing URLs
**What goes wrong:** Generated URLs don't match existing site URLs, causing broken links
**Why it happens:** The `glob()` loader generates IDs from filenames. If `friars-head.mdx` generates ID `friars-head`, the URL becomes `/courses/friars-head/` -- which matches. But if files are named differently (e.g., `01-friars-head.mdx`), URLs break.
**How to avoid:** Name MDX files to match existing URL slugs exactly: `friars-head.mdx`, `viktor-hovland.mdx`, etc. Do NOT prefix with numbers or dates.
**Warning signs:** 404 errors when visiting existing URLs

### Pitfall 7: Course Page Inline Styles Lost
**What goes wrong:** Course detail pages lose their unique image layout styles
**Why it happens:** The existing course pages each have 100+ lines of inline `<style>` covering `.course-hero`, `.inline-image`, `.full-bleed-image`, `.image-pair`, `.memorabilia`, `.lightbox` classes. These must be absorbed into the corresponding Astro components.
**How to avoid:** Each MDX image component (`FullBleed.astro`, `ImagePair.astro`, etc.) must include the relevant scoped styles from the original inline blocks. Verify visually against the original site.
**Warning signs:** Broken image layouts on course pages

## Code Examples

### MDX Chronicle File
```mdx
---
title: "A Memorable Experience: My Day as a Golf Caddie for Viktor Hovland"
description: "A Memorable Experience: My Day as a Golf Caddie for Viktor Hovland -- The Caddie Chat."
date: 2024-08-01
heroImage: ../../assets/images/chronicles/viktor-hovland/hero.jpg
meta: "BMW Championship Practice Round"
next:
  slug: tyrrell-hatton
  title: "Tyrrell Hatton"
---

Every once in a while, life presents us with unexpected opportunities...

## Inside the Ropes

Walking alongside Viktor Hovland during the practice round was an education...

<InlineImage
  src={import("../../assets/images/chronicles/viktor-hovland/inline-1.jpg")}
  alt="Evans Scholar caddies at sunset on the course"
  caption="Evans Scholar caddies at Olympia Fields during the BMW Championship."
/>
```

### MDX Course File with Custom Components
```mdx
---
title: "Friar's Head"
description: "The final stop. Coore & Crenshaw's modern masterpiece on Long Island's North Shore."
architect: "Coore & Crenshaw"
year: 2002
location: "Baiting Hollow, NY"
heroImage: ../../assets/images/courses/friars-head/hero-clubhouse-bluff.jpg
courseNumber: "08"
style: "Private"
prev:
  slug: winged-foot
  title: "Winged Foot GC"
---

Every great trip needs a great ending, and Friar's Head delivered ours...

<FeaturedImage
  src={import("../../assets/images/courses/friars-head/group-bluff-sound.jpg")}
  alt="The foursome standing on the sandy bluff at Friar's Head"
  caption="The foursome on the bluff. Long Island Sound behind us, the final course of the trip ahead."
/>

## Links on Long Island

The property at Friar's Head is unlike anything else we played on this trip...

<FullBleed
  src={import("../../assets/images/courses/friars-head/tee-dune-corridor-ocean.jpg")}
  alt="A group of golfers on the tee at Friar's Head"
  caption="The tee shot through the dunes. Shot on 35mm film."
/>

<ImagePair>
  <ImagePair.Item
    src={import("../../assets/images/courses/friars-head/putting-clubhouse-film.jpg")}
    alt="A golfer reading a putt"
    caption="Putting toward the clubhouse. Shot on film."
  />
  <ImagePair.Item
    src={import("../../assets/images/courses/friars-head/bluff-coastline-film.jpg")}
    alt="The bluff at Friar's Head"
    caption="The bluff. The boardwalk down to the Sound."
  />
</ImagePair>

<Memorabilia
  src={import("../../assets/images/courses/friars-head/mailbox-3000.jpg")}
  alt="A plain black mailbox numbered 3000"
  label="Finding the Place"
  caption="Mailbox 3000. No sign. No gate. If you know, you know."
/>
```

### BaseLayout Component
```astro
---
// src/layouts/BaseLayout.astro
interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
import '../styles/global.css';
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title}</title>
  {description && <meta name="description" content={description} />}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
</head>
<body>
  <slot />
</body>
</html>
```

### Full URL Map (19 Pages)
```
/                          -> src/pages/index.astro
/chronicles/               -> src/pages/chronicles/index.astro
/chronicles/viktor-hovland/ -> src/pages/chronicles/[...slug].astro (collection)
/chronicles/tyrrell-hatton/ -> src/pages/chronicles/[...slug].astro (collection)
/chronicles/matt-fitzpatrick/ -> src/pages/chronicles/[...slug].astro (collection)
/chronicles/beauty-or-burden/ -> src/pages/chronicles/[...slug].astro (collection)
/chronicles/uphill-challenge/ -> src/pages/chronicles/[...slug].astro (collection)
/courses/                  -> src/pages/courses/index.astro
/courses/golden-age-golf/  -> src/pages/courses/golden-age-golf/index.astro (standalone)
/courses/stonewall/        -> src/pages/courses/[...slug].astro (collection)
/courses/francis-a-byrne/  -> src/pages/courses/[...slug].astro (collection)
/courses/mountain-ridge/   -> src/pages/courses/[...slug].astro (collection)
/courses/essex-county/     -> src/pages/courses/[...slug].astro (collection)
/courses/north-jersey/     -> src/pages/courses/[...slug].astro (collection)
/courses/hollywood/        -> src/pages/courses/[...slug].astro (collection)
/courses/winged-foot/      -> src/pages/courses/[...slug].astro (collection)
/courses/friars-head/      -> src/pages/courses/[...slug].astro (collection)
/camera-roll/              -> src/pages/camera-roll/index.astro
```

**Note on golden-age-golf:** This page is a standalone hub (not a course detail page). It lists all 8 courses with thumbnails and a hero image. It should be a standalone Astro page at `src/pages/courses/golden-age-golf/index.astro` that queries the courses collection for listing data, NOT a dynamic route.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `src/content/config.ts` | `src/content.config.ts` | Astro 5.0 (Dec 2024) | Config file moved to src root |
| `type: 'content'` collection | `loader: glob()` | Astro 5.0 (Dec 2024) | New Content Layer API, more flexible |
| Astro 4 content collections | Astro 5 Content Layer | Astro 5.0 (Dec 2024) | 5x faster Markdown builds, 2x faster MDX |
| `withastro/action@v4` | `withastro/action@v5` | 2025 | Updated node version defaults (22), new config options |
| Manual `getStaticPaths` slugs | Auto-generated IDs from filenames | Astro 5.0 | `entry.id` replaces `entry.slug` |

**Deprecated/outdated:**
- Legacy content collection API (`type: 'content'`): Still works but should use Content Layer API with `glob()` loader
- `entry.slug`: Replaced by `entry.id` in Astro 5's Content Layer API
- `withastro/action@v4`: Use v5

## Open Questions

1. **Image handling in MDX custom components**
   - What we know: Astro's `<Image />` component works in `.astro` files and MDX files. The `image()` schema helper validates frontmatter images. Custom MDX components can accept image imports as props.
   - What's unclear: The exact prop passing pattern for dynamic image imports in MDX (using `import()` expressions). May need to test whether `src={import("...")}` works directly or if images need frontmatter-level imports.
   - Recommendation: Start with static `import` statements in MDX for hero images (via frontmatter). For inline images in custom components, test `import()` expressions first; fall back to string paths in `src/assets/` resolved at component level if needed.

2. **Lightbox functionality on course pages**
   - What we know: Course pages have a custom lightbox with prev/next navigation and captions. It uses a `lightboxImages` array and inline script.
   - What's unclear: How to cleanly pass the lightbox image array from MDX content to a shared Lightbox component.
   - Recommendation: Include the Lightbox component in the course layout. Have each MDX image component register itself with the lightbox via a shared client-side script that collects all clickable images on the page.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | No test framework currently in project |
| Config file | none -- see Wave 0 |
| Quick run command | `npm run build` (build validates all content schemas + routes) |
| Full suite command | `npm run build && node scripts/validate-urls.mjs` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| FNDN-01 | Site builds with Astro layouts | smoke | `npm run build` | Wave 0 |
| FNDN-02 | All content migrated to MDX collections | smoke | `npm run build` (schema validation catches missing fields) | Wave 0 |
| FNDN-05 | GitHub Actions deploys to Pages | manual-only | Push to main, verify deployment | N/A (requires GitHub) |
| FNDN-06 | All 19 URLs preserved | integration | `node scripts/validate-urls.mjs` (crawl build output) | Wave 0 |

**Justification for test approach:** Astro's build process IS the primary validation tool for this phase. A successful `npm run build` proves: (1) all content schemas are valid (Zod catches errors), (2) all static paths generate correctly, (3) all image references resolve, (4) all layouts render without errors. A separate URL validation script confirms FNDN-06 by checking the `dist/` output directory structure.

### Sampling Rate
- **Per task commit:** `npm run build` (validates schemas, routes, and renders)
- **Per wave merge:** `npm run build && node scripts/validate-urls.mjs`
- **Phase gate:** Full build + URL validation + manual visual comparison with original site

### Wave 0 Gaps
- [ ] `scripts/validate-urls.mjs` -- script that checks dist/ output contains all 19 expected URL paths as directories with index.html files
- [ ] Astro project setup with `package.json` and build script -- prerequisite for all validation

## Sources

### Primary (HIGH confidence)
- [Astro official docs - Content Collections](https://docs.astro.build/en/guides/content-collections/) - Content Layer API, glob() loader, schemas, querying, rendering
- [Astro official docs - Project Structure](https://docs.astro.build/en/basics/project-structure/) - Directory layout, reserved paths
- [Astro official docs - Deploy to GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) - withastro/action@v5, workflow YAML, custom domain setup
- [Astro official docs - MDX Integration](https://docs.astro.build/en/guides/integrations-guide/mdx/) - @astrojs/mdx v4.3, custom components, frontmatter
- [Astro official docs - Images](https://docs.astro.build/en/guides/images/) - Image component, image() schema helper, src/ vs public/
- [Astro official docs - Configuration Reference](https://docs.astro.build/en/reference/configuration-reference/) - trailingSlash, build.format, output, site

### Secondary (MEDIUM confidence)
- [Astro MDX Components blog post](https://blog.kizu.dev/astro-mdx-components/) - Custom component patterns for MDX rendering
- [withastro/action GitHub repo](https://github.com/withastro/action) - v5 action configuration options
- [Astro 5.0 blog post](https://astro.build/blog/astro-5/) - Content Layer API performance improvements

### Tertiary (LOW confidence)
- None -- all findings verified against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Verified against official Astro docs, npm registry, and GitHub releases
- Architecture: HIGH - Based on official project structure docs and content collection patterns verified in Astro 5 documentation
- Pitfalls: HIGH - Drawn from GitHub issues, official docs migration guides, and known Astro 5 breaking changes
- Content migration: HIGH - Full audit of all 19 existing HTML pages completed, patterns catalogued
- Validation: MEDIUM - URL validation script is a custom solution; build-as-test is a standard Astro pattern

**Research date:** 2026-03-04
**Valid until:** 2026-04-04 (Astro releases frequently but core APIs are stable)
