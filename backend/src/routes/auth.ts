import { Router } from 'express'
import { allowsMultipleAccountsForEmail } from '../authPolicy.js'
import { saveAuthToDisk } from '../persistAuth.js'
import { users, credentialsByEmail, type EmailCredential } from '../store.js'
import type { UserProfile, UserRole } from '../types.js'

export const authRouter = Router()

function credListFor(email: string): EmailCredential[] {
  return credentialsByEmail[email] ?? []
}

function normPassword(p: string | undefined): string {
  return (p ?? '').normalize('NFC').trim()
}

const DEFAULT_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'

authRouter.post('/register', (req, res) => {
  const body = req.body as {
    email?: string
    password?: string
    name?: string
    role?: UserRole
  }
  const emailRaw = body.email?.trim().toLowerCase()
  const passwordRaw = normPassword(body.password)
  const name = body.name?.trim() ?? ''
  const role = body.role === 'buyer' ? 'buyer' : 'gardener'

  if (!emailRaw || !passwordRaw || !name) {
    return res.status(400).json({ error: 'Missing email, password, or name' })
  }

  const existing = credListFor(emailRaw)
  if (existing.length > 0 && !allowsMultipleAccountsForEmail(emailRaw)) {
    return res.status(409).json({ error: 'Email already registered' })
  }

  const userId = `u_${Date.now()}`
  const handleBase =
    emailRaw
      .split('@')[0]
      ?.replace(/[^a-zA-Z0-9_]/g, '_')
      .slice(0, 24) || 'user'

  const user: UserProfile = {
    id: userId,
    name,
    handle: `@${handleBase}`,
    bio: '',
    avatar: DEFAULT_AVATAR,
    role,
    isMember: role === 'gardener',
    following: [],
    likedListings: [],
  }

  users[userId] = user
  credentialsByEmail[emailRaw] = [...existing, { userId, password: passwordRaw }]
  saveAuthToDisk()

  return res.status(201).json({ user })
})

authRouter.post('/login', (req, res) => {
  const body = req.body as { email?: string; password?: string }
  const emailRaw = body.email?.trim().toLowerCase()
  const passwordInput = body.password ?? ''
  const passwordNorm = normPassword(passwordInput)

  if (!emailRaw || !passwordNorm) {
    return res.status(400).json({ error: 'Missing email or password' })
  }

  const list = credListFor(emailRaw)
  if (list.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const matches = list.filter((cred) => {
    const stored = normPassword(cred.password)
    return stored === passwordNorm || cred.password === passwordInput
  })
  if (matches.length === 0) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  const cred = matches[0]
  const user = users[cred.userId]
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }

  return res.json({ user })
})
