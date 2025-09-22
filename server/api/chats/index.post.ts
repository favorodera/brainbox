import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  prompt: z.string(),
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
        message: issue ? `${issue.path}: ${issue.message}` : 'Invalid body parameters',
      })
    }

    const { prompt } = validate.data

    const client = await serverSupabaseClient<Database>(event)

    const { error, data } = await client
      .from('chats')
      .insert({ messages: [{
        id: 'init',
        role: 'user',
        parts: [{ type: 'text', text: prompt }],
      }],
      })
      .select('id')
      .single()

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.code,
        message: error.message,
      })
    }

    return data.id

  } catch (error) {
    return getError(error)
  }
})
