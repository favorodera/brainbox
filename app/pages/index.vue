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
        
          <ChatPromptBox />
        </UContainer>

      </template>

    </UDashboardPanel>
  </div>

</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'chat',
})

const { data, status } = useRequest('', {
  $fetch: {
    method: 'POST',
  },
  hooks: {
    onSuccess(data) {
      navigateTo({
        path: 'chat-id',
        params: { id: data.id },
      })
    },
  },
}, false)
</script>
