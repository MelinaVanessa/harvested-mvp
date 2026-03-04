/**
 * Data service layer – P2P-ready.
 * Replace implementations with P2P/API calls later; keep this interface.
 */
import type { UserProfile, Listing, Reservation, Message } from '@/types'

export interface HarvestedService {
  getListings(): Promise<Listing[]>
  getListing(id: string): Promise<Listing | null>
  createListing(listing: Omit<Listing, 'id' | 'datePosted'>): Promise<Listing>
  updateListing(listing: Listing): Promise<Listing>
  deleteListing(id: string): Promise<void>

  getUser(id: string): Promise<UserProfile | null>
  getUsers(ids: string[]): Promise<Record<string, UserProfile>>
  updateUser(id: string, patch: Partial<UserProfile>): Promise<UserProfile>

  getReservations(userId: string): Promise<Reservation[]>
  createReservation(listingId: string, amount: number, userId: string): Promise<Reservation>
  cancelReservation(reservationId: string): Promise<void>

  getMessages(partnerId: string): Promise<Message[]>
  sendMessage(partnerId: string, text: string, senderId: string): Promise<Message>
}
