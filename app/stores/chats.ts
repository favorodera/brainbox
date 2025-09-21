import type { UIMessage } from 'ai'

export const useChatsStore = createStore('chats-store', ({ request }) => {

  const chat = request<{ id: string, messages: UIMessage[], title: string }, { id: string }>(({ signal, param: { id } }) => $fetch(
    `/api/chats/${id}`,
    {
      signal,
      cache: 'force-cache',
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ), { mode: 'manual' })

  return {
    chat,
  }

})
