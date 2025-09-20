<template>

  <UModal
    :close="{ onClick: () => emit('close', false) }"
    title="Settings"
    description="Manage your profile, security, and data settings."
    :ui="{
      content: 'max-w-2xl',
      body: 'p-0 sm:p-0 flex flex-col gap-1 sm:flex-row justify-between min-h-96',
      header: 'p-3 sm:p-3',
    }"
    :dismissible="false"
  >

    <template #body>

      <div class="flex flex-wrap gap-2 p-3 sm:flex-col">

        <UButton
          v-for="(item, index) in tabsItems"
          :key="index"
          color="neutral"
          variant="ghost"
          :label="item.label"
          :icon="item.icon"
          :active="item.component === activeTab"
          active-variant="soft"
          class="min-w-max"
          @click="activeTab = item.component"
        />

      </div>

      <USeparator
        orientation="vertical"
        class="max-sm:hidden"
        :ui="{ border: 'min-h-96' }"
      />

      <USeparator class="min-sm:hidden" />

      <div class="flex-1 p-3">

        <Transition
          name="fade-out-in"
          mode="out-in"
        >
          <KeepAlive>
            <component :is="activeTab" />
          </KeepAlive>
        </Transition>
       

      </div>
     

    </template>


  </UModal>

</template>

<script setup lang="ts">
import { LazySettingsGeneral, LazySettingsPersonalization, LazySettingsDataControls, LazySettingsSecurity, LazySettingsAccount } from '#components'

const emit = defineEmits<{ close: [boolean] }>()


const tabsItems = [

  { label: 'General', icon: 'lucide:settings', component: LazySettingsGeneral },
  { label: 'Personalization', icon: 'lucide:clock', component: LazySettingsPersonalization },
  { label: 'Data controls', icon: 'lucide:database', component: LazySettingsDataControls },
  { label: 'Security', icon: 'lucide:key-round', component: LazySettingsSecurity },
  { label: 'Account', icon: 'lucide:user', component: LazySettingsAccount },

]

const activeTab = shallowRef(tabsItems[0]?.component)

</script>

<style scoped>

</style>
