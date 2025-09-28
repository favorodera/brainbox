import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'

/** Database name for the local IndexedDB storage */
const dbName = 'brainbox'
/** Store used to keep retryable chat messages */
const storeName = 'retry_queue'

/** Base key for IndexedDB storage */
const base = 'app'

/** Interval for processing the retry queue */
let retryInterval: NodeJS.Timeout | null = null

/**
 * Generates a storage key for a given message ID within the retry queue store.
 * @param {string} key - The unique identifier for the message.
 * @returns {string} The formatted storage key for the message.
 */
function keyHelper(key: string): string {
  return `${storeName}:${key}`
}

/** Shared storage instance for queued messages */
const storage = createStorage<QueuedMessage>({
  driver: indexedDbDriver({
    base,
    dbName,
    storeName,
  }),
})

/**
 * Adds a message to the retry queue with metadata for scheduling.
 */
async function add(
  message: UIMessageExtension,
  retries = 0,
  nextAttempt = Date.now(),
) {
  const queued: QueuedMessage = { ...message, retries, nextAttempt }
  await storage.setItem(keyHelper(message.id), queued)
  
  // Start worker if not already running
  if (!retryInterval) {
    start()
  }
}

/**
 * Removes a message from the retry queue by id.
 */
async function remove(id: string) {
  await storage.removeItem(keyHelper(id))
}

/**
 * Returns all messages ready to be retried based on `nextAttempt`.
 */
async function getReady() {
  const allKeys = await storage.getKeys(`${base}:${storeName}`)
  const now = Date.now()
  const messages: QueuedMessage[] = []

  // No items at all
  if (allKeys.length === 0) {
    // Stop worker right here
    stop()
    return []
  }

  for (const key of allKeys) {
    const keyWithoutPrefix = key.replace(/^app:/, '')
    const message = await storage.getItem(keyWithoutPrefix)

    if (message && (!message.nextAttempt || message.nextAttempt <= now)) {
      messages.push(message)
    }
  }
  return messages
}

/**
 * Updates the metadata for a message in the retry queue.
 */
async function update(id: string, retries: number, nextAttempt: number) {

  const message = await storage.getItem(keyHelper(id))

  if (message) {
    message.retries = retries
    message.nextAttempt = nextAttempt
    await storage.setItem(keyHelper(id), message)
  }

}

/**
 * Processes the retry queue by attempting to resend each queued message.
 *
 * For each message ready to retry:
 * - Attempts to POST the message to the retry API endpoint.
 * - On success, removes the message from the queue.
 * - On failure, increments the retry count and schedules the next attempt using exponential backoff (max 1 hour).
 */
async function process() {
  const queue = await getReady()

  // Do nothing if there are no messages to process
  if (queue.length === 0) return

  for (const message of queue) {
    try {
      const { nextAttempt, retries, ...payload } = message

      await $fetch('/api/chats/retry', {
        method: 'POST',
        body: { message: payload },
      })
      await remove(message.id)
    } catch {
      // Exponential backoff: delay = 2^retries * 1000ms, capped at 1 hour
      const delay = Math.min(Math.pow(2, message.retries) * 1000, 3600_000)
      const nextAttempt = Date.now() + delay
      await update(message.id, message.retries + 1, nextAttempt)
    }
  }
}

/**
 * Starts the retry worker interval to process the message queue every 5 seconds.
 * Does nothing if the worker is already running.
 */
function start() {
  if (retryInterval) return
  retryInterval = setInterval(process, 5000)
}

/**
 * Stops the retry worker interval if it is running.
 */
function stop() {
  if (retryInterval) {
    clearInterval(retryInterval)
    retryInterval = null
  }
}

/**
 * Composable for managing a persistent retry queue of chat messages using IndexedDB.
 *
 * - Adds, removes, and retrieves messages for retrying failed API calls.
 * - Each message is stored with retry metadata (`retries`, `nextAttempt`).
 * - Uses Unstorage with the IndexedDB driver for browser persistence.
 */
export default function () {
  return {
    add,
    start,
    stop,
  }
}
