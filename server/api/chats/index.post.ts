// POST /api/chats → Creates a new chat and returns its id
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
