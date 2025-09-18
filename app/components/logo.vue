<template>

  <div
    class="flex items-center gap-2 p-1.5"
    :class="ui.root"
  >

    <UIcon
      name="custom:logo"
      class="size-5 shrink-0 text-default"
      :class="ui.icon"
    />

    <p
      v-if="withText"
      class=" w-max font-medium"
      :class="ui.text"
    >
      MyDocs AI
    </p>

  </div>

</template>

<script setup lang="ts">
withDefaults(defineProps<{
  withText?: boolean
  ui?: {
    root?: string
    text?: string
    icon?: string
  }
}>(), {
  withText: true,
  ui: () => ({}),
})
</script>
