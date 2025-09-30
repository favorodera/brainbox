/**
 * Store for the authenticated user's profile payload.
 */
export const useUserStore = createStore('user-store', ({ request }) => {

  const user = request(({ signal }) => $fetch(
    '/api/user/',
    {
      signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))

  return {
    user,
  }

})
