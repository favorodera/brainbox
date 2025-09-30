<template>
  <UModal
    :close="{
      onClick: () => emit('close', false),
      disabled: status === 'pending',
    }"
    title="Delete Docs"
    description="Are you sure you want to delete the following docs? This action cannot be undone."
    :ui="{
      content: 'max-w-2xl',
      footer: 'justify-between',
    }"
    :dismissible="false"
  >
    <template #body>
      <div class="space-y-2">

        <ul class="divide-y divide-default rounded border border-default bg-muted/50">
          <li
            v-for="(doc, index) in docs"
            :key="index"
            class="flex flex-col justify-between gap-1 px-3 py-2 sm:flex-row sm:items-center"
          >
            <span class="truncate text-sm">{{ doc.name }}</span>
            <span class="truncate text-xs text-muted">{{ doc.url }}</span>
          </li>
        </ul>

        <div
          v-if="!docs?.length"
          class="py-4 text-center text-muted"
        >
          No docs selected for deletion.
        </div>

      </div>
    </template>

    <template #footer>
      <UButton
        label="Cancel"
        color="neutral"
        variant="soft"
        :disabled="status === 'pending'"
        block
        @click="emit('close', false)"
      />
      <UButton
        label="Delete"
        color="error"
        variant="soft"
        :loading="status === 'pending'"
        loading-auto
        block
        @click="execute()"
      />
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  docs: { name: string, url: string }[]
}>()

const emit = defineEmits<{ close: [boolean] }>()

const { refresh } = useContextsStore('docs')
const toast = useToast()

const { execute, status } = useRequest('/api/docs', {
  $fetch: {
    method: 'DELETE',
    body: { docs: [...props.docs] },
  },
  hooks: {
    onSuccess() {

      toast.add({
        title: 'Docs deleted successfully',
        color: 'success',
        icon: 'lucide:check',
      })

      emit('close', false)

      refresh()
    },
    onError(error) {
      toast.add({
        title: error?.data?.message || 'Failed to delete docs',
        color: 'error',
        icon: 'lucide:x',
      })
    },
  },
}, false)


</script>

<style scoped>
</style>
