import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, ShoppingBag, Clock, Leaf, Edit3, Trash2, Save, Sparkles, Loader2, Minus, Plus, MapPin } from 'lucide-react'
import type { Listing, UserProfile, ThemeTokens } from '@/types'
import { getGoogleMapsUrlForListing } from '@/utils/listingPosition'

interface ListingDetailModalProps {
  selectedPost: Listing
  setSelectedPost: (post: Listing | null) => void
  user: UserProfile
  isOwnProfile: boolean
  onEditListing: (post: Listing) => void
  onDeleteListing: (id: string) => void
  saveEditedPost: () => void
  isEditingPost: boolean
  editPostData: Partial<Listing>
  setEditPostData: (data: Partial<Listing>) => void
  startEditPost: (post: Listing) => void
  theme: ThemeTokens
  t: Record<string, Record<string, string>>
  /** Compact viewport-friendly layout when opening from the map */
  variant?: 'default' | 'map'
  /** Listing author — used for reserve UI (isSelf check) and contact copy */
  gardener?: UserProfile
  onReserve?: (listingId: string, amount: number) => void
}

export function ListingDetailModal({
  selectedPost,
  setSelectedPost,
  user,
  isOwnProfile,
  onDeleteListing,
  saveEditedPost,
  isEditingPost,
  editPostData,
  setEditPostData,
  startEditPost,
  theme,
  t,
  variant = 'default',
  gardener,
  onReserve,
}: ListingDetailModalProps) {
  const [recipe, setRecipe] = useState('')
  const [loadingRecipe, setLoadingRecipe] = useState(false)
  const step = selectedPost.unit.toLowerCase() === 'stück' ? 1 : 0.5
  const [reserveAmount, setReserveAmount] = useState(() =>
    Math.min(selectedPost.availableQuantity, selectedPost.unit.toLowerCase() === 'stück' ? 1 : 0.5),
  )

  useEffect(() => {
    const s = selectedPost.unit.toLowerCase() === 'stück' ? 1 : 0.5
    setReserveAmount(Math.min(selectedPost.availableQuantity, s))
  }, [selectedPost.id, selectedPost.availableQuantity, selectedPost.unit])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  const isMap = variant === 'map'
  const authorId = String(selectedPost.gardenerId ?? '').trim()
  const isSelfListing = Boolean(authorId) && String(user.id) === authorId
  const sellerContactName = gardener?.name?.trim()
  const contactReserveLine = sellerContactName
    ? (t?.listing?.contactNamed ?? 'Kontaktieren Sie {{name}} für Reservierungen.').replace(
        /\{\{name\}\}/g,
        sellerContactName,
      )
    : (t?.listing?.contactUnknownSeller ?? 'Kontaktieren Sie den Anbieter für Reservierungen.')
  /** Show stepper + Reservieren for any listing that isn’t yours (don’t gate on onReserve — props must still fire the handler). */
  const showReserveBar = !isSelfListing && !isEditingPost

  const handleGenerateRecipe = async () => {
    setLoadingRecipe(true)
    setTimeout(() => {
      setRecipe('🍏 Apfelkuchen mit Zimtstreuseln\n🥗 Frischer Apfel-Fenchel-Salat\n🥞 Apfel-Pfannkuchen')
      setLoadingRecipe(false)
    }, 1500)
  }

  const handleDecrementReserve = () =>
    setReserveAmount((prev) => Math.max(step, prev - step))
  const handleIncrementReserve = () =>
    setReserveAmount((prev) => Math.min(selectedPost.availableQuantity, prev + step))

  /** Gold CTA so the button never blends into dark green cards (`#0D1A15` on `#1A2621` was effectively invisible). */
  const reserveCtaClass = isSelfListing
    ? `border ${theme.border} ${theme.bg} ${theme.textSec} cursor-default`
    : 'bg-[#C29901] text-[#0D1A15] hover:bg-[#a8840c] shadow-md ring-1 ring-black/15'

  const reserveControls = showReserveBar ? (
    <div className={`${isMap ? 'mb-3' : 'mb-6'}`}>
      {selectedPost.availableQuantity > 0 ? (
        <div className={`flex items-center gap-2 ${isMap ? 'flex-wrap' : ''}`}>
          {!isSelfListing && (
            <div
              className={`flex items-center rounded-xl border ${theme.border} p-0.5 h-9 shrink-0 ${theme.input}`}
            >
              <button
                type="button"
                onClick={handleDecrementReserve}
                className="w-8 h-full flex items-center justify-center rounded-lg hover:opacity-70 disabled:opacity-40"
                disabled={reserveAmount <= step}
              >
                <Minus size={16} />
              </button>
              <span className={`min-w-[2.75rem] px-1 text-center text-xs font-bold ${theme.text}`}>
                {reserveAmount} {selectedPost.unit}
              </span>
              <button
                type="button"
                onClick={handleIncrementReserve}
                className="w-8 h-full flex items-center justify-center rounded-lg hover:opacity-70 disabled:opacity-40"
                disabled={reserveAmount >= selectedPost.availableQuantity}
              >
                <Plus size={16} />
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => onReserve?.(selectedPost.id, reserveAmount)}
            disabled={isSelfListing}
            className={`flex-1 min-w-[8rem] h-10 rounded-xl text-sm font-bold flex items-center justify-center gap-1 transition-all active:scale-[0.98] ${reserveCtaClass}`}
          >
            {isSelfListing
              ? t?.listing?.yourOffer ?? 'Dein Angebot'
              : t?.listing?.reserve ?? 'Reservieren'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled
          className={`w-full py-2.5 rounded-xl text-xs font-semibold border ${theme.border} ${theme.bg} ${theme.textSec} opacity-80`}
        >
          {t?.listing?.soldOut ?? 'Leider vergriffen'}
        </button>
      )}
    </div>
  ) : null

  const modal = (
    <div
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in ${
        isMap ? 'p-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]' : 'p-4'
      }`}
      onClick={() => setSelectedPost(null)}
      role="presentation"
    >
      <div
        className={`${theme.card} ${theme.text} w-full rounded-3xl shadow-2xl flex flex-col ${
          isMap
            ? 'max-w-md max-h-[min(92dvh,calc(100svh-1.5rem))] overflow-hidden'
            : 'max-h-full overflow-y-auto'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-detail-title"
      >
        <div className={`relative shrink-0 ${isMap ? 'overflow-hidden rounded-t-3xl' : ''}`}>
          <img
            src={selectedPost.image}
            className={
              isMap
                ? 'w-full object-cover max-h-[min(30vh,200px)] h-[min(30vh,200px)] sm:max-h-[min(34vh,240px)] sm:h-[min(34vh,240px)]'
                : 'w-full aspect-square object-cover'
            }
            alt={selectedPost.title}
          />
          <button
            type="button"
            onClick={() => setSelectedPost(null)}
            className="absolute top-3 right-3 bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>
        <div className={`flex flex-col flex-1 min-h-0 ${isMap ? 'p-4 overflow-y-auto' : 'p-6'}`}>
          {isEditingPost ? (
            <div className="space-y-4">
              <input
                className={`w-full text-2xl font-bold ${theme.text} border-b border-[#C29901] focus:outline-none bg-transparent`}
                value={editPostData.title}
                onChange={(e) => setEditPostData({ ...editPostData, title: e.target.value })}
                placeholder="Titel"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  className={`w-20 p-2 border rounded-lg ${theme.input}`}
                  value={editPostData.availableQuantity}
                  onChange={(e) =>
                    setEditPostData({ ...editPostData, availableQuantity: parseFloat(e.target.value) })
                  }
                />
                <span className="self-center text-sm font-bold">{selectedPost.unit} verfügbar</span>
              </div>
              <textarea
                className={`w-full p-3 border rounded-lg h-24 text-sm ${theme.input}`}
                value={editPostData.description}
                onChange={(e) => setEditPostData({ ...editPostData, description: e.target.value })}
                placeholder="Beschreibung"
              />
            </div>
          ) : (
            <>
              <h3
                id="listing-detail-title"
                className={`font-bold mb-2 ${isMap ? 'text-lg sm:text-xl' : 'text-2xl'}`}
              >
                {selectedPost.title}
              </h3>
              {!isSelfListing ? (
                <div className={`flex flex-col gap-2 ${isMap ? 'mb-2' : 'mb-3'}`}>
                  <div className={`flex items-center gap-1 text-[#4A5D4E] text-sm font-medium`}>
                    <ShoppingBag size={14} />
                    <span>
                      Noch {selectedPost.availableQuantity} {selectedPost.unit}{' '}
                      {t?.listing?.available ?? 'verfügbar'}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 ${isMap ? 'text-xs' : 'text-sm'} ${theme.textSec}`}>
                    <Clock size={14} /> {selectedPost.datePosted.split('T')[0]}
                  </div>
                </div>
              ) : (
                <div className={`flex gap-4 ${isMap ? 'text-xs mb-3' : 'text-sm mb-4'} ${theme.textSec}`}>
                  <span className="flex items-center gap-1">
                    <ShoppingBag size={14} /> {selectedPost.availableQuantity} {selectedPost.unit}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {selectedPost.datePosted.split('T')[0]}
                  </span>
                </div>
              )}
              {!isEditingPost && (
                <div className={`space-y-2 ${isMap ? 'mb-3' : 'mb-4'}`}>
                  {selectedPost.location.address?.trim() ? (
                    <p className={`text-sm ${theme.text} flex items-start gap-2`}>
                      <MapPin size={16} className="shrink-0 mt-0.5 text-[#4A5D4E]" aria-hidden />
                      <span>{selectedPost.location.address.trim()}</span>
                    </p>
                  ) : null}
                  {selectedPost.pickupTimes ? (
                    <p className={`text-sm flex items-center gap-2 ${theme.textSec}`}>
                      <Clock size={14} aria-hidden />
                      {selectedPost.pickupTimes}
                    </p>
                  ) : null}
                  <a
                    href={getGoogleMapsUrlForListing(selectedPost)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl border ${theme.border} py-2.5 text-sm font-semibold ${theme.text} bg-[#C29901]/15 hover:bg-[#C29901]/25 transition-colors`}
                  >
                    <MapPin size={18} className="text-[#C29901]" aria-hidden />
                    {t?.listing?.openInGoogleMaps ?? 'Open in Google Maps'}
                  </a>
                </div>
              )}
              {reserveControls}
              <p className={`opacity-80 ${isMap ? 'text-sm mb-4' : 'mb-6'}`}>{selectedPost.description}</p>
            </>
          )}

          {!isSelfListing && !isEditingPost && (
            <div
              className={`${isMap ? 'mt-0 mb-3 p-3' : 'mt-4 mb-6 p-4'} rounded-xl border border-[#4A5D4E]/20 ${theme.bg === 'bg-[#0D1A15]' ? 'bg-[#1A2E35]' : 'bg-[#F2F4F0]'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="text-[#4A5D4E]" size={20} />
                <h4 className="font-bold text-sm text-[#4A5D4E]">{t?.listing?.recipes}</h4>
              </div>
              {!recipe ? (
                <button
                  type="button"
                  onClick={handleGenerateRecipe}
                  disabled={loadingRecipe}
                  className="w-full bg-[#4A5D4E] text-white py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#3A4D3E] transition-colors disabled:opacity-70"
                >
                  {loadingRecipe ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {loadingRecipe ? t?.listing?.loadingRecipes : t?.listing?.cook}
                </button>
              ) : (
                <div className="text-sm whitespace-pre-line leading-relaxed animate-fade-in">{recipe}</div>
              )}
            </div>
          )}

          {isOwnProfile ? (
            <div className={`flex gap-3 mt-auto pt-4 border-t ${theme.border} shrink-0`}>
              {isEditingPost ? (
                <button
                  type="button"
                  onClick={saveEditedPost}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0D1A15] text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  <Save size={18} /> Speichern
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => startEditPost(selectedPost)}
                  className={`flex-1 flex items-center justify-center gap-2 ${theme.bg} ${theme.text} border ${theme.border} py-3 rounded-xl font-bold active:scale-95 transition-transform`}
                >
                  <Edit3 size={18} /> Bearbeiten
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  onDeleteListing(selectedPost.id)
                  setSelectedPost(null)
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold active:scale-95 transition-transform"
              >
                <Trash2 size={18} /> Löschen
              </button>
            </div>
          ) : showReserveBar ? null : !isSelfListing ? (
            <div className={`text-center ${isMap ? 'text-xs mt-2' : 'text-sm mt-4'} ${theme.textSec} italic shrink-0`}>
              {contactReserveLine}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}
