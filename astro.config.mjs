import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://thecaddiechat.com',
  output: 'static',
  // Outside node_modules so CI can restore it across runs (npm ci wipes
  // node_modules, which is the default cache location)
  cacheDir: './.astro-cache',
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

