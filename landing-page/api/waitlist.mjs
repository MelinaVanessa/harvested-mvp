import {
  applyCors,
  getRedis,
  readJsonBody,
  WAITLIST_EMAILS_SET,
  WAITLIST_LOG_KEY,
} from './lib/waitlist-shared.mjs'

const validRoles = ['gardener', 'neighbor', 'both']

export default async function handler(req, res) {
  applyCors(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const redis = getRedis()
  if (!redis) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(
      JSON.stringify({
        error:
          'Waitlist storage not configured. On Vercel: add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN (see .env.example). Locally: run npm run api.',
      }),
    )
    return
  }

  const payload = await readJsonBody(req)
  if (payload === null) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Invalid JSON' }))
    return
  }

  const nameRaw =
    typeof payload.name === 'string' ? String(payload.name).trim().slice(0, 200) : ''
  const emailRaw =
    typeof payload.email === 'string' ? String(payload.email).trim().toLowerCase() : ''
  const role = payload.role

  if (!nameRaw) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Name required' }))
    return
  }
  if (!emailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Valid email required' }))
    return
  }
  if (!validRoles.includes(role)) {
    res.statusCode = 400
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Invalid role' }))
    return
  }

  let added
  try {
    added = await redis.sadd(WAITLIST_EMAILS_SET, emailRaw)
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Could not save signup' }))
    return
  }

  if (Number(added) === 0) {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ duplicate: true }))
    return
  }

  const row = {
    email: emailRaw,
    role,
    name: nameRaw,
    createdAt: new Date().toISOString(),
  }

  try {
    await redis.lpush(WAITLIST_LOG_KEY, JSON.stringify(row))
  } catch (err) {
    console.error(err)
    try {
      await redis.srem(WAITLIST_EMAILS_SET, emailRaw)
    } catch {
      /* ignore */
    }
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Could not save signup' }))
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.end(JSON.stringify({}))
}
