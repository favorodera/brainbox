<template>

  <div class="space-y-2">

    <h3 class="line-clamp-1 w-full text-lg font-normal">
      Security
    </h3>

    <USeparator />

    <div class="flex items-center justify-between">

      <p>
        Sign out of your account
      </p>

      <UButton
        color="error"
        variant="link"
        label="Sign Out"
        @click="signOutConfirmationModal.open()"
      />

    </div>

  </div>


</template>

<script setup lang="ts">
import { LazyOverlaysSignoutConfirmation } from '#components'

const overlay = useOverlay()
const signOutConfirmationModal = overlay.create(LazyOverlaysSignoutConfirmation)
</script>

<style scoped>

</style>
