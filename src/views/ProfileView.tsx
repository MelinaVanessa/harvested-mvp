import { useState, useRef, useEffect, useMemo } from 'react'
import {
  ArrowLeft,
  PlusCircle,
  Settings,
  CheckCircle,
  Camera,
  X,
  XCircle,
  Calendar,
  ShoppingBag,
  Star,
  Trash2,
} from 'lucide-react'
import { ListingDetailModal } from '@/components/ListingDetailModal'
import { ImageCropper } from '@/components/ImageCropper'
import { LOGO_URL } from '@/constants'
import type { Listing, UserProfile, Reservation, ThemeTokens, Review } from '@/types'
import { gardenerRatingSummaryFromReviews } from '@/utils/reviewRating'

const SHARE_BRANDS = {
  link: '/brands/link.svg',
  whatsapp: '/brands/whatsapp.svg',
  messages: '/brands/messages.svg',
  share: '/brands/share.svg',
  instagram: '/brands/instagram.svg',
  linkedin: '/brands/linkedin.svg',
  x: '/brands/x.svg',
  facebook: '/brands/facebook.svg',
  tiktok: '/brands/tiktok.svg',
} as const

interface ProfileViewProps {
  user: UserProfile
  isOwnProfile: boolean
  listings: Listing[]
  users: Record<string, UserProfile>
  onUpdateProfile: (patch: Partial<UserProfile>) => void
  onBack?: () => void
  onChat?: () => void
  currentUser: UserProfile
  onFollow?: (userId: string) => void
  onDeleteListing: (id: string) => void
  onUpdateListing: (listing: Listing) => void
  onSettings?: () => void
  onUserClick: (userId: string) => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
  onCancelReservation?: (id: string) => void
  onReserve?: (listingId: string, amount: number, pickupAt: string) => void
  reviews?: Review[]
  onAddReview?: (profileId: string, rating: number, text: string) => void
  isAdmin?: boolean
  onToggleCertification?: (userId: string) => void
  onDeleteReview?: (reviewId: string) => void
  onUpdateReservation?: (reservationId: string, amount: number, pickupAt: string) => void
}

export function ProfileView({
  user,
  isOwnProfile,
  listings,
  users,
  onUpdateProfile,
  onBack,
  onChat,
  currentUser,
  onFollow,
  onDeleteListing,
  onUpdateListing,
  onSettings,
  onUserClick,
  theme,
  t,
  onCancelReservation,
  onReserve,
  reviews = [],
  onAddReview,
  isAdmin = false,
  onToggleCertification,
  onDeleteReview,
  onUpdateReservation,
}: ProfileViewProps) {
  const safeUser = user ?? ({} as UserProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editBio, setEditBio] = useState(safeUser.bio ?? '')
  const [editName, setEditName] = useState(safeUser.name ?? '')
  const [showPfpOptions, setShowPfpOptions] = useState(false)
  const [showFullPfp, setShowFullPfp] = useState(false)
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null)
  const [selectedPost, setSelectedPost] = useState<Listing | null>(null)
  const [isEditingPost, setIsEditingPost] = useState(false)
  const [editPostData, setEditPostData] = useState<Partial<Listing>>({})
  const [showFollowingList, setShowFollowingList] = useState(false)
  const [showShareOptions, setShowShareOptions] = useState(false)
  const [activeTab, setActiveTab] = useState<'posts' | 'reservations'>('posts')
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null)
  const [editReservationAmount, setEditReservationAmount] = useState(1)
  const [editReservationPickupAt, setEditReservationPickupAt] = useState('')
  const [draftRating, setDraftRating] = useState(5)
  const [draftReviewText, setDraftReviewText] = useState('')
  const [snapshotFollowing, setSnapshotFollowing] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const safeFollowing = safeUser.following ?? []
  const userListings = listings.filter((l) => l.gardenerId === safeUser.id)
  const profileGardenerRatingSummary = useMemo(
    () => gardenerRatingSummaryFromReviews(reviews, safeUser.id),
    [reviews, safeUser.id],
  )
  const isFollowing = !isOwnProfile && (currentUser.following ?? []).includes(safeUser.id)
  const myReservations: Reservation[] = isOwnProfile ? (safeUser.reservations ?? []) : []
  const profileReviews = reviews
    .filter((r) => r.profileId === safeUser.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const averageRating = profileReviews.length
    ? profileReviews.reduce((sum, r) => sum + r.rating, 0) / profileReviews.length
    : 0

  const toLocalInputValue = (iso?: string) => {
    if (!iso) return ''
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    return local.toISOString().slice(0, 16)
  }

  useEffect(() => {
    if (!isEditing && user) {
      setEditBio(user.bio ?? '')
      setEditName(user.name ?? '')
    }
  }, [user, isEditing])

  const saveProfile = () => {
    onUpdateProfile({ bio: editBio, name: editName })
    setIsEditing(false)
  }

  const handlePfpClick = () => {
    if (isOwnProfile) setShowPfpOptions(true)
    else setShowFullPfp(true)
  }

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setCropImageSrc(e.target.result as string)
          setShowPfpOptions(false)
        }
      }
      reader.readAsDataURL(event.target.files[0])
    }
  }

  const handleSaveCroppedImage = (newUrl: string) => {
    onUpdateProfile({ avatar: newUrl })
    setCropImageSrc(null)
  }

  const startEditPost = (post: Listing) => {
    setEditPostData(post)
    setIsEditingPost(true)
  }

  const saveEditedPost = () => {
    if (selectedPost && editPostData) {
      const updated = { ...selectedPost, ...editPostData } as Listing
      onUpdateListing(updated)
      setSelectedPost(updated)
      setIsEditingPost(false)
    }
  }

  const profileShareUrl = `https://harvested.app/u/${(safeUser.handle ?? '').replace('@', '')}`
  const profileShareLine = `${safeUser.name ?? 'Profil'} · ${t.brand?.name ?? 'Harvested-Berlin'} · ${profileShareUrl}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileShareUrl)
    } catch {
      /* ignore */
    }
    alert(t.errors?.profileLinkCopied ?? '')
    setShowShareOptions(false)
  }

  const shareOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowShareOptions(false)
  }

  const shareFacebook = () => {
    shareOpen(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileShareUrl)}`)
  }

  const shareLinkedIn = () => {
    shareOpen(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileShareUrl)}`)
  }

  const shareX = () => {
    const text = encodeURIComponent(
      `Check out ${safeUser.name ?? 'this profile'} on ${t.brand?.name ?? 'Harvested-Berlin'}`,
    )
    shareOpen(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(profileShareUrl)}`)
  }

  const shareWhatsApp = () => {
    shareOpen(`https://wa.me/?text=${encodeURIComponent(profileShareLine)}`)
  }

  const shareSms = () => {
    window.location.href = `sms:?body=${encodeURIComponent(profileShareLine)}`
    setShowShareOptions(false)
  }

  const copyForPasteApps = async (hint: 'instagram' | 'tiktok') => {
    try {
      await navigator.clipboard.writeText(profileShareUrl)
    } catch {
      /* ignore */
    }
    alert(
      hint === 'tiktok'
        ? (t.errors?.profileLinkCopiedTiktok ?? '')
        : (t.errors?.profileLinkCopiedInstagram ?? ''),
    )
    setShowShareOptions(false)
  }

  const shareSystem = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${safeUser.name ?? t.brand?.name ?? 'Harvested-Berlin'} Profil`,
          text: profileShareLine,
          url: profileShareUrl,
        })
        setShowShareOptions(false)
      } catch (e) {
        if ((e as Error).name !== 'AbortError') void handleCopyLink()
      }
    } else {
      void handleCopyLink()
    }
  }

  const openFollowingList = () => {
    setSnapshotFollowing(safeFollowing)
    setShowFollowingList(true)
  }

  const handleSubmitReview = () => {
    const clean = draftReviewText.trim()
    if (!clean || !onAddReview || isOwnProfile) return
    onAddReview(safeUser.id, draftRating, clean)
    setDraftReviewText('')
    setDraftRating(5)
  }

  const startEditReservation = (res: Reservation) => {
    setEditingReservationId(res.id)
    setEditReservationAmount(res.amount)
    setEditReservationPickupAt(toLocalInputValue(res.pickupAt))
  }

  if (showFollowingList) {
    return (
      <div className={`h-full flex flex-col ${theme?.bg} ${theme?.text} animate-in slide-in-from-right duration-200`}>
        <div className={`px-4 py-3 border-b ${theme?.border} flex items-center gap-3`}>
          <button onClick={() => setShowFollowingList(false)} className={`p-1 -ml-2 ${theme?.text}`}>
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold">{t?.profile?.following}</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {snapshotFollowing.map((id) => {
            const followedUser = users[id]
            if (!followedUser) return null
            const isStillFollowing = (currentUser?.following ?? []).includes(id)
            return (
              <div
                key={id}
                onClick={() => onUserClick(id)}
                className={`flex items-center justify-between p-4 border-b ${theme?.border} cursor-pointer hover:opacity-95`}
              >
                <div className="flex items-center gap-3">
                  <img src={followedUser.avatar} className="w-12 h-12 rounded-full object-cover bg-gray-100" alt={followedUser.name} />
                  <div>
                    <p className="font-bold">{followedUser.name}</p>
                  </div>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    onFollow?.(id)
                  }}
                  className="min-w-[90px]"
                >
                  <button
                    className={`w-full px-4 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                      isStillFollowing
                        ? (theme?.bg ?? '').includes('bg-[#0D1A15]')
                          ? 'bg-[#2C3E34] text-white hover:bg-red-900/30 hover:text-red-400 border border-[#2C3E34]'
                          : 'bg-gray-100 text-[#0D1A15] hover:bg-red-50 hover:text-red-600 border border-gray-200'
                        : 'bg-[#C29901] text-white border border-[#C29901] hover:bg-[#A68200]'
                    }`}
                  >
                    {isStillFollowing ? (t?.profile?.followingBtn ?? 'Abonniert') : (t?.profile?.followBtn ?? 'Folgen')}
                  </button>
                </div>
              </div>
            )
          })}
          {snapshotFollowing.length === 0 && (
            <div className={`p-8 text-center ${theme?.textSec}`}>
              <p>{t?.profile?.noFollowing}</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-full pb-24 overflow-y-auto ${theme?.bg} ${theme?.text}`}>
      {!isOwnProfile && onBack && (
        <div className={`px-3 py-3 border-b ${theme?.border} flex items-center gap-3`}>
          <button onClick={onBack} className={`p-1 -ml-2 ${theme?.text}`}>
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold">{safeUser.name ?? ''}</span>
        </div>
      )}

      <div className="px-3 pt-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="relative group cursor-pointer mr-6" onClick={handlePfpClick}>
            <img
              src={safeUser.avatar ?? ''}
              alt="Profile"
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full border ${theme?.border} shadow-sm object-cover active:scale-95 transition-transform`}
            />
            {isOwnProfile && (
              <div className="absolute bottom-0 right-0 bg-[#0D1A15] p-1.5 rounded-full text-white border-2 border-white">
                <PlusCircle size={14} />
              </div>
            )}
          </div>
          <div className="flex-1 flex justify-around items-center">
            {safeUser.role === 'gardener' && (
              <div className="flex flex-col items-center">
                <span className="font-bold text-lg">{userListings.length}</span>
                <span className={`text-xs ${theme?.textSec}`}>{t?.profile?.posts}</span>
              </div>
            )}
            <button onClick={openFollowingList} className="flex flex-col items-center hover:opacity-70 active:scale-95 transition-all">
              <span className="font-bold text-lg">{safeFollowing.length}</span>
              <span className={`text-xs ${theme?.textSec}`}>{t?.profile?.following}</span>
            </button>
            {isOwnProfile ? (
              onSettings && (
                <button onClick={onSettings} className={`flex flex-col items-center ${theme?.text} group`}>
                  <Settings size={20} className="mb-0.5 group-active:rotate-90 transition-transform" />
                  <span className={`text-xs font-semibold ${theme?.textSec}`}>{t?.profile?.settings}</span>
                </button>
              )
            ) : (
              safeUser.isMember && (
                <div className={`flex flex-col items-center ${theme?.accent}`}>
                  <CheckCircle size={20} className="mb-0.5" />
                  <span className="text-xs font-semibold">{t?.profile?.member}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="mb-5">
          {isEditing ? (
            <input
              className={`text-lg font-bold leading-tight w-full bg-transparent border-b ${theme?.border} focus:outline-none focus:border-[#C29901] mb-1 ${theme?.text}`}
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t?.profile?.namePlaceholder ?? 'Dein Name'}
            />
          ) : (
            <h2 className="text-lg font-bold leading-tight">{safeUser.name ?? ''}</h2>
          )}
          {isEditing ? (
            <div className="w-full mb-3">
              <textarea
                className={`w-full p-2 border ${theme?.border} rounded-lg text-sm focus:border-[#C29901] focus:outline-none ${theme?.input}`}
                rows={3}
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
              />
              <button onClick={saveProfile} className="text-xs bg-[#0D1A15] text-white px-4 py-2 rounded-lg font-semibold mt-1">
                Speichern
              </button>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap cursor-pointer" onClick={() => isOwnProfile && setIsEditing(true)}>
              {safeUser.bio || 'Keine Bio vorhanden.'}
            </p>
          )}
        </div>

        {isOwnProfile ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className={`flex-1 ${theme?.card} hover:opacity-80 active:scale-[0.98] transition-all font-semibold text-sm py-2 rounded-lg shadow-sm border ${theme?.border}`}
            >
              {t?.profile?.edit}
            </button>
            <button
              onClick={() => setShowShareOptions(true)}
              className={`flex-1 ${theme?.card} hover:opacity-80 active:scale-[0.98] transition-all font-semibold text-sm py-2 rounded-lg shadow-sm border ${theme?.border}`}
            >
              {t?.profile?.share}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
            <button
              onClick={() => onFollow?.(safeUser.id)}
              className={`flex-1 ${isFollowing ? `${theme?.card} ${theme?.text}` : 'bg-[#C29901] text-white'} active:scale-[0.98] transition-all font-semibold text-sm py-2 rounded-lg`}
            >
              {isFollowing ? 'Abonniert' : 'Folgen'}
            </button>
            <button
              onClick={onChat}
              className={`flex-1 ${theme?.card} hover:opacity-80 active:scale-[0.98] transition-all ${theme?.text} font-semibold text-sm py-2 rounded-lg`}
            >
              Nachricht
            </button>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={() => onToggleCertification?.(safeUser.id)}
                className={`w-full py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  safeUser.isMember
                    ? `border-red-300 text-red-600 hover:bg-red-50 ${theme?.bg}`
                    : `border-[#4A5D4E]/40 text-[#4A5D4E] hover:bg-[#4A5D4E]/10 ${theme?.card}`
                }`}
              >
                {safeUser.isMember
                  ? (t?.profile?.certOff ?? 'Zertifizierung entfernen')
                  : (t?.profile?.certOn ?? 'Als zertifiziert markieren')}
              </button>
            )}
          </div>
        )}
      </div>

      {isOwnProfile && (
        <div className={`flex border-b ${theme?.border} mt-4 mx-3`}>
          {user.role === 'gardener' && (
            <button
              onClick={() => setActiveTab('posts')}
              className={`flex-1 pb-3 text-sm font-bold text-center transition-colors relative ${activeTab === 'posts' ? theme?.text : theme?.textSec}`}
            >
              {t?.profile?.tabPosts ?? 'Angebote'}
              {activeTab === 'posts' && (
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme?.bg === 'bg-[#0D1A15]' ? 'bg-white' : 'bg-[#0D1A15]'}`} />
              )}
            </button>
          )}
          <button
            onClick={() => setActiveTab('reservations')}
            className={`flex-1 pb-3 text-sm font-bold text-center transition-colors relative ${activeTab === 'reservations' ? theme?.text : theme?.textSec}`}
          >
            {t?.profile?.tabReservations ?? 'Reserviert'}
            {activeTab === 'reservations' && (
              <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${theme?.bg === 'bg-[#0D1A15]' ? 'bg-white' : 'bg-[#0D1A15]'}`} />
            )}
          </button>
        </div>
      )}

      {!isOwnProfile && <div className={`border-t ${theme?.border} mt-4 mx-3`} />}

      <div className="px-3 mt-2">
        <div className={`grid ${activeTab === 'reservations' && isOwnProfile ? 'grid-cols-1' : 'grid-cols-3 gap-1.5'}`}>
        {(activeTab === 'posts' || !isOwnProfile) && safeUser.role === 'gardener' ? (
          userListings.length > 0 ? (
            userListings.map((l) => (
              <div
                key={l.id}
                onClick={() => {
                  setSelectedPost(l)
                  setIsEditingPost(false)
                }}
                className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer active:scale-95 transition-transform"
              >
                <img src={l.image} className="w-full h-full object-cover" alt={l.title} />
                {l.availableQuantity === 0 && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <span className="text-white text-xs font-bold">Vergeben</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={`col-span-3 py-10 text-center ${theme?.textSec} text-sm flex flex-col items-center`}>
              <div className={`w-12 h-12 rounded-full border-2 ${theme?.border} flex items-center justify-center mb-2`}>
                <Camera size={20} />
              </div>
              <span className="font-bold">Noch keine Beiträge</span>
            </div>
          )
        ) : (
          <div className="p-2 space-y-2">
            {myReservations.length > 0 ? (
              myReservations.map((res) => {
                const listing = listings.find((l) => l.id === res.listingId)
                if (!listing) return null
                return (
                  <div
                    key={res.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${theme?.border} ${theme?.card} shadow-sm animate-in slide-in-from-bottom-2`}
                  >
                    <img src={listing.image} className="w-16 h-16 rounded-lg object-cover bg-gray-100" alt={listing.title} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-bold text-sm ${theme?.text} truncate`}>{listing.title}</h4>
                      {editingReservationId === res.id ? (
                        <div className="space-y-1.5 mt-1">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min={listing.unit.toLowerCase() === 'stück' ? 1 : 0.5}
                              step={listing.unit.toLowerCase() === 'stück' ? 1 : 0.5}
                              value={editReservationAmount}
                              onChange={(e) => setEditReservationAmount(parseFloat(e.target.value || '0'))}
                              className={`w-20 p-1.5 rounded-md border ${theme?.border} ${theme?.input} text-xs`}
                            />
                            <span className={`text-xs ${theme?.textSec}`}>{listing.unit}</span>
                          </div>
                          {(listing.pickupSlots ?? []).length > 0 ? (
                            <select
                              value={editReservationPickupAt}
                              onChange={(e) => setEditReservationPickupAt(e.target.value)}
                              className={`w-full p-1.5 rounded-md border ${theme?.border} ${theme?.input} text-xs`}
                            >
                              <option value="">Abholzeit wählen</option>
                              {(listing.pickupSlots ?? []).map((slot) => (
                                <option key={slot} value={toLocalInputValue(slot)}>
                                  {new Date(slot).toLocaleString()}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <p className={`text-xs ${theme?.textSec}`}>Keine Abholtermine für dieses Angebot hinterlegt.</p>
                          )}
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (!onUpdateReservation || !editReservationPickupAt) return
                                onUpdateReservation(res.id, editReservationAmount, new Date(editReservationPickupAt).toISOString())
                                setEditingReservationId(null)
                              }}
                              disabled={
                                !Number.isFinite(editReservationAmount) ||
                                editReservationAmount <= 0 ||
                                !editReservationPickupAt ||
                                (listing.pickupSlots ?? []).length === 0
                              }
                              className="px-2 py-1 rounded-md bg-[#0D1A15] text-white text-[10px] font-semibold disabled:opacity-40"
                            >
                              Speichern
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingReservationId(null)}
                              className={`px-2 py-1 rounded-md border ${theme?.border} text-[10px] font-semibold ${theme?.text}`}
                            >
                              Abbrechen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={`text-xs ${theme?.textSec} flex items-center gap-1`}>
                            <ShoppingBag size={12} /> {res.amount} {listing.unit}
                          </p>
                          {res.pickupAt && (
                            <p className={`text-[10px] ${theme?.textSec} opacity-80`}>
                              Abholung: {new Date(res.pickupAt).toLocaleString()}
                            </p>
                          )}
                          <p className={`text-[10px] ${theme?.textSec} opacity-70`}>{new Date(res.timestamp).toLocaleDateString()}</p>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {onUpdateReservation && editingReservationId !== res.id && (listing.pickupSlots ?? []).length > 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditReservation(res)
                          }}
                          className={`px-2 py-1 rounded-md border ${theme?.border} text-[10px] font-semibold ${theme?.text}`}
                        >
                          Bearbeiten
                        </button>
                      )}
                      {onCancelReservation && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onCancelReservation(res.id)
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className={`py-10 text-center ${theme?.textSec} text-sm flex flex-col items-center`}>
                <div className={`w-12 h-12 rounded-full border-2 ${theme?.border} flex items-center justify-center mb-2`}>
                  <Calendar size={20} />
                </div>
                <span className="font-bold">{t?.profile?.noReservations}</span>
              </div>
            )}
          </div>
        )}
        </div>
      </div>

      <div className="px-3 pt-4 pb-2">
        <div className={`rounded-xl border ${theme?.border} ${theme?.card} p-3`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${theme?.text}`}>{t?.profile?.reviewsTitle ?? 'Reviews'}</h3>
            {profileReviews.length > 0 && (
              <span className={`text-xs ${theme?.textSec}`}>
                {t?.profile?.averageRating ?? 'Average'}: {averageRating.toFixed(1)} / 5
              </span>
            )}
          </div>

          {!isOwnProfile && onAddReview && (
            <div className={`mt-3 border-t ${theme?.border} pt-3`}>
              <p className={`text-xs font-semibold mb-2 ${theme?.text}`}>{t?.profile?.writeReview ?? 'Write a review'}</p>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDraftRating(value)}
                    className="p-0.5"
                    aria-label={`Set rating ${value}`}
                  >
                    <Star size={16} className={value <= draftRating ? 'fill-[#C29901] text-[#C29901]' : `${theme?.textSec}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={draftReviewText}
                onChange={(e) => setDraftReviewText(e.target.value)}
                className={`w-full rounded-lg border ${theme?.border} ${theme?.input} p-2 text-sm focus:outline-none`}
                rows={2}
                placeholder={t?.profile?.reviewPlaceholder ?? 'How was your experience?'}
              />
              <button
                type="button"
                onClick={handleSubmitReview}
                disabled={!draftReviewText.trim()}
                className="mt-2 h-9 px-3 rounded-lg bg-[#0D1A15] text-[#FCFAF7] text-xs font-semibold disabled:opacity-40"
              >
                {t?.profile?.submitReview ?? 'Submit review'}
              </button>
            </div>
          )}

          <div className="mt-3 space-y-2">
            {profileReviews.length > 0 ? (
              profileReviews.map((review) => {
                const reviewer = users[review.reviewerId]
                return (
                  <div key={review.id} className={`rounded-lg border ${theme?.border} p-2`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${theme?.text}`}>{reviewer?.name ?? 'User'}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] ${theme?.textSec}`}>{new Date(review.timestamp).toLocaleDateString()}</span>
                        {isAdmin && onDeleteReview && (
                          <button
                            type="button"
                            onClick={() => onDeleteReview(review.id)}
                            className="p-1 rounded-md text-red-500 hover:bg-red-50/60 transition-colors"
                            aria-label={t?.profile?.deleteReview ?? 'Delete review'}
                            title={t?.profile?.deleteReview ?? 'Delete review'}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <Star key={`${review.id}-${value}`} size={12} className={value <= review.rating ? 'fill-[#C29901] text-[#C29901]' : `${theme?.textSec}`} />
                      ))}
                    </div>
                    <p className={`text-xs mt-1 ${theme?.text}`}>{review.text}</p>
                  </div>
                )
              })
            ) : (
              <p className={`text-xs ${theme?.textSec}`}>{t?.profile?.noReviews ?? 'No reviews yet.'}</p>
            )}
          </div>
        </div>
      </div>

      {showShareOptions && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={() => setShowShareOptions(false)}
        >
          <div className={`${theme?.card} m-4 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300 ring-1 ring-black/5`} onClick={(e) => e.stopPropagation()}>
            <div className={`border-b ${theme?.border} px-3 py-3 text-center`}>
              <h3 className={`text-sm font-bold ${theme?.textSec}`}>{t?.profile?.shareTitle}</h3>
            </div>
            <div className={`relative border-b ${theme?.border}`}>
              <div
                className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-proximity touch-pan-x pl-4 pr-3 py-2.5"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                <button
                  type="button"
                  onClick={() => void handleCopyLink()}
                  className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[5.5rem] max-w-[6rem]"
                >
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-2 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.link} alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>{t?.profile?.copy}</span>
                </button>
                <button type="button" onClick={shareWhatsApp} className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]">
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-1.5 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.whatsapp} alt="" className="w-8 h-8 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>WhatsApp</span>
                </button>
                <button type="button" onClick={shareSms} className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]">
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-2 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.messages} alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>Nachricht</span>
                </button>
                <button
                  type="button"
                  onClick={() => void copyForPasteApps('instagram')}
                  className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]"
                >
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-1.5 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.instagram} alt="" className="w-8 h-8 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>Instagram</span>
                </button>
                <button type="button" onClick={shareLinkedIn} className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]">
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-2 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.linkedin} alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>LinkedIn</span>
                </button>
                <button type="button" onClick={shareX} className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]">
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-2 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.x} alt="" className="w-6 h-6 object-contain dark:invert" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>X</span>
                </button>
                <button type="button" onClick={shareFacebook} className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]">
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-2 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.facebook} alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>Facebook</span>
                </button>
                <button
                  type="button"
                  onClick={() => void copyForPasteApps('tiktok')}
                  className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]"
                >
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-2 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.tiktok} alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>TikTok</span>
                </button>
                <button type="button" onClick={() => void shareSystem()} className="flex shrink-0 snap-start flex-col items-center gap-1 group min-w-[4rem] max-w-[4.5rem]">
                  <div className={`w-12 h-12 rounded-2xl ${theme?.card} border ${theme?.border} shadow-sm flex items-center justify-center p-2 group-active:scale-90 transition-transform`}>
                    <img src={SHARE_BRANDS.share} alt="" className="w-7 h-7 object-contain" />
                  </div>
                  <span className={`text-[11px] text-center leading-tight ${theme?.text}`}>{t?.profile?.more}</span>
                </button>
              </div>
            </div>
            <div className={`border-t ${theme?.border} bg-gray-50/50 px-3 py-3 dark:bg-black/20`}>
              <div className={`flex items-center gap-3 p-2.5 border ${theme?.border} rounded-xl ${theme?.bg}`}>
                <img
                  src={LOGO_URL}
                  alt="Harvested"
                  className="w-10 h-10 rounded-xl object-contain shrink-0 bg-[#FCFAF7] border border-[#88887D]/15"
                  onError={(e) => {
                    const el = e.currentTarget
                    if (el.dataset.fallback === '1') return
                    el.dataset.fallback = '1'
                    el.src = '/favicon.svg'
                  }}
                />
                <img src={safeUser.avatar ?? ''} className="w-10 h-10 rounded-full object-cover shrink-0 border border-[#88887D]/15" alt="" />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold ${theme?.text} truncate`}>{safeUser.name ?? ''}</p>
                  <p className={`text-xs ${theme?.textSec} truncate`}>harvested.app/u/{(safeUser.handle ?? '').replace('@', '')}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mx-4 mb-6">
            <button onClick={() => setShowShareOptions(false)} className={`w-full ${theme?.card} py-4 rounded-2xl text-red-500 font-bold shadow-lg active:scale-95 transition-transform`}>
              {t?.profile?.cancel}
            </button>
          </div>
        </div>
      )}

      {selectedPost && (
        <ListingDetailModal
          selectedPost={selectedPost}
          setSelectedPost={setSelectedPost}
          user={currentUser}
          gardener={safeUser}
          gardenerRatingSummary={profileGardenerRatingSummary}
          onReserve={!isOwnProfile ? onReserve : undefined}
          isOwnProfile={isOwnProfile}
          onEditListing={startEditPost}
          onDeleteListing={onDeleteListing}
          saveEditedPost={saveEditedPost}
          isEditingPost={isEditingPost}
          editPostData={editPostData}
          setEditPostData={setEditPostData}
          startEditPost={startEditPost}
          theme={theme}
          t={t}
        />
      )}

      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileSelect} />

      {showPfpOptions && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200" onClick={() => setShowPfpOptions(false)}>
          <div className={`${theme?.card} m-4 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300 ring-1 ring-black/5`} onClick={(e) => e.stopPropagation()}>
            <div className={`py-4 text-center border-b ${theme?.border}`}>
              <h3 className={`text-sm font-bold ${theme?.textSec}`}>{t?.profile?.changePic}</h3>
            </div>
            <button onClick={() => fileInputRef.current?.click()} className={`w-full py-4 text-center font-semibold active:bg-[#C29901]/10 transition-colors border-b ${theme?.border} ${theme?.text}`}>
              {t?.profile?.newPic}
            </button>
            <button onClick={() => { setShowPfpOptions(false); setShowFullPfp(true); }} className={`w-full py-4 text-center font-semibold active:bg-[#C29901]/10 transition-colors ${theme?.text}`}>
              {t?.profile?.view}
            </button>
          </div>
          <div className="mx-4 mb-6">
            <button onClick={() => setShowPfpOptions(false)} className={`w-full ${theme?.card} py-4 rounded-2xl text-red-500 font-bold shadow-lg active:scale-95 transition-transform`}>
              {t?.profile?.cancel}
            </button>
          </div>
        </div>
      )}

      {cropImageSrc && (
        <ImageCropper imageSrc={cropImageSrc} onCancel={() => setCropImageSrc(null)} onSave={handleSaveCroppedImage} t={t} />
      )}

      {showFullPfp && (
        <div className="absolute inset-0 z-50 bg-black flex items-center justify-center animate-in fade-in duration-200" onClick={() => setShowFullPfp(false)}>
          <button className="absolute top-4 right-4 text-white p-2 bg-white/10 rounded-full">
            <X size={24} />
          </button>
          <img src={safeUser.avatar ?? ''} className="max-w-full max-h-full object-contain" alt={safeUser.name ?? ''} />
        </div>
      )}
    </div>
  )
}
