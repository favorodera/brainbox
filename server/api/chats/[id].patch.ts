import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { UIMessage } from 'ai'
import { z } from 'zod'

const bodySchema = z.object({
  message: z.custom<UIMessage>(),
})

const paramsSchema = z.object({
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

    const { error } = await client.rpc('append_chat_message', {
      p_chat_id: id,
      p_owner_id: user.id,
      p_message: JSON.parse(JSON.stringify(message)),
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
