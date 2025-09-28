/**
 * Persists an AI response message to the database for a given chat.
 *
 * Route: POST /api/chats/:id/persist
 * Auth: Required (Supabase session cookie)
 * Body: { message: UIMessage }
 * Response: 'OK'
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'
import type { UIMessage } from 'ai'

/** Route params validation schema */
const paramsSchema = z.object({
  /** Chat ID */
  id: z.string(),
})

/** Body validation schema */
const bodySchema = z.object({
  /** Assistant UI message to persist */
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

    // Store minimal fields used by the UI
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
