// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  extends: ['@favorodera/nuxt-helper'],
  modules: [
    '@vaxee/nuxt',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
    '@nuxt/image',
    '@nuxt/eslint',
  ],
  imports: {
    dirs: ['./app/stores'],
  },
  devtools: { enabled: true },
  app: {
    rootTag: 'main',
    rootAttrs: {
      id: 'app',
    },
    pageTransition: { name: 'page-layout-transition', mode: 'out-in' },
    layoutTransition: { name: 'page-layout-transition', mode: 'out-in' },
  },
  css: ['~/assets/styles/index.css'],
  compatibilityDate: '2025-07-15',
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  eslint: {
    config: {
      stylistic: true,
    },
  },
  icon: {
    mode: 'svg',
    customCollections: [
      { prefix: 'custom', dir: './app/assets/icons' },
    ],
  },
})
