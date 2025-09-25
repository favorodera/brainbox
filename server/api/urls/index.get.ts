// Returns the authenticated user's personalization URLs array
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/urls → fetches user's stored URLs from Supabase
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
    
    return data.urls

  } catch (error) {
    return getError(error)
  }
})
