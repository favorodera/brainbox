<!-- Syntax-highlighted code block renderer backed by cached Shiki highlighter -->
<template>
  <ProsePre v-bind="props">
    <ShikiCachedRenderer
      :key="key"
      :highlighter="highlighter"
      :code="trimmedCode"
      :lang="lang"
      :theme="colorMode.value === 'dark' ? 'material-theme-palenight' : 'material-theme-lighter'"
    />
  </ProsePre>
</template>

<script setup lang="ts">
import { ShikiCachedRenderer } from 'shiki-stream/vue'

const colorMode = useColorMode()
const { $highlighter: highlighter } = useNuxtApp()

// Props passed by content renderer for code blocks
const props = defineProps<{
  code: string
  language: string
  class?: string
  meta?: string
}>()

// Trim trailing backticks left by streaming
const trimmedCode = computed(() => {
  return props.code.trim().replace(/`+$/, '')
})

// Normalize language names to Shiki grammar ids
const lang = computed(() => {
  switch (props.language) {
    case 'vue':
      return 'vue'
    case 'javascript':
      return 'js'
    case 'typescript':
      return 'ts'
    case 'css':
      return 'css'
    default:
      return props.language
  }
})

// Rerender when theme or language changes to refresh highlighting
const key = computed(() => {
  return `${lang.value}-${colorMode.value}`
})
</script>
