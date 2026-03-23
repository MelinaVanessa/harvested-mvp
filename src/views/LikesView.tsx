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
  onAdminDelete: (listingId: string) => void
  isAdmin: boolean
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
  onAdminDelete,
  isAdmin,
  onUserClick,
  theme,
  t,
}: LikesViewProps) {
  const likedListings = listings.filter((l) => currentUser.likedListings.includes(l.id))
  return (
    <div className={`pt-4 px-4 [@media(min-width:1200px)_and_(orientation:landscape)]:px-6 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:px-5 space-y-6 ${theme.bg} min-h-full pb-20`}>
      <h2 className={`text-xl font-bold px-2 ${theme.text}`}>{t?.likes?.title}</h2>
      {likedListings.length === 0 ? (
        <div className={`text-center py-20 ${theme.textSec}`}>
          <Heart size={48} className="mx-auto mb-4 opacity-20" />
          <p>{t?.likes?.empty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 [@media(min-width:900px)_and_(orientation:landscape)]:grid-cols-2 [@media(min-width:900px)_and_(orientation:landscape)]:gap-5 [@media(min-width:1200px)_and_(orientation:landscape)]:grid-cols-3 [@media(min-width:1200px)_and_(orientation:landscape)]:gap-6 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:grid-cols-3 [@media(min-width:1000px)_and_(max-height:700px)_and_(orientation:landscape)]:gap-4">
          {likedListings.map((l) => (
            <ListingCard
              key={l.id}
              listing={l}
              gardener={getGardener(l.gardenerId)}
              currentUser={currentUser}
              onLike={() => toggleLike(l.id)}
              onFollow={() => toggleFollow(l.gardenerId)}
              onReserve={handleReservation}
              onAdminDelete={onAdminDelete}
              isAdmin={isAdmin}
              onUserClick={onUserClick}
              theme={theme}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  )
}
