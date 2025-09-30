import type { Provider } from '@supabase/auth-js'

/**
 * Small helper for reading/writing the last used auth method.
 */
export default function () {

  const cookie = useCookie<Provider | null>('brainbox-last-auth-method', {
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
    sameSite: 'lax',
    secure: true,
  })

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
