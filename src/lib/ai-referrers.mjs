/*
 * AI referral classification — GEO-PLAN Phase 6.2.
 *
 * Plain .mjs on purpose (allowJs is on via astro/tsconfigs/strict): this exact file
 * is imported by Analytics.astro at build time AND by tools/verify-ai-referrers.mjs
 * under node. One source of truth, no duplicated host table, no eval.
 *
 * WHY THIS IS CODE AND NOT A DASHBOARD SEGMENT
 * The plan originally said "set up a referrer segment in whichever tool wins". That
 * is not enough, for three reasons a UI segment cannot fix:
 *
 *   1. utm_source survives when the referrer does not. ChatGPT appends
 *      ?utm_source=chatgpt.com to links it surfaces, and Perplexity tags its own.
 *      Desktop/native AI apps frequently send no Referer header at all, so a
 *      referrer-only segment silently drops a large share of real AI visits.
 *   2. Attribution has to be sticky for the session. The referrer is only present
 *      on the landing hit; every soft navigation after it is same-origin. A naive
 *      per-pageview segment therefore credits AI with exactly one pageview per
 *      visit and reports the rest as direct.
 *   3. bing.com must NOT be treated as AI wholesale (see BING_CHAT_PATHS below).
 *
 * PRECISION OVER RECALL — read before adding a host.
 * This number exists to answer a kill decision (Phase 6.4): after ~4 months, is any
 * of this producing traffic? An over-broad rule makes GEO look alive when it is not,
 * which is the one failure mode that actually costs money. When a host is ambiguous,
 * leave it unclassified. Undercounting is recoverable; a poisoned metric is not.
 */

/**
 * @typedef {Object} AiSource
 * @property {string} id      stable machine id, used as the analytics value
 * @property {string} label   human label for reports
 * @property {string[]} hosts referrer hostnames; matched exactly or as a subdomain
 * @property {string[]} utm   utm_source values, compared lowercased
 */

/** @type {AiSource[]} */
export const AI_SOURCES = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    // Deliberately NOT bare openai.com — that is the marketing site and blog,
    // whose outbound links are ordinary referrals, not answer citations.
    hosts: ['chatgpt.com', 'chat.openai.com'],
    utm: ['chatgpt.com', 'chatgpt', 'openai'],
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    hosts: ['perplexity.ai'], // subdomain rule covers www.
    utm: ['perplexity', 'perplexity.ai'],
  },
  {
    id: 'claude',
    label: 'Claude',
    hosts: ['claude.ai'],
    utm: ['claude', 'claude.ai'],
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    // Host-specific, so the subdomain rule cannot leak google.com organic search.
    hosts: ['gemini.google.com', 'bard.google.com'],
    utm: ['gemini'],
  },
  {
    id: 'copilot',
    label: 'Microsoft Copilot',
    hosts: ['copilot.microsoft.com'],
    utm: ['copilot'],
  },
];

/**
 * bing.com is the one host that is both an AI surface and a plain search engine.
 * Classifying all of it as AI would fold ordinary Bing organic traffic into the GEO
 * number — and Bing organic is exactly what Phase 1.2/1.3 are separately trying to
 * grow, so the two would become impossible to tell apart.
 *
 * We therefore only count bing.com when the referrer path still says chat/copilot.
 * Under the usual strict-origin-when-cross-origin policy that path is stripped and
 * we correctly fall through to "not AI" rather than guessing.
 */
export const BING_HOSTS = ['bing.com'];
export const BING_CHAT_PATHS = ['/chat', '/copilot', '/search/chat'];

/** Exact host, or any subdomain of it. Case- and trailing-dot-insensitive. */
export function hostMatches(host, candidate) {
  return host === candidate || host.endsWith('.' + candidate);
}

/**
 * Classify a visit as AI-sourced.
 *
 * Pure and dependency-free so it can be unit-tested directly and inlined into the
 * page at build time via toString(). Takes raw strings rather than touching
 * `document`/`location` for the same reason.
 *
 * @param {string} referrer  document.referrer (may be '' when stripped)
 * @param {string} search    location.search, e.g. '?utm_source=chatgpt.com'
 * @returns {{id: string, label: string, via: 'referrer'|'utm'} | null}
 */
export function classifyAiSource(referrer, search) {
  // utm_source is checked FIRST and wins ties: it is an explicit, first-party
  // declaration by the AI product, whereas a referrer can be a stale tab or a
  // proxy. It is also the only signal present when the Referer header is absent.
  const params = new URLSearchParams(search || '');
  const utm = (params.get('utm_source') || '').trim().toLowerCase();
  if (utm) {
    for (const s of AI_SOURCES) {
      if (s.utm.includes(utm)) {
        return { id: s.id, label: s.label, via: 'utm' };
      }
    }
  }

  if (!referrer) return null;

  let url;
  try {
    url = new URL(referrer);
  } catch {
    return null; // malformed referrer: unclassified, never guessed
  }

  const host = url.hostname.toLowerCase().replace(/\.$/, '');

  for (const s of AI_SOURCES) {
    if (s.hosts.some((h) => hostMatches(host, h))) {
      return { id: s.id, label: s.label, via: 'referrer' };
    }
  }

  if (BING_HOSTS.some((h) => hostMatches(host, h))) {
    const path = url.pathname.toLowerCase();
    if (BING_CHAT_PATHS.some((p) => path === p || path.startsWith(p + '/'))) {
      return { id: 'copilot', label: 'Microsoft Copilot', via: 'referrer' };
    }
    return null; // plain Bing search — belongs to organic, not GEO
  }

  return null;
}

/**
 * Emit this module's classifier as source text for an inline <script>.
 *
 * Analytics.astro must be `is:inline` to preserve the dormancy guarantee (with
 * PROVIDER='none' the site's HTML has to stay byte-identical, and Astro hoists
 * bundled <script> tags into the page whether or not the tag renders). An inline
 * script cannot `import`, so the classifier is interpolated as text at build time.
 *
 * Everything classifyAiSource() references from module scope must be emitted with
 * it or the inlined copy throws on a free variable. That is easy to get wrong when
 * adding a rule, so verify-ai-referrers.mjs evaluates this exact string and re-runs
 * the entire case table through it — a missed const fails the suite immediately.
 *
 * @returns {string} JS source defining classifyAiSource and its dependencies
 */
export function buildInlinePrelude() {
  return [
    `const AI_SOURCES = ${JSON.stringify(AI_SOURCES)};`,
    `const BING_HOSTS = ${JSON.stringify(BING_HOSTS)};`,
    `const BING_CHAT_PATHS = ${JSON.stringify(BING_CHAT_PATHS)};`,
    `const hostMatches = ${hostMatches.toString()};`,
    `const classifyAiSource = ${classifyAiSource.toString()};`,
  ].join('\n');
}
