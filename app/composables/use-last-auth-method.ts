import type { Provider } from '@supabase/auth-js'

const cookie = useCookie<Provider | null>('brainbox-last-auth-method', {
  maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
  sameSite: 'lax',
  secure: true,
})

export default function () {

  function set(method: Provider) {
    cookie.value = method
  }

  function get() {
    return cookie.value
  }

  return {
    set,
    get,
  }

}
