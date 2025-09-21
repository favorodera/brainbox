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
          <ChatPromptBox class="sticky bottom-0 z-10 rounded-b-none [view-transition-name:chat-prompt]" />
        </UContainer>
      </template>

    </UDashboardPanel>

  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'chat',
})

const route = useRoute()
const toast = useToast()
const { model } = useAiModels()

const prompt = ref('')


</script>

<style scoped>

</style>
