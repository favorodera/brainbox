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
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>

