import { Router } from 'express'
import { reservations, listings } from '../store.js'
import type { Reservation } from '../types.js'

export const reservationsRouter = Router()

/** GET /api/reservations – X-User-Id = current user (returns all for now; filter by userId if we add userId to Reservation) */
reservationsRouter.get('/', (req, res) => {
  res.json(reservations)
})

/** POST /api/reservations – body: { listingId, amount }. X-User-Id = userId */
reservationsRouter.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] as string
  if (!userId) return res.status(400).json({ error: 'X-User-Id required' })
  const { listingId, amount } = req.body as { listingId: string; amount: number }
  const listing = listings.find((l) => l.id === listingId)
  if (!listing) return res.status(404).json({ error: 'Listing not found' })
  const resId = `r${Date.now()}`
  const reservation: Reservation = {
    id: resId,
    listingId,
    amount,
    timestamp: new Date().toISOString(),
    status: 'active',
  }
  reservations.push(reservation)
  listing.availableQuantity = Math.max(0, listing.availableQuantity - amount)
  res.status(201).json(reservation)
})

/** DELETE /api/reservations/:id */
reservationsRouter.delete('/:id', (req, res) => {
  const idx = reservations.findIndex((r) => r.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Reservation not found' })
  const row = reservations[idx]
  const listing = listings.find((l) => l.id === row.listingId)
  if (listing) listing.availableQuantity += row.amount
  reservations.splice(idx, 1)
  res.status(204).send()
})
