'use strict';

/**
 * publishDraft — Firebase Cloud Function
 *
 * POST body: { password: string, action: "publish" | "discard", slug: string }
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

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Missing password' });
    return;
  }
  if (action !== 'publish' && action !== 'discard') {
    res.status(400).json({ error: 'Invalid action — must be publish or discard' });
    return;
  }
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    res.status(400).json({ error: 'Invalid slug' });
    return;
  }

  // ── Password verification ────────────────────────────────
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    functions.logger.error('ADMIN_PASSWORD_HASH env var not set');
    res.status(500).json({ error: 'Server not configured — ADMIN_PASSWORD_HASH missing' });
    return;
  }

  // Trim whitespace defensively — a trailing space or newline in functions/.env
  // causes bcrypt.compare to always return false.
  const trimmedHash = hash.trim();
  if (!trimmedHash.startsWith('$2')) {
    functions.logger.error('ADMIN_PASSWORD_HASH does not look like a bcrypt hash', {
      length: hash.length,
      prefix: hash.slice(0, 4),
    });
    res.status(500).json({ error: 'Server not configured — ADMIN_PASSWORD_HASH is not a valid bcrypt hash' });
    return;
  }

  const valid = await bcrypt.compare(password, trimmedHash);
  if (!valid) {
    functions.logger.warn('Password mismatch', { hashPrefix: trimmedHash.slice(0, 7) });
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  // ── Trigger GitHub Actions workflow ──────────────────────
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    functions.logger.error('GITHUB_TOKEN env var not set');
    res.status(500).json({ error: 'Server not configured — set GITHUB_TOKEN' });
    return;
  }

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
          inputs: { action, slug },
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
