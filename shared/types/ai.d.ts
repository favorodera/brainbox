import type { UIMessage } from 'ai'

/**
 * Extended UIMessage persisted to database.
 * - `id`: message id (UUID)
 * - `chat_id`: owning chat id
 * - `created_at`: ISO timestamp
 */
export type UIMessageExtension = UIMessage & {
  id: string
  chat_id: string
  created_at: string
}
  
/**
 * Message stored in IndexedDB for retry with scheduling metadata.
 */
export type QueuedMessage = UIMessageExtension & {
  retries: number
  nextAttempt: number
}

/**
 * Chat context type
 */
export type ChatContextType = 'docs'

/**
 * Relevant context for LLM for better response.
 */
export type ChatContext = {
  docs?: {
    label: string
    value: string
  }[]
}
