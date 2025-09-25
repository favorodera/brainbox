<!-- Dashboard navbar showing auth-aware actions and help menu -->
<template>
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
            icon="lucide:circle-question-mark"
          />
        </UDropdownMenu>
      </template>
            
    </template>

  </UDashboardNavbar>
</template>

<script setup lang="ts">
// Reactive Supabase user used to toggle navbar items
const user = useSupabaseUser()
</script>

<style scoped>

</style>
