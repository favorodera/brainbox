/**
 * Store for a user's personalization URLs.
 */
export const useUrlsStore = createStore('urls-store', ({ request }) => {

  /**
   * Server-requested list of personalization URLs for the authenticated user.
   */
  const urls = request<{ name: string, url: string }[]>(({ signal }) => $fetch(
    '/api/urls/',
    {
      signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))


  return {
    urls,
  }

})
