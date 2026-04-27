import {
  applyCors,
  escapeHtml,
  getRedis,
  loadSignupsFromRedis,
  readRawTextBody,
  WAITLIST_EMAILS_SET,
  WAITLIST_LOG_KEY,
} from './lib/waitlist-shared.mjs'

function tableHtml(signups, diagHtml = '') {
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
    p.meta { margin: 1rem 0 0; font-size: 0.85rem; color: #555; line-height: 1.5; }
    p.meta code { font-size: 0.8rem; word-break: break-all; }
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
  ${diagHtml}
</body>
</html>`
}

async function readPostedSecret(req) {
  if (typeof req.body === 'object' && req.body !== null && !Buffer.isBuffer(req.body)) {
    const v = /** @type {Record<string, unknown>} */ (req.body).secret
    if (typeof v === 'string') return v.trim()
  }
  const rawBody = await readRawTextBody(req)
  return new URLSearchParams(rawBody).get('secret')?.trim() ?? ''
}

function errorHtml(title, message) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #FCFAF7; color: #0D1A15; margin: 0; padding: 1.5rem; max-width: 36rem; }
    h1 { font-size: 1.1rem; color: #7f1d1d; }
    p { color: #444; line-height: 1.5; }
    a { color: #4A5D4E; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${message}</p>
  <p><a href="/waitlist-admin.html">Back</a></p>
</body>
</html>`
}

export default async function handler(req, res) {
  applyCors(res)

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method === 'GET') {
    res.statusCode = 302
    res.setHeader('Location', '/waitlist-admin.html')
    res.end()
    return
  }

  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end('Method not allowed')
    return
  }

  const adminSecret = process.env.WAITLIST_ADMIN_SECRET?.trim()
  if (!adminSecret) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(
      errorHtml(
        'Not configured',
        'Set <strong>WAITLIST_ADMIN_SECRET</strong> on Vercel (or in <code>.env</code> locally), redeploy, then try again.',
      ),
    )
    return
  }

  let posted = ''
  try {
    posted = await readPostedSecret(req)
  } catch (err) {
    console.error(err)
    res.statusCode = 400
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(errorHtml('Bad request', 'Could not read form body.'))
    return
  }
  if (posted !== adminSecret) {
    res.statusCode = 401
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(errorHtml('Unauthorized', 'Wrong secret. Try again from the admin page.'))
    return
  }

  const redis = getRedis()
  if (!redis) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(
      errorHtml(
        'Storage missing',
        'Upstash is not configured. Add <code>UPSTASH_REDIS_REST_URL</code> and <code>UPSTASH_REDIS_REST_TOKEN</code>.',
      ),
    )
    return
  }

  try {
    const signups = await loadSignupsFromRedis(redis)
    let diagHtml = ''
    if (signups.length === 0) {
      const logLen = await redis.llen(WAITLIST_LOG_KEY)
      const dedupeCount = await redis.scard(WAITLIST_EMAILS_SET)
      if (logLen === 0 && dedupeCount === 0) {
        diagHtml = `<p class="meta">This Redis database is empty (<code>waitlist:log</code> length 0). Successful signups only appear here after someone submits the form on <strong>this production site</strong> (<a href="/">homepage</a>) with Upstash already configured on Vercel. Submissions while you were on localhost, or before Redis env vars were set, are not in this database.</p>`
      } else if (logLen > 0) {
        const sample = await redis.lindex(WAITLIST_LOG_KEY, 0)
        const samplePreview =
          typeof sample === 'object' && sample !== null
            ? JSON.stringify(sample)
            : String(sample ?? '')
        diagHtml = `<p class="meta">There are <strong>${logLen}</strong> row(s) in Redis but none matched the expected shape (need <code>email</code>, <code>role</code>, optional <code>name</code> / <code>createdAt</code>). First entry (truncated): <code>${escapeHtml(samplePreview.slice(0, 280))}</code></p>`
      } else {
        diagHtml = `<p class="meta">Log list is empty but the dedupe set has <strong>${dedupeCount}</strong> email(s) (unusual). In Upstash, run <code>LRANGE waitlist:log 0 -1</code> to inspect. New signups should still append to the log.</p>`
      }
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(tableHtml(signups, diagHtml))
  } catch (err) {
    console.error(err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.end(errorHtml('Error', 'Could not load signups.'))
  }
}
