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
