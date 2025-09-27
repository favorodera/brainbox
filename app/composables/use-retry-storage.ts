import { createStorage } from 'unstorage'
import indexedDbDriver from 'unstorage/drivers/indexedb'

const DB_NAME = 'brainbox'
const STORE_NAME = 'retry_queue'

const storage = createStorage<QueuedMessage>({
  driver: indexedDbDriver({
    base: 'app:',
    dbName: DB_NAME,
    storeName: STORE_NAME,
  }),
})

async function addToQueue(
  message: UIMessageExtension,
  retries = 0,
  nextAttempt = Date.now(),
) {
  const queued: QueuedMessage = { ...message, retries, nextAttempt }
  await storage.setItem(`${STORE_NAME}:${message.id}`, queued)
}

async function removeFromQueue(id: string) {
  await storage.removeItem(`${STORE_NAME}:${id}`)
}

async function getReadyQueued() {
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
    addToQueue,
    removeFromQueue,
  }
}
