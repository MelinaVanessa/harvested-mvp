/**
 * LocalStorage: saved login (userId only) and optional profile data (avatar, name, bio, handle).
 */
const SAVED_LOGIN_KEY = 'harvested_saved_login'
const PROFILE_PREFIX = 'harvested_profile_'

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
