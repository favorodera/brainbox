/**
 * Deletes URLs from the authenticated user's personalization list.
 *
 * Route: DELETE /api/urls
 * Auth: Required (Supabase session cookie)
 * Body: { urls: Array<{ name: string; url: string }> }
 * Response: 'OK'
 */
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { z } from 'zod'

/** Body validation schema for URL entries */
const schema = z.object({
  urls: z.array(
    z.object({
      name: z.string('Invalid input').nonempty('Name is required'),
      url: z.url('Invalid URL').nonempty('URL is required'),
    }),
  ),
})

/**
 * Removes provided URLs via Postgres RPC for atomic updates.
 */
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

    // Validate request body
    const validate = await readValidatedBody(event, schema.safeParse)

    if (validate.error) {
      const issue = validate.error.issues[0]
      throw createError({
        statusCode: 400,
        statusMessage: 'BAD_REQUEST',
        message: issue ? `${issue.path}: ${issue.message}` : 'Invalid body parameters',
      })
    }

    const { urls } = validate.data

    const client = await serverSupabaseClient<Database>(event)

    // Use Postgres function to delete URLs atomically
    const { error } = await client.rpc('manage_user_urls', {
      p_user_id: user.id,
      p_action: 'delete',
      p_urls: urls,
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
