import type { UIMessage } from 'ai'

/** Extended UIMessage for queuing in indexedDB */
export type UIMessageExtension = UIMessage & {
  id: string
  chat_id: string
  created_at: string
}
  
/** QueuedMessage in indexedDB */
export type QueuedMessage = UIMessageExtension & {
  retries: number
  nextAttempt: number
}
