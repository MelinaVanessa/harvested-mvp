// ==========================================
// Harvested MVP – Types (P2P-ready)
// ==========================================

export type UserRole = 'buyer' | 'gardener'

export interface UserProfile {
  id: string
  name: string
  handle: string
  bio: string
  avatar: string
  role: UserRole
  isMember: boolean
  following: string[]
  likedListings: string[]
  reservations?: Reservation[]
}

export interface Listing {
  id: string
  gardenerId: string
  title: string
  description: string
  image: string
  totalQuantity: number
  unit: string
  availableQuantity: number
  harvestType: 'pickup' | 'self_harvest'
  pickupTimes: string
  pickupSlots?: string[]
  location: { x: number; y: number; address: string; lat?: number; lng?: number }
  datePosted: string
}

export interface Reservation {
  id: string
  listingId: string
  amount: number
  timestamp: string
  status: 'active' | 'cancelled'
  pickupAt?: string
  reminderDayBeforeSent?: boolean
  reminderHourBeforeSent?: boolean
}

export interface Review {
  id: string
  reviewerId: string
  profileId: string
  rating: number
  text: string
  timestamp: string
}

export interface InAppNotification {
  id: string
  type: 'reservation' | 'new_post'
  title: string
  body: string
  timestamp: string
  read: boolean
}

export interface Message {
  id: string
  senderId: string
  text: string
  timestamp: string
}

// Theme & i18n (for UI only)
export type ThemeId = 'light' | 'dark'
export type Locale = 'de' | 'en'

export interface ThemeTokens {
  bg: string
  card: string
  text: string
  textSec: string
  border: string
  nav: string
  accent: string
  input: string
  mapFilterBg: string
  mapOverlayText: string
}
