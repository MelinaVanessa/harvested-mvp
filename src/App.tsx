import { useState, useEffect } from 'react'
import { Map as MapIcon, Home, PlusCircle, User, Heart, MessageCircle, Menu, Leaf, Settings, LogOut, HelpCircle } from 'lucide-react'
import { ErrorBoundary, NavButton } from '@/components'
import {
  LoginView,
  ChatView,
  InboxView,
  SettingsView,
  SupportView,
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
  registeredAccountsUserMap,
  storedAccountToUserProfile,
} from '@/constants/storage'
import { INITIAL_USER, MOCK_USERS, INITIAL_LISTINGS, INITIAL_MESSAGES } from '@/data'
import type { UserProfile, Listing, Reservation, Message } from '@/types'

type ActiveTab = 'home' | 'map' | 'add' | 'profile' | 'likes' | 'support' | 'settings'

const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '') ||
  'https://harvested-mvp.onrender.com'
const API_ENABLED = API_BASE_URL.length > 0
const OWNER_NAME = 'Melina Vanessa Mann'

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home')
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER)
  const [listings, setListings] = useState<Listing[]>(API_ENABLED ? [] : INITIAL_LISTINGS)
  const [users, setUsers] = useState<Record<string, UserProfile>>(() => ({
    ...MOCK_USERS,
    ...registeredAccountsUserMap(),
  }))
  const [feedType, setFeedType] = useState<'explore' | 'following'>('explore')
  const [filterType, setFilterType] = useState<'all' | 'pickup' | 'self_harvest'>('all')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null)
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null)
  const [showInbox, setShowInbox] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES)
  const [showSaveLoginModal, setShowSaveLoginModal] = useState(false)
  const [pendingSaveUserId, setPendingSaveUserId] = useState<string | null>(null)
  const [isShortLandscape, setIsShortLandscape] = useState(false)

  const theme = isDarkMode ? THEMES.dark : THEMES.light
  const t = TRANSLATIONS[language]
  const isAdmin = isLoggedIn && currentUser.id === 'u1' && currentUser.name === OWNER_NAME
  const currentUserWithRes = { ...currentUser, reservations }
  const showTopBar = isLoggedIn && !chatPartnerId && !viewingProfileId && !showInbox && activeTab !== 'support' && activeTab !== 'settings'
  const showBottomNav = isLoggedIn && !chatPartnerId && !viewingProfileId && !showInbox && activeTab !== 'support' && activeTab !== 'settings'

  useEffect(() => {
    const mergedUsers = { ...MOCK_USERS, ...registeredAccountsUserMap() }
    const saved = getSavedLogin()
    if (saved?.userId && mergedUsers[saved.userId]) {
      const base = mergedUsers[saved.userId]!
      const profilePatch = getSavedProfile(saved.userId)
      setCurrentUser(profilePatch ? { ...base, ...profilePatch } : base)
      setUsers((prev) => ({ ...mergedUsers, ...prev }))
      setIsLoggedIn(true)
    }
  }, [])

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
        const data = (await res.json()) as Listing[]
        if (!cancelled) setListings(Array.isArray(data) ? data : [])
      } catch (e) {
        console.error('Could not load listings from API', e)
      }
    }
    void loadListings()
    return () => {
      cancelled = true
    }
  }, [isLoggedIn])

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

  const handleReservation = (listingId: string, amount: number) => {
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
      },
      ...prev,
    ])
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

  const handleSendMessage = (partnerId: string, text: string) => {
    const newMessage: Message = {
      id: `m${Date.now()}`,
      senderId: currentUser.id,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages((prev) => ({ ...prev, [partnerId]: [...(prev[partnerId] ?? []), newMessage] }))
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
    }
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
          />
        )
      case 'support':
        return <SupportView onBack={() => setActiveTab('home')} theme={theme} t={t} />
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
            onLogout={() => setIsLoggedIn(false)}
            userRole={currentUser.role}
            onToggleRole={handleToggleRole}
          />
        )
      default:
        return null
    }
  }

  return (
    <div
      className={[
        'fixed inset-0 w-full h-[100dvh] font-sans overflow-hidden transition-colors duration-300',
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
            <LoginView
            onLogin={(userData) => {
              if (userData) {
                let nextUser: UserProfile
                if (userData.id === 'u1') {
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
                setPendingSaveUserId(nextUser.id)
                setShowSaveLoginModal(true)
              } else {
                setIsLoggedIn(true)
              }
            }}
            theme={theme}
            t={t}
          />
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

            <main
              id="scroll-container"
              className={[
                'flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide relative',
                showBottomNav
                  ? isShortLandscape
                    ? 'pb-[calc(52px+env(safe-area-inset-bottom,0px))]'
                    : 'pb-[calc(72px+env(safe-area-inset-bottom,0px))]'
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
                  isShortLandscape ? 'px-2 py-0.5 pb-safe' : 'px-2 pb-safe',
                ].join(' ')}
              >
                <div className={`${isShortLandscape ? 'h-[52px]' : 'h-[72px]'} flex justify-around items-center`}>
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
                    <button
                      onClick={() => { setShowMenu(false); setIsLoggedIn(false); clearSavedLogin(); }}
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
    </div>
  )
}
