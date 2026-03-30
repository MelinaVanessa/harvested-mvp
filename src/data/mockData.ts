import type { UserProfile, Listing, Message } from '@/types'
import { formatPickupScheduleSummary, generateWeeklyPickupSlots } from '@/utils/pickupSlots'

const MOCK_SLOTS_L1 = generateWeeklyPickupSlots({
  weekdays: [1, 2, 3, 4, 5],
  timeStart: '17:00',
  timeEnd: '19:00',
  slotMinutes: 60,
  weeksAhead: 8,
})
const MOCK_SUMMARY_L1 = formatPickupScheduleSummary({
  weekdays: [1, 2, 3, 4, 5],
  timeStart: '17:00',
  timeEnd: '19:00',
  slotMinutes: 60,
})

const MOCK_SLOTS_L2 = generateWeeklyPickupSlots({
  weekdays: [0, 6],
  timeStart: '10:00',
  timeEnd: '14:00',
  slotMinutes: 60,
  weeksAhead: 8,
})
const MOCK_SUMMARY_L2 = formatPickupScheduleSummary({
  weekdays: [0, 6],
  timeStart: '10:00',
  timeEnd: '14:00',
  slotMinutes: 60,
})

const MOCK_SLOTS_L3 = generateWeeklyPickupSlots({
  weekdays: [1, 3, 5],
  timeStart: '12:00',
  timeEnd: '13:00',
  slotMinutes: 30,
  weeksAhead: 8,
})
const MOCK_SUMMARY_L3 = formatPickupScheduleSummary({
  weekdays: [1, 3, 5],
  timeStart: '12:00',
  timeEnd: '13:00',
  slotMinutes: 30,
})

export const INITIAL_USER: UserProfile = {
  id: 'u1',
  name: 'Melina Vanessa Mann',
  handle: '@anna_gärtnert',
  bio: 'Liebt frisches Gemüse und teilt gerne.',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
  role: 'gardener',
  isMember: true,
  following: ['u2'],
  likedListings: [],
  reservations: [],
}

export const MOCK_USERS: Record<string, UserProfile> = {
  u1: INITIAL_USER,
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

export const INITIAL_LISTINGS: Listing[] = [
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
    pickupTimes: MOCK_SUMMARY_L1,
    pickupSlots: MOCK_SLOTS_L1,
    location: {
      x: 42,
      y: 48,
      address: 'Bergmannstraße 5, 10961 Berlin',
      lat: 52.49267,
      lng: 13.38542,
    },
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
    pickupTimes: MOCK_SUMMARY_L2,
    pickupSlots: MOCK_SLOTS_L2,
    location: {
      x: 55,
      y: 22,
      address: 'Kollwitzstraße 87, 10435 Berlin',
      lat: 52.53845,
      lng: 13.41689,
    },
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
    pickupTimes: MOCK_SUMMARY_L3,
    pickupSlots: MOCK_SLOTS_L3,
    location: {
      x: 68,
      y: 52,
      address: 'Maybachufer 47, 12047 Berlin',
      lat: 52.49642,
      lng: 13.43138,
    },
    datePosted: '2023-10-03',
  },
]

export const INITIAL_MESSAGES: Record<string, Message[]> = {}
