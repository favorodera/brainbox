import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'

/** Database name for the local IndexedDB storage */
const DB_NAME = 'brainbox'
/** Store used to keep retryable chat messages */
const STORE_NAME = 'retry_queue'

/** Shared storage instance for queued messages */
const storage = createStorage<QueuedMessage>({
  driver: indexedDbDriver({
    base: 'app:',
    dbName: DB_NAME,
    storeName: STORE_NAME,
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
  await storage.setItem(`${STORE_NAME}:${message.id}`, queued)
}

/**
 * Removes a message from the retry queue by id.
 */
async function remove(id: string) {
  await storage.removeItem(`${STORE_NAME}:${id}`)
}

/**
 * Returns all messages ready to be retried based on `nextAttempt`.
 */
async function getReady() {
  const allKeys = await storage.getKeys(STORE_NAME)
  const now = Date.now()
  const messages: QueuedMessage[] = []

  for (const key of allKeys) {
    const message = await storage.getItem(key)
    if (message && (!message.nextAttempt || message.nextAttempt <= now)) {
      messages.push(message)
    }
  }

  return messages

}

export default function () {
  return {
    add,
    remove,
    getReady,
  }
}
