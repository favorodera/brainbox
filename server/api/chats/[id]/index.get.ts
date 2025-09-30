// GET /api/chats/:id → Returns chat content
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

    //  Check if chat exists and belongs to user
    const { data: chat, error: chatError } = await client
      .from('chats')
      .select('id')
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
        fatal: true,
      })
    }

    //  Fetch messages only if chat exists
    const { data: messages, error: messagesError } = await client
      .from('messages')
      .select('id, role, parts')
      .match({ chat_id: chat.id, owner_id: user.id })
      .order('created_at', { ascending: true })

    if (messagesError) {
      throw createError({
        statusCode: 500,
        statusMessage: messagesError.code,
        message: messagesError.message,
      })
    }

    return {
      id: chat.id,
      messages,
    }

  } catch (error) {
    return getError(error)
  }
})
