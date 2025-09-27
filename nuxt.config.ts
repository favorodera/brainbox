// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  extends: ['@favorodera/nuxt-helper'],
  modules: [
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@vueuse/nuxt',
    '@nuxt/eslint',
    '@nuxtjs/supabase',
    '@vaxee/nuxt',
    '@nuxtjs/seo',
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
    pageTransition: { name: 'fade-out-in', mode: 'out-in' },
    layoutTransition: { name: 'fade-out-in', mode: 'out-in' },
  },
  css: ['~/assets/styles/index.css'],
  mdc: {
    highlight: {
      shikiEngine: 'javascript',
    },
    headings: {
      anchorLinks: false,
    },
  },
  runtimeConfig: {
    supabaseServiceKey: '',
    googleGenerativeAiKey: '',
    public: {
      supabaseUrl: '',
      supabaseKey: '',
    },
  },
  experimental: {
    viewTransition: true,
  },
  compatibilityDate: '2025-07-15',
  vite: {
    $server: {
      build: {
        rollupOptions: {
          output: {
            preserveModules: true,
          },
        },
      },
    },
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
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    serviceKey: process.env.NUXT_SUPABASE_SERVICE_KEY,
    redirectOptions: {
      login: '/auth',
      callback: '/callback',
      saveRedirectToCookie: true,
      exclude: ['/'],
    },
    cookiePrefix: 'brainbox',
    cookieOptions: {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
      secure: true,
    },
    types: './shared/database.d.ts',
  },
})
