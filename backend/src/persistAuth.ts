/**
 * MVP: persist in-memory auth to disk so Render / restarts keep registrations until redeploy.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import type { UserProfile } from './types.js'
import { credentialsByEmail, users } from './store.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const AUTH_FILE = path.join(DATA_DIR, 'auth.json')

export function loadAuthFromDisk(): void {
  try {
    if (!fs.existsSync(AUTH_FILE)) return
    const raw = fs.readFileSync(AUTH_FILE, 'utf8')
    const j = JSON.parse(raw) as {
      credentialsByEmail?: Record<string, { userId: string; password: string }>
      users?: Record<string, UserProfile>
    }
    if (j.credentialsByEmail && typeof j.credentialsByEmail === 'object') {
      Object.assign(credentialsByEmail, j.credentialsByEmail)
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
