<!-- Confirmation modal to sign out the current user -->
<template>

  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Sign Out"
    description="Are you sure you want to sign out?"
    :ui="{
      content: 'max-w-lg',
    }"
  >

    <template #body>

      <p class="line-clamp-1">
        You are signing out as <span class="font-semibold">{{ user?.email }}</span>
      </p>

    </template>

    <template #footer>

      <UButton
        label="Cancel"
        color="neutral"
        variant="soft"
        block
        @click="emit('close', true)"
      />

      <UButton
        label="Sign Out"
        color="error"
        variant="soft"
        block
        loading-auto
        @click="signOut()"
      />
    </template>

  </UModal>
  
</template>

<script setup lang="ts">
const emit = defineEmits<{ close: [boolean] }>()

const { auth } = useSupabaseClient()
const user = useSupabaseUser()

const toast = useToast()

// Signs the user out, closes modal, shows toast, then navigates
async function signOut() {
  try {
    await auth.signOut()
    
    await nextTick(() => emit('close', false))

    await nextTick(() => toast.add({
      title: 'Sign out successful',
      color: 'success',
      icon: 'lucide:check',
    }))

    await navigateTo('/auth')
   
  } catch {
    toast.add({
      title: 'Sign out failed',
      color: 'error',
      icon: 'lucide:x',
    })
  }
}
</script>

<style scoped>

</style>
