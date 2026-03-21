import { useState, useRef, useCallback } from 'react'
import L from 'leaflet'
import { Search, Layers, Locate } from 'lucide-react'
import { FilterChip } from '@/components/FilterChip'
import { ListingCard } from '@/components/ListingCard'
import { ListingDetailModal } from '@/components/ListingDetailModal'
import { InteractiveGoogleMap } from '@/components/InteractiveGoogleMap'
import { OpenStreetMapLayer } from '@/components/OpenStreetMapLayer'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

/** Collapsed height of the listings sheet (px) — thin strip: handle barely above the bottom edge */
const SHEET_PEEK_HEIGHT = 44

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

  const [sheetHeight, setSheetHeight] = useState(SHEET_PEEK_HEIGHT)
  const [isDraggingState, setIsDraggingState] = useState(false)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim()
  const [googleMapsFailed, setGoogleMapsFailed] = useState(false)
  const useGoogleMap = Boolean(apiKey) && !googleMapsFailed

  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const leafletMapRef = useRef<L.Map | null>(null)

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map
  }, [])

  const handleLocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        if (useGoogleMap && mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng })
          mapInstanceRef.current.setZoom(14)
        } else if (leafletMapRef.current) {
          leafletMapRef.current.setView([lat, lng], 14)
        }
      },
      () => {},
    )
  }

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
    if (newHeight >= 40 && newHeight <= 820) setSheetHeight(newHeight)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false
    setIsDraggingState(false)
    ;(e.target as Element).releasePointerCapture(e.pointerId)
    if (sheetHeight > 700) setActiveTab('home')
    else if (sheetHeight > 300) setSheetHeight(600)
    else setSheetHeight(SHEET_PEEK_HEIGHT)
  }

  return (
    <div className={`relative h-full w-full overflow-hidden ${isDark ? 'bg-[#050A08]' : 'bg-[#E5E0D8]'}`}>
      {useGoogleMap && apiKey ? (
        <InteractiveGoogleMap
          apiKey={apiKey}
          listings={filteredListings}
          isDark={isDark}
          onMarkerClick={setSelectedListing}
          onMapReady={handleMapReady}
          onMapFailure={() => setGoogleMapsFailed(true)}
          loadingLabel={t?.map?.loading}
        />
      ) : (
        <OpenStreetMapLayer
          listings={filteredListings}
          isDark={isDark}
          onMarkerClick={setSelectedListing}
          leafletMapRef={leafletMapRef}
          sheetHeight={sheetHeight}
        />
      )}

      <div className="absolute top-4 left-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        <div
          className={`${theme.mapFilterBg} rounded-full shadow-md px-4 py-2.5 flex items-center gap-2 border ${theme.border} pointer-events-auto`}
        >
          <Search size={18} className={theme.textSec} />
          <input
            type="text"
            className={`flex-1 bg-transparent text-sm focus:outline-none ${theme.mapOverlayText} placeholder:${theme.textSec}`}
            placeholder={t?.map?.searchPlaceholder}
            defaultValue="Berlin, Brandenburg"
          />
        </div>
        {googleMapsFailed && apiKey && (
          <p className={`text-xs px-1 text-amber-700 dark:text-amber-300 pointer-events-auto`}>{t?.map?.loadError}</p>
        )}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 pointer-events-auto">
          <FilterChip label={t?.filter?.all} active={filterType === 'all'} onClick={() => setFilterType('all')} theme={theme} />
          <FilterChip label={t?.filter?.pickup} active={filterType === 'pickup'} onClick={() => setFilterType('pickup')} theme={theme} />
          <FilterChip label={t?.filter?.self} active={filterType === 'self_harvest'} onClick={() => setFilterType('self_harvest')} theme={theme} />
        </div>
      </div>

      <div className="absolute top-40 right-4 z-[100] flex flex-col gap-3 pointer-events-auto">
        <button type="button" className={`w-10 h-10 ${theme.card} rounded-full shadow-md flex items-center justify-center ${theme.textSec}`}>
          <Layers size={20} />
        </button>
      </div>

      <div className="absolute bottom-24 right-4 z-[100] transition-all duration-300 pointer-events-auto" style={{ bottom: sheetHeight + 20 }}>
        <button
          type="button"
          onClick={handleLocate}
          disabled={typeof navigator === 'undefined' || !navigator.geolocation}
          className={`w-12 h-12 ${theme.card} rounded-full shadow-lg flex items-center justify-center text-[#4285F4] disabled:opacity-40 disabled:pointer-events-none`}
        >
          <Locate size={24} fill="currentColor" style={{ fillOpacity: 0.2 }} />
        </button>
      </div>

      {!selectedListing && (
        <div
          className={`absolute bottom-0 left-0 right-0 ${theme.card} rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[110] flex flex-col pointer-events-auto ${isDraggingState ? '' : 'transition-all duration-300 ease-out'}`}
          style={{ height: `${sheetHeight}px`, maxHeight: '90%' }}
        >
          <div
            className={`w-full flex flex-col items-center justify-center cursor-grab active:cursor-grabbing shrink-0 touch-none rounded-t-3xl ${
              sheetHeight <= 80 ? 'py-1.5' : 'pt-4 pb-4'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="w-12 h-1.5 bg-gray-300 rounded-full shrink-0" />
            {sheetHeight > 88 && sheetHeight < 140 && (
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
