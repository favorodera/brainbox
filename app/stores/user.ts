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
          filter: 'column_name=urls',
        },
        (payload) => {

          if (!user.data.value) return

          switch (payload.eventType) {
            case 'INSERT':{

              if (payload.new.id === user.data.value.id) {
                user.data.value.urls = { ...user.data.value.urls, ...payload.new }
              }

              break
            }

            case 'UPDATE':{

              if (payload.new.id === user.data.value.id) {
                user.data.value.urls = { ...user.data.value.urls, ...payload.new }
              }

              break
            }

            case 'DELETE':{
              if (payload.old.id === user.data.value.id) {
                user.refresh()
              }
              break
            }
              
          
          }

        },
      ).subscribe()
  }

  return {
    user,
    realtimeOn,
    realtimeOff,
  }

})
