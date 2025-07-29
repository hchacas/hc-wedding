// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [tailwind()],
  server: {
    port: 4321,
    host: true
  },
  vite: {
    define: {
      'import.meta.env.API_URL': JSON.stringify(process.env.API_URL || 'http://localhost:3001'),
      'import.meta.env.FRONTEND_URL': JSON.stringify(process.env.FRONTEND_URL || 'http://localhost:4321')
    }
  }
});
