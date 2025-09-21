export const useChatsStore = createStore('chats-store', ({ request }) => {

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chats = request<any>(({ signal }) => $fetch(
    '/api/chats/',
    {
      signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ), { mode: 'manual' })


  return {
    chats,
  }

})
