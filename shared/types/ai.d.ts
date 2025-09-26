import type { UIMessage } from 'ai'
  
export type AIModel = 'google/gemini-2.5-pro'
  | 'google/gemini-2.5-flash'

export type UIMessageExtension = UIMessage & {
  id: string
  chat_id: string
  created_at: string
}
  
export type QueuedMessage = UIMessageExtension & {
  retries: number
  nextAttempt: number
}
