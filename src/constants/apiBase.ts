import type { UserProfile, UserRole } from '@/types'

/**
 * Origins to try for /api/auth (and similar). Order tuned so real API is found even when
 * VITE_API_URL was missing at build time or frontend/API hosts differ.
 */
function readMetaApiBase(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const v = document.querySelector('meta[name="harvested-api-base"]')?.getAttribute('content')?.trim()
  return v && v.length > 0 ? v : undefined
}

export function getApiBaseCandidates(): string[] {
  const seen = new Set<string>()
  const add = (u: string | undefined | null) => {
    if (u === undefined || u === null) return
    const s = u.trim().replace(/\/$/, '')
    if (s) seen.add(s)
  }

  add(readMetaApiBase())
  add(import.meta.env.VITE_API_URL as string | undefined)

  if (typeof window !== 'undefined') {
    const { hostname } = window.location
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      add('') // relative /api → Vite proxy in dev
      add('http://localhost:3001')
    }
    add(window.location.origin)
  }

  add('https://harvested-mvp.onrender.com')

  return [...seen]
}

/** Primary base (first candidate) — matches historical App default. */
export function getPrimaryApiBase(): string {
  const list = getApiBaseCandidates().filter((b) => b.length > 0)
  return list[0] ?? 'https://harvested-mvp.onrender.com'
}

/**
 * Auth requests should hit the real API before the static site origin (GitHub Pages has no /api).
 * Dev (localhost) keeps the original order (Vite proxy + 3001 first).
 */
export function getAuthApiBaseCandidates(): string[] {
  const all = getApiBaseCandidates()
  if (typeof window === 'undefined') return all
  const { hostname, origin } = window.location
  const isLocal = hostname === 'localhost' || hostname === '127.0.0.1'
  if (isLocal) return all

  const withoutOrigin = all.filter((b) => b !== origin)
  const originOnly = all.filter((b) => b === origin)
  return [...withoutOrigin, ...originOnly]
}

function authUrl(base: string, path: 'login' | 'register'): string {
  const suffix = path === 'login' ? '/api/auth/login' : '/api/auth/register'
  if (!base) return suffix
  return `${base}${suffix}`
}

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const c = new AbortController()
  const id = globalThis.setTimeout(() => c.abort(), 20000)
  try {
    return await fetch(url, { ...init, signal: c.signal })
  } finally {
    globalThis.clearTimeout(id)
  }
}

export async function tryAuthLogin(body: { email: string; password: string }): Promise<UserProfile | null> {
  const result = await tryAuthLoginDetailed(body)
  return result.user
}

export async function tryAuthLoginDetailed(body: { email: string; password: string }): Promise<{
  user: UserProfile | null
  reason: 'ok' | 'invalid_credentials' | 'unreachable'
}> {
  let hadInvalidCredentials = false
  let hadReachableAuthServer = false
  for (const base of getAuthApiBaseCandidates()) {
    try {
      const res = await fetchWithTimeout(authUrl(base, 'login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      // Only real auth responses should influence credential verdicts.
      // A 404/HTML from a static origin must not become "invalid credentials".
      if (res.status === 401 || res.status === 400) {
        hadReachableAuthServer = true
        hadInvalidCredentials = true
        continue
      }
      const ct = res.headers.get('content-type') ?? ''
      if (!res.ok || !ct.includes('application/json')) continue
      hadReachableAuthServer = true
      const data = (await res.json()) as { user?: UserProfile }
      if (data.user?.id) return { user: data.user, reason: 'ok' }
    } catch {
      /* try next base */
    }
  }
  if (hadInvalidCredentials) return { user: null, reason: 'invalid_credentials' }
  if (hadReachableAuthServer) return { user: null, reason: 'invalid_credentials' }
  return { user: null, reason: 'unreachable' }
}

export async function tryAuthRegister(body: {
  email: string
  password: string
  name: string
  role: UserRole
}): Promise<{ user: UserProfile } | { conflict: true } | null> {
  for (const base of getAuthApiBaseCandidates()) {
    try {
      const res = await fetchWithTimeout(authUrl(base, 'register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      if (res.status === 409) return { conflict: true }
      const ct = res.headers.get('content-type') ?? ''
      if (!res.ok || !ct.includes('application/json')) continue
      const data = (await res.json()) as { user?: UserProfile }
      if (data.user?.id) return { user: data.user }
    } catch {
      /* try next base */
    }
  }
  return null
}
