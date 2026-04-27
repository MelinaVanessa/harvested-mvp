import { applyCors } from './lib/waitlist-shared.mjs'

const CAP = 100

/**
 * Slots shown as “taken” on the landing-page pilot bar (0–100).
 * Update this when you have a new number, or set PILOT_CLAIMED_MANUAL on Vercel to override without redeploying.
 */
const PILOT_SLOTS_CLAIMED = 42

function publicPilotClaimed() {
  const raw = process.env.PILOT_CLAIMED_MANUAL
  if (raw !== undefined && String(raw).trim() !== '') {
    const n = Number.parseInt(String(raw).trim(), 10)
    if (Number.isFinite(n)) return Math.min(CAP, Math.max(0, n))
  }
  return Math.min(CAP, Math.max(0, PILOT_SLOTS_CLAIMED))
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

  const claimed = publicPilotClaimed()
  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
  res.end(JSON.stringify({ cap: CAP, claimed, configured: true, remaining: CAP - claimed }))
}
