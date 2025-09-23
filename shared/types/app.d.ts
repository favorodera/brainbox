declare module '#app' {
  interface NuxtError {
    data?: {
      statusCode?: number
      statusMessage?: string
      message?: string
    }
  }
}

declare global {
  interface Error {
    data?: {
      statusCode?: number
      statusMessage?: string
      message?: string
    }
  }
}

declare module '@supabase/supabase-js' {
  interface UserMetadata {
    full_name: string
    avatar_url: string
  }
}

export {}
