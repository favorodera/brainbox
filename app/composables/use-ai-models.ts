export default function () {
  const models = [
    // Google Models
    { label: 'Gemini 2.5 Pro', value: 'google/gemini-2.5-pro', icon: 'simple-icons:googlegemini' },
    { label: 'Gemini 2.5 Flash', value: 'google/gemini-2.5-flash', icon: 'simple-icons:googlegemini' },
  ]

  const model = useCookie<string>('ai-model', { default: () => 'google/gemini-2.5-flash' })

  return {
    models,
    model,
  }
}
