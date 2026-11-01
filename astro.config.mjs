// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

export default defineConfig({
  // Замените на свой домен, когда он появится: от него строятся ссылки для превью в соцсетях
  site: process.env.SITE_URL || 'https://kasta-design.vercel.app',
  integrations: [react(), keystatic()],
  adapter: vercel(),
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
});
