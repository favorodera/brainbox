<template>
  <UPage>
    
    <UPageBody class="flex min-h-[calc(100vh-var(--ui-header-height))] items-center justify-center">
      
      <UPageCard
        class="mx-4 w-fit max-w-lg sm:mx-6"
        variant="naked"
      >
    

        <div class="flex flex-col items-center gap-2">

          
          <template v-if="error && !user">
            <UIcon
              name="lucide:alert-circle"
              class="size-6 text-error"
            />

            <p class="text-xl capitalize">
              {{ (error as string).split('_').join(' ') }}
            </p>

            <p
              v-if="error_description"
              class="text-sm text-muted capitalize"
            >
              {{ (error_description as string) }}
            </p>
          </template>

          <template v-else>
            <UIcon
              :name="user ? 'lucide:circle-check' : 'lucide:loader'"
              :class="[
                'size-6',
                { 'animate-spin': !user },
              ]"
            />

            <p
              :class="[
                'text-xl',
                { 'animate-pulse': !user },
              ]"
            >
              {{ user ? 'Authenticated' : 'Authenticating...' }}
            </p>
          </template>

        </div>


      </UPageCard>
      
    </UPageBody>
    
  </UPage>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const { pluck } = useSupabaseCookieRedirect()

const { error, error_description } = useRoute().query

watch(user, () => {
  if (user.value) {
  
    return navigateTo(pluck() || '/')

  } else {
    return navigateTo('/auth')
  }
}, { immediate: true })


</script>

<style scoped>

</style>


