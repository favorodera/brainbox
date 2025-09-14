<template>

  <div class="flex w-full">
    <UDashboardPanel :ui="{ body: 'items-center justify-center' }">

      <template #header>
        <UDashboardNavbar class="border-none">

          <template #right>

            <UButton
              color="neutral"
              variant="ghost"
              icon="lucide-plus"
              to="/"
              class="lg:hidden"
            />
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>

        <UPageCard
          variant="naked"
          title="How can I help you today?"
          :ui="{ root: 'w-full max-w-3xl', title: 'text-3xl sm:text-4xl' }"
        >
          <UChatPrompt
            class="[view-transition-name:chat-prompt]"
            variant="subtle"
          >
            <UChatPromptSubmit color="neutral" />

          </UChatPrompt>
        </UPageCard>

      </template>


    </UDashboardPanel>
  </div>

</template>

<script lang="ts" setup>
definePageMeta({
  layout: 'authenticated',
})

</script>
