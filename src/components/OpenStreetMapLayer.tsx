import { useEffect } from 'react'
import type { MutableRefObject } from 'react'
import { MapContainer, TileLayer, CircleMarker, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Listing } from '@/types'
import { getListingLatLng } from '@/utils/listingPosition'

function FitBounds({ listings }: { listings: Listing[] }) {
  const map = useMap()
  useEffect(() => {
    if (listings.length === 0) {
      map.setView([52.52, 13.405], 11)
      return
    }
    const pts = listings.map((l) => {
      const p = getListingLatLng(l)
      return [p.lat, p.lng] as [number, number]
    })
    const bounds = L.latLngBounds(pts)
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 })
  }, [map, listings])
  return null
}

function MapRefEffect({
  mapRef,
  sheetHeight,
}: {
  mapRef: MutableRefObject<L.Map | null>
  sheetHeight: number
}) {
  const map = useMap()
  useEffect(() => {
    mapRef.current = map
    return () => {
      mapRef.current = null
    }
  }, [map, mapRef])

  useEffect(() => {
    const id = window.setTimeout(() => {
      map.invalidateSize()
    }, 320)
    return () => window.clearTimeout(id)
  }, [map, sheetHeight])

  return null
}

type OpenStreetMapLayerProps = {
  listings: Listing[]
  isDark: boolean
  onMarkerClick: (listing: Listing) => void
  leafletMapRef: MutableRefObject<L.Map | null>
  sheetHeight: number
}

export function OpenStreetMapLayer({
  listings,
  isDark,
  onMarkerClick,
  leafletMapRef,
  sheetHeight,
}: OpenStreetMapLayerProps) {
  return (
    <div className="absolute inset-0 z-0 [&_.leaflet-control]:z-[5] [&_.leaflet-pane]:z-[1]">
      <MapContainer
        center={[52.52, 13.405]}
        zoom={11}
        zoomControl={false}
        className="h-full w-full !absolute inset-0 z-0"
        scrollWheelZoom
        style={{ background: isDark ? '#1a1a1a' : '#e5e5e5' }}
      >
        <TileLayer
          attribution={
            isDark
              ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
              : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          }
          url={
            isDark
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        <ZoomControl position="bottomleft" />
        <FitBounds listings={listings} />
        <MapRefEffect mapRef={leafletMapRef} sheetHeight={sheetHeight} />
        {listings.map((l) => {
          const p = getListingLatLng(l)
          return (
            <CircleMarker
              key={l.id}
              center={[p.lat, p.lng]}
              radius={11}
              pathOptions={{
                fillColor: l.harvestType === 'pickup' ? '#EA4335' : '#34A853',
                fillOpacity: 1,
                color: '#ffffff',
                weight: 2,
              }}
              eventHandlers={{
                click: () => onMarkerClick(l),
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
