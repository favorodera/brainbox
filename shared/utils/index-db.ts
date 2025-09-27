import { openDB } from 'idb'
import type { UIMessageExtension, QueuedMessage } from '../types/ai'

const DB_NAME = 'brainbox'
const STORE_NAME = 'retry_queue'

let retryInterval: NodeJS.Timeout | null = null

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    },
  })
}

export async function addToQueue(
  message: UIMessageExtension,
  retries = 0,
  nextAttempt = Date.now(),
) {
  const db = await getDB()
  const queued: QueuedMessage = { ...message, retries, nextAttempt }
  await db.put(STORE_NAME, queued)
}

export async function removeFromQueue(id: string) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

async function getReadyQueued() {
  const db = await getDB()
  const all = (await db.getAll(STORE_NAME)) as QueuedMessage[]
  const now = Date.now()
  return all.filter(message => !message.nextAttempt || message.nextAttempt <= now)
}

async function updateRetries(id: string, retries: number, nextAttempt: number) {
  const db = await getDB()
  const msg = (await db.get(STORE_NAME, id)) as QueuedMessage | undefined
  if (msg) {
    msg.retries = retries
    msg.nextAttempt = nextAttempt
    await db.put(STORE_NAME, msg)
  }
}

async function processQueue() {

  const queue = await getReadyQueued()
  for (const item of queue) {
    try {
      await $fetch('/chats/retry', {
        method: 'POST',
        body: { message: item },
      })

      await removeFromQueue(item.id)
    } catch {
      const delay = Math.min(Math.pow(2, item.retries) * 1000, 3600_000)
      const nextAttempt = Date.now() + delay
      await updateRetries(item.id, item.retries + 1, nextAttempt)
    }
  }
}

function startRetryWorker() {
  if (retryInterval) return
  if (import.meta.client)retryInterval = setInterval(processQueue, 5000)
}

function stopRetryWorker() {
  if (retryInterval) {
    if (import.meta.client)clearInterval(retryInterval)
    retryInterval = null
  }
}

export default function () {

  return {
    addToQueue,
    startRetryWorker,
    processQueue,
    stopRetryWorker,
  }
}
