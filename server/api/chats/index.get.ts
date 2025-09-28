/**
 * Lists the current user's chats with minimal metadata for the sidebar and command pallette.
 *
 * Route: GET /api/chats
 * Auth: Required (Supabase session cookie)
 * Response: Array<{ id: string; title: string | null }>
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

/**
 * Returns chat id and title for the authenticated user.
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
      .select('id, title')
      .eq('owner_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    // Minimal payload for listing chats in the UI
    return data

  } catch (error) {
    return getError(error)
  }

})
