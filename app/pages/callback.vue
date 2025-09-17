<template>
  <UPage>
    
    <UPageBody class="flex min-h-[calc(100vh-var(--ui-header-height))] items-center justify-center">
      
      <UPageCard
        class="mx-4 w-fit max-w-lg sm:mx-6"
        variant="naked"
      >
    

        <div class="flex flex-col items-center gap-2">

          <UIcon
            name="lucide:loader"
            class="size-6 animate-spin"
          />

          <p class="animate-pulse text-xl">
            Redirecting...
          </p>

        </div>


      </UPageCard>
      
    </UPageBody>
    
  </UPage>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { pluck } = useSupabaseCookieRedirect()

watch(user, () => {
  if (user.value) {
    return navigateTo(pluck() || '/')
  }
}, { immediate: true })
</script>

<style scoped>

</style>


