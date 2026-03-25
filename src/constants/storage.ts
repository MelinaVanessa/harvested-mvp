/**
 * LocalStorage: saved login (userId only) and optional profile data (avatar, name, bio, handle).
 */
import type { UserProfile, UserRole } from '@/types'
import { normalizePasswordForAuth } from '@/utils/password'

const SAVED_LOGIN_KEY = 'harvested_saved_login'
const PROFILE_PREFIX = 'harvested_profile_'
const REGISTERED_ACCOUNTS_KEY = 'harvested_registered_accounts'

export interface SavedLogin {
  userId: string
}

export function getSavedLogin(): SavedLogin | null {
  try {
    const raw = localStorage.getItem(SAVED_LOGIN_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as SavedLogin
    return data?.userId ? data : null
  } catch {
    return null
  }
}

export function setSavedLogin(userId: string): void {
  try {
    localStorage.setItem(SAVED_LOGIN_KEY, JSON.stringify({ userId }))
  } catch (e) {
    console.warn('Could not save login to localStorage', e)
  }
}

export function clearSavedLogin(): void {
  localStorage.removeItem(SAVED_LOGIN_KEY)
}

export interface SavedProfilePatch {
  avatar?: string
  name?: string
  bio?: string
  handle?: string
}

export function getSavedProfile(userId: string): SavedProfilePatch | null {
  try {
    const raw = localStorage.getItem(PROFILE_PREFIX + userId)
    if (!raw) return null
    return JSON.parse(raw) as SavedProfilePatch
  } catch {
    return null
  }
}

export function setSavedProfile(userId: string, patch: SavedProfilePatch): void {
  try {
    const existing = getSavedProfile(userId) ?? {}
    const merged = { ...existing, ...patch }
    localStorage.setItem(PROFILE_PREFIX + userId, JSON.stringify(merged))
  } catch (e) {
    console.warn('Could not save profile to localStorage', e)
  }
}

/** MVP: local accounts (email login) stored on device — not for production auth. */
export interface StoredAccount {
  email: string
  password: string
  userId: string
  name: string
  role: UserRole
}

/** Normalize stored rows so we never drop accounts on read (strict role checks caused data loss on upsert). */
function normalizeStoredAccount(x: unknown): StoredAccount | null {
  if (!x || typeof x !== 'object') return null
  const o = x as Record<string, unknown>
  if (
    typeof o.email !== 'string' ||
    typeof o.password !== 'string' ||
    typeof o.userId !== 'string' ||
    typeof o.name !== 'string'
  ) {
    return null
  }
  const role: UserRole = o.role === 'buyer' ? 'buyer' : 'gardener'
  return {
    email: o.email.trim().toLowerCase(),
    password: normalizePasswordForAuth(String(o.password)),
    userId: String(o.userId),
    name: String(o.name),
    role,
  }
}

export function getRegisteredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(REGISTERED_ACCOUNTS_KEY)
    if (!raw) return []
    const data = JSON.parse(raw) as unknown
    if (!Array.isArray(data)) return []
    const rows = data.map(normalizeStoredAccount).filter((a): a is StoredAccount => a !== null)
    const byEmail = new Map<string, StoredAccount>()
    for (const a of rows) {
      byEmail.set(a.email, a)
    }
    return [...byEmail.values()]
  } catch {
    return []
  }
}

export function findRegisteredAccountByEmail(emailLower: string): StoredAccount | undefined {
  const needle = emailLower.trim().toLowerCase()
  return getRegisteredAccounts().find((a) => a.email.trim().toLowerCase() === needle)
}

export function upsertRegisteredAccount(account: StoredAccount): boolean {
  try {
    const key = account.email.trim().toLowerCase()
    const list = getRegisteredAccounts().filter((a) => a.email.trim().toLowerCase() !== key)
    list.push({
      ...account,
      email: key,
      password: normalizePasswordForAuth(account.password),
    })
    localStorage.setItem(REGISTERED_ACCOUNTS_KEY, JSON.stringify(list))
    return true
  } catch (e) {
    console.warn('Could not save registered account', e)
    return false
  }
}

/** Re-read disk accounts into the user map (e.g. after logout or when opening the login screen). */
export function mergeUsersFromStorage(
  mockUsers: Record<string, UserProfile>,
  prev: Record<string, UserProfile>,
): Record<string, UserProfile> {
  return { ...mockUsers, ...registeredAccountsUserMap(), ...prev }
}

export function findRegisteredAccountByUserId(userId: string): StoredAccount | undefined {
  return getRegisteredAccounts().find((a) => a.userId === userId)
}

const DEFAULT_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'

export function storedAccountToUserProfile(a: StoredAccount): UserProfile {
  const handleBase =
    a.email
      .split('@')[0]
      ?.replace(/[^a-zA-Z0-9_]/g, '_')
      .slice(0, 24) || 'user'
  return {
    id: a.userId,
    name: a.name,
    handle: `@${handleBase}`,
    bio: '',
    avatar: DEFAULT_AVATAR,
    role: a.role,
    isMember: a.role === 'gardener',
    following: [],
    likedListings: [],
  }
}

export function registeredAccountsUserMap(): Record<string, UserProfile> {
  const map: Record<string, UserProfile> = {}
  for (const a of getRegisteredAccounts()) {
    map[a.userId] = storedAccountToUserProfile(a)
  }
  return map
}
