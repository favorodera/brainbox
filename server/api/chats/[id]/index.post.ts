// POST /api/chats/:id → validates, streams model output, saves messages
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

const paramsSchema = z.object({
  id: z.string(),
})

const bodySchema = z.object({
  messages: z.array(z.custom<UIMessage>()),
  context: z.custom<ChatContext>().optional(),
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

  // Instantiate Google AI provider
  const google = createGoogleGenerativeAI({
    apiKey: googleGenerativeAiKey,
  })

  const model = google('gemini-2.5-flash')
  const { title: titleSystemPrompt, chat: chatSystemPrompt } = systemPrompt()

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
      const { messages, context } = validateBody.data

      const client = await serverSupabaseClient<Database>(event)

      const { error, data: chat } = await client
        .from('chats')
        .select('id, title')
        .match({ id, owner_id: user.id })
        .maybeSingle()

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: error.code,
          message: error.message,
        })
      }

      if (!chat) {
        throw createError({
          statusCode: 404,
          statusMessage: 'NOT_FOUND',
          message: 'Chat not found',
          fatal: true,
        })
      }

      const lastMessage = messages[messages.length - 1]

      if (lastMessage && lastMessage.role === 'user') {
    
        const { error } = await client
          .from('messages')
          .insert({
            chat_id: id,
            id: lastMessage.id,
            role: lastMessage.role,
            created_at: new Date().toISOString(),
            parts: lastMessage.parts as unknown as Json[],
          })

        if (error) {
          throw createError({
            statusCode: 500,
            statusMessage: error.code,
            message: error.message,
          })
        }
      }

      // If not set, generate a concise title using user's first message
      if (!chat.title) {
        try {
          const { text } = await generateText({
            model: model,
            system: titleSystemPrompt,
            prompt: JSON.stringify(messages[0]),
          })
          
          const normalized = text.replace(/:/g, '').split('\n')[0]?.trim()
  
          await client
            .from('chats')
            .update({ title: normalized })
            .match({ id, owner_id: user.id })
        } catch {
          // Fail silently on title
        }
      }

      const stream = createUIMessageStream({
        execute({ writer }) {

          const result = streamText({
            model,
            system: chatSystemPrompt(context),
            messages: convertToModelMessages(messages),
          })

          writer.merge(result.toUIMessageStream())
          
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
