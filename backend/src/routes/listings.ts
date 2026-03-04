import { Router } from 'express'
import { listings as store } from '../store.js'
import type { Listing } from '../types.js'

export const listingsRouter = Router()

/** GET /api/listings */
listingsRouter.get('/', (_req, res) => {
  res.json(store)
})

/** GET /api/listings/:id */
listingsRouter.get('/:id', (req, res) => {
  const listing = store.find((l) => l.id === req.params.id)
  if (!listing) return res.status(404).json({ error: 'Listing not found' })
  res.json(listing)
})

/** POST /api/listings – body: Listing without id, datePosted. X-User-Id = gardenerId */
listingsRouter.post('/', (req, res) => {
  const gardenerId = req.headers['x-user-id'] as string
  if (!gardenerId) return res.status(400).json({ error: 'X-User-Id required' })
  const body = req.body as Omit<Listing, 'id' | 'datePosted'>
  const listing: Listing = {
    ...body,
    id: `l${Date.now()}`,
    datePosted: new Date().toISOString().slice(0, 10),
  }
  store.unshift(listing)
  res.status(201).json(listing)
})

/** PUT /api/listings/:id */
listingsRouter.put('/:id', (req, res) => {
  const idx = store.findIndex((l) => l.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Listing not found' })
  const listing = req.body as Listing
  if (listing.id !== req.params.id) return res.status(400).json({ error: 'ID mismatch' })
  store[idx] = listing
  res.json(listing)
})

/** DELETE /api/listings/:id */
listingsRouter.delete('/:id', (req, res) => {
  const idx = store.findIndex((l) => l.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Listing not found' })
  store.splice(idx, 1)
  res.status(204).send()
})
