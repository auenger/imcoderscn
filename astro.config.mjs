import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://imcoders.cn',
  integrations: [mdx()],
  build: {
    format: 'directory',
  },
  vite: {
    build: {
      assetsInlineLimit: 0,
    },
  },
});
