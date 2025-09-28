<template>

  <div class="flex w-full">

    <UDashboardPanel
      id="home"
      :ui="{ body: 'p-0 sm:p-0' }"
    >

      <template #header>
        <Navbar />
      </template>

      <template #body>

        <UContainer class="flex max-w-3xl flex-1 flex-col justify-center gap-4 py-8 sm:gap-6">

          <h1 class="text-3xl font-bold text-highlighted sm:text-4xl">
            How can I help you today?
          </h1>

          <UChatPrompt
            id="new-chat-prompt"
            v-model="prompt"
            class="[view-transition-name:chat-prompt]"
            variant="soft"
            placeholder="Ask anything..."
            autofocus
            autoresize
            :maxrows="6"
            :disabled="idlePromptBox"
            :ui="{
              body: 'items-end',
            }"
            @submit="execute()"
          >

            <UButton
              type="submit"
              icon="lucide:send"
              :loading="idlePromptBox"
              :disabled="idlePromptBox || prompt.trim() === ''"
            />

          </UChatPrompt>

        </UContainer>

      </template>
      

    </UDashboardPanel>


  </div>

</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'chat',
})

const { start } = useQueueStorage()

const { initPrompt } = useChatsStore()

const user = useSupabaseUser()

const toast = useToast()

const prompt = ref('')

const { status, execute } = useRequest<string>('/api/chats/', {
  $fetch: {
    method: 'POST',
  },
  hooks: {
    async onSuccess(data) {
      initPrompt.value = prompt.value

      prompt.value = ''

      await navigateTo(`/chats/${data}`)
    },
    onError(error) {
      toast.add({
        title: error?.data?.message || 'An unexpected error occurred',
        icon: 'lucide:x',
        color: 'error',
      })
    },
  },
}, false)

/** Idles prompt box awaiting redirect */
const idlePromptBox = computed(() => {
  return status.value === 'pending' || status.value === 'success'
})

onMounted(() => {
  if (user.value) {
    // If the user is authenticated, start the retry queue worker to process the retry queue
    start()
  }
})
</script>
