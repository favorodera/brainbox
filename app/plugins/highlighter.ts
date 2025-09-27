import { bundledLanguages, createHighlighter } from 'shiki'
import type { BundledTheme, BundledLanguage, HighlighterGeneric } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'

/** Highlighter Instance */
const highlighter = ref<HighlighterGeneric<BundledLanguage, BundledTheme>>()
/** Highlighter Promise */
const highlighterPromise = ref<Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>>()

export default defineNuxtPlugin({
  parallel: true,
  async setup() {
    // Check if highlighter instance is already created and use it if any
    if (!highlighterPromise.value) {
      const allLanguageIds = Object.keys(bundledLanguages)

      highlighterPromise.value = createHighlighter({
        langs: allLanguageIds,
        themes: ['material-theme-palenight', 'material-theme-lighter'],
        engine: createJavaScriptRegexEngine(),
      })
    }

    // If highlighter instance is not created, create it
    if (!highlighter.value) {
      highlighter.value = await highlighterPromise.value
    }

    return {
      provide: {
        highlighter: highlighter.value,
      },
    }
  },
})
