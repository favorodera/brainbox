<template>

  <UDashboardGroup unit="rem">

    <UDashboardSidebar
      v-if="user"
      collapsible
      toggle-side="right"
      :ui="{
        root: 'transition-all duration-300 ease-in-out bg-elevated/25',
        content: 'max-w-xs',
        header: 'justify-between',
      }"
    >

      <template #header="{ collapsed }">
        <Logo
          with-text
          :ui="{ text: collapsed ? 'hidden' : '' }"
        />

        <UDashboardSidebarCollapse v-if="!collapsed" />

      </template>

      <template #default="{ collapsed }">

        <div class="flex flex-col gap-4">

          <UButton
            icon="lucide:edit"
            :label="collapsed ? undefined : 'New Chat'"
            class="w-full"
            to="/"
          />

          <UButton
            icon="lucide:search"
            :label="collapsed ? undefined : 'Search Chats'"
            variant="ghost"
            class="w-full"
            @click="isCommandPaletteOpen = true"
          />

          <UDashboardSidebarCollapse v-if="collapsed" />

        </div>

        <UNavigationMenu
          :collapsed="collapsed"
          orientation="vertical"
          tooltip
          :items="navigationMenuItems"
          popover
          :ui="{ link: 'overflow-hidden' }"
          :unmount-on-hide="false"
        >
          <template #chat-trailing="{ item }">
            <div class="-mr-1.5 flex transition-transform group-hover:translate-x-0 lg:translate-x-full">
              <UButton
                icon="lucide:trash-2"
                color="error"
                variant="ghost"
                size="xs"
                tabindex="-1"
                square
                @click.stop.prevent="deleteChatConfirmationModal.open({
                  chatTitle: (item as any).label,
                  chatId: (item as any).id,
                })"
              />
            </div>

          </template>
        </UNavigationMenu>

      </template>

      <template #footer="{ collapsed }">
        <OverlaysUserMenu :collapsed="collapsed" />
      </template>

    </UDashboardSidebar>

    <UDashboardSearch
      v-model:open="isCommandPaletteOpen"
      :color-mode="false"
      placeholder="Search chats..."
      :groups="[
        {
          id: 'links',
          items: [
            {
              label: 'New chat',
              to: '/',
              icon: 'lucide:square-pen',
            },
          ],
        },
        ...commandPaletteGroups,
      ]"
    />

    <slot />

  </UDashboardGroup>

</template>

<script setup lang="ts">
import { LazyOverlaysDeleteChatConfirmation } from '#components'
import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'

const overlay = useOverlay()

const deleteChatConfirmationModal = overlay.create(LazyOverlaysDeleteChatConfirmation)

const isCommandPaletteOpen = ref(false)

const user = useSupabaseUser()

const { data: chats } = await useChatsStore('chats')

const chatsList = computed(() => chats.value || [])

const commandPaletteGroups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
  if (!chatsList.value.length) return []

  return [
    {
      id: 'chats',
      items: [
        {
          id: 'label-chats',
          label: 'Chats',
          type: 'label' as const,
        },
        ...chatsList.value.map(chat => ({
          ...chat,
          slot: 'chat' as const,
          class: chat.label === 'Untitled' ? 'text-muted' : '',
        })),
      ],
    },
  ]
})

const navigationMenuItems = computed<NavigationMenuItem[]>(() => {
  if (!chatsList.value.length) return []

  return [
    {
      id: 'label-chats',
      label: 'Chats',
      type: 'label' as const,
    },
    ...chatsList.value.map(chat => ({
      ...chat,
      slot: 'chat' as const,
      icon: undefined,
      class: chat.label === 'Untitled' ? 'text-muted' : '',
    })),
  ]
})


</script>
