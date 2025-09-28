/**
 * Deletes a chat if it is owned by the authenticated requester.
 *
 * Route: DELETE /api/chats/:id
 * Auth: Required (Supabase session cookie)
 * Params: { id: string }
 * Response: 'OK'
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

/** Route params validation schema */
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

    const { error } = await client
      .from('chats')
      .delete()
      .match({ id, owner_id: user.id })

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
