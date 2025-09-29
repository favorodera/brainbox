<!--
  Chat page renders a single conversation with streaming AI responses.
  - Header: navbar
  - Body: messages list and prompt input
  - Handles retry persistence and title refresh on first message
-->
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

                <template #header>

                  <UPopover
                    arrow
                    :content="{
                      align: 'start',
                      sideOffset: 5,
                    }"
                    size="sm"
                  >
                    <UTooltip text="Add Context">
                      <UButton
                        label="@"
                        color="neutral"
                        variant="subtle"
                        size="sm"
                      />
                    </UTooltip>

                    <template #content>
                      <UCommandPalette
                        v-model="commandPalletteValue"
                        :loading="docsStatus === 'fetching'"
                        :fuse="{ fuseOptions: { includeMatches: true } }"
                        multiple
                        placeholder="Add relevant context..."
                        :groups="commandPalletteGroups"
                        :ui="{ input: '[&>input]:h-8 [&>input]:text-sm' }"
                      />
                    </template>
                  </UPopover>


                </template>
  
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
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

definePageMeta({
  layout: 'chat',
  title: 'Chat',
})

const route = useRoute()

const { data: docs, status: docsStatus } = useContextsStore('docs')

const { start } = useQueueStorage()

// MDC component mapping (streamed code blocks)
const components = {
  pre: ProseStreamPre as unknown as DefineComponent,
}

const { add } = useQueueStorage()

// Load chat thread and messages for the given id
const { data, status, error, execute } = await useFetch<{ id: string, messages: UIMessage[], title: string }>(`/api/chats/${route.params.id}`, {
  headers: useRequestHeaders(['cookie']),
  method: 'GET',
  key: `chat-${route.params.id}`,
  watch: [route],
})

// Persist assistant messages; on failure queue locally for retry
const { execute: persist } = useRequest(`/api/chats/${route.params.id}/persist/`, {
  $fetch: {
    method: 'POST',
    headers: useRequestHeaders(['cookie']),
  },
  hooks: {
    onError(error) {
      const message = error.data?.data?.payload
      if (message) {
        add(message)
      }
    },
  },
}, false)

// Access chats store for title refresh and initial prompt
const { chats: { refresh }, getChatById, initPrompt } = useChatsStore()

const prompt = ref('')

const toast = useToast()

// Clipboard utility for message copy action
const { copy, copied } = useClipboard({
  copiedDuring: 1000,
  legacy: true,
})

// Copy a message's text content
function handleCopy(event: MouseEvent, message: UIMessage) {
  copy(getTextFromMessage(message))
}

// Guard against invalid or missing chat
if (!data.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Chat not found',
    fatal: true,
  })
}

// Chat controller handles sending and streaming messages
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
  async onFinish({ message }) {
  
    const chat = getChatById(route.params.id as string)

    if (!chat || !chat.title) refresh()

    persist({ $fetch: { body: { message } } })
  },
})

// Submit prompt and stream assistant response
function handleSubmit() {
  chat.sendMessage(
    { text: prompt.value },
    { headers: useRequestHeaders(['cookie']) },
  )
  prompt.value = ''
}

/**
 * Computed list of user's Docs for the command palette.
 * Each doc is mapped to a palette item with icon, label, and URL.
 */
const mappedDocs = computed(() =>
  (docs.value || []).map(doc => ({
    icon: 'lucide:book-open', // Book icon for docs
    label: doc.name, // Doc name as label
    suffix: doc.url, // Doc URL as suffix
  })),
)

/**
 * Value for the command palette (not used here, but can be set for selection).
 */
const commandPalletteValue = ref([])

/**
 * Command palette groups for quick access to Docs/tools.
 * Includes a "Docs" group with all mapped docs as children.
 */
const commandPalletteGroups = ref<CommandPaletteGroup<CommandPaletteItem>[]>([
  {
    id: 'tools',
    items: [
      {
        icon: 'lucide:book-open',
        label: 'Docs',
        placeholder: 'Search Documentations...',
        children: [...mappedDocs.value],
      },
    ],
  },
])

// If an init prompt exists (from home), send it once page mounts
onMounted(() => {

  if (initPrompt.value.trim() !== '') {
    chat.sendMessage(
      { text: initPrompt.value },
      { headers: useRequestHeaders(['cookie']) },
    )
    initPrompt.value = ''
  }

  // Start the retry queue worker to process the retry queue
  start()

})

</script>
