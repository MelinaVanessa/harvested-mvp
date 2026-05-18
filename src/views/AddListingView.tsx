import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Camera, ShoppingBag, Leaf, LocateFixed } from 'lucide-react'
import type { Listing, UserProfile, ThemeTokens } from '@/types'
import { formatPickupScheduleSummary, generateWeeklyPickupSlots } from '@/utils/pickupSlots'

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
  pickupSlots: [],
  location: { x: 50, y: 50, address: '' },
  image: '',
}

const PICKUP_DAY_ROW: { d: number; label: string }[] = [
  { d: 1, label: 'Mo' },
  { d: 2, label: 'Di' },
  { d: 3, label: 'Mi' },
  { d: 4, label: 'Do' },
  { d: 5, label: 'Fr' },
  { d: 6, label: 'Sa' },
  { d: 0, label: 'So' },
]

type PickupDayPresetId = 'mf' | 'ms' | 'we' | 'all' | 'custom'

const PRESET_WEEKDAYS: Record<Exclude<PickupDayPresetId, 'custom'>, number[]> = {
  mf: [1, 2, 3, 4, 5],
  ms: [1, 2, 3, 4, 5, 6],
  we: [0, 6],
  all: [0, 1, 2, 3, 4, 5, 6],
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

  /** 0 = Sun … 6 = Sat — at least one required */
  const [pickupDayPreset, setPickupDayPreset] = useState<PickupDayPresetId>('mf')
  const [pickupWeekdays, setPickupWeekdays] = useState<number[]>(PRESET_WEEKDAYS.mf)
  const [pickupTimeStart, setPickupTimeStart] = useState('14:00')
  const [pickupTimeEnd, setPickupTimeEnd] = useState('18:00')
  const [pickupSlotMinutes, setPickupSlotMinutes] = useState<30 | 60>(60)

  const applyDayPreset = useCallback((id: PickupDayPresetId) => {
    setPickupDayPreset(id)
    if (id !== 'custom') {
      setPickupWeekdays([...PRESET_WEEKDAYS[id]])
    }
  }, [])

  const togglePickupWeekday = (d: number) => {
    setPickupDayPreset('custom')
    setPickupWeekdays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]))
  }

  const previewPickupSlots = useMemo(
    () =>
      generateWeeklyPickupSlots({
        weekdays: pickupWeekdays,
        timeStart: pickupTimeStart,
        timeEnd: pickupTimeEnd,
        slotMinutes: pickupSlotMinutes,
        weeksAhead: 8,
      }),
    [pickupWeekdays, pickupTimeStart, pickupTimeEnd, pickupSlotMinutes],
  )

  const pickupScheduleSummary = useMemo(() => {
    if (pickupWeekdays.length === 0) return ''
    return formatPickupScheduleSummary({
      weekdays: pickupWeekdays,
      timeStart: pickupTimeStart,
      timeEnd: pickupTimeEnd,
      slotMinutes: pickupSlotMinutes,
    })
  }, [pickupWeekdays, pickupTimeStart, pickupTimeEnd, pickupSlotMinutes])

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
    if (pickupWeekdays.length === 0) {
      window.alert(t.errors?.addPickupWeekday ?? '')
      return
    }
    const [sh, sm] = pickupTimeStart.split(':').map(Number)
    const [eh, em] = pickupTimeEnd.split(':').map(Number)
    const startM = sh * 60 + sm
    const endM = eh * 60 + em
    if (!Number.isFinite(startM) || !Number.isFinite(endM) || endM <= startM) {
      window.alert(t.errors?.addPickupTimes ?? '')
      return
    }
    const pickupSlots = generateWeeklyPickupSlots({
      weekdays: pickupWeekdays,
      timeStart: pickupTimeStart,
      timeEnd: pickupTimeEnd,
      slotMinutes: pickupSlotMinutes,
      weeksAhead: 8,
    })
    if (pickupSlots.length === 0) {
      window.alert(t.errors?.addNoSlots ?? '')
      return
    }
    onAdd({
      id: `l${Date.now()}`,
      gardenerId: currentUser.id,
      availableQuantity: formData.totalQuantity!,
      image: formData.image ?? 'https://images.unsplash.com/photo-1606507119036-0742d1f760da',
      datePosted: new Date().toISOString(),
      ...formData,
      pickupSlots,
      pickupTimes: pickupScheduleSummary,
    } as Listing)
  }

  const handleOptimize = () => {
    setFormData((prev) => ({
      ...prev,
      description:
        t?.add?.optimizeSample ??
        'Super frisch aus meiner Region! Knackig, saisonal und direkt vom Erzeuger. Reserviere deine Menge und hol sie lokal ab.',
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
      window.alert(t.errors?.addGeoUnsupported ?? '')
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
        window.alert(t.errors?.addGeoDenied ?? '')
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    )
  }

  return (
    <div className={`app-gutter py-8 ${theme.bg} ${theme.text} min-h-full pb-24`}>
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
            <p className={`text-xs mb-3 ${theme.textSec}`}>
              Kurz die Tage wählen, dann das Zeitfenster — fertig. Daraus entstehen feste Abholtermine (kein Rund-um-die-Uhr).
            </p>
            <div className="space-y-3">
              <div>
                <span className={`block text-[10px] font-bold uppercase mb-1.5 ${theme.textSec}`}>Wochentage</span>
                <div className="flex flex-wrap gap-1.5">
                  {(
                    [
                      { id: 'mf' as const, label: 'Mo–Fr' },
                      { id: 'ms' as const, label: 'Mo–Sa' },
                      { id: 'we' as const, label: 'Sa–So' },
                      { id: 'all' as const, label: 'Täglich' },
                    ] as const
                  ).map(({ id, label }) => {
                    const active = pickupDayPreset === id
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => applyDayPreset(id)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          active
                            ? 'border-[#C29901] bg-[#C29901]/15 text-[#0D1A15]'
                            : `${theme.border} ${theme.textSec} hover:bg-black/5`
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                  <button
                    type="button"
                    onClick={() => applyDayPreset('custom')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      pickupDayPreset === 'custom'
                        ? 'border-[#C29901] bg-[#C29901]/15 text-[#0D1A15]'
                        : `${theme.border} ${theme.textSec} hover:bg-black/5`
                    }`}
                  >
                    Eigene Tage
                  </button>
                </div>
              </div>
              {pickupDayPreset === 'custom' ? (
                <div className="flex flex-wrap gap-1.5 pl-0.5">
                  {PICKUP_DAY_ROW.map(({ d, label }) => {
                    const on = pickupWeekdays.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => togglePickupWeekday(d)}
                        className={`min-w-[2.25rem] px-2 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          on
                            ? 'border-[#C29901] bg-[#C29901]/15 text-[#0D1A15]'
                            : `${theme.border} ${theme.textSec} hover:bg-black/5`
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm">
                <span className={`font-medium ${theme.text}`}>Zwischen</span>
                <input
                  type="time"
                  value={pickupTimeStart}
                  onChange={(e) => setPickupTimeStart(e.target.value)}
                  className={`p-2 rounded-lg ${theme.input} text-base max-w-[8.5rem]`}
                  aria-label="Abholung ab"
                />
                <span className={`${theme.textSec}`}>und</span>
                <input
                  type="time"
                  value={pickupTimeEnd}
                  onChange={(e) => setPickupTimeEnd(e.target.value)}
                  className={`p-2 rounded-lg ${theme.input} text-base max-w-[8.5rem]`}
                  aria-label="Abholung bis"
                />
                <span className={`text-xs ${theme.textSec}`}>(lokale Zeit)</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs ${theme.textSec}`}>Termine etwa alle</span>
                <select
                  value={pickupSlotMinutes}
                  onChange={(e) => setPickupSlotMinutes(Number(e.target.value) as 30 | 60)}
                  className={`px-2 py-1.5 rounded-lg ${theme.input} text-xs`}
                  aria-label="Abstand zwischen Terminen"
                >
                  <option value={60}>1 Stunde</option>
                  <option value={30}>30 Minuten</option>
                </select>
              </div>
              {pickupScheduleSummary ? (
                <p className={`text-xs font-medium ${theme.text}`}>{pickupScheduleSummary}</p>
              ) : null}
              <details className={`rounded-lg border ${theme.border} px-3 py-2`}>
                <summary className={`text-xs font-semibold cursor-pointer ${theme.text} flex items-center justify-between gap-2`}>
                  <span>
                    Vorschau: <span className="text-[#C29901]">{previewPickupSlots.length}</span> buchbare Termine
                  </span>
                  <span className={`text-[10px] font-normal ${theme.textSec}`}>optional</span>
                </summary>
                <div className="mt-2 pt-2 border-t border-black/5 max-h-36 overflow-y-auto">
                  {previewPickupSlots.length > 0 ? (
                    <ul className={`text-[11px] space-y-0.5 ${theme.text}`}>
                      {previewPickupSlots.slice(0, 8).map((slot) => (
                        <li key={slot}>{new Date(slot).toLocaleString()}</li>
                      ))}
                      {previewPickupSlots.length > 8 ? (
                        <li className={theme.textSec}>… und {previewPickupSlots.length - 8} weitere</li>
                      ) : null}
                    </ul>
                  ) : (
                    <p className={`text-xs ${theme.textSec}`}>Noch keine zukünftigen Termine — Zeitfenster oder Tage anpassen.</p>
                  )}
                </div>
              </details>
            </div>
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
          className="w-full bg-[#0D1A15] text-[#FCFAF7] py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
        >
          {t?.add?.submit}
        </button>
      </form>
    </div>
  )
}
