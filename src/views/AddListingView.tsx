import { useRef, useState } from 'react'
import { Camera, ShoppingBag, Leaf } from 'lucide-react'
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
            <input
              required
              className={`w-full p-3 rounded-lg ${theme.input}`}
              placeholder="..."
              value={formData.location?.address}
              onChange={(e) =>
                setFormData({ ...formData, location: { ...formData.location!, address: e.target.value } })
              }
            />
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
