import type { Review } from '@/types'

export type GardenerRatingSummary = { average: number; count: number }

export function gardenerRatingSummaryFromReviews(reviews: Review[], profileId: string): GardenerRatingSummary | null {
  const list = reviews.filter((r) => r.profileId === profileId)
  if (list.length === 0) return null
  const sum = list.reduce((s, r) => s + r.rating, 0)
  return { average: sum / list.length, count: list.length }
}
