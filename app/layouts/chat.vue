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
          popover
          :ui="{ link: 'overflow-hidden' }"
          :unmount-on-hide="false"
        >
          <template #chat-trailing>
            <div class="-mr-1.25 flex translate-x-full transition-transform group-hover:translate-x-0">
              <UButton
                icon="lucide:trash-2"
                color="neutral"
                variant="ghost"
                size="xs"
                class="p-0.5 text-muted hover:bg-accented/50 hover:text-primary focus-visible:bg-accented/50"
                tabindex="-1"
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
      :groups="[{
        id: 'links',
        items: [
          {
            label: 'New chat',
            icon: 'lucide:square-pen',
            to: '/',
          },
        ],
      }]"
    />

    <slot />

  </UDashboardGroup>

</template>


<script setup lang="ts">

const isCommandPaletteOpen = ref(false)

const user = useSupabaseUser()
</script>
