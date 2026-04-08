# Chronicles Drafts — Convention Guide

## Editorial Focus

Beat: **golf course development, acquisition, and architecture news.**
This means: finance, construction, renovation, acquisition, and design of golf courses — not pro-tour results, player profiles, or instruction. Think: who is buying Tillinghast's legacy courses and why, what capital is flowing into new resort construction, which municipalities are selling or preserving public courses, how contemporary architects are approaching restoration.

---

## Frontmatter Fields

All chronicles entries share a base schema. Drafts add three fields:

```yaml
---
title: "Story title here"
description: "One or two sentence summary used in listings."
date: 2026-04-06          # ISO date; use the date the AI drafted it
meta: "Golf Course Development"   # Short topic label shown in article header
draft: true               # Required for drafts. Flip to false when publishing.
sourceUrl: "https://..."  # Primary source the AI used for this story
sourcesConsidered:        # All sources the scanner surfaced (optional)
  - "https://..."
  - "https://..."
# heroImage is intentionally omitted for AI drafts.
# Add one manually before publishing if you want the full article layout.
---
```

Fields required for publishing (flip `draft: false` and confirm these exist):
- `title`, `description`, `date`, `meta` — always set by the AI drafter
- `heroImage` — optional but strongly recommended before publishing; omit to publish text-only
- `sourceUrl`, `sourcesConsidered` — can stay as-is for attribution or be removed

---

## Weekly Flow

Every Sunday morning a scheduled task (Cowork) runs three agents in sequence:

1. **thecaddiechat-news-scanner** — searches for golf course development/architecture/acquisition news from the past week and selects the most interesting story
2. **thecaddiechat-story-selector** — scores candidates and picks one
3. **thecaddiechat-post-drafter** — drafts a full article in the site's voice and writes it as a new `.mdx` file into `src/content/chronicles/` with `draft: true`

### Reviewing a draft

```bash
# 1. Pull the new draft commit if you haven't already
git pull

# 2. Start the dev server
npm run dev

# 3. Open the admin review page
open http://localhost:4321/admin/drafts/

# 4. Click "Preview →" to read it rendered in the full site layout
# 5. Click "Publish" to flip draft: false and commit, or "Discard" to delete and commit

# 6. Push when you're ready (Publish does NOT push automatically)
git push
```

The Publish button commits the file with message `publish(chronicles): <slug>`.
The Discard button deletes the file and commits with `discard(chronicles): <slug>`.

---

## Previewing without publishing

Because `draft: true` entries are included in `getStaticPaths` in dev mode, you can
navigate directly to the article URL to see it fully rendered:

```
http://localhost:4321/chronicles/<slug>/
```

Drafts do **not** appear in the `/chronicles/` listing or on the homepage in either
dev or production — they are only visible via the direct URL (dev) or the admin page.

---

## Manual draft creation

You can create a draft manually at any time:

1. Create `src/content/chronicles/your-slug.mdx` with `draft: true` in frontmatter
2. It will appear in `/admin/drafts/` on your next `npm run dev`

Slug naming: lowercase, hyphen-separated, matches the URL path (`your-slug` → `/chronicles/your-slug/`).
