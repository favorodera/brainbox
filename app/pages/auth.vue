<template>

  <UPage>

    <UHeader
      to="/"
      :toggle="false"
    >

      <template #title>
        <Logo />
      </template>

    </UHeader>
    
    <UMain
      id="main"
      class="flex items-center justify-center"
    >
      <UPageCard class="mx-4 w-full max-w-lg sm:mx-6">

        <UAuthForm
          title="Login or Sign Up"
          description="Access all the features of MyDocs AI"
          :providers="[
            {
              label: 'GitHub',
              icon: 'lucide:github',
              variant: 'soft',
              onClick(){
                auth.signInWithOAuth({ provider: 'github' })
              },
            },
          ]"
        >
      
          <template #footer>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </template>
        </UAuthForm>

      </UPageCard>
    </UMain>

    <UFooter>
      
      <template #left>
        <p class="text-sm text-muted">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <UNavigationMenu
        :items="[
          { label: 'Privacy Policy', to: '', target: '_blank' },
          { label: 'Terms of Service', to: '', target: '_blank' },
        ]"
        variant="link"
      />

    </UFooter>

  </UPage>

</template>

<script setup lang="ts">
const { auth } = useSupabaseClient()
const user = useSupabaseUser()

watch(user, () => {
  if (user.value) {
    return navigateTo('/confirm')
  }
}, { immediate: true })
</script>
