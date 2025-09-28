/**
 * Store for listing chats and local UI state for initial prompt.
 */
export const useChatsStore = createStore('chats-store', ({ request, state }) => {

  /**
   * Local-only state used for seeding the first prompt in a chat.
   */
  const initPrompt = state('')

  /**
   * Server-requested list of chats for the authenticated user.
   */
  const chats = request<{ id: string, title: string | null }[]>(({ signal }) => $fetch(
    '/api/chats/',
    {
      signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))

  /**
   * Returns a chat by id from the fetched list.
   */
  function getChatById(id: string) {
    return chats.data.value?.find(chat => chat.id === id)
  }

  return {
    chats,
    getChatById,
    initPrompt,
  }

})
