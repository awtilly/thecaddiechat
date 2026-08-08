import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thecaddiechat.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    mdx(),
    // /tarmac/ is noindex -- keep it out of the sitemap too
    sitemap({ filter: (page) => !page.includes('/tarmac/') }),
  ],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
});

