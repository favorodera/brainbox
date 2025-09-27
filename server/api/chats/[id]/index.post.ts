// Streams an AI response for a chat and persists messages/title
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, generateText, streamText } from 'ai'
import type { UIMessage } from 'ai'
import { z } from 'zod'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

// Route params validation schema
const paramsSchema = z.object({
  /** Chat ID */
  id: z.string(),
})

// Request body validation schema
const bodySchema = z.object({
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

  const model = google('gemini-2.5-flash')

  return defineEventHandler(async (event) => {

    try {

      const timestamp = new Date().toISOString()

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
      const { messages } = validateBody.data

      const client = await serverSupabaseClient<Database>(event)

      const { addToQueue } = indexDb()

      const { error, data: chat } = await client
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
            created_at: timestamp,
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

      const stream = createUIMessageStream({
        execute({ writer }) {

          const result = streamText({
            model,
            system: 'You are a helpful assistant that can answer questions and help.',
            messages: convertToModelMessages(messages),
          })

          writer.merge(result.toUIMessageStream())
          
        },
        async onFinish({ responseMessage }) {
          try {
            await client
              .from('messages')
              .insert({
                chat_id: id,
                id: responseMessage.id,
                role: responseMessage.role,
                created_at: timestamp,
                parts: responseMessage.parts as unknown as Json[],
              })
        
            if (!chat.title) {
              try {
                const { text } = await generateText({
                  model: google('gemini-2.5-flash'),
                  system: `
                  Create a short title (3 to 5 words, max 30 characters) based only on the user's first message.
                  
                  Rules:
                  - No punctuation, no markdown, no filler words.
                  - Use natural word order so it sounds like a real topic.
                  - Ignore emojis, numbers, or symbols.
                  - If the first message is just a greeting (hello, hi, hey, how are you, etc.), return "Greetings".
                  - If it is just a farewell (bye, goodbye, goodnight, see you later, etc.), return "Farewell".
                  - If the message is empty, meaningless, or provides no useful context, return "General Chat".
                  - Otherwise, make a concise but clear title capturing the main subject.
                  
                  Examples:
                  "Whats football all about" → "Football Basics"
                  "Tell me how rockets work" → "Rocket Science Overview"
                  "How are you" → "Greetings"
                  "Bye for now" → "Farewell"
                  "???" → "General Chat"
                  `,
                  prompt: JSON.stringify(messages[0]),
                })
                
                const normalized = text.replace(/:/g, '').split('\n')[0].trim()
        
                await client
                  .from('chats')
                  .update({ title: normalized })
                  .match({ id, owner_id: user.id })
              } catch {
                // Fail silently on title
              }
            }
          } catch {
            // Queue the AI response if persistence fails
            await addToQueue({
              ...responseMessage,
              chat_id: id,
              created_at: timestamp,
            }, 0)
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
