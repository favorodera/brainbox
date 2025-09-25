// Fetches a single chat (id/messages/title) for the authenticated owner
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

// Route params validation schema
const schema = z.object({
  id: z.string(),
})

// GET /api/chats/:id → returns chat content if owned by requester
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

    // Supabase client scoped to this request
    const client = await serverSupabaseClient<Database>(event)

    const { error, data } = await client
      .from('chats')
      .select('id, messages, title')
      .match({ id, owner_id: user.id })
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    return data

  } catch (error) {
    return getError(error)
  }
})
