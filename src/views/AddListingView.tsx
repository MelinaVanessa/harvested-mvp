import { useEffect, useRef, useState } from 'react'
import { Camera, ShoppingBag, Leaf, LocateFixed } from 'lucide-react'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

interface AddListingViewProps {
  onAdd: (listing: Listing) => void
  currentUser: UserProfile
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
}

const defaultForm: Partial<Listing> = {
  title: '',
  description: '',
  totalQuantity: 1,
  unit: 'kg',
  harvestType: 'pickup',
  pickupTimes: '',
  location: { x: 50, y: 50, address: '' },
  image: '',
}

export function AddListingView({ onAdd, currentUser, theme, t }: AddListingViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Partial<Listing>>(defaultForm)
  const apiBaseUrl =
    (import.meta.env.VITE_API_URL as string | undefined)?.trim().replace(/\/$/, '') ||
    'https://harvested-mvp.onrender.com'

  type GeoSuggestion = {
    lat: number
    lon: number
    displayName: string
  }
  const [addressQuery, setAddressQuery] = useState('')
  const [addressSuggestions, setAddressSuggestions] = useState<GeoSuggestion[]>([])
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false)
  const [isLocating, setIsLocating] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setFormData((prev) => ({ ...prev, image: reader.result as string }))
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      id: `l${Date.now()}`,
      gardenerId: currentUser.id,
      availableQuantity: formData.totalQuantity!,
      image: formData.image ?? 'https://images.unsplash.com/photo-1606507119036-0742d1f760da',
      datePosted: new Date().toISOString(),
      ...formData,
    } as Listing)
  }

  const handleOptimize = () => {
    setFormData((prev) => ({
      ...prev,
      description:
        '✨ Frisch aus meinem Garten! Knackig, saftig und voller Geschmack. Perfekt für einen gesunden Snack oder Salat. Kommt vorbei und holt es euch!',
    }))
  }

  useEffect(() => {
    setAddressQuery(formData.location?.address ?? '')
  }, [formData.location?.address])

  useEffect(() => {
    const q = addressQuery.trim()
    if (q.length < 1) {
      setAddressSuggestions([])
      setShowAddressSuggestions(false)
      return
    }

    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      try {
        const res = await fetch(`${apiBaseUrl}/api/geocode?query=${encodeURIComponent(q)}&limit=6`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const rows = (await res.json()) as GeoSuggestion[]
        setAddressSuggestions(rows)
        setShowAddressSuggestions(rows.length > 0)
      } catch {
        setAddressSuggestions([])
        setShowAddressSuggestions(false)
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [addressQuery, apiBaseUrl])

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      window.alert('Geolocation is not supported on this device.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude
        const lon = position.coords.longitude

        try {
          const res = await fetch(`${apiBaseUrl}/api/geocode?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lon))}`, {
            headers: { Accept: 'application/json' },
          })
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          const row = (await res.json()) as GeoSuggestion
          const resolvedAddress = row.displayName?.trim() || `${lat.toFixed(6)}, ${lon.toFixed(6)}`
          setFormData((prev) => ({
            ...prev,
            location: {
              ...(prev.location ?? { x: 50, y: 50, address: '' }),
              address: resolvedAddress,
              lat,
              lng: lon,
            },
          }))
          setAddressQuery(resolvedAddress)
          setShowAddressSuggestions(false)
        } catch {
          const fallbackAddress = 'Current location'
          setFormData((prev) => ({
            ...prev,
            location: {
              ...(prev.location ?? { x: 50, y: 50, address: '' }),
              address: fallbackAddress,
              lat,
              lng: lon,
            },
          }))
          setAddressQuery(fallbackAddress)
          setShowAddressSuggestions(false)
        } finally {
          setIsLocating(false)
        }
      },
      () => {
        setIsLocating(false)
        window.alert('Location access denied. Please allow location permissions.')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    )
  }

  return (
    <div className={`px-6 py-8 ${theme.bg} ${theme.text} min-h-full pb-24`}>
      <h2 className="text-2xl font-bold mb-6">{t?.add?.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`w-full aspect-video ${theme.card} border-2 border-dashed ${formData.image ? 'border-[#C29901]' : 'border-[#88887D]/40'} rounded-xl flex flex-col items-center justify-center ${theme.textSec} cursor-pointer hover:border-[#C29901] transition-colors overflow-hidden relative`}
        >
          {formData.image ? (
            <>
              <img src={formData.image} className="w-full h-full object-cover" alt="Upload" />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Camera size={32} className="text-white" />
              </div>
            </>
          ) : (
            <>
              <Camera size={32} className="mb-2" />
              <span className="text-sm font-medium">{t?.add?.photo}</span>
            </>
          )}
        </div>
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />

        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${theme.textSec}`}>{t?.add?.what}</label>
            <input
              required
              className={`w-full p-3 rounded-lg focus:outline-none focus:border-[#C29901] ${theme.input}`}
              placeholder="z.B. Saftige Birnen"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={`block text-xs font-bold uppercase mb-1 ${theme.textSec}`}>{t?.add?.amount}</label>
              <input
                type="number"
                required
                className={`w-full p-3 rounded-lg ${theme.input}`}
                value={formData.totalQuantity}
                onChange={(e) => setFormData({ ...formData, totalQuantity: parseFloat(e.target.value) })}
              />
            </div>
            <div className="w-1/3">
              <label className={`block text-xs font-bold uppercase mb-1 ${theme.textSec}`}>{t?.add?.unit}</label>
              <select
                className={`w-full p-3 rounded-lg ${theme.input}`}
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              >
                <option value="kg">kg</option>
                <option value="Stück">Stück</option>
                <option value="Kisten">Kisten</option>
                <option value="Bund">Bund</option>
              </select>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={`block text-xs font-bold uppercase ${theme.textSec}`}>{t?.add?.desc}</label>
              <button
                type="button"
                onClick={handleOptimize}
                className="text-[10px] bg-[#4A5D4E]/10 text-[#4A5D4E] px-2 py-0.5 rounded font-bold hover:bg-[#4A5D4E]/20"
              >
                {t?.add?.aiOptimize}
              </button>
            </div>
            <textarea
              className={`w-full p-3 rounded-lg h-24 resize-none ${theme.input}`}
              placeholder="..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${theme.textSec}`}>{t?.add?.type}</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, harvestType: 'pickup' })}
                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 ${formData.harvestType === 'pickup' ? 'border-[#C29901] bg-[#C29901]/10 text-[#C29901]' : `${theme.border} ${theme.textSec}`}`}
              >
                <ShoppingBag size={20} />
                {t?.filter?.pickup}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, harvestType: 'self_harvest' })}
                className={`p-3 rounded-lg border text-sm font-medium flex flex-col items-center gap-2 ${formData.harvestType === 'self_harvest' ? 'border-[#4A5D4E] bg-[#4A5D4E]/10 text-[#4A5D4E]' : `${theme.border} ${theme.textSec}`}`}
              >
                <Leaf size={20} />
                {t?.filter?.self}
              </button>
            </div>
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${theme.textSec}`}>{t?.add?.times}</label>
            <input
              required
              className={`w-full p-3 rounded-lg ${theme.input}`}
              placeholder="z.B. Mo-Fr 18-20 Uhr"
              value={formData.pickupTimes}
              onChange={(e) => setFormData({ ...formData, pickupTimes: e.target.value })}
            />
          </div>
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${theme.textSec}`}>{t?.add?.address}</label>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className={`mb-2 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                isLocating
                  ? 'cursor-not-allowed opacity-70'
                  : 'hover:bg-black/5'
              } ${theme.border} ${theme.text}`}
            >
              <LocateFixed size={14} />
              {isLocating ? 'Using your location...' : 'Use my current location'}
            </button>
            <div className="relative">
              <input
                required
                className={`w-full p-3 rounded-lg ${theme.input}`}
                placeholder="..."
                value={formData.location?.address}
                onFocus={() => {
                  if (addressSuggestions.length > 0) setShowAddressSuggestions(true)
                }}
                onBlur={() => window.setTimeout(() => setShowAddressSuggestions(false), 120)}
                onChange={(e) => {
                  const address = e.target.value
                  setAddressQuery(address)
                  setFormData({ ...formData, location: { ...formData.location!, address } })
                }}
              />
              {showAddressSuggestions && (
                <div className={`absolute left-0 right-0 mt-1 rounded-xl border ${theme.border} ${theme.card} shadow-xl max-h-56 overflow-y-auto z-20`}>
                  {addressSuggestions.map((s) => (
                    <button
                      key={`${s.lat}:${s.lon}:${s.displayName}`}
                      type="button"
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-black/5 ${theme.text}`}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setFormData({
                          ...formData,
                          location: {
                            ...formData.location!,
                            address: s.displayName,
                            lat: s.lat,
                            lng: s.lon,
                          },
                        })
                        setAddressQuery(s.displayName)
                        setShowAddressSuggestions(false)
                      }}
                    >
                      <span className="line-clamp-2">{s.displayName}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#0D1A15] text-[#FCFAF7] py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          {t?.add?.submit}
        </button>
      </form>
    </div>
  )
}
