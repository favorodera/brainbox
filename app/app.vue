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

const color = computed(() => colorMode.value === 'dark' ? '#090909' : 'white')

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
    { key: 'theme-color', name: 'theme-color', content: color },
  ],
  link: [
    { rel: 'icon', href: '/favicon-dark.ico', media: '(prefers-color-scheme:dark)' },
    { rel: 'icon', href: '/favicon-light.ico', media: '(prefers-color-scheme:light)' },
  ],
})


</script>

