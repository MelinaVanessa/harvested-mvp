import express from 'express'
import cors from 'cors'
import { listingsRouter } from './routes/listings.js'
import { usersRouter } from './routes/users.js'
import { reservationsRouter } from './routes/reservations.js'
import { messagesRouter } from './routes/messages.js'
import { geocodeRouter } from './routes/geocode.js'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: true }))
app.use(express.json({ limit: '5mb' }))

app.use('/api/listings', listingsRouter)
app.use('/api/users', usersRouter)
app.use('/api/reservations', reservationsRouter)
app.use('/api/messages', messagesRouter)
app.use('/api/geocode', geocodeRouter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.listen(PORT, () => {
  console.log(`Harvested API: http://localhost:${PORT}`)
})
