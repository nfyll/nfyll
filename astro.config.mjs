import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://nfyll.org',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
