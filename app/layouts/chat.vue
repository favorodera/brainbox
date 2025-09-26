<template>

  <UDashboardGroup
    unit="rem"
  >
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
          :items="items"
          popover
          :ui="{ link: 'overflow-hidden' }"
          :unmount-on-hide="false"
        >
          <template #chat-trailing>
            <UButton
              icon="lucide:trash-2"
              color="error"
              variant="ghost"
              size="xs"
              tabindex="-1"
            />
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
      :groups="[{
        id: 'links',
        items: [{
          label: 'New chat',
          to: '/',
          icon: 'lucide:square-pen',
        }],
      }, ...groups]"
    />

    <slot />

  </UDashboardGroup>

</template>


<script setup lang="ts">

const isCommandPaletteOpen = ref(false)

const user = useSupabaseUser()

const { data } = await useChatsStore('chats')

const { groups } = groupChats(data)

const { startRetryWorker, processQueue, stopRetryWorker } = indexDb()

const items = computed(() => groups.value?.flatMap((group) => {
  return [{
    label: group.label,
    type: 'label' as const,
  }, ...group.items.map(item => ({
    ...item,
    slot: 'chat' as const,
    icon: undefined,
    class: item.label === 'Untitled' ? 'text-muted' : '',
  }))]
}))

onMounted(async () => {
  await nextTick()

  useEventListener('online', () => {
    startRetryWorker()
    processQueue()
  })

  useEventListener('offline', () => {
    stopRetryWorker()
  })
})
</script>
