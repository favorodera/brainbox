<!-- Profile dropdown with settings and sign-out actions -->
<template>
  <UDropdownMenu
    :items="dropdownMenuItems"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: collapsed ? 'w-48' : 'w-(--reka-dropdown-menu-trigger-width)' }"
  >
    <UButton
      :avatar="{
        src: user?.avatar,
        alt: user?.name,
      }"
      :label="collapsed ? undefined : user?.name"
      :trailing-icon="collapsed ? undefined : 'lucide:chevrons-up-down'"
      color="neutral"
      variant="ghost"
      block
      size="lg"
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />

  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { LazyOverlaysSignoutConfirmation, LazyOverlaysSettings } from '#components'

defineProps<{
  collapsed?: boolean
}>()

const { data: user } = await useUserStore('user')

const overlay = useOverlay()
const signOutConfirmationModal = overlay.create(LazyOverlaysSignoutConfirmation)
const settingsModal = overlay.create(LazyOverlaysSettings)

const dropdownMenuItems = ref<DropdownMenuItem[][]>([
  
  [
    {
      label: user.value?.email,
      avatar: {
        src: user.value?.avatar,
        alt: user.value?.name,
      },
    },
    {
      label: 'Settings',
      icon: 'lucide:settings',
      onSelect: () => settingsModal.open(),
    },
  ],

  [
    {
      label: 'Help',
      icon: 'lucide:help-circle',
    },
    {
      label: 'Log out',
      icon: 'lucide:log-out',
      color: 'error',
      onSelect: () => signOutConfirmationModal.open(),
    },
  ],
  
])
</script>

