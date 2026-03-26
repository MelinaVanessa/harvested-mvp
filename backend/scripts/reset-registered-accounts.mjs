/**
 * Removes persisted API registrations (backend/data/auth.json).
 * Next server start uses only seed data: admin melina_vanessa.mann@web.de (u1) + demo users u2/u3.
 *
 * Does not clear browser localStorage (harvested_registered_accounts) — each user must clear
 * site data or re-register if out of sync with the API.
 *
 * Usage: npm run clear-registered-accounts
 * On Render: Shell → cd project → node scripts/reset-registered-accounts.mjs → Manual Deploy / restart
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const authFile = path.join(__dirname, '..', 'data', 'auth.json')

if (fs.existsSync(authFile)) {
  fs.unlinkSync(authFile)
  console.log('Deleted:', authFile)
  console.log('Restart the API process so only seed accounts (incl. admin u1) remain.')
} else {
  console.log('No auth snapshot on disk — nothing to delete (already using seed only).')
}
