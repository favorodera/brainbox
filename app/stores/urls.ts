export const useUrlsStore = createStore('urls-store', ({ request }) => {

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
