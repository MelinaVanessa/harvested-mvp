import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '..', '.env') })
const PORT = Number(process.env.PORT) || 3001
const DATA_FILE = path.join(__dirname, 'data', 'waitlist.json')

const supabaseUrl = process.env.SUPABASE_URL?.trim()
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
const adminSecret = process.env.WAITLIST_ADMIN_SECRET?.trim()
const useSupabase = Boolean(supabaseUrl && supabaseKey)

const supabase = useSupabase ? createClient(supabaseUrl, supabaseKey) : null

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Secret',
}

async function readStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function writeStore(rows) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(rows, null, 2), 'utf8')
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...cors,
    'Content-Length': Buffer.byteLength(body),
  })
  res.end(body)
}

function adminOk(req) {
  if (!adminSecret) return false
  const h = req.headers['x-admin-secret']
  return typeof h === 'string' && h === adminSecret
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function waitlistTableHtml(signups) {
  let gardeners = 0
  let neighbors = 0
  let both = 0
  for (const s of signups) {
    if (s.role === 'gardener') gardeners += 1
    else if (s.role === 'neighbor') neighbors += 1
    else if (s.role === 'both') both += 1
  }

  const rows = signups
    .map(
      (s) => `<tr>
  <td>${escapeHtml(s.name)}</td>
  <td>${escapeHtml(s.email)}</td>
  <td>${escapeHtml(s.role)}</td>
  <td class="dt">${escapeHtml(s.created_at)}</td>
</tr>`,
    )
    .join('\n')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>Harvested — Waitlist</title>
  <style>
    body { font-family: system-ui, "Segoe UI", sans-serif; background: #FCFAF7; color: #0D1A15; margin: 0; padding: 1.25rem 1.5rem 2rem; }
    h1 { font-size: 1.2rem; font-weight: 600; color: #4A5D4E; margin: 0 0 0.75rem; }
    .stats { display: flex; flex-wrap: wrap; gap: 0.45rem; margin: 0 0 1rem; }
    .chip { font-size: 0.78rem; color: #314033; background: rgba(74,93,78,0.10); border: 1px solid rgba(74,93,78,0.2); border-radius: 999px; padding: 0.26rem 0.56rem; white-space: nowrap; }
    .chip strong { font-size: 0.84rem; }
    table { border-collapse: collapse; width: 100%; max-width: 64rem; background: #fff; border: 1px solid rgba(74,93,78,0.22); border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(13,26,21,0.06); }
    th, td { text-align: left; padding: 0.6rem 0.85rem; border-bottom: 1px solid rgba(74,93,78,0.12); vertical-align: top; }
    th { background: rgba(74,93,78,0.08); font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #4A5D4E; white-space: nowrap; }
    tr:last-child td { border-bottom: 0; }
    td.dt { font-size: 0.8rem; color: #555; white-space: nowrap; }
    p.meta { margin: 1rem 0 0; font-size: 0.85rem; color: #555; }
    a { color: #4A5D4E; }
    .empty { padding: 1rem 0.85rem; color: #555; }
  </style>
</head>
<body>
  <h1>Waitlist signups</h1>
  <div class="stats">
    <span class="chip">Total: <strong>${signups.length}</strong></span>
    <span class="chip">Gardeners: <strong>${gardeners}</strong></span>
    <span class="chip">Users: <strong>${neighbors}</strong></span>
    <span class="chip">Both: <strong>${both}</strong></span>
  </div>
  <table>
    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
    <tbody>
      ${signups.length ? rows : '<tr><td class="empty" colspan="4">No signups yet.</td></tr>'}
    </tbody>
  </table>
  <p class="meta"><a href="/waitlist-admin.html">← Enter a different secret</a></p>
</body>
</html>`
}

async function getSignupsArray() {
  if (useSupabase) {
    const { data, error } = await supabase
      .from('waitlist_signups')
      .select('email, role, name, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r) => ({
      email: r.email,
      role: r.role,
      name: r.name ?? null,
      created_at: r.created_at ?? null,
    }))
  }
  const rows = await readStore()
  return rows
    .map((r) => ({
      email: r.email,
      role: r.role,
      name: r.name ?? null,
      created_at: r.createdAt ?? null,
    }))
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)))
}

async function handleWaitlistPost(res, emailRaw, role, nameRaw) {
  if (useSupabase) {
    const { error } = await supabase
      .from('waitlist_signups')
      .insert({ email: emailRaw, role, name: nameRaw })
    if (error) {
      if (error.code === '23505') {
        sendJson(res, 200, { duplicate: true })
        return
      }
      console.error(error)
      sendJson(res, 500, { error: 'Could not save signup' })
      return
    }
    sendJson(res, 200, {})
    return
  }

  try {
    const rows = await readStore()
    const exists = rows.some((r) => r.email === emailRaw)
    if (exists) {
      sendJson(res, 200, { duplicate: true })
      return
    }
    rows.push({ email: emailRaw, role, name: nameRaw, createdAt: new Date().toISOString() })
    await writeStore(rows)
    sendJson(res, 200, {})
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: 'Could not save signup' })
  }
}

async function handleWaitlistList(res) {
  if (!adminSecret) {
    sendJson(res, 503, { error: 'WAITLIST_ADMIN_SECRET is not set on the server' })
    return
  }

  try {
    const signups = await getSignupsArray()
    sendJson(res, 200, { signups })
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: 'Could not load signups' })
  }
}

const PILOT_CAP = 100

/** Keep in sync with api/waitlist-pilot-capacity.mjs — or set PILOT_CLAIMED_MANUAL in .env */
const PILOT_SLOTS_CLAIMED = 48

function publicPilotClaimed() {
  const raw = process.env.PILOT_CLAIMED_MANUAL
  if (raw !== undefined && String(raw).trim() !== '') {
    const n = Number.parseInt(String(raw).trim(), 10)
    if (Number.isFinite(n)) return Math.min(PILOT_CAP, Math.max(0, n))
  }
  return Math.min(PILOT_CAP, Math.max(0, PILOT_SLOTS_CLAIMED))
}

async function handleWaitlistPilotCapacity(res) {
  try {
    const claimed = publicPilotClaimed()
    sendJson(res, 200, {
      cap: PILOT_CAP,
      claimed,
      configured: true,
      remaining: PILOT_CAP - claimed,
    })
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: 'Could not load capacity' })
  }
}

async function handleWaitlistStats(res) {
  if (!adminSecret) {
    sendJson(res, 503, { error: 'WAITLIST_ADMIN_SECRET is not set on the server' })
    return
  }

  try {
    const signups = await getSignupsArray()
    let gardeners = 0
    let neighbors = 0
    let both = 0

    for (const s of signups) {
      if (s.role === 'gardener') gardeners += 1
      else if (s.role === 'neighbor') neighbors += 1
      else if (s.role === 'both') both += 1
    }

    sendJson(res, 200, {
      stats: {
        total: signups.length,
        gardeners,
        users: neighbors,
        both,
      },
    })
  } catch (err) {
    console.error(err)
    sendJson(res, 500, { error: 'Could not load waitlist stats' })
  }
}

async function handleWaitlistBoardPost(res, rawBody) {
  if (!adminSecret) {
    const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Not configured</title></head><body><p>Set WAITLIST_ADMIN_SECRET in .env and restart the API.</p></body></html>`
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8', ...cors, 'Content-Length': Buffer.byteLength(body) })
    res.end(body)
    return
  }

  const posted = new URLSearchParams(rawBody).get('secret')?.trim() ?? ''
  if (posted !== adminSecret) {
    const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Unauthorized</title></head><body><p>Wrong secret.</p><p><a href="/waitlist-admin.html">Back</a></p></body></html>`
    res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8', ...cors, 'Content-Length': Buffer.byteLength(body) })
    res.end(body)
    return
  }

  try {
    const signups = await getSignupsArray()
    const html = waitlistTableHtml(signups)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', ...cors, 'Content-Length': Buffer.byteLength(html) })
    res.end(html)
  } catch (err) {
    console.error(err)
    const body = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Error</title></head><body><p>Could not load signups.</p></body></html>`
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8', ...cors, 'Content-Length': Buffer.byteLength(body) })
    res.end(body)
  }
}

const server = http.createServer(async (req, res) => {
  const url = req.url?.split('?')[0] ?? ''

  if (req.method === 'OPTIONS' && url.startsWith('/api/')) {
    res.writeHead(204, cors)
    res.end()
    return
  }

  if (req.method === 'GET' && url === '/api/waitlist-signups') {
    if (!adminOk(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }
    await handleWaitlistList(res)
    return
  }

  if (req.method === 'GET' && url === '/api/waitlist-stats') {
    if (!adminOk(req)) {
      sendJson(res, 401, { error: 'Unauthorized' })
      return
    }
    await handleWaitlistStats(res)
    return
  }

  if (req.method === 'GET' && url === '/api/waitlist-pilot-capacity') {
    await handleWaitlistPilotCapacity(res)
    return
  }

  if (req.method === 'POST' && url === '/api/waitlist') {
    let rawBody = ''
    for await (const chunk of req) rawBody += chunk

    let payload
    try {
      payload = JSON.parse(rawBody || '{}')
    } catch {
      sendJson(res, 400, { error: 'Invalid JSON' })
      return
    }

    const nameRaw =
      typeof payload.name === 'string' ? payload.name.trim().slice(0, 200) : ''
    const emailRaw = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
    const { role } = payload
    const validRoles = ['gardener', 'neighbor', 'both']

    if (!nameRaw) {
      sendJson(res, 400, { error: 'Name required' })
      return
    }
    if (!emailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      sendJson(res, 400, { error: 'Valid email required' })
      return
    }
    if (!validRoles.includes(role)) {
      sendJson(res, 400, { error: 'Invalid role' })
      return
    }

    await handleWaitlistPost(res, emailRaw, role, nameRaw)
    return
  }

  if (req.method === 'POST' && url === '/api/waitlist-board') {
    let rawBody = ''
    for await (const chunk of req) rawBody += chunk
    await handleWaitlistBoardPost(res, rawBody)
    return
  }

  if (req.method === 'GET' && url === '/api/health') {
    sendJson(res, 200, {
      ok: true,
      storage: useSupabase ? 'supabase' : 'file',
    })
    return
  }

  res.writeHead(404, { 'Content-Type': 'application/json', ...cors })
  res.end(JSON.stringify({ error: 'Not found' }))
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Harvested waitlist API → http://127.0.0.1:${PORT}`)
  console.log(`  POST /api/waitlist`)
  console.log(`  POST /api/waitlist-board  (form body secret=… → HTML table)`)
  console.log(`  GET  /api/waitlist-signups  (header X-Admin-Secret)`)
  console.log(`  GET  /api/waitlist-stats    (header X-Admin-Secret)`)
  console.log(`  GET  /api/waitlist-pilot-capacity  (public pilot fill)`)
  if (useSupabase) {
    console.log('  Storage: Supabase (waitlist_signups)')
  } else {
    console.warn('  Storage: local JSON (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY for Supabase)')
  }
  if (!adminSecret) {
    console.warn('  WAITLIST_ADMIN_SECRET not set — export list disabled until you set it')
  }
})
