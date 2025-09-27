<template>
  <div class="grid w-full">

    <UDashboardPanel
      id="chat"
      class="relative"
      :ui="{ body: 'p-0 sm:p-0 grid grid-cols-1' }"
    >

      <template #header>
        <Navbar />
      </template>

      <template #body>
        <UContainer class="grid max-w-3xl flex-1 grid-cols-1 gap-4 sm:gap-6">

          <div
            v-if="status === 'pending'"
            class="flex flex-col items-center justify-center gap-2"
          >
            <UIcon
              name="lucide:loader-circle"
              class="size-5 animate-spin"
            />
            <p class="animate-pulse">
              Loading Chat...
            </p>
          </div>

          <div
            v-else-if="error && status === 'error' && error.data?.statusCode !== 401"
            class="flex flex-col items-center justify-center gap-2"
          >
            <UIcon
              name="lucide:alert-circle"
              class="size-5 text-error"
            />
            <p class="line-clamp-2">
              {{ error?.data?.message || 'An unexpected error occurred' }}
            </p>
            <UButton
              label="Retry"
              variant="soft"
              size="sm"
              @click="execute()"
            />
          </div>


          <template v-else>

            <UChatMessages
              should-auto-scroll
              :messages="chat.messages"
              :status="chat.status"
              class="pb-4 sm:pb-6 lg:pt-(--ui-header-height)"
              :spacing-offset="160"
              :assistant="{
                actions: [
                  {
                    icon: copied ? 'lucide:copy-check' : 'lucide:copy',
                    label: 'Copy',
                    variant: 'link',
                    onClick: handleCopy,
                  },
                ],
              }"
            >

              <template #content="{ message }">
                <MDCCached
                  :value="getTextFromMessage(message)"
                  :cache-key="message.id"
                  unwrap="p"
                  :components="components"
                  :parser-options="{ highlight: false, toc: false }"
                />
              </template>

            </UChatMessages>

            <div class="sticky bottom-0 z-10 flex h-full flex-col justify-end rounded-b-none bg-default pb-2 [view-transition-name:chat-prompt]">
              <UChatPrompt
                id="chat-prompt"
                v-model="prompt"
                variant="soft"
                :error="chat.error"
                placeholder="Ask anything..."
                autofocus
                autoresize
                :maxrows="6"
                :ui="{
                  body: 'items-end',
                }"
                @submit="handleSubmit()"
              >
  
                <UChatPromptSubmit
                  :disabled="prompt.trim() === '' && chat.status !== 'error'"
                  :status="chat.status"
                  icon="lucide:send"
                  @stop="chat.stop"
                  @reload="chat.regenerate"
                />

              </UChatPrompt>
            </div>

          </template>

        </UContainer>
      </template>

    </UDashboardPanel>

  </div>
</template>

<script setup lang="ts">
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { ProseStreamPre } from '#components'
import type { DefineComponent } from 'vue'

definePageMeta({
  layout: 'chat',
  title: 'Chat',
})

const route = useRoute()

const components = {
  pre: ProseStreamPre as unknown as DefineComponent,
}

const { data, status, error, execute } = await useFetch<{ id: string, messages: UIMessage[], title: string }>(`/api/chats/${route.params.id}`, {
  headers: useRequestHeaders(['cookie']),
  method: 'GET',
  key: `chat-${route.params.id}`,
  watch: [route],
})

const { chats: { refresh }, initPrompt } = useChatsStore()

const prompt = ref('')

const toast = useToast()

const { copy, copied } = useClipboard({
  copiedDuring: 1000,
  legacy: true,
})

function handleCopy(event: MouseEvent, message: UIMessage) {
  copy(getTextFromMessage(message))
}

if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Chat not found',
    fatal: true,
  })
}

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
  }),
  onError(error) {
    toast.add({
      title: error.data?.message || 'An unexpected error occurred',
      icon: 'lucide:x',
      color: 'error',
    })
  },
  onFinish() {
    refresh()
  },
})

function handleSubmit() {
  chat.sendMessage(
    { text: prompt.value },
    { headers: useRequestHeaders(['cookie']) },
  )
  prompt.value = ''

  
}

onMounted(() => {

  if (initPrompt.value.trim() !== '') {
    chat.sendMessage(
      { text: initPrompt.value },
      { headers: useRequestHeaders(['cookie']) },
    )
    initPrompt.value = ''
  }

})

</script>
