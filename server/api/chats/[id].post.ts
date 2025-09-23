import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { convertToModelMessages, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const paramsSchema = z.object({
  id: z.string(),
})

const bodySchema = z.object({
  model: z.custom<AIModel>(),
  messages: z.array(z.custom<UIMessage>()),
})

export default defineLazyEventHandler(() => {

  const { googleGenerativeAiKey } = useRuntimeConfig()

  if (!googleGenerativeAiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'BAD_REQUEST',
      message: 'Internal server error',
    })
  }

  const google = createGoogleGenerativeAI({
    apiKey: googleGenerativeAiKey,
  })

  return defineEventHandler(async (event) => {

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

      const { messages, model } = validateBody.data

      const client = await serverSupabaseClient<Database>(event)

      const { error, data } = await client
        .from('chats')
        .select('id')
        .match({ id, owner_id: user.id })
        .single()

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
          fatal: true,
        })
      }

      const lastMessage = messages[messages.length - 1]

      if (lastMessage) {
        const { error } = await client.rpc('append_chat_message', {
          p_chat_id: id,
          p_owner_id: user.id,
          p_message: JSON.parse(JSON.stringify(lastMessage)),
        })
    

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: error.code,
            message: error.message,
          })
        }
      }

      const modelRefined = google(model.split('/')[1])

      const stream = streamText({
        model: modelRefined,
        system: 'You are a helpful assistant that can answer questions and help.',
        messages: convertToModelMessages(messages),
      })
  
      return stream.toUIMessageStreamResponse()

    } catch (error) {
      return getError(error)
    }

  })

})
