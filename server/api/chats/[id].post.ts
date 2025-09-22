import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import type { AIModel } from '~~/shared/types/ai'


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
        .select('title')
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
        })
      }

      const modelRefined = google(model.split('/')[1])


      if (!data.title) {
        const { text } = await generateText({
          model: google('gemini-2.5-pro'),
          system: `You are a title generator for a chat:
              - Generate a short title based on the first user's message
              - The title should be less than 30 characters long
              - The title should be a summary of the user's message
              - Do not use quotes (' or ") or colons (:) or any other punctuation
              - Do not use markdown, just plain text`,
          prompt: JSON.stringify(messages[0]),
        })

        setHeader(event, 'X-Chat-Title', text.replace(/:/g, '').split('\n')[0])

        client
          .from('chats')
          .update({
            title: text,
          })
          .match({ id, owner_id: user.id })
      }

      const lastMessage = messages[messages.length - 1]
      if (lastMessage?.role === 'user' && messages.length > 1) {
        await client
          .from('chats')
          .update({ messages: JSON.parse(JSON.stringify([{
            role: 'user',
            parts: lastMessage.parts,
          }])),
          })
          .match({ id, owner_id: user.id })
      }

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
          await client
            .from('chats')
            .update({ messages: JSON.parse(JSON.stringify(messages)) })
            .match({ id, owner_id: user.id })
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
