import { applyCors, getRedis, loadSignupsFromRedis } from './lib/waitlist-shared.mjs'

function adminOk(req, adminSecret) {
  if (!adminSecret) return false
  const h = req.headers['x-admin-secret']
  return typeof h === 'string' && h === adminSecret
}

function buildStats(signups) {
  let gardeners = 0
  let neighbors = 0
  let both = 0

  for (const s of signups) {
    if (s.role === 'gardener') gardeners += 1
    else if (s.role === 'neighbor') neighbors += 1
    else if (s.role === 'both') both += 1
  }

  return {
    total: signups.length,
    gardeners,
    users: neighbors,
    both,
  }
}

export default async function handler(req, res) {
  applyCors(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const adminSecret = process.env.WAITLIST_ADMIN_SECRET?.trim()
  if (!adminSecret) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'WAITLIST_ADMIN_SECRET is not set on the server' }))
    return
  }

  if (!adminOk(req, adminSecret)) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Unauthorized' }))
    return
  }

  const redis = getRedis()
  if (!redis) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(
      JSON.stringify({
        error:
          'Waitlist storage not configured. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN on Vercel.',
      }),
    )
    return
  }

  try {
    const signups = await loadSignupsFromRedis(redis)
    const stats = buildStats(signups)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ stats }))
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Could not load waitlist stats' }))
  }
}
