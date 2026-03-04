import { Router } from 'express'
import { messagesByConversation, conversationKey } from '../store.js'
import type { Message } from '../types.js'

export const messagesRouter = Router()

/** GET /api/messages?partnerId=u2 – X-User-Id = current user */
messagesRouter.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] as string
  const partnerId = req.query.partnerId as string
  if (!userId || !partnerId) return res.status(400).json({ error: 'X-User-Id and partnerId required' })
  const key = conversationKey(userId, partnerId)
  const list = messagesByConversation[key] ?? []
  res.json(list)
})

/** POST /api/messages – body: { partnerId, text }. X-User-Id = senderId */
messagesRouter.post('/', (req, res) => {
  const senderId = req.headers['x-user-id'] as string
  if (!senderId) return res.status(400).json({ error: 'X-User-Id required' })
  const { partnerId, text } = req.body as { partnerId: string; text: string }
  if (!partnerId || text == null) return res.status(400).json({ error: 'partnerId and text required' })
  const key = conversationKey(senderId, partnerId)
  if (!messagesByConversation[key]) messagesByConversation[key] = []
  const msg: Message = {
    id: `m${Date.now()}`,
    senderId,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }
  messagesByConversation[key].push(msg)
  res.status(201).json(msg)
})
