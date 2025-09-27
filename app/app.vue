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
useSeoMeta({
  titleTemplate: 'MyDocs AI %separator %s',
  twitterCard: 'summary_large_image',
  twitterSite: '@favorodera',
  twitterCreator: '@favorodera',
  colorScheme: 'dark light',
  author: 'Favour Emeka',
  themeColor: [
    { content: '#090909', media: '(prefers-color-scheme: dark)' },
    { content: 'white', media: '(prefers-color-scheme: light)' },
  ],
  viewport: 'width=device-width, initial-scale=1',
})

useHead({
  htmlAttrs: { lang: 'en', dir: 'ltr' },
  link: [
    { rel: 'icon', href: '/logo.svg' },
  ],
})
</script>

