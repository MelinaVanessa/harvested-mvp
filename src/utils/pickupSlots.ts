/** Build concrete ISO pickup instants from weekday + time-window rules (local timezone). */

const DAY_SHORT_DE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']

export type WeeklyPickupSchedule = {
  /** 0 = Sunday … 6 = Saturday (JavaScript Date#getDay) */
  weekdays: number[]
  /** "HH:mm" */
  timeStart: string
  /** "HH:mm", must be after timeStart same day */
  timeEnd: string
  slotMinutes: 30 | 60
  /** How many weeks ahead to emit slots */
  weeksAhead: number
  /** Ignore slots earlier than now + this many minutes */
  minLeadMinutes?: number
}

function parseHm(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim())
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (!Number.isFinite(h) || !Number.isFinite(min) || h > 23 || min > 59) return null
  return h * 60 + min
}

/** Sorted unique ISO strings in the future (local wall-clock slots). */
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

const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0] as const

export function formatPickupScheduleSummary(schedule: Pick<WeeklyPickupSchedule, 'weekdays' | 'timeStart' | 'timeEnd' | 'slotMinutes'>): string {
  const { weekdays, timeStart, timeEnd, slotMinutes } = schedule
  const sorted = [...new Set(weekdays)]
    .filter((d) => d >= 0 && d <= 6)
    .sort((a, b) => WEEKDAY_ORDER.indexOf(a as 0 | 1 | 2 | 3 | 4 | 5 | 6) - WEEKDAY_ORDER.indexOf(b as 0 | 1 | 2 | 3 | 4 | 5 | 6))
  const daysPart = sorted.map((d) => DAY_SHORT_DE[d]).join(', ')
  return `${daysPart} · ${timeStart}–${timeEnd} Uhr (${slotMinutes} Min)`
}
