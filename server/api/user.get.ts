// Returns the authenticated user's public profile fields
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/user → fetches id, name, avatar, email for current user
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
      .select('id,name, avatar, email')
      .eq('id', user.id)
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    return data

  } catch (error) {
    return getError(error)
  }
})
