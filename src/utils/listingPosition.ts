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

/**
 * Builds a Google Maps search URL for a listing. Works for mock data, API payloads, and new posts:
 * 1) `location.lat` + `location.lng` when set (precise pin — use this from geocoding on create)
 * 2) else `location.address` (full street + city works best for real users)
 * 3) else legacy `x`/`y` % fallback inside Berlin–Brandenburg bounds
 */
export function getGoogleMapsUrlForListing(listing: Listing): string {
  const { location } = listing
  const addr = location.address?.trim()
  if (location.lat != null && location.lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${location.lat},${location.lng}`)}`
  }
  if (addr) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`
  }
  const { lat, lng } = getListingLatLng(listing)
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`
}
