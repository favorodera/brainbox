<!-- Personalization settings: manage external URLs powering personalization -->
<template>

  <div class="space-y-2">

    <h3 class="line-clamp-1 w-full text-lg font-normal">
      Personalization
    </h3>

    <USeparator />

    <div class="flex items-center justify-between">

      <p>
        Docs
      </p>

      <UButton
        color="neutral"
        variant="link"
        label="Manage"
        @click="manageDocsModal.open()"
      />

    </div>

  </div>


</template>

<script setup lang="ts">
import { LazyOverlaysManageDocs } from '#components'

const overlay = useOverlay()
const manageDocsModal = overlay.create(LazyOverlaysManageDocs)
</script>

<style scoped>

</style>
