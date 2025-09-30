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
      ...(docs.data.value || []).map(doc => ({ label: doc.name, value: doc.url })),
    ],
  ]))

  const contextItemsModelValue = state([])

  return {
    docs,
    contextItems,
    contextItemsModelValue,
  }

})
