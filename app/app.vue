<template>
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-default focus:px-3 focus:py-2 focus:text-default"
  >
    Skip to main content
  </a>
  <UApp
    id="main"
    tabindex="-1"
    :toaster="{ position: 'top-right', progress: false, duration: 4000 }"
  >
    <NuxtRouteAnnouncer />
    <NuxtLoadingIndicator
      color="white"
      error-color="red"
    />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

<script lang="ts" setup>
const colorMode = useColorMode()

const themeColor = computed(() =>
  colorMode.value === 'dark' ? '#000000' : '#ffffff',
)

useSeoMeta({
  titleTemplate: 'Brainbox %separator %s',
  twitterCard: 'summary_large_image',
  twitterSite: '@favorodera',
  twitterCreator: '@favorodera',
  colorScheme: 'dark light',
  author: 'Favour Emeka',
})

useHead({
  htmlAttrs: { lang: 'en', dir: 'ltr' },
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      name: 'theme-color',
      content: '#ffffff',
      media: '(prefers-color-scheme: light)',
    },
    {
      name: 'theme-color',
      content: '#000000',
      media: '(prefers-color-scheme: dark)',
    },

    {
      name: 'theme-color',
      content: themeColor,
      tagPriority: 1,
    },

    {
      name: 'msapplication-navbutton-color',
      content: themeColor,
    },
    {
      name: 'apple-mobile-web-app-status-bar-style',
      content: 'black-translucent',
    },
  ],
  link: [
    { rel: 'icon', href: '/favicon-dark.ico', media: '(prefers-color-scheme:dark)' },
    { rel: 'icon', href: '/favicon-light.ico', media: '(prefers-color-scheme:light)' },
    { rel: 'canonical', href: 'https://brainboxaichat.vercel.app/' },
  ],
})

</script>
