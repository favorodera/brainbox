// Creates an empty chat for the authenticated user and returns its id
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// POST /api/chats → inserts a new chat row with empty messages
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

    return data.id

  } catch (error) {
    return getError(error)
  }
})
