import type { UIMessage } from 'ai'

export const useChatsStore = createStore('chats-store', ({ state, request }) => {

  const prompt = state('')

  const chat = request<{ id: string, messages: UIMessage[], title: string }, string>(({ signal, param }) => $fetch(
    `/api/chats/${param}`,
    {
      signal,
      cache: 'force-cache',
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ), { mode: 'manual' })

  return {
    chat,
    prompt,
  }

})
