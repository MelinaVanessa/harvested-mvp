import { useState, useEffect, useRef } from 'react'
import { Map as MapIcon, Home, PlusCircle, User, Heart, MessageCircle, Menu, Leaf, Settings, LogOut, HelpCircle, Bell } from 'lucide-react'
import { ErrorBoundary, NavButton } from '@/components'
import {
  LoginView,
  ChatView,
  InboxView,
  SettingsView,
  SupportView,
  LegalView,
  HomeView,
  AddListingView,
  LikesView,
  MapView,
  ProfileView,
} from '@/views'
import { THEMES, TRANSLATIONS } from '@/constants'
import {
  getSavedLogin,
  setSavedLogin,
  clearSavedLogin,
  getSavedProfile,
  setSavedProfile,
  findRegisteredAccountByUserId,
  mergeUsersFromStorage,
  storedAccountToUserProfile,
} from '@/constants/storage'
import { INITIAL_USER, MOCK_USERS, INITIAL_LISTINGS, INITIAL_MESSAGES } from '@/data'
import type { UserProfile, Listing, Reservation, Message, Review, InAppNotification } from '@/types'
import { ensureBrowserNotificationPermission, showBrowserNotification } from '@/utils/browserNotifications'

type ActiveTab =
  | 'home'
  | 'map'
  | 'add'
  | 'profile'
  | 'likes'
  | 'support'
  | 'settings'
  | 'legal_terms'
  | 'legal_privacy'
  | 'legal_imprint'

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '') ||
  'https://harvested-mvp.onrender.com'
const API_ENABLED = API_BASE_URL.length > 0
const OWNER_NAME = 'Melina Vanessa Mann'
const ADMIN_EMAIL = 'melina_vanessa.mann@web.de'
const LEGAL_ACK_KEY = 'harvested_legal_ack_v2'
const NAV_STATE_KEY = 'harvested_nav_state_v1'
const NOTIFICATION_PREFS_KEY = 'harvested_notification_prefs_v1'

type PersistedNavState = {
  activeTab: ActiveTab
  viewingProfileId: string | null
  chatPartnerId: string | null
  showInbox: boolean
}

type NotificationPrefs = {
  reservationConfirmed: boolean
  reservationReminders: boolean
  newPostsFromFollowing: boolean
}

const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  reservationConfirmed: true,
  reservationReminders: true,
  newPostsFromFollowing: true,
}

function readSavedNavState(): PersistedNavState | null {
  try {
    const raw = localStorage.getItem(NAV_STATE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersistedNavState>
    const validTabs: ActiveTab[] = [
      'home',
      'map',
      'add',
      'profile',
      'likes',
      'support',
      'settings',
      'legal_terms',
      'legal_privacy',
      'legal_imprint',
    ]
    const activeTab = validTabs.includes(parsed.activeTab as ActiveTab) ? (parsed.activeTab as ActiveTab) : 'home'
    return {
      activeTab,
      viewingProfileId: typeof parsed.viewingProfileId === 'string' ? parsed.viewingProfileId : null,
      chatPartnerId: typeof parsed.chatPartnerId === 'string' ? parsed.chatPartnerId : null,
      showInbox: Boolean(parsed.showInbox),
    }
  } catch {
    return null
  }
}

function clearSavedNavState() {
  try {
    localStorage.removeItem(NAV_STATE_KEY)
  } catch {
    // ignore
  }
}

function readSavedNotificationPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(NOTIFICATION_PREFS_KEY)
    if (!raw) return DEFAULT_NOTIFICATION_PREFS
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>
    return {
      reservationConfirmed:
        typeof parsed.reservationConfirmed === 'boolean'
          ? parsed.reservationConfirmed
          : DEFAULT_NOTIFICATION_PREFS.reservationConfirmed,
      reservationReminders:
        typeof parsed.reservationReminders === 'boolean'
          ? parsed.reservationReminders
          : DEFAULT_NOTIFICATION_PREFS.reservationReminders,
      newPostsFromFollowing:
        typeof parsed.newPostsFromFollowing === 'boolean'
          ? parsed.newPostsFromFollowing
          : DEFAULT_NOTIFICATION_PREFS.newPostsFromFollowing,
    }
  } catch {
    return DEFAULT_NOTIFICATION_PREFS
  }
}

/** API / older payloads may omit camelCase gardenerId */
function normalizeListingGardenerId(item: Listing): Listing {
  const row = item as unknown as Record<string, unknown>
  const g = row.gardenerId ?? row.gardener_id ?? row.userId ?? row.user_id
  if (g == null || g === '') return item
  const gardenerId = typeof g === 'string' ? g : String(g)
  return gardenerId === item.gardenerId ? item : { ...item, gardenerId }
}

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev1',
    reviewerId: 'u1',
    profileId: 'u2',
    rating: 5,
    text: 'Super freundlich und alles wie beschrieben.',
    timestamp: new Date('2026-01-15T09:30:00Z').toISOString(),
  },
  {
    id: 'rev2',
    reviewerId: 'u1',
    profileId: 'u3',
    rating: 4,
    text: 'Tolle Kürbisse, gerne wieder.',
    timestamp: new Date('2026-02-03T16:10:00Z').toISOString(),
  },
]

export default function App() {
  const initialNavRef = useRef<PersistedNavState | null>(readSavedNavState())
  const [hasAcceptedLegal, setHasAcceptedLegal] = useState<boolean>(() => {
    try {
      return localStorage.getItem(LEGAL_ACK_KEY) === '1'
    } catch {
      return false
    }
  })
  const [legalConfirmChecked, setLegalConfirmChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialNavRef.current?.activeTab ?? 'home')
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER)
  const [listings, setListings] = useState<Listing[]>(API_ENABLED ? [] : INITIAL_LISTINGS)
  const [users, setUsers] = useState<Record<string, UserProfile>>(() => mergeUsersFromStorage(MOCK_USERS, {}))
  const [feedType, setFeedType] = useState<'explore' | 'following'>('explore')
  const [filterType, setFilterType] = useState<'all' | 'pickup' | 'self_harvest'>('all')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(initialNavRef.current?.viewingProfileId ?? null)
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(initialNavRef.current?.chatPartnerId ?? null)
  const [showInbox, setShowInbox] = useState(initialNavRef.current?.showInbox ?? false)
  const [showMenu, setShowMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isAuthBootstrapping, setIsAuthBootstrapping] = useState(true)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES)
  const [showSaveLoginModal, setShowSaveLoginModal] = useState(false)
  const [pendingSaveUserId, setPendingSaveUserId] = useState<string | null>(null)
  const [isShortLandscape, setIsShortLandscape] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS)
  const [notifications, setNotifications] = useState<InAppNotification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPrefs>(() => readSavedNotificationPrefs())
  const previousListingIdsRef = useRef<Set<string>>(new Set())

  const theme = isDarkMode ? THEMES.dark : THEMES.light
  const t = TRANSLATIONS[language]
  const isAdmin = isLoggedIn && currentUser.id === 'u1' && currentUser.name === OWNER_NAME
  const currentUserWithRes = { ...currentUser, reservations }
  const isLegalTab = activeTab === 'legal_terms' || activeTab === 'legal_privacy' || activeTab === 'legal_imprint'
  const showTopBar =
    isLoggedIn && !chatPartnerId && !viewingProfileId && !showInbox && activeTab !== 'support' && activeTab !== 'settings' && !isLegalTab
  const showBottomNav =
    isLoggedIn && !chatPartnerId && !viewingProfileId && !showInbox && activeTab !== 'support' && activeTab !== 'settings' && !isLegalTab
  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const addNotification = (
    payload: Omit<InAppNotification, 'id' | 'timestamp' | 'read'>,
    preferenceKey: keyof NotificationPrefs,
  ) => {
    if (!notificationPrefs[preferenceKey]) return
    setNotifications((prev) => [
      {
        id: `n${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        timestamp: new Date().toISOString(),
        read: false,
        ...payload,
      },
      ...prev,
    ])
    void showBrowserNotification({
      title: payload.title,
      body: payload.body,
      tag: payload.type,
    })
  }

  useEffect(() => {
    let cancelled = false
    const restoreSavedLogin = async () => {
      const mergedUsers = mergeUsersFromStorage(MOCK_USERS, {})
      const saved = getSavedLogin()
      if (!saved?.userId) {
        if (!cancelled) setIsAuthBootstrapping(false)
        return
      }

      const profilePatch = getSavedProfile(saved.userId)
      const localBase = mergedUsers[saved.userId]
      if (localBase) {
        if (cancelled) return
        setCurrentUser(profilePatch ? { ...localBase, ...profilePatch } : localBase)
        setUsers((prev) => mergeUsersFromStorage(MOCK_USERS, prev))
        setIsLoggedIn(true)
        setIsAuthBootstrapping(false)
        return
      }

      if (!API_ENABLED) {
        clearSavedLogin()
        if (!cancelled) setIsAuthBootstrapping(false)
        return
      }

      const controller = new AbortController()
      const timeout = window.setTimeout(() => controller.abort(), 4000)
      try {
        const res = await fetch(`${API_BASE_URL}/api/users/${encodeURIComponent(saved.userId)}`, {
          headers: { Accept: 'application/json' },
          signal: controller.signal,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const remoteUser = (await res.json()) as UserProfile
        if (cancelled || !remoteUser?.id) return
        const next = profilePatch ? { ...remoteUser, ...profilePatch } : remoteUser
        setUsers((prev) => ({ ...mergeUsersFromStorage(MOCK_USERS, prev), [next.id]: next }))
        setCurrentUser(next)
        setIsLoggedIn(true)
      } catch {
        clearSavedLogin()
      } finally {
        window.clearTimeout(timeout)
        if (!cancelled) setIsAuthBootstrapping(false)
      }
    }

    void restoreSavedLogin()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (isLoggedIn) return
    setUsers((prev) => mergeUsersFromStorage(MOCK_USERS, prev))
  }, [isLoggedIn])

  useEffect(() => {
    if (!showNotifications) return
    setNotifications((prev) => prev.map((n) => (n.read ? n : { ...n, read: true })))
  }, [showNotifications])

  useEffect(() => {
    if (!isLoggedIn || !hasAcceptedLegal) return
    void ensureBrowserNotificationPermission()
  }, [isLoggedIn, hasAcceptedLegal])

  useEffect(() => {
    if (!isLoggedIn) return
    try {
      localStorage.setItem(
        NAV_STATE_KEY,
        JSON.stringify({
          activeTab,
          viewingProfileId,
          chatPartnerId,
          showInbox,
        } satisfies PersistedNavState),
      )
    } catch {
      // ignore storage errors
    }
  }, [isLoggedIn, activeTab, viewingProfileId, chatPartnerId, showInbox])

  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(notificationPrefs))
    } catch {
      // ignore storage errors
    }
  }, [notificationPrefs])

  useEffect(() => {
    const updateViewportFlags = () => {
      const shortLandscape = window.innerWidth >= 900 && window.innerHeight <= 700
      setIsShortLandscape(shortLandscape)
    }
    updateViewportFlags()
    window.addEventListener('resize', updateViewportFlags)
    return () => window.removeEventListener('resize', updateViewportFlags)
  }, [])

  useEffect(() => {
    if (!API_ENABLED) return
    let cancelled = false
    const loadListings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings`, { headers: { Accept: 'application/json' } })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const raw = (await res.json()) as unknown
        const arr = Array.isArray(raw) ? raw : []
        if (!cancelled) {
          setListings(
            arr
              .filter((x): x is Listing => Boolean(x) && typeof x === 'object' && 'id' in (x as object))
              .map((x) => normalizeListingGardenerId(x as Listing)),
          )
        }
      } catch (e) {
        console.error('Could not load listings from API', e)
      }
    }
    void loadListings()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

  useEffect(() => {
    const previousIds = previousListingIdsRef.current
    if (previousIds.size === 0) {
      previousListingIdsRef.current = new Set(listings.map((l) => l.id))
      return
    }

    const newListings = listings.filter((l) => !previousIds.has(l.id))
    if (newListings.length > 0) {
      newListings.forEach((listing) => {
        const isFromFollowedGardener = currentUser.following.includes(listing.gardenerId)
        const isOwnListing = listing.gardenerId === currentUser.id
        if (!isFromFollowedGardener || isOwnListing) return
        const gardenerName = users[listing.gardenerId]?.name ?? 'User'
        addNotification({
          type: 'new_post',
          title: t?.notifications?.newPostTitle ?? 'New post',
          body:
            (t?.notifications?.newPostBody ?? '{{name}} published "{{title}}".')
              .replace('{{name}}', gardenerName)
              .replace('{{title}}', listing.title),
        }, 'newPostsFromFollowing')
      })
    }
    previousListingIdsRef.current = new Set(listings.map((l) => l.id))
  }, [listings, currentUser.following, currentUser.id, t, users])

  const getGardener = (id: string) => users[id] ?? { name: 'Unbekannt', handle: '@unknown', avatar: '', id, bio: '', role: 'gardener', isMember: false, following: [], likedListings: [] }

  const toggleLike = (listingId: string) => {
    setCurrentUser((prev) => {
      const isLiked = prev.likedListings.includes(listingId)
      return {
        ...prev,
        likedListings: isLiked ? prev.likedListings.filter((id) => id !== listingId) : [...prev.likedListings, listingId],
      }
    })
  }

  const toggleFollow = (gardenerId: string) => {
    setCurrentUser((prev) => {
      const isFollowing = prev.following.includes(gardenerId)
      const newFollowing = isFollowing ? prev.following.filter((id) => id !== gardenerId) : [...prev.following, gardenerId]
      setUsers((prevUsers) => ({
        ...prevUsers,
        [prev.id]: { ...prevUsers[prev.id], following: newFollowing },
      }))
      return { ...prev, following: newFollowing }
    })
  }

  const handleToggleRole = () => {
    setCurrentUser((prev) => ({
      ...prev,
      role: prev.role === 'gardener' ? 'buyer' : 'gardener',
    }))
  }

  const handleReservation = (listingId: string, amount: number, pickupAt: string) => {
    const reservedListing = listings.find((l) => l.id === listingId)
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, availableQuantity: Math.max(0, l.availableQuantity - amount) } : l))
    )
    setReservations((prev) => [
      {
        id: `r${Date.now()}`,
        listingId,
        amount,
        timestamp: new Date().toISOString(),
        status: 'active',
        pickupAt,
        reminderDayBeforeSent: false,
        reminderHourBeforeSent: false,
      },
      ...prev,
    ])
    if (reservedListing) {
      addNotification({
        type: 'reservation',
        title: t?.notifications?.reserveTitle ?? 'Reservation successful',
        body:
          (t?.notifications?.reserveBody ?? 'You reserved {{amount}} {{unit}} of "{{title}}".')
            .replace('{{amount}}', String(amount))
            .replace('{{unit}}', reservedListing.unit)
            .replace('{{title}}', reservedListing.title),
      }, 'reservationConfirmed')
    }
    alert(`Erfolgreich ${amount} reserviert! Der Gärtner wurde benachrichtigt.`)
  }

  const handleCancelReservation = (reservationId: string) => {
    const res = reservations.find((r) => r.id === reservationId)
    if (!res) return
    setListings((prev) =>
      prev.map((l) => (l.id === res.listingId ? { ...l, availableQuantity: l.availableQuantity + res.amount } : l))
    )
    setReservations((prev) => prev.filter((r) => r.id !== reservationId))
    alert('Reservierung storniert.')
  }

  useEffect(() => {
    const evaluateReservationReminders = () => {
      const now = Date.now()
      setReservations((prev) => {
        let changed = false
        const next = prev.map((res) => {
          if (res.status !== 'active' || !res.pickupAt) return res
          const pickupMs = new Date(res.pickupAt).getTime()
          if (!Number.isFinite(pickupMs)) return res
          const diff = pickupMs - now
          const shouldSendDay = diff <= 24 * 60 * 60 * 1000 && diff > 23 * 60 * 60 * 1000
          const shouldSendHour = diff <= 60 * 60 * 1000 && diff > 55 * 60 * 1000

          let updated = res
          if (shouldSendDay && !res.reminderDayBeforeSent) {
            const listing = listings.find((l) => l.id === res.listingId)
            addNotification({
              type: 'reservation',
              title: language === 'de' ? 'Erinnerung: morgen abholen' : 'Reminder: pickup tomorrow',
              body:
                language === 'de'
                  ? `Deine Reservierung "${listing?.title ?? 'Angebot'}" ist morgen um ${new Date(res.pickupAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                  : `Your reservation "${listing?.title ?? 'listing'}" is tomorrow at ${new Date(res.pickupAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            }, 'reservationReminders')
            updated = { ...updated, reminderDayBeforeSent: true }
            changed = true
          }
          if (shouldSendHour && !updated.reminderHourBeforeSent) {
            const listing = listings.find((l) => l.id === res.listingId)
            addNotification({
              type: 'reservation',
              title: language === 'de' ? 'Erinnerung: in 1 Stunde' : 'Reminder: in 1 hour',
              body:
                language === 'de'
                  ? `Deine Reservierung "${listing?.title ?? 'Angebot'}" ist in etwa 1 Stunde.`
                  : `Your reservation "${listing?.title ?? 'listing'}" is in about 1 hour.`,
            }, 'reservationReminders')
            updated = { ...updated, reminderHourBeforeSent: true }
            changed = true
          }
          return updated
        })
        return changed ? next : prev
      })
    }

    evaluateReservationReminders()
    const timer = window.setInterval(evaluateReservationReminders, 60 * 1000)
    return () => window.clearInterval(timer)
  }, [listings, language])

  const handleCreateListing = async (newListing: Listing) => {
    if (API_ENABLED) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-User-Id': currentUser.id,
          },
          body: JSON.stringify(newListing),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const created = (await res.json()) as Listing
        setListings((prev) => [created, ...prev])
      } catch (e) {
        console.error('Could not create listing via API', e)
        alert(language === 'de' ? 'Angebot konnte nicht gespeichert werden.' : 'Could not save listing.')
        return
      }
    } else {
      setListings((prev) => [newListing, ...prev])
    }
    if (!currentUser.isMember) {
      setCurrentUser((prev) => ({ ...prev, isMember: true }))
      alert('Glückwunsch! Deine Mitgliedschaft ist jetzt kostenlos aktiv, da du etwas geteilt hast.')
    }
    setActiveTab('home')
    setFeedType('explore')
  }

  const handleUpdateProfile = (updatedProfile: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      const next = { ...prev, ...updatedProfile }
      setSavedProfile(prev.id, {
        avatar: next.avatar,
        name: next.name,
        bio: next.bio,
        handle: next.handle,
      })
      return next
    })
  }

  const handleAddReview = (profileId: string, rating: number, text: string) => {
    setReviews((prev) => {
      const existing = prev.find((r) => r.profileId === profileId && r.reviewerId === currentUser.id)
      if (existing) {
        return prev.map((r) =>
          r.id === existing.id
            ? {
                ...r,
                rating: Math.max(1, Math.min(5, Math.round(rating))),
                text,
                timestamp: new Date().toISOString(),
              }
            : r,
        )
      }
      return [
        {
          id: `rev${Date.now()}`,
          reviewerId: currentUser.id,
          profileId,
          rating: Math.max(1, Math.min(5, Math.round(rating))),
          text,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]
    })
  }

  const handleToggleCertification = (userId: string) => {
    if (!isAdmin) return
    setUsers((prev) => {
      const target = prev[userId]
      if (!target) return prev
      const nextTarget = { ...target, isMember: !target.isMember }
      return { ...prev, [userId]: nextTarget }
    })
  }

  const handleSendMessage = (partnerId: string, text: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => ({ ...prev, [partnerId]: [...(prev[partnerId] ?? []), newMessage] }))
  }

  const handleSendSupportMessage = (subject: string, text: string) => {
    const adminId = 'u1'
    const supportMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      text: `[Support: ${subject}] ${text}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => {
      const next: Record<string, Message[]> = {
        ...prev,
        [adminId]: [...(prev[adminId] ?? []), supportMessage],
      }
      if (currentUser.id !== adminId) {
        next[currentUser.id] = [...(prev[currentUser.id] ?? []), supportMessage]
      }
      return next
    })
  }

  const handleDeleteListing = async (id: string) => {
    if (confirm('Möchtest du diesen Beitrag wirklich löschen?')) {
      if (API_ENABLED) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/listings/${encodeURIComponent(id)}`, { method: 'DELETE' })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
        } catch (e) {
          console.error('Could not delete listing via API', e)
          alert(language === 'de' ? 'Löschen fehlgeschlagen.' : 'Delete failed.')
          return
        }
      }
      setListings((prev) => prev.filter((l) => l.id !== id))
    }
  }

  const handleUpdateListing = async (updatedListing: Listing) => {
    if (API_ENABLED) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/listings/${encodeURIComponent(updatedListing.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(updatedListing),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const saved = (await res.json()) as Listing
        setListings((prev) => prev.map((l) => (l.id === saved.id ? saved : l)))
        return
      } catch (e) {
        console.error('Could not update listing via API', e)
        alert(language === 'de' ? 'Speichern fehlgeschlagen.' : 'Save failed.')
        return
      }
    }
    setListings((prev) => prev.map((l) => (l.id === updatedListing.id ? updatedListing : l)))
  }

  const openProfile = (userId: string) => {
    if (userId === currentUser.id) {
      setActiveTab('profile')
      setViewingProfileId(null)
    } else {
      setViewingProfileId(userId)
    }
  }

  const handleMenuClick = (item: string) => {
    setShowMenu(false)
    if (item === 'support') {
      setActiveTab('support')
      setViewingProfileId(null)
      setChatPartnerId(null)
      setShowInbox(false)
    } else if (item === 'settings') {
      setActiveTab('settings')
      setViewingProfileId(null)
      setChatPartnerId(null)
      setShowInbox(false)
    } else if (item === 'legal_terms') {
      setActiveTab('legal_terms')
      setViewingProfileId(null)
      setChatPartnerId(null)
      setShowInbox(false)
    } else if (item === 'legal_privacy') {
      setActiveTab('legal_privacy')
      setViewingProfileId(null)
      setChatPartnerId(null)
      setShowInbox(false)
    } else if (item === 'legal_imprint') {
      setActiveTab('legal_imprint')
      setViewingProfileId(null)
      setChatPartnerId(null)
      setShowInbox(false)
    }
  }

  const handleAcceptLegal = () => {
    try {
      localStorage.setItem(LEGAL_ACK_KEY, '1')
    } catch {
      // ignore storage errors; still let user continue in current session
    }
    setHasAcceptedLegal(true)
  }

  const renderContent = () => {
    if (chatPartnerId)
      return (
        <ChatView
          partner={users[chatPartnerId]}
          messages={messages[chatPartnerId] ?? []}
          currentUserId={currentUser.id}
          onSend={(text) => handleSendMessage(chatPartnerId, text)}
          onBack={() => setChatPartnerId(null)}
          theme={theme}
        />
      )
    if (showInbox)
      return (
        <InboxView
          users={users}
          messages={messages}
          onSelectChat={(id) => {
            setChatPartnerId(id)
            setShowInbox(false)
          }}
          onBack={() => setShowInbox(false)}
          theme={theme}
        />
      )
    if (viewingProfileId)
      return (
        <ProfileView
          user={users[viewingProfileId]}
          isOwnProfile={false}
          listings={listings}
          users={users}
          onUpdateProfile={() => {}}
          onBack={() => setViewingProfileId(null)}
          onChat={() => setChatPartnerId(viewingProfileId)}
          currentUser={currentUser}
          onFollow={toggleFollow}
          onDeleteListing={() => {}}
          onUpdateListing={() => {}}
          onUserClick={openProfile}
          onReserve={handleReservation}
          reviews={reviews}
          onAddReview={handleAddReview}
          isAdmin={isAdmin}
          onToggleCertification={handleToggleCertification}
          theme={theme}
          t={t}
        />
      )

    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            listings={listings}
            feedType={feedType}
            setFeedType={setFeedType}
            currentUser={currentUser}
            toggleLike={toggleLike}
            toggleFollow={toggleFollow}
            getGardener={getGardener}
            filterType={filterType}
            setFilterType={setFilterType}
            handleReservation={handleReservation}
            onAdminDelete={handleDeleteListing}
            isAdmin={isAdmin}
            onUserClick={openProfile}
            theme={theme}
            t={t}
          />
        )
      case 'map':
        return (
          <MapView
            listings={listings}
            filterType={filterType}
            setFilterType={setFilterType}
            handleReservation={handleReservation}
            getGardener={getGardener}
            onUserClick={openProfile}
            setActiveTab={setActiveTab}
            currentUser={currentUser}
            toggleLike={toggleLike}
            toggleFollow={toggleFollow}
            onAdminDelete={handleDeleteListing}
            isAdmin={isAdmin}
            onToggleMenu={() => setShowMenu(true)}
            theme={theme}
            t={t}
          />
        )
      case 'add':
        return <AddListingView onAdd={handleCreateListing} currentUser={currentUser} theme={theme} t={t} />
      case 'likes':
        return (
          <LikesView
            listings={listings}
            currentUser={currentUser}
            toggleLike={toggleLike}
            toggleFollow={toggleFollow}
            getGardener={getGardener}
            handleReservation={handleReservation}
            onAdminDelete={handleDeleteListing}
            isAdmin={isAdmin}
            onUserClick={openProfile}
            theme={theme}
            t={t}
          />
        )
      case 'profile':
        return (
          <ProfileView
            user={currentUserWithRes}
            isOwnProfile
            listings={listings}
            users={users}
            onUpdateProfile={handleUpdateProfile}
            currentUser={currentUser}
            onDeleteListing={handleDeleteListing}
            onUpdateListing={handleUpdateListing}
            onSettings={() => setActiveTab('settings')}
            onUserClick={openProfile}
            theme={theme}
            t={t}
            onCancelReservation={handleCancelReservation}
            onFollow={toggleFollow}
            reviews={reviews}
            isAdmin={isAdmin}
            onToggleCertification={handleToggleCertification}
          />
        )
      case 'support':
        return (
          <SupportView
            onBack={() => setActiveTab('home')}
            theme={theme}
            t={t}
            adminEmail={ADMIN_EMAIL}
            onSendSupport={handleSendSupportMessage}
          />
        )
      case 'settings':
        return (
          <SettingsView
            onBack={() => setActiveTab('profile')}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            language={language}
            setLanguage={setLanguage}
            theme={theme}
            t={t}
            onLogout={() => { setIsLoggedIn(false); clearSavedLogin(); clearSavedNavState() }}
            userRole={currentUser.role}
            onToggleRole={handleToggleRole}
            notificationPrefs={notificationPrefs}
            setNotificationPrefs={setNotificationPrefs}
          />
        )
      case 'legal_terms':
        return <LegalView kind="terms" language={language} onBack={() => setActiveTab('home')} theme={theme} />
      case 'legal_privacy':
        return <LegalView kind="privacy" language={language} onBack={() => setActiveTab('home')} theme={theme} />
      case 'legal_imprint':
        return <LegalView kind="imprint" language={language} onBack={() => setActiveTab('home')} theme={theme} />
      default:
        return null
    }
  }

  if (isAuthBootstrapping) {
    return <div className={`fixed inset-0 w-full h-[100svh] ${theme.bg}`} />
  }

  return (
    <div
      className={[
        'fixed inset-0 w-full h-[100svh] font-sans overflow-hidden transition-colors duration-300',
        theme.bg,
      ].join(' ')}
    >
      <div
        className={[
          'relative flex flex-col w-full h-full min-h-0 min-w-0 overflow-hidden',
        ].join(' ')}
      >
        

        {!isLoggedIn ? (
          <div className="flex-1 min-h-0 flex flex-col w-full">
            {isLegalTab ? (
              <LegalView
                kind={activeTab === 'legal_terms' ? 'terms' : activeTab === 'legal_privacy' ? 'privacy' : 'imprint'}
                language={language}
                onBack={() => setActiveTab('home')}
                theme={theme}
              />
            ) : (
              <LoginView
              onLogin={(userData) => {
                if (userData) {
                  let nextUser: UserProfile
                  if (userData.profile) {
                    const base = userData.profile
                    const profilePatch = getSavedProfile(base.id)
                    nextUser = profilePatch ? { ...base, ...profilePatch } : base
                  } else if (userData.id === 'u1') {
                    const base = MOCK_USERS.u1
                    const profilePatch = getSavedProfile('u1')
                    nextUser = profilePatch ? { ...base, ...profilePatch } : base
                  } else {
                    const acc = findRegisteredAccountByUserId(userData.id)
                    const base = acc
                      ? storedAccountToUserProfile(acc)
                      : users[userData.id] ?? {
                          id: userData.id,
                          name: userData.name,
                          handle: `@user_${userData.id}`,
                          bio: '',
                          avatar:
                            'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png',
                          role: userData.role,
                          isMember: userData.role === 'gardener',
                          following: [],
                          likedListings: [],
                        }
                    const profilePatch = getSavedProfile(userData.id)
                    nextUser = profilePatch ? { ...base, ...profilePatch } : base
                  }
                  setUsers((prev) => ({ ...prev, [nextUser.id]: nextUser }))
                  setCurrentUser(nextUser)
                  setIsLoggedIn(true)
                  // Persist login by default so page refresh does not log users out.
                  setSavedLogin(nextUser.id)
                  setPendingSaveUserId(null)
                  setShowSaveLoginModal(false)
                } else {
                  setIsLoggedIn(true)
                }
              }}
              theme={theme}
              t={t}
            />
            )}
          </div>
        ) : (
          <div className="flex-1 min-h-0 flex flex-col min-w-0">
          <>
            {showSaveLoginModal && (
              <div className="absolute inset-0 z-[70] flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/40" onClick={() => { setShowSaveLoginModal(false); setPendingSaveUserId(null); clearSavedLogin(); }} />
                <div className={`relative w-full max-w-xs rounded-xl shadow-xl p-5 ${theme.card} border ${theme.border} animate-in zoom-in-95 fade-in duration-200`}>
                  <p className={`text-sm ${theme.text} text-center mb-4`}>
                    {language === 'de'
                      ? 'Möchtest du angemeldet bleiben? Deine Anmeldedaten werden dann auf diesem Gerät gespeichert.'
                      : 'Do you want to stay logged in? Your login will be saved on this device.'}
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (pendingSaveUserId) setSavedLogin(pendingSaveUserId)
                        setShowSaveLoginModal(false)
                        setPendingSaveUserId(null)
                      }}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white bg-[#4A5D4E] hover:opacity-90 transition-opacity"
                    >
                      {language === 'de' ? 'Ja, speichern' : 'Yes, save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        clearSavedLogin()
                        setShowSaveLoginModal(false)
                        setPendingSaveUserId(null)
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border ${theme.border} ${theme.text} hover:opacity-80 transition-opacity`}
                    >
                      {language === 'de' ? 'Nein, danke' : 'No, thanks'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {showTopBar && (
              <div className={`${theme.bg}/95 backdrop-blur-sm border-b ${theme.border} z-40 shrink-0 transition-colors duration-300`}>
                <div className={`w-full px-4 ${isShortLandscape ? 'py-1.5' : 'py-3'} flex justify-between items-center`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowMenu(true)}
                      className={`${isShortLandscape ? 'p-1.5 -m-1.5' : 'p-2 -m-2'} rounded-lg hover:bg-black/5 ${isDarkMode ? 'hover:bg-white/10' : ''} ${theme.text}`}
                      aria-label="Open menu"
                    >
                      <Menu size={isShortLandscape ? 21 : 24} />
                    </button>
                    <h1 className={`${isShortLandscape ? 'text-base' : 'text-xl'} font-bold tracking-tight ${theme.text}`}>Harvested</h1>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowNotifications((prev) => !prev)}
                      className={`relative ${isShortLandscape ? 'p-1.5 -m-1.5' : 'p-2 -m-2'} rounded-lg hover:bg-black/5 ${isDarkMode ? 'hover:bg-white/10' : ''} ${theme.text}`}
                      aria-label="Open notifications"
                    >
                      <Bell size={isShortLandscape ? 21 : 24} />
                      {unreadNotificationsCount > 0 && (
                        <div className={`absolute top-0 right-0 min-w-4 h-4 px-1 bg-[#C29901] text-[#0D1A15] text-[10px] font-bold rounded-full flex items-center justify-center border ${isDarkMode ? 'border-[#0D1A15]' : 'border-[#FCFAF7]'}`}>
                          {Math.min(unreadNotificationsCount, 9)}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setShowInbox(true)}
                      className={`relative ${isShortLandscape ? 'p-1.5 -m-1.5' : 'p-2 -m-2'} rounded-lg hover:bg-black/5 ${isDarkMode ? 'hover:bg-white/10' : ''} ${theme.text}`}
                      aria-label="Open inbox"
                    >
                      <MessageCircle size={isShortLandscape ? 21 : 24} />
                      {Object.keys(messages).length > 0 && (
                        <div className={`absolute top-0 right-0 w-2.5 h-2.5 bg-[#C29901] rounded-full border-2 ${isDarkMode ? 'border-[#0D1A15]' : 'border-[#FCFAF7]'}`} />
                      )}
                    </button>
                    <div className={`${isShortLandscape ? 'w-7 h-7' : 'w-8 h-8'} rounded-full overflow-hidden border ${theme.border} cursor-pointer`} onClick={() => setActiveTab('profile')}>
                      <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showNotifications && (
              <div className="absolute inset-0 z-[115]" onClick={() => setShowNotifications(false)}>
                <div
                  className={`absolute right-3 top-14 w-[min(360px,calc(100vw-1.5rem))] max-h-[65vh] overflow-y-auto rounded-2xl border ${theme.border} ${theme.card} shadow-2xl p-3`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className={`text-sm font-bold mb-2 ${theme.text}`}>{t?.notifications?.title ?? 'Notifications'}</h3>
                  {notifications.length === 0 ? (
                    <p className={`text-xs ${theme.textSec}`}>{t?.notifications?.empty ?? 'No notifications yet.'}</p>
                  ) : (
                    <div className="space-y-2">
                      {notifications.map((n) => (
                        <div key={n.id} className={`rounded-lg border ${theme.border} p-2 ${n.read ? '' : 'ring-1 ring-[#C29901]/40'}`}>
                          <p className={`text-xs font-semibold ${theme.text}`}>{n.title}</p>
                          <p className={`text-xs ${theme.textSec} mt-0.5`}>{n.body}</p>
                          <p className={`text-[10px] ${theme.textSec} mt-1 opacity-80`}>
                            {new Date(n.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <main
              id="scroll-container"
              className={[
                'flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide relative',
                showBottomNav
                  ? isShortLandscape
                    ? 'pb-[calc(40px+env(safe-area-inset-bottom,0px))]'
                    : 'pb-[calc(48px+env(safe-area-inset-bottom,0px))]'
                  : 'pb-safe',
              ].join(' ')}
            >
              <ErrorBoundary>
                {renderContent()}
              </ErrorBoundary>
            </main>

            {showBottomNav && (
              <nav
                className={[
                  'absolute bottom-0 left-0 right-0 z-[200]',
                  `${theme.nav} border-t ${theme.border} transition-colors duration-300`,
                  'px-2 pb-safe',
                ].join(' ')}
              >
                <div className={`${isShortLandscape ? 'h-[40px]' : 'h-[48px]'} flex justify-around items-center`}>
                <NavButton active={activeTab === 'map'} onClick={() => setActiveTab('map')} icon={<MapIcon size={24} />} label={t.nav.map} theme={theme} compact={isShortLandscape} />
                <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Home size={24} />} label={t.nav.home} theme={theme} compact={isShortLandscape} />
                {currentUser.role === 'gardener' && (
                  <NavButton active={activeTab === 'add'} onClick={() => setActiveTab('add')} icon={<PlusCircle size={24} />} label={t.nav.add} theme={theme} compact={isShortLandscape} />
                )}
                <NavButton active={activeTab === 'likes'} onClick={() => setActiveTab('likes')} icon={<Heart size={24} />} label={t.nav.likes} theme={theme} compact={isShortLandscape} />
                <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={24} />} label={t.nav.profile} theme={theme} compact={isShortLandscape} />
                </div>
              </nav>
            )}

            {showMenu && (
              <div className="absolute inset-0 z-[120] flex">
                <div className="absolute inset-0 bg-black/50 animate-in fade-in" onClick={() => setShowMenu(false)} />
                <div
                  className={[
                    'relative h-full shadow-2xl flex flex-col',
                    'w-[min(300px,82vw)]',
                    'p-5',
                    `${theme.bg}`,
                    'animate-in slide-in-from-left duration-300',
                  ].join(' ')}
                >
                  <div className="mb-6 flex items-center gap-2">
                    <Leaf className="text-[#4A5D4E]" size={28} />
                    <span className={`text-2xl font-bold ${theme.text}`}>Harvested</span>
                  </div>
                  <div className="space-y-4 flex-1">
                    <button
                      onClick={() => handleMenuClick('support')}
                      className={`flex items-center gap-3 ${theme.text} font-semibold px-3 h-11 hover:bg-gray-100/10 rounded-lg w-full text-left`}
                    >
                      <HelpCircle size={20} /> {t.support.title}
                    </button>
                    <button
                      onClick={() => handleMenuClick('settings')}
                      className={`flex items-center gap-3 ${theme.text} font-semibold px-3 h-11 hover:bg-gray-100/10 rounded-lg w-full text-left`}
                    >
                      <Settings size={20} /> {t.settings.title}
                    </button>
                  </div>
                  <div className={`pt-4 border-t ${theme.border} space-y-4`}>
                    <div className="space-y-1">
                      <button
                        onClick={() => handleMenuClick('legal_terms')}
                        className={`flex items-center gap-2 ${theme.textSec} font-medium text-xs px-3 h-7 hover:bg-gray-100/10 rounded-lg w-full text-left opacity-85`}
                      >
                        <Leaf size={14} /> {t.legal.terms}
                      </button>
                      <button
                        onClick={() => handleMenuClick('legal_privacy')}
                        className={`flex items-center gap-2 ${theme.textSec} font-medium text-xs px-3 h-7 hover:bg-gray-100/10 rounded-lg w-full text-left opacity-85`}
                      >
                        <Leaf size={14} /> {t.legal.privacy}
                      </button>
                      <button
                        onClick={() => handleMenuClick('legal_imprint')}
                        className={`flex items-center gap-2 ${theme.textSec} font-medium text-xs px-3 h-7 hover:bg-gray-100/10 rounded-lg w-full text-left opacity-85`}
                      >
                        <Leaf size={14} /> {t.legal.imprint}
                      </button>
                    </div>
                    <button
                      onClick={() => { setShowMenu(false); setIsLoggedIn(false); clearSavedLogin(); clearSavedNavState() }}
                      className="flex items-center gap-3 text-red-500 font-semibold px-3 h-11 hover:bg-red-50 rounded-lg w-full text-left transition-colors"
                    >
                      <LogOut size={20} /> {t.settings?.logout ?? 'Abmelden'}
                    </button>
                    <p className={`text-xs ${theme.textSec} text-center`}>Version 1.0.3</p>
                  </div>
                </div>
              </div>
            )}
          </>
          </div>
        )}
      </div>

      {!hasAcceptedLegal && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" />
          <div className={`relative w-full max-w-md rounded-2xl border ${theme.border} ${theme.card} shadow-2xl p-5`}>
            <h3 className={`text-lg font-bold ${theme.text}`}>{t.legalConsent?.title ?? 'Legal Notice'}</h3>
            <p className={`text-sm mt-2 ${theme.textSec}`}>
              {t.legalConsent?.text ??
                'Please confirm that you have read the legal notices (Terms, Privacy Policy, Imprint).'}
            </p>

            <div className={`mt-4 text-xs ${theme.textSec} flex flex-wrap gap-2`}>
              <button
                type="button"
                onClick={() => setActiveTab('legal_terms')}
                className={`px-2.5 py-1 rounded-md border ${theme.border} hover:bg-black/5`}
              >
                {t.legal?.terms ?? 'Terms'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('legal_privacy')}
                className={`px-2.5 py-1 rounded-md border ${theme.border} hover:bg-black/5`}
              >
                {t.legal?.privacy ?? 'Privacy'}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('legal_imprint')}
                className={`px-2.5 py-1 rounded-md border ${theme.border} hover:bg-black/5`}
              >
                {t.legal?.imprint ?? 'Imprint'}
              </button>
            </div>

            <label className={`mt-4 flex items-start gap-2 text-sm ${theme.text}`}>
              <input
                type="checkbox"
                checked={legalConfirmChecked}
                onChange={(e) => setLegalConfirmChecked(e.target.checked)}
                className="mt-0.5 accent-[#4A5D4E]"
              />
              <span>{t.legalConsent?.confirm ?? 'I have read and accept these notices'}</span>
            </label>

            <button
              type="button"
              onClick={handleAcceptLegal}
              disabled={!legalConfirmChecked}
              className="mt-5 w-full h-11 rounded-xl bg-[#0D1A15] text-[#FCFAF7] font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {t.legalConsent?.continue ?? 'Continue'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
