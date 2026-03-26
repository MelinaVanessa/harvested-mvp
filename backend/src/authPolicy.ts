/** E-Mails mit mehreren Konten (weitere Registrierungen erlaubt; Login wählt per Passwort / User). */
export const MULTI_ACCOUNT_EMAILS = new Set(['melina_vanessa.mann@web.de'])

export function allowsMultipleAccountsForEmail(emailRaw: string): boolean {
  return MULTI_ACCOUNT_EMAILS.has(emailRaw.trim().toLowerCase())
}
