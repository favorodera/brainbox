/**
 * Store for listing chats and local UI state for initial prompt.
 */
export const useChatsStore = createStore('chats-store', ({ request, state }) => {

  const initPrompt = state('')

  const chats = request<{ id: string, title: string | null }[]>(({ signal }) => $fetch(
    '/api/chats/',
    {
      signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))

  function getChatById(id: string) {
    return chats.data.value?.find(chat => chat.id === id)
  }

  return {
    chats,
    getChatById,
    initPrompt,
  }

})
