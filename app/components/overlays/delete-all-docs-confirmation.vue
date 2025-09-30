<template>

  <UModal
    :close="{
      onClick: () => emit('close', false),
      disabled: status === 'pending',
    }"
    title="Delete all docs"
    description="Are you sure you want to delete all your docs?"
    :ui="{
      content: 'max-w-lg',
    }"
  >

    <template #body>
      <p class="line-clamp-1">
        You are about to delete all your docs
      </p>

      <p class="mt-2 text-sm text-muted">
        This action cannot be undone.
      </p>
    </template>

    <template #footer>

      <UButton
        label="Cancel"
        color="neutral"
        variant="soft"
        :disabled="status === 'pending'"
        block
        @click="emit('close', true)"
      />

      <UButton
        label="Delete all docs"
        color="error"
        variant="soft"
        block
        loading-auto
        @click="execute()"
      />
    </template>

  </UModal>
  
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>()
const toast = useToast()
const { refresh } = useContextsStore('docs')

const { execute, status } = useRequest('/api/docs/all', {
  $fetch: {
    method: 'DELETE',
  },
  hooks: {
    async onSuccess() {
      toast.add({
        title: 'All docs deleted successfully',
        color: 'success',
        icon: 'lucide:check',
      })

      await refresh()

      emit('close', false)
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
