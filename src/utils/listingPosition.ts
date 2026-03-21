import type { Listing } from '@/types'

/** Rough Berlin–Brandenburg bounds when only legacy x/y (%) are set */
const FALLBACK_BOUNDS = {
  north: 52.65,
  south: 52.42,
  east: 13.75,
  west: 13.1,
}

export function getListingLatLng(listing: Listing): { lat: number; lng: number } {
  const { location } = listing
  if (location.lat != null && location.lng != null) {
    return { lat: location.lat, lng: location.lng }
  }
  const { x, y } = location
  const lng = FALLBACK_BOUNDS.west + (x / 100) * (FALLBACK_BOUNDS.east - FALLBACK_BOUNDS.west)
  const lat = FALLBACK_BOUNDS.north - (y / 100) * (FALLBACK_BOUNDS.north - FALLBACK_BOUNDS.south)
  return { lat, lng }
}
