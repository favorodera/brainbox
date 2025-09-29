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
    head: {
      htmlAttrs: { lang: 'en', dir: 'ltr' },
      link: [
        { rel: 'icon', href: '/favicon-dark.ico', media: '(prefers-color-scheme:dark)' },
        { rel: 'icon', href: '/favicon-light.ico', media: '(prefers-color-scheme:light)' },
      ],
    },
    rootAttrs: {
      id: 'app',
    },
    pageTransition: { name: 'fade-out-in', mode: 'out-in' },
    layoutTransition: { name: 'fade-out-in', mode: 'out-in' },
  },
  css: ['~/assets/styles/index.css'],
  site: {
    url: 'https://brainboxaichat.vercel.app/',
    name: 'Brainbox',
  },
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
  seo: {
    redirectToCanonicalSiteUrl: true,
    meta: {
      titleTemplate: '%separator %s',
      description: 'Your personal AI chat companion for knowledge and assistance.',
      ogDescription: 'Your personal AI chat companion for knowledge and assistance.',
      twitterDescription: 'Your personal AI chat companion for knowledge and assistance.',
      twitterCard: 'summary_large_image',
      twitterSite: '@favorodera',
      twitterCreator: '@favorodera',
      colorScheme: 'dark light',
      author: 'Favour Emeka',
      themeColor: [
        { content: '#000000', media: '(prefers-color-scheme: dark)' },
        { content: '#ffffff', media: '(prefers-color-scheme: light)' },
      ],
      appleMobileWebAppStatusBarStyle: 'black-translucent',
      viewport: 'width=device-width, initial-scale=1',
      charset: 'utf-8',
    },
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
