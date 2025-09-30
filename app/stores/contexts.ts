import type { InputMenuItem } from '@nuxt/ui'
import type { ChatContextType } from '~~/shared/types/ai'

/**
 * Store for managing the authenticated user's context documents.
 *
 * Provides access to the user's personalized documentation URLs.
 */
export const useContextsStore = createStore('contexts-store', ({ state, getter, request }) => {

  /**
   * Reactive list of documentation contexts for the current user.
   * Fetched from the server using the user's session.
   */
  const docs = request<{ name: string, url: string }[]>(({ signal }) => $fetch(
    '/api/docs/',
    {
      signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))


  // Context items
  const contextItems = getter(() => ([
    [
      { type: 'label', label: 'Docs', icon: 'lucide:book-open' },
      ...(docs.data.value || []).map(doc => ({
        label: doc.name,
        value: doc.url,
        contextType: 'docs' as const, // embed contextType directly
      })),
    ],
  ]))
  

  const contextItemsModelValue = state([])

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
