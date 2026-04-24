'use strict';

/**
 * publishDraft — Firebase Cloud Function
 *
 * POST body: { password: string, action: "publish" | "discard" | "save", slug: string, ... }
 *
 * Env vars required (set via Firebase CLI — see README.md):
 *   ADMIN_PASSWORD_HASH  bcrypt hash of the admin password
 *   GITHUB_TOKEN         fine-grained PAT for awtilly/thecaddiechat
 *                        (needs Contents: write + Actions: write)
 */

const functions = require('firebase-functions');
const bcrypt = require('bcryptjs');

const ALLOWED_ORIGINS = [
  'https://thecaddiechat.com',
  'http://localhost:4321',
];

const SLUG_RE = /^[a-z0-9-]+$/;

// Content collections the admin is allowed to write to. Keep in sync with
// src/content.config.ts and the workflow in .github/workflows/publish-draft.yml.
const VALID_COLLECTIONS = ['chronicles', 'field-notes'];

// ── Shared helpers ───────────────────────────────────────

async function verifyPassword(password) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    functions.logger.error('ADMIN_PASSWORD_HASH env var not set');
    return { ok: false, status: 500, error: 'Server not configured — ADMIN_PASSWORD_HASH missing' };
  }
  const trimmedHash = hash.trim();
  if (!trimmedHash.startsWith('$2')) {
    functions.logger.error('ADMIN_PASSWORD_HASH does not look like a bcrypt hash', {
      length: hash.length,
      prefix: hash.slice(0, 4),
    });
    return { ok: false, status: 500, error: 'Server not configured — ADMIN_PASSWORD_HASH is not a valid bcrypt hash' };
  }
  const valid = await bcrypt.compare(password, trimmedHash);
  if (!valid) {
    functions.logger.warn('Password mismatch', { hashPrefix: trimmedHash.slice(0, 7) });
    return { ok: false, status: 401, error: 'Invalid password' };
  }
  return { ok: true };
}

// ── Main handler ─────────────────────────────────────────

exports.publishDraft = functions.https.onRequest(async (req, res) => {
  // ── CORS ────────────────────────────────────────────────
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // ── Input validation ─────────────────────────────────────
  const { password, action, slug } = req.body || {};
  // Default to 'chronicles' so old admin clients (pre-field-notes) keep working.
  const collection = (req.body && req.body.collection) || 'chronicles';

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Missing password' });
    return;
  }
  if (action !== 'publish' && action !== 'discard' && action !== 'save') {
    res.status(400).json({ error: 'Invalid action — must be publish, discard, or save' });
    return;
  }
  if (!slug || !SLUG_RE.test(slug)) {
    res.status(400).json({ error: 'Invalid slug' });
    return;
  }
  if (!VALID_COLLECTIONS.includes(collection)) {
    res.status(400).json({ error: `Invalid collection — must be one of ${VALID_COLLECTIONS.join(', ')}` });
    return;
  }

  // ── Password verification ────────────────────────────────
  const authResult = await verifyPassword(password);
  if (!authResult.ok) {
    res.status(authResult.status).json({ error: authResult.error });
    return;
  }

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    functions.logger.error('GITHUB_TOKEN env var not set');
    res.status(500).json({ error: 'Server not configured — set GITHUB_TOKEN' });
    return;
  }

  // ── Save action (write file directly via Contents API) ───
  if (action === 'save') {
    const { content, sha, alsoPublish } = req.body;

    if (typeof content !== 'string' || !content) {
      res.status(400).json({ error: 'Missing content' });
      return;
    }
    if (typeof sha !== 'string' || !sha) {
      res.status(400).json({ error: 'Missing sha' });
      return;
    }

    let finalContent = content;
    if (alsoPublish === true) {
      // Flip draft: true → draft: false within the frontmatter block
      finalContent = content.replace(/^draft:\s*true\s*$/m, 'draft: false');
    }

    const encodedContent = Buffer.from(finalContent).toString('base64');
    const commitMessage = alsoPublish
      ? `publish(${collection}): save and publish "${slug}" via admin`
      : `edit(${collection}): update "${slug}" draft via admin`;

    let ghRes;
    try {
      ghRes = await fetch(
        `https://api.github.com/repos/awtilly/thecaddiechat/contents/src/content/${collection}/${slug}.mdx`,
        {
          method: 'PUT',
          headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            'Content-Type': 'application/json',
            'User-Agent': 'thecaddiechat-admin-fn/1.0',
          },
          body: JSON.stringify({
            message: commitMessage,
            content: encodedContent,
            sha,
            branch: 'main',
          }),
        }
      );
    } catch (err) {
      functions.logger.error('Network error calling GitHub Contents API', err);
      res.status(502).json({ error: 'Could not reach GitHub API' });
      return;
    }

    if (ghRes.ok) {
      const ghData = await ghRes.json();
      res.status(200).json({
        ok: true,
        // Return new file blob sha so client can chain saves without a page reload
        sha: ghData.content.sha,
        commit: {
          sha: ghData.commit.sha,
          url: ghData.commit.html_url,
        },
      });
    } else {
      const body = await ghRes.text().catch(() => '');
      let ghError = body;
      try { ghError = JSON.parse(body).message || body; } catch (_) { /* ignore */ }
      functions.logger.error('GitHub Contents API error', { status: ghRes.status, body });
      res.status(502).json({ error: `GitHub API ${ghRes.status}: ${ghError}` });
    }
    return;
  }

  // ── Trigger GitHub Actions workflow (publish / discard) ──
  let ghRes;
  try {
    ghRes = await fetch(
      'https://api.github.com/repos/awtilly/thecaddiechat/actions/workflows/publish-draft.yml/dispatches',
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
          'User-Agent': 'thecaddiechat-admin-fn/1.0',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: { action, slug, collection },
        }),
      }
    );
  } catch (err) {
    functions.logger.error('Network error calling GitHub API', err);
    res.status(502).json({ error: 'Could not reach GitHub API' });
    return;
  }

  if (ghRes.status === 204) {
    const verb = action === 'publish' ? 'Published' : 'Discarded';
    res.status(200).json({
      ok: true,
      message: `${verb} "${slug}" — site rebuilds in ~1–2 min`,
    });
  } else {
    const body = await ghRes.text().catch(() => '');
    functions.logger.error('GitHub API error', { status: ghRes.status, body });
    res.status(502).json({
      error: `GitHub API returned ${ghRes.status} — check GITHUB_TOKEN permissions`,
    });
  }
});
