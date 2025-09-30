// POST /api/docs → Adds new docs.
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

const schema = z.object({
  docs: z.array(
    z.object({
      name: z.string('Invalid input').nonempty('Name is required'),
      url: z.url('Invalid URL').nonempty('URL is required'),
    }),
  ),
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

    const { docs } = validate.data

    const client = await serverSupabaseClient<Database>(event)

    // Use Postgres function to add docs atomically
    const { error } = await client.rpc('manage_user_docs', {
      p_user_id: user.id,
      p_action: 'add',
      p_docs: docs,
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
