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

The drafter commits the new file and pushes to main. The draft appears in the repo
but is excluded from the live site build (filtered by `draft: true`).

### Reviewing a draft (from any device)

1. Go to **[thecaddiechat.com/admin/](https://thecaddiechat.com/admin/)**
2. Enter the admin password
3. Review the draft card — title, date, source URL, and body preview
4. Click **Publish** to flip `draft: false` and trigger a site rebuild (~1–2 min)
5. Click **Discard** to delete the file and trigger a rebuild

No local dev server needed. Works from phone, tablet, or any browser.

### What happens after Publish / Discard

The admin page calls a Firebase Cloud Function (`publishDraft` on project
`greendoor-2da47`), which:

1. Verifies the admin password (bcrypt hash stored in Firebase env)
2. Calls GitHub's `workflow_dispatch` API to run `.github/workflows/publish-draft.yml`
3. That workflow checks out `main`, edits or deletes the MDX file, commits, and pushes
4. The push triggers `deploy.yml`, which rebuilds the Astro site to GitHub Pages

Deploy completes in approximately 1–2 minutes after clicking the button.

---

## Previewing a draft without publishing

Since the repo is public, you can read the raw MDX on GitHub:

```
https://github.com/awtilly/thecaddiechat/blob/main/src/content/chronicles/<slug>.mdx
```

To see it rendered, temporarily run locally:

```bash
git pull
npm run dev
# open http://localhost:4321/chronicles/<slug>/
```

Drafts are included in `getStaticPaths` in dev mode but excluded in prod.

---

## Manual draft creation

Create a draft at any time:

1. Create `src/content/chronicles/your-slug.mdx` with `draft: true` in frontmatter
2. Commit and push — it will appear on `thecaddiechat.com/admin/` immediately

Slug naming: lowercase, hyphen-separated, matches the URL path (`your-slug` → `/chronicles/your-slug/`).
