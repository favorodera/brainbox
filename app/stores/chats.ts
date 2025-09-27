export const useChatsStore = createStore('chats-store', ({ request, state }) => {

  const initPrompt = state('')

  const chats = request<{
    id: string
    label: string
    to: string
    icon: string
    createdAt: string
  }[]>(({ signal }) => $fetch(
    '/api/chats/',
    {
      signal,
      cache: 'force-cache',
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))

  return {
    chats,
    initPrompt,
  }

})
