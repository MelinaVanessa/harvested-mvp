/**
 * In-memory store – same seed data as frontend mockData.
 */
import type { UserProfile, Listing, Message, Reservation } from './types.js'

export const users: Record<string, UserProfile> = {
  u1: {
    id: 'u1',
    name: 'Melina Vanessa Mann',
    handle: '@anna_gärtnert',
    bio: 'Liebt frisches Gemüse und teilt gerne.',
    avatar: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
    role: 'gardener',
    isMember: true,
    following: ['u2'],
    likedListings: [],
  },
  u2: {
    id: 'u2',
    name: 'Karls Kleingarten',
    handle: '@karl_garten',
    bio: 'Alter Baumbestand, beste Äpfel der Stadt.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    role: 'gardener',
    isMember: true,
    following: [],
    likedListings: [],
  },
  u3: {
    id: 'u3',
    name: 'Lisa Green',
    handle: '@lisa_veggie',
    bio: 'Kürbis-Fanatikerin.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    role: 'gardener',
    isMember: true,
    following: [],
    likedListings: [],
  },
}

export const listings: Listing[] = [
  {
    id: 'l1',
    gardenerId: 'u2',
    title: 'Boskoop Äpfel',
    description: 'Säuerlich und perfekt für Apfelkuchen. Bio-Qualität aus dem alten Garten.',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=1000',
    totalQuantity: 10,
    unit: 'kg',
    availableQuantity: 8.5,
    harvestType: 'pickup',
    pickupTimes: 'Mo-Fr ab 17 Uhr',
    location: { x: 30, y: 40, address: 'Gartenweg 3', lat: 52.5412, lng: 13.3944 },
    datePosted: '2023-10-01',
  },
  {
    id: 'l2',
    gardenerId: 'u3',
    title: 'Hokkaido Kürbisse',
    description: 'Klein aber fein. Können direkt vom Feld geholt werden. Gummistiefel mitbringen!',
    image: 'https://images.pexels.com/photos/1486976/pexels-photo-1486976.jpeg?auto=compress&cs=tinysrgb&w=1000',
    totalQuantity: 20,
    unit: 'Stück',
    availableQuantity: 12,
    harvestType: 'self_harvest',
    pickupTimes: 'Wochenende ganztägig',
    location: { x: 60, y: 25, address: 'Am Feldrain 9', lat: 52.5583, lng: 13.4517 },
    datePosted: '2023-10-02',
  },
  {
    id: 'l3',
    gardenerId: 'u2',
    title: 'Frischer Rosmarin',
    description: 'Ich habe einfach zu viel davon. Bitte nehmt so viel ihr wollt.',
    image: 'https://images.pexels.com/photos/365064/pexels-photo-365064.jpeg?auto=compress&cs=tinysrgb&w=1000',
    totalQuantity: 50,
    unit: 'Bund',
    availableQuantity: 50,
    harvestType: 'pickup',
    pickupTimes: 'Jederzeit an der Pforte',
    location: { x: 35, y: 45, address: 'Gartenweg 3', lat: 52.5341, lng: 13.4285 },
    datePosted: '2023-10-03',
  },
]

/** conversationKey(a,b) === conversationKey(b,a) */
export function conversationKey(a: string, b: string): string {
  return [a, b].sort().join('-')
}

/** partnerId -> messages (legacy shape); we also keep a flat list by conversation for API */
export const messagesByConversation: Record<string, Message[]> = {
  'u1-u2': [
    { id: 'm1', senderId: 'u2', text: 'Hallo Anna! Wann möchtest du die Äpfel holen?', timestamp: '10:00' },
  ],
}

export const reservations: Reservation[] = []
