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

        <UContainer class="flex flex-1 flex-col justify-center gap-4 py-8 sm:gap-6">
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
  
              <UButton
                type="submit"
                icon="lucide:send"
                :loading="status === 'pending'"
                :disabled="status === 'pending' || prompt.trim() === ''"
              />
            </template>

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

const toast = useToast()

const { model, models } = useAiModels()

const selectedModel = useArrayFind(models, selected => selected.value === model.value)

const prompt = ref('')

const { status, execute } = useRequest<string>('/api/chats/', {
  $fetch: {
    method: 'POST',
  },
  hooks: {
    async onSuccess(data) {
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

async function handleSubmit() {
  await execute({
    $fetch: {
      body: { prompt: prompt.value },
    },
  })
}
</script>
