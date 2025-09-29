<!--
  Dashboard navbar showing auth-aware actions.
  - Displays brand logo when logged out
  - Shows quick-create and user actions when logged in
-->
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

      <UButton
        v-else
        icon="lucide:lock"
        label="Log in"
        to="/auth"
      />

            
    </template>

  </UDashboardNavbar>
</template>

<script setup lang="ts">
// Supabase user composable drives conditional rendering
const user = useSupabaseUser()
</script>

<style scoped>

</style>
