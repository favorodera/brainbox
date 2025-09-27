// GET /api/chats/:id → returns chat content if owned by requester
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  /** Chat ID */
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
    const { data, error } = await client
      .from('messages')
      .select('id, role, created_at, chat_id, parts, role')
      .match({ chat_id: id, owner_id: user.id })
      .order('created_at', { ascending: true })

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    if (!data) {
      throw createError({
        statusCode: 404,
        statusMessage: 'NOT_FOUND',
        message: 'Chat not found',
      })
    }

    const messages = data.map(message => ({
      id: message.id,
      role: message.role,
      parts: message.parts,
    }))

    return {
      id,
      messages,
    }

  } catch (error) {
    return getError(error)
  }
})
