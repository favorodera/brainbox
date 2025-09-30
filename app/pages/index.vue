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
            variant="subtle"
            placeholder="Ask anything..."
            autofocus
            autoresize
            :maxrows="6"
            :disabled="idlePromptBox || !user"
            :ui="{
              body: 'items-end',
            }"
            @submit="execute()"
          >

            <template #header>

              <UInputMenu
                id="context-menu"
                v-model="contextItemsModelValue"
                :loading="docsStatus === 'fetching'"
                multiple
                :disabled="!user"
                :items="contextItems"
                placeholder="Add relevant context..."
                variant="none"
                icon="lucide:at-sign"
                class="w-fit"
                :ui="{ content: 'min-w-fit max-w-48', trailingIcon: 'hidden' }"
                :filter-fields="['label', 'value']"
                :trailing="false"
                open-on-click
              />

            </template>

            <UButton
              type="submit"
              icon="lucide:send"
              :loading="idlePromptBox"
              :disabled="idlePromptBox || prompt.trim() === '' || !user"
            />

          </UChatPrompt>

          <UAlert
            v-if="!user"
            color="info"
            variant="subtle"
            icon="lucide:info"
            title="You're not logged in"
            description="Sign in to save your chats and access your history across devices."
          />
        </UContainer>

      </template>
      

    </UDashboardPanel>


  </div>

</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'chat',
})

const user = useSupabaseUser()

const { initPrompt } = useChatsStore()
const prompt = ref('')

const { start } = useQueueStorage()

const {
  contextItems,
  contextItemsModelValue,
  docs: {
    status: docsStatus,
  },
} = useContextsStore()

const toast = useToast()

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
    // Start the retry queue worker
    start()
  }
})
</script>
