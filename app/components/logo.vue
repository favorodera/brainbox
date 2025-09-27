<!-- Branded logo with optional text and style overrides -->
<template>

  <div
    class="flex items-center gap-1 p-1.5"
    :class="ui.root"
  >

    <UIcon
      name="custom:logo"
      class="size-5 shrink-0 [&>path]:stroke-black dark:[&>path]:stroke-white"
      :class="ui.icon"
    />

    <p
      v-if="withText"
      class=" w-max font-mono font-medium"
      :class="ui.text"
    >
      Brainbox
    </p>

  </div>

</template>

<script setup lang="ts">
// Accepts flags and class hooks to customize logo appearance
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
