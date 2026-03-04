import { useState } from 'react'
import { Heart, Clock, ShoppingBag, Minus, Plus } from 'lucide-react'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

interface ListingCardProps {
  listing: Listing
  gardener: UserProfile
  currentUser: UserProfile
  onLike: () => void
  onFollow: () => void
  onReserve: (listingId: string, amount: number) => void
  onUserClick: (userId: string) => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
}

export function ListingCard({
  listing,
  gardener,
  currentUser,
  onLike,
  onFollow,
  onReserve,
  onUserClick,
  theme,
  t,
}: ListingCardProps) {
  const isLiked = currentUser.likedListings.includes(listing.id)
  const isFollowing = currentUser.following.includes(gardener.id)
  const isSelf = currentUser.id === gardener.id
  const step = listing.unit.toLowerCase() === 'stück' ? 1 : 0.5
  const initialAmount = Math.min(listing.availableQuantity, step === 1 ? 1 : 1)
  const [amount, setAmount] = useState(initialAmount)

  const handleIncrement = () => setAmount((prev) => Math.min(listing.availableQuantity, prev + step))
  const handleDecrement = () => setAmount((prev) => Math.max(step, prev - step))

  return (
    <div className={`${theme.card} rounded-2xl overflow-hidden shadow-sm border ${theme.border}`}>
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onUserClick(gardener.id)}>
          <img src={gardener.avatar} alt={gardener.name} className="w-8 h-8 rounded-full bg-gray-100" />
          <div className="leading-tight">
            <p className={`text-sm font-semibold ${theme.text} hover:underline`}>{gardener.name}</p>
            <p className={`text-xs ${theme.textSec}`}>{listing.location.address}</p>
          </div>
        </div>
        {!isSelf && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onFollow()
            }}
            className={`text-xs font-bold px-3 py-1 rounded-md transition-colors ${isFollowing ? `bg-gray-100 ${theme.textSec}` : 'text-[#C29901] bg-[#C29901]/10'}`}
          >
            {isFollowing ? t?.profile?.followingBtn ?? 'Abonniert' : t?.profile?.followBtn ?? 'Folgen'}
          </button>
        )}
      </div>
      <div className="relative aspect-[4/3] bg-gray-100">
        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-bold shadow-sm">
          {listing.harvestType === 'pickup' ? '📦 Abholbereit' : '🌾 Selbst ernten'}
        </div>
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`text-lg font-bold ${theme.text}`}>{listing.title}</h3>
            <div className="flex items-center gap-1 text-[#4A5D4E] text-sm font-medium">
              <ShoppingBag size={14} />
              <span>Noch {listing.availableQuantity} {listing.unit} {t?.listing?.available ?? 'verfügbar'}</span>
            </div>
          </div>
          <button onClick={onLike} className="transition-transform active:scale-90">
            <Heart size={24} className={isLiked ? 'fill-red-500 text-red-500' : theme.text} />
          </button>
        </div>
        <p className={`text-sm opacity-80 mb-4 line-clamp-2 ${theme.text}`}>{listing.description}</p>
        <div className={`flex items-center gap-2 text-xs ${theme.textSec} mb-4 ${theme.bg === 'bg-[#0D1A15]' ? 'bg-[#2C3E34]' : 'bg-[#FCFAF7]'} p-2 rounded-lg`}>
          <Clock size={14} />
          <span>{listing.pickupTimes}</span>
        </div>
        {listing.availableQuantity > 0 ? (
          <div className="flex items-center gap-3 mt-4">
            {!isSelf && (
              <div className={`flex items-center rounded-xl border ${theme.border} p-1 h-12 shrink-0 ${theme.input}`}>
                <button
                  onClick={handleDecrement}
                  className={`w-10 h-full flex items-center justify-center ${theme.text} hover:opacity-70 rounded-lg transition-colors`}
                  disabled={amount <= step}
                >
                  <Minus size={16} />
                </button>
                <span className={`min-w-[4rem] px-2 text-center font-bold ${theme.text} text-sm whitespace-nowrap`}>
                  {amount} {listing.unit}
                </span>
                <button
                  onClick={handleIncrement}
                  className={`w-10 h-full flex items-center justify-center ${theme.text} hover:opacity-70 rounded-lg transition-colors`}
                  disabled={amount >= listing.availableQuantity}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
            <button
              onClick={() => onReserve(listing.id, amount)}
              disabled={isSelf}
              className={`flex-1 h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${isSelf ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[#0D1A15] text-[#FCFAF7] hover:bg-[#4A5D4E] shadow-lg shadow-[#0D1A15]/10'}`}
            >
              {isSelf ? t?.listing?.yourOffer ?? 'Dein Angebot' : t?.listing?.reserve ?? 'Reservieren'}
            </button>
          </div>
        ) : (
          <button disabled className="w-full bg-gray-200 text-gray-400 py-3 rounded-xl font-semibold text-sm mt-4">
            {t?.listing?.soldOut ?? 'Leider vergriffen'}
          </button>
        )}
      </div>
    </div>
  )
}
