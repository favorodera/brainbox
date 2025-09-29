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
    :toaster="{
      expand: false,
      position: 'top-center',
      progress: false,
      duration: 3000,
    }"
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
defineOgImageComponent('OgImage')
</script>
