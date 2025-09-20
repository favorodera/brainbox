<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Delete URLs"
    description="Are you sure you want to delete the following URLs? This action cannot be undone."
    :ui="{
      content: 'max-w-xl',
    }"
    :dismissible="false"
  >
    <template #body>
      <div class="space-y-2">
        <ul class="divide-y divide-default rounded border border-default bg-muted/50">
          <li
            v-for="(url, index) in urls"
            :key="index"
            class="flex flex-col justify-between gap-1 px-3 py-2 sm:flex-row sm:items-center"
          >
            <span class="truncate text-sm font-medium">{{ url.name }}</span>
            <span class="truncate text-xs text-muted">{{ url.url }}</span>
          </li>
        </ul>
        <div
          v-if="!urls?.length"
          class="py-4 text-center text-muted"
        >
          No URLs selected for deletion.
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex gap-2">
        <UButton
          label="Cancel"
          color="neutral"
          variant="soft"
          @click="emit('close', false)"
        />
        <UButton
          label="Delete"
          color="error"
          variant="solid"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
defineProps<{
  urls: { name: string, url: string }[]
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<style scoped>
</style>
