/**
 * E-Mail-Adressen, unter denen mehrere Konten (mehrere userIds / Passwörter) erlaubt sind.
 */
const MULTI_ACCOUNT_EMAILS_LOWER = new Set(['melina_vanessa.mann@web.de'])

export function allowsMultipleAccountsForEmail(emailLower: string): boolean {
  return MULTI_ACCOUNT_EMAILS_LOWER.has(emailLower.trim().toLowerCase())
}
