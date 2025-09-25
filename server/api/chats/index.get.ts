// Lists current user's chats with minimal metadata for sidebar
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

// GET /api/chats → returns chat id/title/createdAt for the authenticated user
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
      .select('id, title, created_at')
      .eq('owner_id', user.id)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    // Normalize DB rows to UI-friendly shape
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
