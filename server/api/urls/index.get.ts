/**
 * Returns the authenticated user's personalization URLs array.
 *
 * Route: GET /api/urls
 * Auth: Required (Supabase session cookie)
 * Response: Array<{ name: string; url: string }>
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * Fetches the user's stored URLs from Supabase.
 */
export default defineEventHandler(async (event) => {

  try {
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'UNAUTHORIZED',
        message: 'Unauthorized',
      })
    }

    // Supabase client scoped to this request
    const client = await serverSupabaseClient<Database>(event)

    const { error, data } = await client
      .from('users')
      .select('urls')
      .eq('id', user.id)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }
    
    // Return the stored URLs array
    return data.urls

  } catch (error) {
    return getError(error)
  }
})
