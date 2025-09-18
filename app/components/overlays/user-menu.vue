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

import { LazyOverlaysSignoutConfirmation } from '#components'

defineProps<{
  collapsed?: boolean
}>()

const overlay = useOverlay()
const signOutConfirmationModal = overlay.create(LazyOverlaysSignoutConfirmation)

const { data: user } = await useUserStore('user')

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
      label: 'Billing',
      icon: 'lucide:credit-card',
    },
    {
      label: 'Settings',
      icon: 'lucide:settings',
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

