import { useState, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  PlusCircle,
  Settings,
  CheckCircle,
  Edit3,
  Camera,
  X,
  Link as LinkIcon,
  MessageCircle,
  Send,
  Share2,
  XCircle,
  Calendar,
  ShoppingBag,
} from 'lucide-react'
import { ListingCard } from '@/components/ListingCard'
import { ListingDetailModal } from '@/components/ListingDetailModal'
import { ImageCropper } from '@/components/ImageCropper'
import type { Listing, UserProfile, Reservation, ThemeTokens } from '@/types'

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
  const [snapshotFollowing, setSnapshotFollowing] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const safeFollowing = safeUser.following ?? []
  const userListings = listings.filter((l) => l.gardenerId === safeUser.id)
  const isFollowing = !isOwnProfile && (currentUser.following ?? []).includes(safeUser.id)
  const myReservations: Reservation[] = isOwnProfile ? (safeUser.reservations ?? []) : []

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

  const handleCopyLink = () => {
    alert('Link in die Zwischenablage kopiert!')
    setShowShareOptions(false)
  }

  const openFollowingList = () => {
    setSnapshotFollowing(safeFollowing)
    setShowFollowingList(true)
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
                    <p className={`text-xs ${theme?.textSec}`}>{followedUser.handle}</p>
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
        <div className={`px-4 py-3 border-b ${theme?.border} flex items-center gap-3`}>
          <button onClick={onBack} className={`p-1 -ml-2 ${theme?.text}`}>
            <ArrowLeft size={24} />
          </button>
          <span className="font-bold">{safeUser.handle ?? ''}</span>
        </div>
      )}

      <div className="px-5 pt-6 pb-4">
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
          <p className={`${theme?.textSec} text-sm mb-2`}>{safeUser.handle ?? ''}</p>
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
        )}
      </div>

      {isOwnProfile && (
        <div className={`flex border-b ${theme?.border} mt-4`}>
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

      {!isOwnProfile && <div className={`border-t ${theme?.border} mt-4`} />}

      <div className={`grid ${activeTab === 'reservations' && isOwnProfile ? 'grid-cols-1' : 'grid-cols-3 gap-0.5'} mt-0.5`}>
        {(activeTab === 'posts' || !isOwnProfile) && safeUser.role === 'gardener' ? (
          userListings.length > 0 ? (
            userListings.map((l) => (
              <div
                key={l.id}
                onClick={() => {
                  setSelectedPost(l)
                  setIsEditingPost(false)
                }}
                className="relative aspect-square bg-gray-100 cursor-pointer active:scale-95 transition-transform"
              >
                <img src={l.image} className="w-full h-full object-cover" alt={l.title} />
                {l.availableQuantity === 0 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
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
                      <p className={`text-xs ${theme?.textSec} flex items-center gap-1`}>
                        <ShoppingBag size={12} /> {res.amount} {listing.unit}
                      </p>
                      <p className={`text-[10px] ${theme?.textSec} opacity-70`}>{new Date(res.timestamp).toLocaleDateString()}</p>
                    </div>
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

      {showShareOptions && (
        <div
          className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200"
          onClick={() => setShowShareOptions(false)}
        >
          <div className={`${theme?.card} m-4 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 duration-300 ring-1 ring-black/5`} onClick={(e) => e.stopPropagation()}>
            <div className={`py-4 text-center border-b ${theme?.border}`}>
              <h3 className={`text-sm font-bold ${theme?.textSec}`}>{t?.profile?.shareTitle}</h3>
            </div>
            <div className="grid grid-cols-4 gap-4 p-4">
              <button onClick={handleCopyLink} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 group-active:scale-90 transition-transform">
                  <LinkIcon size={24} />
                </div>
                <span className={`text-xs ${theme?.text}`}>{t?.profile?.copy}</span>
              </button>
              <button onClick={() => setShowShareOptions(false)} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 group-active:scale-90 transition-transform">
                  <MessageCircle size={24} />
                </div>
                <span className={`text-xs ${theme?.text}`}>WhatsApp</span>
              </button>
              <button onClick={() => setShowShareOptions(false)} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-active:scale-90 transition-transform">
                  <Send size={24} />
                </div>
                <span className={`text-xs ${theme?.text}`}>Nachricht</span>
              </button>
              <button onClick={() => setShowShareOptions(false)} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-700 group-active:scale-90 transition-transform">
                  <Share2 size={24} />
                </div>
                <span className={`text-xs ${theme?.text}`}>{t?.profile?.more}</span>
              </button>
            </div>
            <div className={`p-4 border-t ${theme?.border} bg-gray-50/50`}>
              <div className={`flex items-center gap-3 p-3 border ${theme?.border} rounded-xl ${theme?.bg}`}>
                <img src={safeUser.avatar ?? ''} className="w-10 h-10 rounded-full object-cover" alt={safeUser.name ?? ''} />
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
          user={safeUser}
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
