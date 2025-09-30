// GET /api/chats → Lists the current user's chats
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

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

    return data

  } catch (error) {
    return getError(error)
  }

})
