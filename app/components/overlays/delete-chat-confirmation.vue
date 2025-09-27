<!-- Confirmation modal to delete a chat -->
<template>

  <UModal
    :close="{
      onClick: () => emit('close', false),
      disabled: status === 'pending',
    }"
    title="Delete Chat"
    description="Are you sure you want to delete this chat?"
    :ui="{
      content: 'max-w-lg',
    }"
  >

    <template #body>

      <p class="line-clamp-1">
        You are about to delete the chat: <span class="font-semibold">{{ chatTitle }}</span>
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
        label="Delete Chat"
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
const props = defineProps<{
  chatTitle: string
  chatId: string
}>()

const route = useRoute()

const emit = defineEmits<{ close: [boolean] }>()

const toast = useToast()

const { refresh } = useChatsStore('chats')

const { execute, status } = useRequest(`/api/chats/${props.chatId}`, {
  $fetch: {
    method: 'DELETE',
  },
  hooks: {
    async onSuccess() {
      toast.add({
        title: 'Chat deleted successfully',
        color: 'success',
        icon: 'lucide:check',
      })

      await refresh()

      if (route.params.id === props.chatId) {
        await navigateTo('/')
      }

      emit('close', false)

    },
    onError(error) {
      toast.add({
        title: error?.data?.message || 'Failed to delete chat',
        color: 'error',
        icon: 'lucide:x',
      })
    },
  },
}, false)
</script>

<style scoped>

</style>
