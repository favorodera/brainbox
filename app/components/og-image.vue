<template>
  <div
    class="flex h-full w-full flex-col items-center justify-center bg-black p-6 text-white sm:p-10"
  >
    <NuxtImg
      src="/favicon-dark.svg"
      width="128"
      height="128"
      alt="Brainbox Logo"
      class="rounded-xl bg-black shadow-lg"
      loading="eager"
      fetchpriority="high"
    />

    <h1
      class="mt-4 text-center text-3xl leading-none font-bold tracking-tight"
    >
      Brainbox
    </h1>

    <p
      class="max-w-[600px] text-center text-xl leading-snug text-white/80"
    >
      Your personal AI chat companion for knowledge and assistance.
    </p>
  </div>
</template>

<script setup lang="ts">

</script>

<style scoped>
</style>
