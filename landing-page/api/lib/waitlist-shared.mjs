import { Redis } from '@upstash/redis'

export const WAITLIST_LOG_KEY = 'waitlist:log'
export const WAITLIST_EMAILS_SET = 'waitlist:emails'

export function applyCors(res) {
  const allowedOrigin = process.env.ALLOWED_ORIGIN?.trim()
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin || '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret')
}

/** @returns {Redis | null} */
export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  if (!url || !token) return null
  return new Redis({ url, token })
}

/**
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function readRawTextBody(req) {
  if (typeof req.body === 'string') {
    return req.body
  }
  if (Buffer.isBuffer(req.body)) {
    return req.body.toString('utf8')
  }
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

export async function readJsonBody(req) {
  if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)) {
    return /** @type {Record<string, unknown>} */ (req.body)
  }
  const raw = await readRawTextBody(req)
  try {
    return JSON.parse(raw || '{}')
  } catch {
    return null
  }
}

/**
 * Upstash may return each list entry as a string (JSON) or as an already-parsed object.
 * @param {unknown} line
 * @returns {{ email: string, role: string, name: string | null, created_at: string | null } | null}
 */
export function normalizeSignupRow(line) {
  if (line == null) return null
  let o
  if (typeof line === 'object' && !Array.isArray(line)) {
    o = line
  } else if (typeof line === 'string') {
    try {
      o = JSON.parse(line)
    } catch {
      return null
    }
  } else {
    return null
  }
  if (typeof o !== 'object' || o === null) return null
  const email = o.email
  const role = o.role
  if (typeof email !== 'string' || typeof role !== 'string') return null
  const created =
    typeof o.createdAt === 'string'
      ? o.createdAt
      : typeof o.created_at === 'string'
        ? o.created_at
        : null
  const name =
    o.name == null ? null : typeof o.name === 'string' ? o.name : String(o.name)
  return {
    email,
    role,
    name,
    created_at: created,
  }
}

/**
 * @param {Redis} redis
 * @returns {Promise<{ email: string, role: string, name: string | null, created_at: string | null }[]>}
 */
export async function loadSignupsFromRedis(redis) {
  const rows = await redis.lrange(WAITLIST_LOG_KEY, 0, -1)
  return rows
    .map((line) => normalizeSignupRow(line))
    .filter(Boolean)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
}

/** @param {string | null | undefined} s */
export function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
