/**
 * MVP: persist in-memory auth to disk so Render / restarts keep registrations until redeploy.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UserProfile } from './types.js'
import type { EmailCredential } from './store.js'
import { credentialsByEmail, users } from './store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const AUTH_FILE = path.join(DATA_DIR, 'auth.json')

function isCred(x: unknown): x is EmailCredential {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return typeof o.userId === 'string' && typeof o.password === 'string'
}

/** auth.json V1: ein Objekt pro E-Mail → V2: Array (Migration). */
function normalizeCredentialsFromFile(raw: unknown): Record<string, EmailCredential[]> {
  if (!raw || typeof raw !== 'object') return {}
  const out: Record<string, EmailCredential[]> = {}
  for (const [email, val] of Object.entries(raw as Record<string, unknown>)) {
    if (Array.isArray(val)) {
      out[email] = val.filter(isCred)
    } else if (isCred(val)) {
      out[email] = [val]
    }
  }
  return out
}

/** Merge file creds into store so disk never wipes seed logins (e.g. empty `[]` in auth.json). */
function mergeCredentialsFromDisk(file: Record<string, EmailCredential[]>): void {
  for (const [email, fileCreds] of Object.entries(file)) {
    if (!Array.isArray(fileCreds) || fileCreds.length === 0) continue
    const existing = credentialsByEmail[email] ?? []
    const byUserId = new Map<string, EmailCredential>()
    for (const c of existing) byUserId.set(c.userId, c)
    for (const c of fileCreds) byUserId.set(c.userId, c)
    credentialsByEmail[email] = [...byUserId.values()]
  }
}

export function loadAuthFromDisk(): void {
  try {
    if (!fs.existsSync(AUTH_FILE)) return
    const raw = fs.readFileSync(AUTH_FILE, 'utf8')
    const j = JSON.parse(raw) as {
      credentialsByEmail?: unknown
      users?: Record<string, UserProfile>
    }
    if (j.credentialsByEmail && typeof j.credentialsByEmail === 'object') {
      mergeCredentialsFromDisk(normalizeCredentialsFromFile(j.credentialsByEmail))
    }
    if (j.users && typeof j.users === 'object') {
      Object.assign(users, j.users)
    }
  } catch (e) {
    console.warn('[persistAuth] load failed', e)
  }
}

export function saveAuthToDisk(): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(
      AUTH_FILE,
      JSON.stringify({ credentialsByEmail, users }),
      'utf8',
    )
  } catch (e) {
    console.warn('[persistAuth] save failed', e)
  }
}
