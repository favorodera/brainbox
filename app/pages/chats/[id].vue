<template>
  <div class="grid w-full">

    <UDashboardPanel
      id="chat"
      class="relative"
      :ui="{ body: 'p-0 sm:p-0' }"
    >

      <template #header>
        <Navbar />
      </template>

      <template #body>
        <UContainer class="flex flex-1 flex-col gap-4 sm:gap-6">

          <UChatMessages
            should-auto-scroll
            :messages="chat.messages"
            :status="chat.status"
            :assistant="{ actions: [{ label: 'Copy', icon: copied ? 'lucide:copy-check' : 'lucide:copy', onClick: handleCopy }] }"
            class="pb-4 sm:pb-6 lg:pt-(--ui-header-height)"
            :spacing-offset="160"
          >
            <template #content="{ message }">
              <div class="space-y-4">
                <template
                  v-for="(part, index) in message.parts"
                  :key="`${part.type}-${index}-${message.id}`"
                >
                  <UButton
                    v-if="part.type === 'reasoning' && part.state !== 'done'"
                    label="Thinking..."
                    variant="link"
                    color="neutral"
                    class="p-0"
                    loading
                  />
                </template>
                <MDCCached
                  :value="getTextFromMessage(message)"
                  :cache-key="message.id"
                  unwrap="p"
                  :components="components"
                  :parser-options="{ highlight: false }"
                />
              </div>
            </template>
          </UChatMessages>


          <UChatPrompt
            id="new-chat-prompt"
            v-model="prompt"
            class="sticky bottom-0 z-10 rounded-b-none [view-transition-name:chat-prompt]"
            variant="soft"
            placeholder="Ask anything..."
            name="new-chat-prompt"
            
            autofocus
            autoresize
            :maxrows="6"
            autocapitalize="on"
            autocorrect
            :ui="{
              footer: 'justify-between gap-4',
            }"
            @submit="handleSubmit()"
          >

            <template #footer>
              <USelectMenu
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
  
              <UChatPromptSubmit />
            </template>

          </UChatPrompt>
        </UContainer>
      </template>

    </UDashboardPanel>

  </div>
</template>

<script setup lang="ts">
import { ChatStream } from '#components'
import type { DefineComponent } from 'vue'
import { getTextFromMessage } from '@nuxt/ui/utils/ai'
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, type UIMessage } from 'ai'

definePageMeta({
  layout: 'chat',
})

const route = useRoute()

const { data, execute } = useChatsStore('chat')
await execute({ id: route.params.id as string })


const components = {
  pre: ChatStream as unknown as DefineComponent,
}

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

const prompt = ref('')

if (!data.value) {
  throw createError({ statusCode: 404, statusMessage: 'Chat not found', fatal: true })
}

const chat = new Chat({
  id: data.value.id,
  messages: data.value.messages,
  transport: new DefaultChatTransport({
    api: `/api/chats/${data.value.id}`,
    body: {
      aiModel: model.value,
    },
  }),
  onError(error) {
    toast.add({
      title: error?.data?.message || 'An error occurred',
      icon: 'lucide:x',
      color: 'error',
    })
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
  if (data.value?.messages.length === 1) {
    chat.regenerate()
  }
})


</script>

<style scoped>

</style>
