import { bundledLanguages, createHighlighter } from 'shiki'
import type { BundledTheme, BundledLanguage, HighlighterGeneric } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'

const highlighter = ref<HighlighterGeneric<BundledLanguage, BundledTheme>>()
const highlighterPromise = ref<Promise<HighlighterGeneric<BundledLanguage, BundledTheme>>>()

export default defineNuxtPlugin({
  parallel: true,
  async setup() {
    if (!highlighterPromise.value) {
      const allLanguageIds = Object.keys(bundledLanguages)

      highlighterPromise.value = createHighlighter({
        langs: allLanguageIds,
        themes: ['material-theme-palenight', 'material-theme-lighter'],
        engine: createJavaScriptRegexEngine(),
      })
    }

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
