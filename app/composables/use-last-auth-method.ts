import type { Provider } from '@supabase/auth-js'

/**
 * Persists the last used Supabase auth provider in a long-lived cookie.
 */
const cookie = useCookie<Provider | null>('brainbox-last-auth-method', {
  maxAge: 60 * 60 * 24 * 365 * 10, // 10 years
  sameSite: 'lax',
  secure: true,
})

/**
 * Small helper for reading/writing the last used auth method.
 */
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
