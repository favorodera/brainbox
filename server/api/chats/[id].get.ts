// GET /api/chats/:id → returns chat content if owned by requester
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  id: z.string(),
})

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

    // Validate and parse route params
    const validate = await getValidatedRouterParams(event, schema.safeParse)
    if (validate.error) {
      const issue = validate.error.issues[0]
      throw createError({
        statusCode: 400,
        statusMessage: 'BAD_REQUEST',
        message: issue ? `${issue.path}: ${issue.message}` : 'Invalid query parameters',
      })
    }

    const { id } = validate.data
    const client = await serverSupabaseClient<Database>(event)

    // Fetch chat
    const { data: chat, error: chatError } = await client
      .from('chats')
      .select('id, title, created_at')
      .match({ id, owner_id: user.id })
      .maybeSingle()

    if (chatError) {
      throw createError({
        statusCode: 500,
        statusMessage: chatError.code,
        message: chatError.message,
      })
    }

    if (!chat) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NOT_FOUND',
        message: 'Chat not found',
      })
    }

    // Fetch messages for this chat
    const { data: messages, error: msgError } = await client
      .from('messages')
      .select('id, role, parts')
      .match({ chat_id: id, owner_id: user.id })
      .order('created_at', { ascending: true })

    if (msgError) {
      throw createError({
        statusCode: 500,
        statusMessage: msgError.code,
        message: msgError.message,
      })
    }

    return {
      ...chat,
      messages: messages ?? [],
    }
  } catch (error) {
    return getError(error)
  }
})
