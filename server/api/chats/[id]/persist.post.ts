// POST /api/chats/:id/persist → persists LLM response to database
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'
import type { UIMessage } from 'ai'

const paramsSchema = z.object({
  id: z.string(),
})

const bodySchema = z.object({
  message: z.custom<UIMessage>(),
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

    const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)

    if (validateParams.error) {
      const issue = validateParams.error.issues[0]
      throw createError({
        statusCode: 400,
        statusMessage: 'BAD_REQUEST',
        message: issue ? `${issue.path}: ${issue.message}` : 'Invalid query parameters',
      })
    }

    const validateBody = await readValidatedBody(event, bodySchema.safeParse)

    if (validateBody.error) {
      const issue = validateBody.error.issues[0]
      throw createError({
        statusCode: 400,
        statusMessage: 'BAD_REQUEST',
        message: issue ? `${issue.path}: ${issue.message}` : 'Invalid body parameters',
      })
    }

    const { id } = validateParams.data
    const { message } = validateBody.data

    const client = await serverSupabaseClient<Database>(event)

    const payload = {
      chat_id: id,
      role: message.role,
      id: message.id,
      created_at: new Date().toISOString(),
      parts: message.parts as unknown as Json[],
    }

    const { error } = await client
      .from('messages')
      .insert(payload)

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
        data: { payload },
      })
    }

    return 'OK'

  } catch (error) {
    return getError(error)
  }

})
