/** Same rules as frontend src/utils/pickupSlots.ts — keep in sync. */

export type WeeklyPickupSchedule = {
  weekdays: number[]
  timeStart: string
  timeEnd: string
  slotMinutes: 30 | 60
  weeksAhead: number
  minLeadMinutes?: number
}

const DAY_SHORT_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

function parseHm(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null
  return h * 60 + min
}

export function generateWeeklyPickupSlots(schedule: WeeklyPickupSchedule): string[] {
  const {
    weekdays,
    timeStart,
    timeEnd,
    slotMinutes,
    weeksAhead,
    minLeadMinutes = 15,
  } = schedule

  const startMin = parseHm(timeStart)
  const endMin = parseHm(timeEnd)
  if (startMin === null || endMin === null || endMin <= startMin) return []

  const ws = new Set(weekdays.filter((d) => d >= 0 && d <= 6))
  if (ws.size === 0) return []

  const deadline = Date.now() + minLeadMinutes * 60 * 1000
  const out = new Set<string>()

  const anchor = new Date()
  anchor.setHours(0, 0, 0, 0)

  for (let d = 0; d < weeksAhead * 7; d += 1) {
    const day = new Date(anchor)
    day.setDate(anchor.getDate() + d)
    if (!ws.has(day.getDay())) continue

    for (let m = startMin; m < endMin; m += slotMinutes) {
      const h = Math.floor(m / 60)
      const mi = m % 60
      const slot = new Date(day)
      slot.setHours(h, mi, 0, 0)
      if (slot.getTime() > deadline) {
        out.add(slot.toISOString())
      }
    }
  }

  return [...out].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
}

export function formatPickupScheduleSummary(
  schedule: Pick<WeeklyPickupSchedule, 'weekdays' | 'timeStart' | 'timeEnd' | 'slotMinutes'>,
): string {
  const { weekdays, timeStart, timeEnd, slotMinutes } = schedule
  const sorted = [...new Set(weekdays)]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => WEEKDAY_ORDER.indexOf(a as 0 | 1 | 2 | 3 | 4 | 5 | 6) - WEEKDAY_ORDER.indexOf(b as 0 | 1 | 2 | 3 | 4 | 5 | 6))
  const daysPart = sorted.map((d) => DAY_SHORT_DE[d]).join(', ')
  return `${daysPart} · ${timeStart}–${timeEnd} Uhr (${slotMinutes} Min)`
}
