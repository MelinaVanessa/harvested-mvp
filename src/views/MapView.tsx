import { useState, useRef, useCallback, useEffect } from 'react'
import L from 'leaflet'
import { Search, Layers, Locate } from 'lucide-react'
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
  handleReservation: (listingId: string, amount: number, pickupAt: string) => void
  getGardener: (id: string) => UserProfile
  onUserClick: (userId: string) => void
  setActiveTab: (tab: 'home' | 'map' | 'add' | 'profile' | 'likes') => void
  currentUser: UserProfile
  toggleLike: (listingId: string) => void
  toggleFollow: (gardenerId: string) => void
  onAdminDelete: (listingId: string) => void
  isAdmin: boolean
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
  onAdminDelete,
  isAdmin,
  theme,
  t,
}: MapViewProps) {
  const desktopPanelWidth = 'clamp(320px, 34vw, 460px)'
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const filteredListings = listings.filter((l) => filterType === 'all' || l.harvestType === filterType)

  const [sheetHeight, setSheetHeight] = useState(SHEET_PEEK_HEIGHT)
  const [isDraggingState, setIsDraggingState] = useState(false)
  const isDragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const apiBaseUrl =
    (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '') ||
    'https://harvested-mvp.onrender.com'

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined)?.trim()
  const [googleMapsFailed, setGoogleMapsFailed] = useState(false)
  const useGoogleMap = Boolean(apiKey) && !googleMapsFailed

  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const leafletMapRef = useRef<L.Map | null>(null)

  type GeoSuggestion = {
    lat: number
    lon: number
    displayName: string
  }

  const [mapQuery, setMapQuery] = useState('')
  const [geoSuggestions, setGeoSuggestions] = useState<GeoSuggestion[]>([])
  const [isGeoLoading, setIsGeoLoading] = useState(false)
  const [showGeoSuggestions, setShowGeoSuggestions] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapInstanceRef.current = map
  }, [])

  const panTo = (lat: number, lon: number) => {
    if (useGoogleMap && mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng: lon })
      mapInstanceRef.current.setZoom(14)
      return
    }
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([lat, lon], 14)
    }
  }

  useEffect(() => {
    let cancelled = false
    const q = mapQuery.trim()
    if (q.length < 1) {
      setGeoSuggestions([])
      setShowGeoSuggestions(false)
      return
    }

    const controller = new AbortController()
    const t = window.setTimeout(async () => {
      try {
        setIsGeoLoading(true)
        const url = `${apiBaseUrl}/api/geocode?query=${encodeURIComponent(q)}&limit=6`

        const res = await fetch(url, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as any[]

        const parsed = data
          .map((x) => {
            // backend proxy returns {lat,lon,displayName}
            const lat = Number(x.lat)
            const lon = Number(x.lon)
            const displayName = (x.displayName as string | undefined) ?? ''
            if (!Number.isFinite(lat) || !Number.isFinite(lon) || !displayName) return null
            return { lat, lon, displayName }
          })
          .filter((x): x is GeoSuggestion => Boolean(x))

        const qLower = q.toLowerCase()
        const startsWith = (name: string) => {
          const n = name.toLowerCase()
          if (n.startsWith(qLower)) return true
          return n
            .split(/[\s,/-]+/)
            .filter(Boolean)
            .some((part) => part.startsWith(qLower))
        }
        const sorted = [...parsed].sort((a, b) => {
          const aStarts = startsWith(a.displayName)
          const bStarts = startsWith(b.displayName)
          if (aStarts !== bStarts) return aStarts ? -1 : 1
          return a.displayName.localeCompare(b.displayName)
        })

        if (cancelled) return
        setGeoSuggestions(sorted)
        setShowGeoSuggestions(sorted.length > 0)
      } catch (e) {
        // keep the map usable even if geocoding fails
        if (!cancelled) {
          setGeoSuggestions([])
          setShowGeoSuggestions(false)
        }
      } finally {
        if (!cancelled) setIsGeoLoading(false)
      }
    }, 250)

    return () => {
      cancelled = true
      controller.abort()
      window.clearTimeout(t)
    }
  }, [mapQuery, apiBaseUrl, useGoogleMap])

  const handleSelectSuggestion = (s: GeoSuggestion) => {
    setMapQuery(s.displayName)
    setShowGeoSuggestions(false)
    setGeoSuggestions([])
    panTo(s.lat, s.lon)
  }

  const handleLocate = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation || isLocating) return
    setIsLocating(true)

    const onSuccess = (pos: GeolocationPosition) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      panTo(lat, lng)
    }

    // Phase 1: return quickly from cached/coarse position.
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onSuccess(pos)

        // Phase 2: refine in background with high-accuracy GPS.
        navigator.geolocation.getCurrentPosition(
          (betterPos) => {
            onSuccess(betterPos)
            setIsLocating(false)
          },
          () => {
            setIsLocating(false)
          },
          { enableHighAccuracy: true, timeout: 9000, maximumAge: 0 }
        )
      },
      () => {
        setIsLocating(false)
      },
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
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
      <div className="absolute inset-0 lg:right-[var(--map-panel-width)]" style={{ ['--map-panel-width' as string]: desktopPanelWidth }}>
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
      </div>

      {!selectedListing && (
      <div
        className="absolute top-4 left-3 right-3 lg:right-[calc(var(--map-panel-width)+0.75rem)] z-[100] flex flex-col gap-3 pointer-events-none"
        style={{ ['--map-panel-width' as string]: desktopPanelWidth }}
      >
        <div className="relative w-full pointer-events-auto">
          <div
            className={`${theme.mapFilterBg} w-full rounded-full shadow-md px-4 py-2.5 flex items-center gap-2 border ${theme.border}`}
          >
            <Search size={18} className={theme.textSec} />
            <input
              type="text"
              value={mapQuery}
              onChange={(e) => setMapQuery(e.target.value)}
              onFocus={() => {
                if (geoSuggestions.length > 0) setShowGeoSuggestions(true)
              }}
              onBlur={() => {
                // allow clicks (handled via onMouseDown), so delay hiding slightly
                window.setTimeout(() => setShowGeoSuggestions(false), 120)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && geoSuggestions[0]) {
                  handleSelectSuggestion(geoSuggestions[0]!)
                }
              }}
              className={`flex-1 bg-transparent text-sm focus:outline-none ${theme.mapOverlayText} placeholder:${theme.textSec}`}
              placeholder={t?.map?.searchPlaceholder}
            />
          </div>

          {showGeoSuggestions && (
            <div
              className={`${theme.card} mt-2 rounded-2xl border ${theme.border} shadow-2xl overflow-hidden`}
            >
              {isGeoLoading ? (
                <div className={`px-4 py-2 text-xs ${theme.textSec}`}>Loading…</div>
              ) : (
                <div className="max-h-56 overflow-y-auto">
                  {geoSuggestions.map((s) => (
                    <button
                      key={`${s.lat}:${s.lon}:${s.displayName}`}
                      type="button"
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-black/5 ${theme.text}`}
                      onMouseDown={(e) => {
                        // prevent input blur before selection runs
                        e.preventDefault()
                        handleSelectSuggestion(s)
                      }}
                    >
                      <div className="font-semibold line-clamp-1">{s.displayName}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {googleMapsFailed && apiKey && (
          <p className={`text-xs px-1 text-amber-700 dark:text-amber-300 pointer-events-auto`}>{t?.map?.loadError}</p>
        )}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 pointer-events-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border shadow-md backdrop-blur-sm transition-colors ${
              filterType === 'all'
                ? 'bg-[#0D1A15] text-[#FCFAF7] border-[#0D1A15]'
                : 'bg-white text-[#0D1A15] border-black/30 hover:bg-[#F5F5F5]'
            }`}
          >
            {t?.filter?.all}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('pickup')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border shadow-md backdrop-blur-sm transition-colors ${
              filterType === 'pickup'
                ? 'bg-[#0D1A15] text-[#FCFAF7] border-[#0D1A15]'
                : 'bg-white text-[#0D1A15] border-black/30 hover:bg-[#F5F5F5]'
            }`}
          >
            {t?.filter?.pickup}
          </button>
          <button
            type="button"
            onClick={() => setFilterType('self_harvest')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap border shadow-md backdrop-blur-sm transition-colors ${
              filterType === 'self_harvest'
                ? 'bg-[#0D1A15] text-[#FCFAF7] border-[#0D1A15]'
                : 'bg-white text-[#0D1A15] border-black/30 hover:bg-[#F5F5F5]'
            }`}
          >
            {t?.filter?.self}
          </button>
        </div>
      </div>
      )}

      {!selectedListing && (
      <div className="absolute top-40 right-3 z-[100] flex flex-col gap-3 pointer-events-auto">
        <button type="button" className={`w-10 h-10 ${theme.card} rounded-full shadow-md flex items-center justify-center ${theme.textSec}`}>
          <Layers size={20} />
        </button>
      </div>
      )}

      {!selectedListing && (
      <div
        className="absolute z-[100] transition-all duration-300 pointer-events-auto bottom-[var(--locate-bottom)] right-3 lg:bottom-6 lg:right-[calc(var(--map-panel-width)+0.75rem)]"
        style={{ ['--locate-bottom' as string]: `${sheetHeight + 20}px`, ['--map-panel-width' as string]: desktopPanelWidth }}
      >
        <button
          type="button"
          onClick={handleLocate}
          disabled={typeof navigator === 'undefined' || !navigator.geolocation || isLocating}
          className={`w-12 h-12 ${theme.card} rounded-full shadow-lg flex items-center justify-center text-[#4285F4] disabled:opacity-40 disabled:pointer-events-none ${
            isLocating ? 'animate-pulse' : ''
          }`}
          aria-label={isLocating ? 'Locating…' : 'Locate me'}
        >
          <Locate size={24} fill="currentColor" style={{ fillOpacity: 0.2 }} />
        </button>
      </div>
      )}

      {!selectedListing && (
        <div
          className={`absolute bottom-0 left-0 right-0 lg:hidden ${theme.card} rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.1)] z-[110] flex flex-col pointer-events-auto ${isDraggingState ? '' : 'transition-all duration-300 ease-out'}`}
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
                  gardener={getGardener(String(l.gardenerId ?? ''))}
                  currentUser={currentUser}
                  onLike={() => toggleLike(l.id)}
                  onFollow={() => toggleFollow(l.gardenerId)}
                  onReserve={handleReservation}
                  onOpenListing={setSelectedListing}
                  onAdminDelete={onAdminDelete}
                  isAdmin={isAdmin}
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

      {!selectedListing && (
        <aside
          className={`absolute top-0 right-0 h-full w-[var(--map-panel-width)] hidden lg:flex ${theme.card} border-l ${theme.border} z-40 flex-col pointer-events-auto`}
          style={{ ['--map-panel-width' as string]: desktopPanelWidth }}
        >
          <div className={`px-3 py-3 border-b ${theme.border} shrink-0`}>
            <h3 className={`text-sm font-bold ${theme.text}`}>{t?.map?.latest}</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-2.5 py-2 no-scrollbar">
            <div className="space-y-2.5">
              {filteredListings.map((l) => (
                <ListingCard
                  key={l.id}
                  listing={l}
                  gardener={getGardener(String(l.gardenerId ?? ''))}
                  currentUser={currentUser}
                  onLike={() => toggleLike(l.id)}
                  onFollow={() => toggleFollow(l.gardenerId)}
                  onReserve={handleReservation}
                  onOpenListing={setSelectedListing}
                  onAdminDelete={onAdminDelete}
                  isAdmin={isAdmin}
                  onUserClick={onUserClick}
                  compact
                  theme={theme}
                  t={t}
                />
              ))}
              <div className="h-4" />
            </div>
          </div>
        </aside>
      )}

      {selectedListing && (
        <ListingDetailModal
          variant="map"
          selectedPost={selectedListing}
          setSelectedPost={setSelectedListing}
          user={currentUser}
          isOwnProfile={false}
          gardener={getGardener(String(selectedListing.gardenerId ?? ''))}
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
