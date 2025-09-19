import type { RealtimeChannel } from '@supabase/supabase-js'

export const useUserStore = createStore('user-store', ({ state, request }) => {

  const client = useSupabaseClient<Database>()

  const realtimeChannel = state<RealtimeChannel | null>()
  
  const user = request(({ signal }) => $fetch(
    '/api/user/',
    { signal,
      method: 'GET',
      headers: useRequestHeaders(['cookie']),
    },
  ))

  function realtimeOff() {
    if (realtimeChannel.value) {
      client.removeChannel(realtimeChannel.value)
    }
  }

  function realtimeOn() {

    if (realtimeChannel.value) {
      return
    }
    
    realtimeChannel.value = client
      .channel('public:users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users',
        },
        () => user.refresh(),
      )
  }

  return {
    user,
    realtimeOn,
    realtimeOff,
  }

})
