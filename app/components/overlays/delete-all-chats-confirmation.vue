<template>

  <UModal
    :close="{
      onClick: () => emit('close', false),
      disabled: status === 'pending',
    }"
    title="Delete all chats"
    description="Are you sure you want to delete all your chats?"
    :ui="{
      content: 'max-w-lg',
    }"
  >

    <template #body>
      <p class="line-clamp-1">
        You are about to delete all your chats
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
        label="Delete all chats"
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
const route = useRoute()
const emit = defineEmits<{ close: [boolean] }>()
const toast = useToast()
const { refresh } = useChatsStore('chats')

const { execute, status } = useRequest('/api/chats/', {
  $fetch: {
    method: 'DELETE',
  },
  hooks: {
    async onSuccess() {
      toast.add({
        title: 'All chats deleted successfully',
        color: 'success',
        icon: 'lucide:check',
      })

      await refresh()

      if (route.path !== '/') await navigateTo('/')

      emit('close', false)
    },
    onError(error) {
      toast.add({
        title: error?.data?.message || 'Failed to delete chats',
        color: 'error',
        icon: 'lucide:x',
      })
    },
  },
}, false)
</script>

<style scoped>

</style>
