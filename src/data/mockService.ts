/**
 * In-memory mock implementation of HarvestedService.
 * Swap for P2P/API implementation later.
 */
import type { UserProfile, Listing, Reservation, Message } from '@/types'
import type { HarvestedService } from './harvestedService'
import { MOCK_USERS, INITIAL_LISTINGS, INITIAL_MESSAGES } from './mockData'

// Mutable in-memory state (per session)
let listings = [...INITIAL_LISTINGS]
const users = { ...MOCK_USERS }
const messages: Record<string, Message[]> = { ...INITIAL_MESSAGES }
const reservations: Reservation[] = []

export const mockService: HarvestedService = {
  async getListings() {
    return [...listings]
  },

  async getListing(id: string) {
    return listings.find((l) => l.id === id) ?? null
  },

  async createListing(data) {
    const listing: Listing = {
      ...data,
      id: `l${Date.now()}`,
      datePosted: new Date().toISOString(),
    }
    listings = [listing, ...listings]
    return listing
  },

  async updateListing(listing) {
    listings = listings.map((l) => (l.id === listing.id ? listing : l))
    return listing
  },

  async deleteListing(id: string) {
    listings = listings.filter((l) => l.id !== id)
  },

  async getUser(id: string) {
    return users[id] ?? null
  },

  async getUsers(ids: string[]) {
    const out: Record<string, UserProfile> = {}
    for (const id of ids) {
      if (users[id]) out[id] = users[id]
    }
    return out
  },

  async updateUser(id: string, patch: Partial<UserProfile>) {
    if (!users[id]) throw new Error('User not found')
    users[id] = { ...users[id], ...patch }
    return users[id]
  },

  async getReservations() {
    return [...reservations]
  },

  async createReservation(listingId: string, amount: number) {
    const listing = listings.find((l) => l.id === listingId)
    if (!listing) throw new Error('Listing not found')
    const newRes: Reservation = {
      id: `r${Date.now()}`,
      listingId,
      amount,
      timestamp: new Date().toISOString(),
      status: 'active',
    }
    reservations.push(newRes)
    listing.availableQuantity = Math.max(0, listing.availableQuantity - amount)
    return newRes
  },

  async cancelReservation(reservationId: string) {
    const res = reservations.find((r) => r.id === reservationId)
    if (!res) return
    const listing = listings.find((l) => l.id === res.listingId)
    if (listing) listing.availableQuantity += res.amount
    const idx = reservations.findIndex((r) => r.id === reservationId)
    if (idx !== -1) reservations.splice(idx, 1)
  },

  async getMessages(partnerId: string) {
    return [...(messages[partnerId] ?? [])]
  },

  async sendMessage(partnerId: string, text: string, senderId: string) {
    const msg: Message = {
      id: `m${Date.now()}`,
      senderId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    if (!messages[partnerId]) messages[partnerId] = []
    messages[partnerId].push(msg)
    return msg
  },
}
