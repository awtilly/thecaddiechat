# The Caddie Chat - Project Conventions

## PENDING CLEANUP TASK (do this when running locally with Firebase access)

The article-publishing automation was removed from this repo (admin pages,
functions/, publish-draft workflow) in June 2026, but cloud-side resources
still exist. When a session has Firebase CLI or MCP access, finish the job:

1. Delete the leftover Cloud Function from the OLD publishing project:
   `firebase functions:delete publishDraft --project thecaddiechat-178de`
2. Remind the user (Joe) to also:
   - Delete the `PUBLISH_PAT` secret in GitHub repo Settings → Secrets → Actions
   - Revoke the underlying fine-grained PAT at github.com/settings/tokens
   - Delete the Sunday "chronicles drafter" scheduled task in Cowork (it pushes
     draft commits to main)

DO NOT TOUCH Firebase project `todolist-6ca86` — that is the live backend for
the Task Command app (`public/tools/task-command.html`); its Firestore rules
live in `tools/firestore/`.

Once all of the above is done, delete this section from CLAUDE.md.

## Framework & Stack

- **Framework:** Astro 5 with MDX integration (@astrojs/mdx)
- **Package manager:** npm (lockfile: package-lock.json)
- **Build:** `npm run build` (output: dist/)
- **Dev server:** `npm run dev`
- **Preview:** `npm run preview`
- **Deploy:** GitHub Actions on push to main, deployed to GitHub Pages

## Project Structure

- **Content:** MDX files in `src/content/` organized by collection (chronicles/, courses/)
- **Content config:** `src/content.config.ts` (Astro 5 location -- NOT src/content/config.ts)
- **Images:** `src/assets/images/` (NOT public/) -- Astro's image pipeline processes them
- **Layouts:** `src/layouts/` -- BaseLayout > PageLayout/ArticleLayout/CourseLayout
- **Components:** `src/components/` with `mdx/` subdirectory for MDX shortcodes
- **Styles:** Global CSS in `src/styles/global.css`, component styles scoped in `<style>` blocks
- **Pages:** `src/pages/` -- file-based routing with trailing slash

## Content Collections

- Uses Astro 5 Content Layer API with `glob()` loader
- Two collections: `chronicles` and `courses`
- Use `entry.id` (NOT `entry.slug` -- Astro 5 change)
- MDX files named to match URL slugs exactly (no number prefixes)
- Image paths in frontmatter are relative to the MDX file

## Styling Rules

- CSS custom properties: Do NOT rename or remove existing variables in `:root`
- Global styles: Shared resets, typography, utilities, animations
- Component styles: Scoped in `<style>` blocks (Astro default scoping)
- MDX content styles: Use `:global(.classname)` in parent layout for styles that must reach slotted/rendered MDX content
- Preserve ALL existing CSS class names and custom property references

## JavaScript

- Each JS concern lives in its owning component's `<script>` tag
- No global script files (no public/js/main.js pattern)
- Client-side scripts run once per page load

## URL Strategy

- `trailingSlash: 'always'` in astro.config.mjs
- `build.format: 'directory'` -- generates /path/index.html structure
- All 19 existing URLs must be preserved without redirects
- Do NOT set `base` in astro config (custom domain handles this)
- Do NOT delete the root `CNAME` file -- GitHub unsets the Pages custom
  domain (thecaddiechat.com) when it disappears from main, taking the site
  down. Both copies are required: root `CNAME` (Pages settings) and
  `public/CNAME` (copied into dist/ by the build).

## MDX Components (Courses)

Custom image layout components for course articles:
- `FullBleed` -- Full-viewport-width image with caption overlay
- `ImagePair` -- Side-by-side image grid (wraps two InlineImage components)
- `InlineImage` -- Inline figure with caption
- `FeaturedImage` -- Featured image with styled caption line
- `Memorabilia` -- Centered memorabilia display with label

## Key URLs (19 Pages)

```
/                            Homepage
/chronicles/                 Chronicles listing
/chronicles/viktor-hovland/  Chronicle article
/chronicles/tyrrell-hatton/  Chronicle article
/chronicles/matt-fitzpatrick/ Chronicle article
/chronicles/beauty-or-burden/ Chronicle article
/chronicles/uphill-challenge/ Chronicle article
/courses/                    Courses listing
/courses/golden-age-golf/    Golden Age Golf hub (standalone page)
/courses/stonewall/          Course article
/courses/francis-a-byrne/    Course article
/courses/mountain-ridge/     Course article
/courses/essex-county/       Course article
/courses/north-jersey/       Course article
/courses/hollywood/          Course article
/courses/winged-foot/        Course article
/courses/friars-head/        Course article
/camera-roll/                Camera Roll (standalone page)
```

## Validation

- `npm run build` validates all content schemas, routes, and renders
- `npm run validate-urls` checks dist/ output for all 19 expected URL paths
