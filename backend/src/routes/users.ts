import { Router } from 'express'
import { users } from '../store.js'

export const usersRouter = Router()

/** GET /api/users?ids=u1,u2 */
usersRouter.get('/', (req, res) => {
  const ids = (req.query.ids as string)?.split(',').filter(Boolean) ?? []
  const out: Record<string, (typeof users)[string]> = {}
  for (const id of ids) {
    if (users[id]) out[id] = users[id]
  }
  res.json(out)
})

/** GET /api/users/:id */
usersRouter.get('/:id', (req, res) => {
  const user = users[req.params.id]
  if (!user) return res.status(404).json({ error: 'User not found' })
  res.json(user)
})

/** PATCH /api/users/:id */
usersRouter.patch('/:id', (req, res) => {
  const user = users[req.params.id]
  if (!user) return res.status(404).json({ error: 'User not found' })
  const patch = req.body as Partial<typeof user>
  const updated = { ...user, ...patch }
  users[req.params.id] = updated
  res.json(updated)
})
