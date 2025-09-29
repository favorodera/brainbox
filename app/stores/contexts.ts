/**
 * Store for managing the authenticated user's context documents.
 *
 * Provides access to the user's personalized documentation URLs.
 */
export const useContextsStore = createStore('contexts-store', ({ request }) => {

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

  return {
    docs,
  }

})
