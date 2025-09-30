<template>

  <UPage>
    
    <UMain
      id="main"
      class="flex items-center justify-center"
    >
      <UPageCard class="mx-4 w-full max-w-lg sm:mx-6">

        <UAuthForm
          title="Login or Sign Up"
        >

          <template #providers>

            <UChip
              :show="get() === 'google'"
              color="success"
              size="sm"
              inset
              class="w-full"
            >
              <UButton
                label="Continue with Google"
                icon="simple-icons:google"
                variant="soft"
                size="lg"
                block
                @click="authenticate('google')"
              />
            </UChip>


            <UChip
              :show="get() === 'github'"
              color="success"
              size="sm"
              inset
              class="w-full"
            >
              <UButton
                label="Continue with GitHub"
                block
                icon="simple-icons:github"
                variant="soft"
                size="lg"
                @click="authenticate('github')"
              />
            </UChip>
            
          </template>

          <template #leading>
            <Logo
              :with-text="false"
              class="mx-auto w-fit"
              :ui="{
                icon: '!size-10',
              }"
            />
          </template>
      
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
          { label: 'Terms of Service', to: '', target: '_blank' },
          { label: 'Privacy Policy', to: '', target: '_blank' },
        ]"
        variant="link"
      />

    </UFooter>

  </UPage>

</template>

<script setup lang="ts">
import type { Provider } from '@supabase/auth-js'

const user = useSupabaseUser()
const { auth } = useSupabaseClient()

const { set, get } = useLastAuthMethod()
const toast = useToast()

const redirectTo = import.meta.dev ? 'http://localhost:3000/callback' : 'https://brainboxaichat.vercel.app/callback'

async function authenticate(provider: Provider) {
  try {
    const { data, error } = await auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
      },
    })

    if (error) {
      return toast.add({
        title: error.message,
        color: 'error',
        icon: 'lucide:x',
      })
    }

    set(data.provider)

  } catch {
    return toast.add({
      title: 'An unexpected error occurred',
      color: 'error',
      icon: 'lucide:x',
    })
  }
}

whenever(() => user.value, async () => {
  await navigateTo('/callback')
})
</script>
