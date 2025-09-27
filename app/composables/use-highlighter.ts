import { bundledLanguages, createHighlighter } from 'shiki'
import type { BundledTheme, BundledLanguage, HighlighterGeneric } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine-javascript.mjs'

let highlighter: HighlighterGeneric<BundledLanguage, BundledTheme> | null = null
let highlighterPromise: Promise<HighlighterGeneric<BundledLanguage, BundledTheme>> | null = null

export default async function () {
  if (!highlighterPromise) {
    const allLanguageIds = Object.keys(bundledLanguages)

    highlighterPromise = createHighlighter({
      langs: allLanguageIds,
      themes: ['material-theme-palenight', 'material-theme-lighter'],
      engine: createJavaScriptRegexEngine(),
    })
  }

  if (!highlighter) {
    highlighter = await highlighterPromise
  }

  return highlighter
}
