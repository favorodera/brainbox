/**
 * Creates an empty chat for the authenticated user and returns the new chat id.
 *
 * Route: POST /api/chats
 * Auth: Required (Supabase session cookie)
 * Response: string (chat id)
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * Inserts a new chat row (title initially null) and returns its id.
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
      .from('chats')
      .insert({ title: null })
      .select('id')
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    // Return only the identifier for navigation
    return data.id

  } catch (error) {
    return getError(error)
  }
})
