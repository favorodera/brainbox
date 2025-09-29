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
            :disabled="idlePromptBox"
            :ui="{
              body: 'items-end',
            }"
            @submit="execute()"
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

            <UButton
              type="submit"
              icon="lucide:send"
              :loading="idlePromptBox"
              :disabled="idlePromptBox || prompt.trim() === ''"
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
import type { CommandPaletteGroup, CommandPaletteItem } from '@nuxt/ui'

definePageMeta({
  layout: 'chat',
})

const { start } = useQueueStorage()

const { initPrompt } = useChatsStore()

const { data: docs, status: docsStatus } = useContextsStore('docs')

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


onMounted(() => {
  if (user.value) {
    // If the user is authenticated, start the retry queue worker to process the retry queue
    start()
  }
})
</script>
