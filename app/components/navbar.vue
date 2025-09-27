<!-- Dashboard navbar showing auth-aware actions -->
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
      </template>
            
    </template>

  </UDashboardNavbar>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
</script>

<style scoped>

</style>
