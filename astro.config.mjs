import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://sh9hid.github.io',
  base: '/',
  integrations: [
    tailwind({
      applyBaseStyles: false
    }),
    sitemap()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    },
    rehypePlugins: [
      ['rehype-sanitize', { tagNames: ['script', 'style'] }]
    ]
  },
  build: {
    inlineStylesheets: 'always'
  },
  compressHTML: true
});
