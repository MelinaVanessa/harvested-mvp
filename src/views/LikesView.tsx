import { Heart } from 'lucide-react'
import { ListingCard } from '@/components/ListingCard'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

interface LikesViewProps {
  listings: Listing[]
  currentUser: UserProfile
  toggleLike: (listingId: string) => void
  toggleFollow: (gardenerId: string) => void
  getGardener: (id: string) => UserProfile
  handleReservation: (listingId: string, amount: number) => void
  onUserClick: (userId: string) => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
}

export function LikesView({
  listings,
  currentUser,
  toggleLike,
  toggleFollow,
  getGardener,
  handleReservation,
  onUserClick,
  theme,
  t,
}: LikesViewProps) {
  const likedListings = listings.filter((l) => currentUser.likedListings.includes(l.id))
  return (
    <div className={`pt-4 px-4 space-y-6 ${theme.bg} min-h-full pb-20`}>
      <h2 className={`text-xl font-bold px-2 ${theme.text}`}>{t?.likes?.title}</h2>
      {likedListings.length === 0 ? (
        <div className={`text-center py-20 ${theme.textSec}`}>
          <Heart size={48} className="mx-auto mb-4 opacity-20" />
          <p>{t?.likes?.empty}</p>
        </div>
      ) : (
        likedListings.map((l) => (
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
        ))
      )}
    </div>
  )
}
