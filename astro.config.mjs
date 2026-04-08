import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Vite dev-server middleware that powers the /admin/drafts publish/discard flow.
 * This plugin only activates during `npm run dev` — it is never included in
 * production builds or deployed to GitHub Pages.
 */
function draftAdminPlugin() {
  let root = process.cwd();
  return {
    name: 'draft-admin-api',
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use('/api/publish-draft', (req, res) => {
        res.setHeader('Content-Type', 'application/json');

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          try {
            const { slug, action } = JSON.parse(body);

            // Validate slug: lowercase alphanumeric + hyphens only
            if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid slug' }));
              return;
            }
            if (action !== 'publish' && action !== 'discard') {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: 'Invalid action' }));
              return;
            }

            const chroniclesDir = resolve(root, 'src/content/chronicles');
            const filePath = resolve(join(chroniclesDir, `${slug}.mdx`));

            // Guard against path traversal
            if (!filePath.startsWith(chroniclesDir + '/') && filePath !== chroniclesDir) {
              res.statusCode = 403;
              res.end(JSON.stringify({ error: 'Forbidden' }));
              return;
            }

            if (action === 'publish') {
              let content = readFileSync(filePath, 'utf-8');
              // Flip the draft flag in frontmatter
              content = content.replace(/^draft:\s*true\s*$/m, 'draft: false');
              writeFileSync(filePath, content, 'utf-8');
              execSync(`git add "${filePath}" && git commit -m "publish(chronicles): ${slug}"`, {
                cwd: root,
                stdio: 'pipe',
              });
              res.statusCode = 200;
              res.end(JSON.stringify({ ok: true, message: `Published ${slug}` }));
            } else {
              // discard: delete file and commit the removal
              unlinkSync(filePath);
              execSync(`git add "${filePath}" && git commit -m "discard(chronicles): ${slug}"`, {
                cwd: root,
                stdio: 'pipe',
              });
              res.statusCode = 200;
              res.end(JSON.stringify({ ok: true, message: `Discarded ${slug}` }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }));
          }
        });
      });
    },
  };
}

export default defineConfig({
  site: 'https://thecaddiechat.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [mdx()],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  vite: {
    plugins: [draftAdminPlugin()],
  },
});
