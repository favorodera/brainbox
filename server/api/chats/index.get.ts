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
      .select('id, title, created_at')
      .eq('owner_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    return data.map(chat => ({
      id: chat.id,
      label: chat.title || 'Untitled',
      to: `/chats/${chat.id}`,
      icon: 'lucide:message-circle',
      createdAt: chat.created_at,
    }))

  } catch (error) {
    return getError(error)
  }

})
