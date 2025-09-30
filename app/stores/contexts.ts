import type { InputMenuItem } from '@nuxt/ui'
import type { ChatContextType } from '~~/shared/types/ai'

/**
 * Store for managing user's chat contexts
 */
export const useContextsStore = createStore('contexts-store', ({ state, getter, request }) => {

  /**
   * Reactive docs list fetched from server for current user.
   */
  const docs = request<{ name: string, url: string }[]>(({ signal }) => $fetch(
    '/api/docs/',
    {
      signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))


  const contextItems = getter(() => ([
    [
      { type: 'label', label: 'Docs', icon: 'lucide:book-open' },
      ...(docs.data.value || []).map(doc => ({
        label: doc.name,
        value: doc.url,
        contextType: 'docs' as const,
      })),
    ],
  ]))
  
  const contextItemsModelValue = state([])

  // Computed: returns refined docs context items for prompt
  const refinedContextItems = getter(() => {
    const items: InputMenuItem & { contextType: ChatContextType }[] = contextItemsModelValue.value

    return {
      docs: items
        .filter(item => item.contextType === 'docs')
        .map(({ contextType, ...rest }) => rest),
    }
  })
  

  return {
    docs,
    contextItems,
    contextItemsModelValue,
    refinedContextItems,
  }

})
