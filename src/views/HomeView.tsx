import { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { FilterChip } from '@/components/FilterChip'
import { ListingCard } from '@/components/ListingCard'
import { ListingDetailModal } from '@/components/ListingDetailModal'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

interface HomeViewProps {
  listings: Listing[]
  feedType: 'explore' | 'following'
  setFeedType: (v: 'explore' | 'following') => void
  currentUser: UserProfile
  toggleLike: (listingId: string) => void
  toggleFollow: (gardenerId: string) => void
  getGardener: (id: string) => UserProfile
  filterType: 'all' | 'pickup' | 'self_harvest'
  setFilterType: (v: 'all' | 'pickup' | 'self_harvest') => void
  handleReservation: (listingId: string, amount: number) => void
  onAdminDelete: (listingId: string) => void
  isAdmin: boolean
  onUserClick: (userId: string) => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
}

export function HomeView({
  listings,
  feedType,
  setFeedType,
  currentUser,
  toggleLike,
  toggleFollow,
  getGardener,
  filterType,
  setFilterType,
  handleReservation,
  onAdminDelete,
  isAdmin,
  onUserClick,
  theme,
  t,
}: HomeViewProps) {
  const [detailListing, setDetailListing] = useState<Listing | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearch, setShowSearch] = useState(true)
  const [isShortLandscape, setIsShortLandscape] = useState(false)
  const lastScrollY = useRef(0)

  useEffect(() => {
    const updateViewportFlags = () => {
      setIsShortLandscape(window.innerWidth >= 900 && window.innerHeight <= 700)
    }
    updateViewportFlags()
    window.addEventListener('resize', updateViewportFlags)
    return () => window.removeEventListener('resize', updateViewportFlags)
  }, [])

  useEffect(() => {
    const scrollContainer = document.querySelector('#scroll-container')
    if (!scrollContainer) return
    const handleScroll = () => {
      const currentY = scrollContainer.scrollTop
      const delta = currentY - lastScrollY.current
      if (currentY < 10) setShowSearch(true)
      else if (delta > 10) setShowSearch(false)
      else if (delta < -10) setShowSearch(true)
      lastScrollY.current = currentY
    }
    scrollContainer.addEventListener('scroll', handleScroll)
    return () => scrollContainer.removeEventListener('scroll', handleScroll)
  }, [])

  const filteredListings = listings.filter((l) => {
    if (feedType === 'following' && !currentUser.following.includes(l.gardenerId)) return false
    if (filterType !== 'all' && l.harvestType !== filterType) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      if (!l.title.toLowerCase().includes(term) && !l.description.toLowerCase().includes(term)) return false
    }
    return true
  })

  return (
    <div className={`pt-0 ${theme.bg} min-h-full`}>
      <div className={`sticky top-0 z-50 ${theme.bg} shadow-sm transition-all duration-300`}>
        {!isShortLandscape && (
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${showSearch ? 'max-h-20 opacity-100 py-3' : 'max-h-0 opacity-0 py-0'}`}
          >
            <div className="px-4">
              <div
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border ${theme.border} ${theme.input} shadow-sm transition-all focus-within:border-[#4A5D4E] focus-within:ring-1 focus-within:ring-[#4A5D4E]/20`}
              >
                <Search size={18} className={theme.textSec} />
                <input
                  type="text"
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                  placeholder={t?.home?.searchPlaceholder ?? 'Suche nach Äpfeln, Kürbis...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={16} className={theme.textSec} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className={`flex border-b ${theme.border} mb-0 px-4 ${theme.bg} relative z-40 ${isShortLandscape ? 'pt-1' : ''}`}>
          <button
            onClick={() => {
              setFeedType('explore')
              setFilterType('all')
              setSearchTerm('')
            }}
            className={`flex-1 ${isShortLandscape ? 'pb-2 text-xs' : 'pb-3 text-sm'} font-semibold transition-colors ${feedType === 'explore' ? `${theme.text} border-b-2 border-[#0D1A15]` : theme.textSec}`}
          >
            Alle anzeigen
          </button>
          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 ${isShortLandscape ? 'pb-2 text-xs' : 'pb-3 text-sm'} font-semibold transition-colors ${feedType === 'following' ? `${theme.text} border-b-2 border-[#0D1A15]` : theme.textSec}`}
          >
            {t?.home?.following}
          </button>
        </div>

        {!isShortLandscape && (
          <div className={`flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar scrollbar-hide ${theme.bg} relative z-40`}>
            <FilterChip label={t?.filter?.all} active={filterType === 'all'} onClick={() => setFilterType('all')} theme={theme} />
            <FilterChip label={t?.filter?.pickup} active={filterType === 'pickup'} onClick={() => setFilterType('pickup')} theme={theme} />
            <FilterChip label={t?.filter?.self} active={filterType === 'self_harvest'} onClick={() => setFilterType('self_harvest')} theme={theme} />
          </div>
        )}
      </div>

      <div className={`grid grid-cols-1 ${isShortLandscape ? 'px-5 pt-1 pb-16 gap-4' : 'px-4 pt-2 pb-20 gap-6'} [@media(min-width:900px)_and_(orientation:landscape)]:grid-cols-2 [@media(min-width:900px)_and_(orientation:landscape)]:gap-5 [@media(min-width:1200px)_and_(orientation:landscape)]:grid-cols-3 [@media(min-width:1200px)_and_(orientation:landscape)]:px-6 [@media(min-width:1200px)_and_(orientation:landscape)]:gap-6 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:grid-cols-3 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:gap-4`}>
        {filteredListings.length === 0 ? (
          <div className={`col-span-full text-center py-10 ${theme.textSec}`}>
            <p>{t?.home?.empty}</p>
          </div>
        ) : (
          filteredListings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              gardener={getGardener(String(l.gardenerId ?? ''))}
              currentUser={currentUser}
              onLike={() => toggleLike(l.id)}
              onFollow={() => toggleFollow(l.gardenerId)}
              onReserve={handleReservation}
              onOpenListing={setDetailListing}
              onAdminDelete={onAdminDelete}
              isAdmin={isAdmin}
              onUserClick={onUserClick}
              theme={theme}
              t={t}
            />
          ))
        )}
      </div>

      {detailListing && (
        <ListingDetailModal
          selectedPost={detailListing}
          setSelectedPost={setDetailListing}
          user={currentUser}
          isOwnProfile={false}
          gardener={getGardener(String(detailListing.gardenerId ?? ''))}
          onReserve={handleReservation}
          onEditListing={() => {}}
          onDeleteListing={() => {}}
          saveEditedPost={() => {}}
          isEditingPost={false}
          editPostData={{}}
          setEditPostData={() => {}}
          startEditPost={() => {}}
          theme={theme}
          t={t}
        />
      )}
    </div>
  )
}
