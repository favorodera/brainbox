/**
 * Accepts a previously failed UI message and persists it for retry.
 *
 * Route: POST /api/chats/retry
 * Auth: Required (Supabase session cookie)
 * Body: { message: UIMessageExtension }
 * Response: { success: true }
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

/** Body validation schema */
const schema = z.object({
  /** UI message to be retried and stored */
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

    // Extract validated fields early for clarity
    const { message } = validate.data
    const client = await serverSupabaseClient<Database>(event)

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

    return { success: true }
  } catch (error) {
    return getError(error)
  }
})
