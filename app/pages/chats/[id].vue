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
        <UContainer class="grid flex-1 grid-cols-1 gap-4 sm:gap-6">


          <div
            v-if="status === 'fetching'"
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
              @click="execute(route.params.id as string)"
            />
          </div>


          <template v-else>

            <UChatMessages
              should-auto-scroll
              :messages="chat.messages"
              :status="chat.status"
              :assistant="{
                actions: [
                  {
                    label: 'Copy', icon: copied ? 'lucide:copy-check' : 'lucide:copy', onClick: handleCopy,
                  },
                ],
              }"
              class="pb-4 sm:pb-6 lg:pt-(--ui-header-height)"
              :ui="{
                indicator: 'h-auto block *:rounded-none *:bg-transparent [&>*:nth-child(1)]:animate-none *:size-auto [&>*:nth-child(3)]:animate-none [&>*:nth-child(4)]:animate-none',
              }"
              :spacing-offset="160"
            >
              <template #indicator>
                <UButton
                  class="px-0"
                  color="neutral"
                  variant="link"
                  loading
                  loading-icon="lucide:loader"
                  :ui="{ label: 'animate-pulse text-muted' }"
                  label="Thinking..."
                />
              </template>

              <template #content="{ message }">

                <div class="space-y-4">

                  <MDCCached
                    :value="getTextFromMessage(message)"
                    :cache-key="message.id"
                    unwrap="p"
                    :components="components"
                    :parser-options="{ highlight: false, toc: false }"
                  />

                  <template
                    v-for="(part, index) in message.parts"
                    :key="`${part.type}-${index}-${message.id}`"
                  >
                    <UButton
                      v-if="part.type === 'text' && part.state !== 'done' && message.role === 'assistant'"
                      class="px-0"
                      color="neutral"
                      variant="link"
                      loading
                      loading-icon="lucide:loader"
                      :ui="{ label: 'animate-pulse text-muted' }"
                      label="Generating..."
                    />

                  </template>

                </div>

              </template>
            </UChatMessages>

            <div class="sticky bottom-0 z-10 flex h-full flex-col justify-end rounded-b-none bg-default pb-2 [view-transition-name:chat-prompt]">
              <UChatPrompt
                id="chat-prompt"
                v-model="prompt"
                variant="soft"
                placeholder="Ask anything..."
                autofocus
                autoresize
                :maxrows="6"
                :ui="{
                  footer: 'justify-between gap-4',
                }"
                @submit="handleSubmit()"
              >

                <template #footer>
                  <USelectMenu
                    id="model-select"
                    v-model="model"
                    :items="models"
                    :icon="selectedModel?.icon"
                    variant="ghost"
                    value-key="value"
                    :search-input="{
                      placeholder: 'Search models...',
                    }"
                    class="w-min"
                    :ui="{
                      leadingIcon: 'size-4',
                      trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200',
                    }"
                  />
  
                  <UChatPromptSubmit
                    :disabled="prompt.trim() === '' && chat.status !== 'error'"
                    :status="chat.status"
                    icon="lucide:send"
                    @stop="chat.stop"
                    @reload="chat.regenerate"
                  />
                </template>

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
})

const route = useRoute()

const components = {
  pre: ProseStreamPre as unknown as DefineComponent,
}

const { chats: { refresh }, chat: { data, execute, status, error }, initPrompt } = useChatsStore()

const prompt = ref('')

await execute(route.params.id as string)

const { model, models } = useAiModels()
const selectedModel = useArrayFind(models, selected => selected.value === model.value)

const toast = useToast()

const { copy, copied } = useClipboard({
  copiedDuring: 2000,
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
    body: {
      model: model.value,
    },
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

<style scoped>

</style>
