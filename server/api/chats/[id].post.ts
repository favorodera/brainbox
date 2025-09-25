// Streams an AI response for a chat and persists messages/title
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Route params validation schema
const paramsSchema = z.object({
  id: z.string(),
})

// Request body validation schema
const bodySchema = z.object({
  model: z.custom<AIModel>(),
  messages: z.array(z.custom<UIMessage>()),
})

// POST /api/chats/:id → validates, streams model output, saves messages
export default defineLazyEventHandler(() => {

  const { googleGenerativeAiKey } = useRuntimeConfig()

  if (!googleGenerativeAiKey) {
    throw createError({
      statusCode: 400,
      statusMessage: 'BAD_REQUEST',
      message: 'Internal server error',
    })
  }

  // Instantiate Google AI provider
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

      // Validate path params
      const validateParams = await getValidatedRouterParams(event, paramsSchema.safeParse)

      if (validateParams.error) {
        const issue = validateParams.error.issues[0]
        throw createError({
          statusCode: 400,
          statusMessage: 'BAD_REQUEST',
          message: issue ? `${issue.path}: ${issue.message}` : 'Invalid query parameters',
        })
      }

      // Validate request body
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

      // Supabase client scoped to this request
      const client = await serverSupabaseClient<Database>(event)

      const { error, data } = await client
        .from('chats')
        .select('id, title')
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

      if (lastMessage && lastMessage.role === 'user') {
        const { error } = await client.rpc('append_chat_message', {
          p_chat_id: id,
          p_owner_id: user.id,
          p_message: lastMessage as unknown as Json,
        })
    

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: error.code,
            message: error.message,
          })
        }
      }

      // Map UI model value (e.g. google/gemini-2.5-flash) to provider model id
      const modelRefined = google(model.split('/')[1])

      // Stream model tokens to the UI and persist messages on finish
      const stream = createUIMessageStream({
        execute: ({ writer }) => {
          const result = streamText({
            model: modelRefined,
            system: 'You are a helpful assistant that can answer questions and help.',
            messages: convertToModelMessages(messages),
          })
    
          writer.merge(result.toUIMessageStream())
        },
        onFinish: async ({ messages }) => {
          const lastMessage = messages[messages.length - 1]

          await client.rpc('append_chat_message', {
            p_chat_id: id,
            p_owner_id: user.id,
            p_message: lastMessage as unknown as Json,
          })

          if (!data.title) {
            void (async () => {
              try {
                const { text } = await generateText({
                  model: google('gemini-2.5-flash'),
                  system: `You are a title generator for a chat:
                  - Generate a short title based on the first user's message
                  - The title should be less than 30 characters long
                  - The title should be a summary of the user's message
                  - Do not use quotes (' or ") or colons (:) or any other punctuation
                  - Do not use markdown, just plain text`,
                  prompt: JSON.stringify(messages[0]),
                })
        
                await client
                  .from('chats')
                  .update({ title: text.replace(/:/g, '').split('\n')[0].trim() })
                  .match({ id, owner_id: user.id })
              } catch {
                // Ignore errors
              }
            })()
          }
        },
      })
  
      return createUIMessageStreamResponse({
        stream,
      })

    } catch (error) {
      return getError(error)
    }

  })

})
