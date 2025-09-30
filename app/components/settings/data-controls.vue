<template>

  <div class="space-y-2">

    <h3 class="line-clamp-1 w-full text-lg font-normal select-none">
      Data controls
    </h3>

    <USeparator />


    <div class="flex items-center justify-between">

      <p>
        Delete all chats
      </p>

      <UButton
        color="error"
        variant="link"
        label="Delete all"
        @click="deleteAllChatsModal.open()"
      />

    </div>

    <USeparator />

    <div class="flex items-center justify-between">

      <p>
        Delete all Docs
      </p>

      <UButton
        color="error"
        variant="link"
        label="Delete all"
        @click="deleteAllDocsModal.open()"
      />


    </div>


  </div>


</template>

<script setup lang="ts">
import { LazyOverlaysDeleteAllChatsConfirmation, LazyOverlaysDeleteAllDocsConfirmation } from '#components'

const overlay = useOverlay()

const deleteAllChatsModal = overlay.create(LazyOverlaysDeleteAllChatsConfirmation)
const deleteAllDocsModal = overlay.create(LazyOverlaysDeleteAllDocsConfirmation)
</script>
