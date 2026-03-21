import { useCallback, useEffect, useLayoutEffect, useRef, type CSSProperties } from 'react'
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api'
import type { Listing } from '@/types'
import { getListingLatLng } from '@/utils/listingPosition'

const defaultCenter: google.maps.LatLngLiteral = { lat: 52.52, lng: 13.405 }

const mapContainerStyle: CSSProperties = { width: '100%', height: '100%' }

const darkStyles: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
]

type InteractiveGoogleMapProps = {
  apiKey: string
  listings: Listing[]
  isDark: boolean
  onMarkerClick: (listing: Listing) => void
  onMapReady: (map: google.maps.Map) => void
  onMapFailure?: () => void
  loadingLabel?: string
}

export function InteractiveGoogleMap({
  apiKey,
  listings,
  isDark,
  onMarkerClick,
  onMapReady,
  onMapFailure,
  loadingLabel,
}: InteractiveGoogleMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'harvested-google-map',
    googleMapsApiKey: apiKey,
  })

  const mapRef = useRef<google.maps.Map | null>(null)

  const fitBounds = useCallback(
    (map: google.maps.Map) => {
      if (listings.length === 0) {
        map.setCenter(defaultCenter)
        map.setZoom(11)
        return
      }
      const bounds = new google.maps.LatLngBounds()
      listings.forEach((l) => bounds.extend(getListingLatLng(l)))
      map.fitBounds(bounds, 64)
    },
    [listings],
  )

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map
      onMapReady(map)
      fitBounds(map)
    },
    [fitBounds, onMapReady],
  )

  const onUnmount = useCallback(() => {
    mapRef.current = null
  }, [])

  useLayoutEffect(() => {
    if (loadError) onMapFailure?.()
  }, [loadError, onMapFailure])

  useEffect(() => {
    if (mapRef.current) fitBounds(mapRef.current)
  }, [fitBounds, listings])

  if (loadError) return null

  if (!isLoaded) {
    return (
      <div className="absolute inset-0 z-0 flex items-center justify-center bg-black/10 text-sm text-neutral-600">
        {loadingLabel ?? '…'}
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      mapContainerClassName="absolute inset-0 z-0 !h-full !w-full"
      center={defaultCenter}
      zoom={11}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        gestureHandling: 'greedy',
        styles: isDark ? darkStyles : undefined,
      }}
    >
      {listings.map((l) => (
        <Marker
          key={l.id}
          position={getListingLatLng(l)}
          onClick={() => onMarkerClick(l)}
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: l.harvestType === 'pickup' ? '#EA4335' : '#34A853',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2,
          }}
        />
      ))}
    </GoogleMap>
  )
}
