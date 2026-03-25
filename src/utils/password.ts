/** Trim + Unicode NFC so login matches registration across devices/browsers. */
export function normalizePasswordForAuth(s: string): string {
  return s.normalize('NFC').trim()
}
