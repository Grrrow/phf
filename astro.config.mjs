// @ts-check
import { defineConfig } from 'astro/config';
import { storyblok } from '@storyblok/astro';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import mkcert from 'vite-plugin-mkcert';
import { storyblokComponents } from './src/storyblok/components.ts';

const env = loadEnv("", process.cwd(), 'STORYBLOK');

// https://astro.build/config
export default defineConfig({
  site: 'https://pedrohalfftercaro.com',
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: storyblokComponents,
    }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: {
          en: 'en',
          es: 'es'
        }
      }
    }),
  ],
  vite: {
    plugins: [mkcert()],
    server: {
      https: true,
      headers: {
        'Access-Control-Allow-Private-Network': 'true'
      },
      cors: {
        origin: 'https://app.storyblok.com',
        credentials: true
      }
    },
  },
});
// Trigger configuration reload

