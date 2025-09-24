import type { UIMessage } from 'ai'

export const useChatsStore = createStore('chats-store', ({ request, state }) => {

  const prompt = state('')

  const chat = request<{ id: string, messages: UIMessage[], title: string }, string>(({ signal, param }) => $fetch(
    `/api/chats/${param}/`,
    {
      signal,
      cache: 'force-cache',
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))

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
    chat,
    chats,
    prompt,
  }

})
