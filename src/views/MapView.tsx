import { useState, useRef } from 'react'
import { Search, Layers, Locate, ShoppingBag, Leaf } from 'lucide-react'
import { FilterChip } from '@/components/FilterChip'
import { ListingCard } from '@/components/ListingCard'
import { ListingDetailModal } from '@/components/ListingDetailModal'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

interface MapViewProps {
  listings: Listing[]
  filterType: 'all' | 'pickup' | 'self_harvest'
  setFilterType: (v: 'all' | 'pickup' | 'self_harvest') => void
  handleReservation: (listingId: string, amount: number) => void
  getGardener: (id: string) => UserProfile
  onUserClick: (userId: string) => void
  setActiveTab: (tab: 'home' | 'map' | 'add' | 'profile' | 'likes') => void
  currentUser: UserProfile
  toggleLike: (listingId: string) => void
  toggleFollow: (gardenerId: string) => void
  onToggleMenu: () => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
}

export function MapView({
  listings,
  filterType,
  setFilterType,
  handleReservation,
  getGardener,
  onUserClick,
  setActiveTab,
  currentUser,
  toggleLike,
  toggleFollow,
  theme,
  t,
}: MapViewProps) {
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const filteredListings = listings.filter((l) => filterType === 'all' || l.harvestType === filterType)

  const [sheetHeight, setSheetHeight] = useState(130)
  const [isDraggingState, setIsDraggingState] = useState(false)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const isDark = theme.bg.includes('0D1A15')

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true
    setIsDraggingState(true)
    startY.current = e.clientY
    startHeight.current = sheetHeight
    ;(e.target as Element).setPointerCapture(e.pointerId)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return
    const newHeight = startHeight.current + (startY.current - e.clientY)
    if (newHeight >= 100 && newHeight <= 820) setSheetHeight(newHeight)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    setIsDraggingState(false)
    ;(e.target as Element).releasePointerCapture(e.pointerId)
    if (sheetHeight > 700) setActiveTab('home')
    else if (sheetHeight > 300) setSheetHeight(600)
    else setSheetHeight(130)
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${isDark ? 'bg-[#050A08]' : 'bg-[#E5E0D8]'}`}>
      <div className={`absolute inset-0 ${isDark ? 'bg-[#050A08]' : 'bg-[#F2F4F0]'}`}>
        <div
          className={`absolute top-[45%] left-0 w-full h-8 transform -rotate-2 origin-left ${isDark ? 'bg-[#1A2E35]' : 'bg-[#AADAFF]'} opacity-50`}
        />
        <div
          className={`absolute top-[38%] left-[60%] w-32 h-32 rounded-full ${isDark ? 'bg-[#1A2E35]' : 'bg-[#AADAFF]'} opacity-50`}
        />
        <div
          className={`absolute top-[42%] left-[15%] w-56 h-32 rounded-[20%] ${isDark ? 'bg-[#1A2621]' : 'bg-[#C5E8C5]'} opacity-60`}
        />
        <div
          className={`absolute top-[10%] right-[10%] w-32 h-32 rounded-full ${isDark ? 'bg-[#1A2621]' : 'bg-[#C5E8C5]'} opacity-60`}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(${isDark ? '#333' : '#888'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? '#333' : '#888'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            opacity: 0.1,
          }}
        />
        <div
          className={`absolute top-0 left-[45%] w-2 h-full ${isDark ? 'bg-[#2C3E34]' : 'bg-[#FFFFFF]'} shadow-sm opacity-50`}
        />
        <div
          className={`absolute top-[60%] left-0 w-full h-2 ${isDark ? 'bg-[#2C3E34]' : 'bg-[#FFFFFF]'} shadow-sm transform rotate-6 opacity-50`}
        />
      </div>

      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3">
        <div className={`${theme.mapFilterBg} rounded-full shadow-md px-4 py-2.5 flex items-center gap-2 border ${theme.border}`}>
          <Search size={18} className={theme.textSec} />
          <input
            type="text"
            className={`flex-1 bg-transparent text-sm focus:outline-none ${theme.mapOverlayText} placeholder:${theme.textSec}`}
            placeholder={t?.map?.searchPlaceholder}
            defaultValue="Berlin, Brandenburg"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
          <FilterChip label={t?.filter?.all} active={filterType === 'all'} onClick={() => setFilterType('all')} theme={theme} />
          <FilterChip label={t?.filter?.pickup} active={filterType === 'pickup'} onClick={() => setFilterType('pickup')} theme={theme} />
          <FilterChip label={t?.filter?.self} active={filterType === 'self_harvest'} onClick={() => setFilterType('self_harvest')} theme={theme} />
        </div>
      </div>

      <div className="absolute top-40 right-4 z-10 flex flex-col gap-3">
        <button className={`w-10 h-10 ${theme.card} rounded-full shadow-md flex items-center justify-center ${theme.textSec}`}>
          <Layers size={20} />
        </button>
      </div>

      {filteredListings.map((l) => (
        <button
          key={l.id}
          onClick={() => setSelectedListing(l)}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all hover:scale-125 focus:scale-125 z-0 focus:z-10 group"
          style={{ left: `${l.location.x}%`, top: `${l.location.y}%` }}
        >
          <div className="relative">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-[2px] border-white relative z-10 ${l.harvestType === 'pickup' ? 'bg-[#EA4335]' : 'bg-[#34A853]'}`}
            >
              {l.harvestType === 'pickup' ? (
                <ShoppingBag size={14} color="white" />
              ) : (
                <Leaf size={14} color="white" />
              )}
            </div>
            <div
              className={`absolute top-6 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] z-0 ${l.harvestType === 'pickup' ? 'border-t-[#EA4335]' : 'border-t-[#34A853]'}`}
            />
          </div>
        </button>
      ))}

      <div className="absolute bottom-24 right-4 z-10 transition-all duration-300" style={{ bottom: sheetHeight + 20 }}>
        <button className={`w-12 h-12 ${theme.card} rounded-full shadow-lg flex items-center justify-center text-[#4285F4]`}>
          <Locate size={24} fill="currentColor" style={{ fillOpacity: 0.2 }} />
        </button>
      </div>

      {!selectedListing && (
        <div
          className={`absolute bottom-0 left-0 right-0 ${theme.card} rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-40 flex flex-col ${isDraggingState ? '' : 'transition-all duration-300 ease-out'}`}
          style={{ height: `${sheetHeight}px`, maxHeight: '90%' }}
        >
          <div
            className="w-full pt-4 pb-4 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shrink-0 touch-none rounded-t-3xl"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-1" />
            {sheetHeight < 200 && (
              <p className={`text-xs ${theme.textSec} font-medium mt-1`}>{t?.map?.near}</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-20 no-scrollbar">
            <h3 className={`text-lg font-bold ${theme.text} mb-4 sticky top-0 ${theme.card} py-2 z-10`}>
              {t?.map?.latest}
            </h3>
            <div className="space-y-4">
              {filteredListings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  gardener={getGardener(l.gardenerId)}
                  currentUser={currentUser}
                  onLike={() => toggleLike(l.id)}
                  onFollow={() => toggleFollow(l.gardenerId)}
                  onReserve={handleReservation}
                  onUserClick={onUserClick}
                  theme={theme}
                  t={t}
                />
              ))}
              <div className="h-10" />
            </div>
          </div>
        </div>
      )}

      {selectedListing && (
        <ListingDetailModal
          selectedPost={selectedListing}
          setSelectedPost={setSelectedListing}
          user={currentUser}
          isOwnProfile={false}
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
