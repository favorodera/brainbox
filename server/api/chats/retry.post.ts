// POST /api/chats/retry → Retries a 'failed-to-persist' message
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  message: z.custom<UIMessageExtension>(),
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

    const validate = await readValidatedBody(event, schema.safeParse)
    if (validate.error) {
      const issue = validate.error.issues[0]
      throw createError({
        statusCode: 400,
        statusMessage: 'BAD_REQUEST',
        message: issue
          ? `${issue.path}: ${issue.message}`
          : 'Invalid body parameters',
      })
    }

    const { message } = validate.data
    const client = await serverSupabaseClient<Database>(event)

    // Check if the chat still exists before attempting to insert the message
    const { data: chat, error: chatError } = await client
      .from('chats')
      .select('id')
      .match({ id: message.chat_id, owner_id: user.id })
      .maybeSingle()


    if (chatError) {
      throw createError({
        statusCode: 500,
        statusMessage: chatError.code,
        message: chatError.message,
      })
    }

    if (!chat) {
      // Chat doesn't exist - return success to remove from queue
      return 'OK'
    }

    const { error } = await client.from('messages').insert({
      id: message.id,
      chat_id: message.chat_id,
      owner_id: user.id,
      role: message.role,
      parts: message.parts as unknown as Json[],
      created_at: message.created_at,
    })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    return 'OK'
  } catch (error) {
    return getError(error)
  }
})
