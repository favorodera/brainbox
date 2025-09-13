<template>

  <UDashboardGroup
    unit="rem"
  >
    <UDashboardSidebar
      collapsible
      toggle-side="right"
      :ui="{
        root: 'transition-all duration-300 ease-in-out bg-elevated/25',
      }"
    >

      <template #header="{ collapsed }">

    <UDashboardSidebarCollapse></UDashboardSidebarCollapse>

      </template>

      <template #default="{ collapsed }">

        <UNavigationMenu
          :collapsed="collapsed"
          orientation="vertical"
          tooltip
          popover
          :unmount-on-hide="false"
        />
        

      </template>


    </UDashboardSidebar>

    <slot />

  </UDashboardGroup>

</template>


<script setup lang="ts">
</script>
