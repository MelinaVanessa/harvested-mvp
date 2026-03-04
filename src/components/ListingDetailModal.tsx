import { useState } from 'react'
import { X, ShoppingBag, Clock, Leaf, Edit3, Trash2, Save, Sparkles, Loader2 } from 'lucide-react'
import type { Listing, UserProfile, ThemeTokens } from '@/types'

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
}: ListingDetailModalProps) {
  const [recipe, setRecipe] = useState('')
  const [loadingRecipe, setLoadingRecipe] = useState(false)

  const handleGenerateRecipe = async () => {
    setLoadingRecipe(true)
    setTimeout(() => {
      setRecipe('🍏 Apfelkuchen mit Zimtstreuseln\n🥗 Frischer Apfel-Fenchel-Salat\n🥞 Apfel-Pfannkuchen')
      setLoadingRecipe(false)
    }, 1500)
  }

  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in"
      onClick={() => setSelectedPost(null)}
    >
      <div
        className={`${theme.card} ${theme.text} w-full max-h-full overflow-y-auto rounded-3xl shadow-2xl flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <img src={selectedPost.image} className="w-full aspect-square object-cover" alt={selectedPost.title} />
          <button
            onClick={() => setSelectedPost(null)}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
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
              <h3 className="text-2xl font-bold mb-2">{selectedPost.title}</h3>
              <div className={`flex gap-4 text-sm ${theme.textSec} mb-4`}>
                <span className="flex items-center gap-1">
                  <ShoppingBag size={14} /> {selectedPost.availableQuantity} {selectedPost.unit}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {selectedPost.datePosted.split('T')[0]}
                </span>
              </div>
              <p className="opacity-80 mb-6">{selectedPost.description}</p>
            </>
          )}

          {!isOwnProfile && !isEditingPost && (
            <div
              className={`mt-4 mb-6 p-4 rounded-xl border border-[#4A5D4E]/20 ${theme.bg === 'bg-[#0D1A15]' ? 'bg-[#1A2E35]' : 'bg-[#F2F4F0]'}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="text-[#4A5D4E]" size={20} />
                <h4 className="font-bold text-sm text-[#4A5D4E]">{t?.listing?.recipes}</h4>
              </div>
              {!recipe ? (
                <button
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
                <div className="text-sm whitespace-pre-line leading-relaxed animate-in fade-in">{recipe}</div>
              )}
            </div>
          )}

          {isOwnProfile ? (
            <div className={`flex gap-3 mt-auto pt-4 border-t ${theme.border}`}>
              {isEditingPost ? (
                <button
                  onClick={saveEditedPost}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#0D1A15] text-white py-3 rounded-xl font-bold active:scale-95 transition-transform"
                >
                  <Save size={18} /> Speichern
                </button>
              ) : (
                <button
                  onClick={() => startEditPost(selectedPost)}
                  className={`flex-1 flex items-center justify-center gap-2 ${theme.bg} ${theme.text} border ${theme.border} py-3 rounded-xl font-bold active:scale-95 transition-transform`}
                >
                  <Edit3 size={18} /> Bearbeiten
                </button>
              )}
              <button
                onClick={() => {
                  onDeleteListing(selectedPost.id)
                  setSelectedPost(null)
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl font-bold active:scale-95 transition-transform"
              >
                <Trash2 size={18} /> Löschen
              </button>
            </div>
          ) : (
            <div className={`text-center text-sm ${theme.textSec} italic mt-4`}>
              Kontaktieren Sie {user.name} für Reservierungen.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
