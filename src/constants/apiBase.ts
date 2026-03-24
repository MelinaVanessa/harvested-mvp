import type { UserProfile, UserRole } from '@/types'

/**
 * Origins to try for /api/auth (and similar). Order tuned so real API is found even when
 * VITE_API_URL was missing at build time or frontend/API hosts differ.
 */
export function getApiBaseCandidates(): string[] {
  const seen = new Set<string>()
  const add = (u: string | undefined | null) => {
    if (u === undefined || u === null) return
    const s = u.trim().replace(/\/$/, '')
    if (s) seen.add(s)
  }

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
  for (const base of getApiBaseCandidates()) {
    try {
      const res = await fetchWithTimeout(authUrl(base, 'login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body),
      })
      const ct = res.headers.get('content-type') ?? ''
      if (!res.ok || !ct.includes('application/json')) continue
      const data = (await res.json()) as { user?: UserProfile }
      if (data.user?.id) return data.user
    } catch {
      /* try next base */
    }
  }
  return null
}

export async function tryAuthRegister(body: {
  email: string
  password: string
  name: string
  role: UserRole
}): Promise<{ user: UserProfile } | { conflict: true } | null> {
  for (const base of getApiBaseCandidates()) {
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
