<template>

  <div class="flex w-full">
    <UDashboardPanel
      :ui="{
        body: 'items-center justify-center',
      }"
    >

      <template #header>
        <UDashboardNavbar
          class="border-none"
          :toggle="!!user"
        >

          <template #left>

            <Logo
              v-if="!user"
            />

          </template>

          <template #right>

            <UButton
              v-if="user"
              color="neutral"
              variant="ghost"
              icon="lucide-plus"
              to="/"
              class="lg:hidden"
            />

            <template v-else>
              <UButton
                label="Log in"
                to="/auth"
              />

              <UButton
                label="Sign up"
                color="neutral"
                variant="soft"
                to="/auth"
              />

              <UDropdownMenu
                :items="[
                  { label: 'Plans and Pricing', to: '', target: '_blank' },
                  { type: 'separator' },
                  { label: 'Documentation', to: '', target: '_blank' },
                  { label: 'Privacy Policy', to: '', target: '_blank' },
                ]"
              >
                <UButton
                  color="neutral"
                  variant="soft"
                  icon="lucide:info"
                />
              </UDropdownMenu>
            </template>
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
            id="chat-prompt"
            class="[view-transition-name:chat-prompt]"
            variant="subtle"
            placeholder="Ask anything..."
            name="chat-prompt"
            autofocus
            autoresize
            autocapitalize
            autocorrect
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
  layout: 'chat',
})
const user = useSupabaseUser()
</script>
