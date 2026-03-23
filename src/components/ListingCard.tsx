import { useState } from 'react'
import { Heart, Clock, ShoppingBag, Minus, Plus, MoreVertical } from 'lucide-react'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

interface ListingCardProps {
  listing: Listing
  gardener: UserProfile
  currentUser: UserProfile
  onLike: () => void
  onFollow: () => void
  onReserve: (listingId: string, amount: number) => void
  onUserClick: (userId: string) => void
  isAdmin?: boolean
  onAdminDelete?: (listingId: string) => void
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
  isAdmin = false,
  onAdminDelete,
  theme,
  t,
}: ListingCardProps) {
  const isLiked = currentUser.likedListings.includes(listing.id)
  const isFollowing = currentUser.following.includes(gardener.id)
  const isSelf = currentUser.id === gardener.id
  const step = listing.unit.toLowerCase() === 'stück' ? 1 : 0.5
  const initialAmount = Math.min(listing.availableQuantity, step === 1 ? 1 : 1)
  const [amount, setAmount] = useState(initialAmount)
  const [showAdminMenu, setShowAdminMenu] = useState(false)

  const handleIncrement = () => setAmount((prev) => Math.min(listing.availableQuantity, prev + step))
  const handleDecrement = () => setAmount((prev) => Math.max(step, prev - step))

  return (
    <div className={`${theme.card} rounded-2xl [@media(min-width:1200px)_and_(orientation:landscape)]:rounded-xl [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:rounded-xl overflow-hidden shadow-sm border ${theme.border}`}>
      <div className="p-3 [@media(min-width:900px)_and_(orientation:landscape)]:p-2.5 [@media(min-width:1200px)_and_(orientation:landscape)]:p-2 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:p-1.5 flex items-center justify-between relative">
        <div className="flex items-center gap-3 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:gap-2 cursor-pointer" onClick={() => onUserClick(gardener.id)}>
          <img src={gardener.avatar} alt={gardener.name} className="w-8 h-8 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:w-7 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:h-7 rounded-full bg-gray-100" />
          <div className="leading-tight">
            <p className={`text-sm [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[11px] font-semibold ${theme.text} hover:underline line-clamp-1`}>{gardener.name}</p>
            <p className={`text-xs [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[10px] ${theme.textSec} line-clamp-1`}>{listing.location.address}</p>
          </div>
        </div>
        {isAdmin ? (
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowAdminMenu((prev) => !prev)
              }}
              className={`p-1.5 rounded-md border ${theme.border} ${theme.textSec} hover:bg-black/5`}
              aria-label="Admin options"
            >
              <MoreVertical size={16} />
            </button>
            {showAdminMenu && (
              <div className={`absolute right-0 mt-1 min-w-[120px] rounded-lg border ${theme.border} ${theme.card} shadow-xl z-20`}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAdminMenu(false)
                    onAdminDelete?.(listing.id)
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50/60"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ) : (
          !isSelf && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFollow()
              }}
              className={`text-xs [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[10px] font-bold px-3 py-1 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:px-2 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:py-0.5 rounded-md transition-colors ${isFollowing ? `bg-gray-100 ${theme.textSec}` : 'text-[#C29901] bg-[#C29901]/10'}`}
            >
              {isFollowing ? t?.profile?.followingBtn ?? 'Abonniert' : t?.profile?.followBtn ?? 'Folgen'}
            </button>
          )
        )}
      </div>
      <div className="relative aspect-[4/3] [@media(min-width:900px)_and_(orientation:landscape)]:aspect-[16/10] [@media(min-width:1200px)_and_(orientation:landscape)]:aspect-[7/4] [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:aspect-[12/5] bg-gray-100">
        <img src={listing.image} alt={listing.title} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:top-2 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:right-2 bg-white/90 backdrop-blur-sm px-2 py-1 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:px-1.5 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:py-0.5 rounded-md text-xs [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[10px] font-bold shadow-sm">
          {listing.harvestType === 'pickup' ? '📦 Abholbereit' : '🌾 Selbst ernten'}
        </div>
      </div>
      <div className="p-4 [@media(min-width:900px)_and_(orientation:landscape)]:p-3 [@media(min-width:1200px)_and_(orientation:landscape)]:p-2.5 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:p-2">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className={`text-lg [@media(min-width:900px)_and_(orientation:landscape)]:text-base [@media(min-width:1200px)_and_(orientation:landscape)]:text-sm [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[13px] font-bold ${theme.text} line-clamp-1`}>{listing.title}</h3>
            <div className="flex items-center gap-1 text-[#4A5D4E] text-sm [@media(min-width:1200px)_and_(orientation:landscape)]:text-xs [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[11px] font-medium">
              <ShoppingBag size={12} />
              <span>Noch {listing.availableQuantity} {listing.unit} {t?.listing?.available ?? 'verfügbar'}</span>
            </div>
          </div>
          <button onClick={onLike} className="transition-transform active:scale-90">
            <Heart size={22} className={isLiked ? 'fill-red-500 text-red-500' : theme.text} />
          </button>
        </div>
        <p className={`text-sm opacity-80 mb-4 [@media(min-width:900px)_and_(orientation:landscape)]:mb-3 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[11px] [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:mb-1 line-clamp-2 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:line-clamp-1 ${theme.text}`}>{listing.description}</p>
        <div className={`flex items-center gap-2 text-xs [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:hidden ${theme.textSec} mb-4 [@media(min-width:900px)_and_(orientation:landscape)]:mb-3 ${theme.bg === 'bg-[#0D1A15]' ? 'bg-[#2C3E34]' : 'bg-[#FCFAF7]'} p-2 rounded-lg`}>
          <Clock size={14} />
          <span>{listing.pickupTimes}</span>
        </div>
        {listing.availableQuantity > 0 ? (
          <div className="flex items-center gap-3 [@media(min-width:900px)_and_(orientation:landscape)]:gap-2.5 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:gap-2 mt-4 [@media(min-width:900px)_and_(orientation:landscape)]:mt-3 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:mt-1.5">
            {!isSelf && (
              <div className={`flex items-center rounded-xl border ${theme.border} p-1 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:p-0.5 h-12 [@media(min-width:900px)_and_(orientation:landscape)]:h-10 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:h-8 shrink-0 ${theme.input}`}>
                <button
                  onClick={handleDecrement}
                  className={`w-10 [@media(min-width:900px)_and_(orientation:landscape)]:w-8 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:w-6 h-full flex items-center justify-center ${theme.text} hover:opacity-70 rounded-lg transition-colors`}
                  disabled={amount <= step}
                >
                  <Minus size={16} />
                </button>
                <span className={`min-w-[4rem] [@media(min-width:900px)_and_(orientation:landscape)]:min-w-[3.3rem] [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:min-w-[2.7rem] px-2 [@media(min-width:900px)_and_(orientation:landscape)]:px-1 text-center font-bold ${theme.text} text-sm [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[11px] whitespace-nowrap`}>
                  {amount} {listing.unit}
                </span>
                <button
                  onClick={handleIncrement}
                  className={`w-10 [@media(min-width:900px)_and_(orientation:landscape)]:w-8 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:w-6 h-full flex items-center justify-center ${theme.text} hover:opacity-70 rounded-lg transition-colors`}
                  disabled={amount >= listing.availableQuantity}
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
            <button
              onClick={() => onReserve(listing.id, amount)}
              disabled={isSelf}
              className={`flex-1 h-12 [@media(min-width:900px)_and_(orientation:landscape)]:h-10 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:h-8 rounded-xl font-bold text-sm [@media(min-width:900px)_and_(orientation:landscape)]:text-xs [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:text-[11px] flex items-center justify-center gap-2 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:gap-1 transition-all active:scale-[0.98] ${isSelf ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-[#0D1A15] text-[#FCFAF7] hover:bg-[#4A5D4E] shadow-lg shadow-[#0D1A15]/10'}`}
            >
              {isSelf ? t?.listing?.yourOffer ?? 'Dein Angebot' : t?.listing?.reserve ?? 'Reservieren'}
            </button>
          </div>
        ) : (
          <button disabled className="w-full bg-gray-200 text-gray-400 py-3 [@media(min-width:900px)_and_(orientation:landscape)]:py-2.5 rounded-xl font-semibold text-sm [@media(min-width:900px)_and_(orientation:landscape)]:text-xs mt-4 [@media(min-width:900px)_and_(orientation:landscape)]:mt-3">
            {t?.listing?.soldOut ?? 'Leider vergriffen'}
          </button>
        )}
      </div>
    </div>
  )
}
