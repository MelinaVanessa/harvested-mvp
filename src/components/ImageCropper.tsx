import { useState, useRef } from 'react'
import { X, Leaf } from 'lucide-react'

interface ImageCropperProps {
  imageSrc: string
  onCancel: () => void
  onSave: (dataUrl: string) => void
  t: Record<string, Record<string, string>>
}

export function ImageCropper({ imageSrc, onCancel, onSave, t }: ImageCropperProps) {
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement>(null)

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      setOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y })
    }
  }

  const handlePointerUp = () => setIsDragging(false)

  const handleSave = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const size = 300
    canvas.width = size
    canvas.height = size
    if (ctx && imgRef.current) {
      ctx.fillStyle = '#FCFAF7'
      ctx.fillRect(0, 0, size, size)
      const scaleFactor = size / 250
      ctx.save()
      ctx.translate(size / 2, size / 2)
      ctx.scale(zoom, zoom)
      ctx.translate(offset.x * scaleFactor, offset.y * scaleFactor)
      const img = imgRef.current
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2)
      ctx.restore()
      onSave(canvas.toDataURL('image/jpeg', 0.9))
    }
  }

  return (
    <div className="absolute inset-0 z-[60] bg-[#FCFAF7] flex flex-col animate-in slide-in-from-bottom-full duration-300">
      <div className="px-4 py-4 border-b border-[#88887D]/20 flex justify-between items-center bg-[#FCFAF7]">
        <button onClick={onCancel} className="p-2 -ml-2 text-[#0D1A15]">
          <X size={24} />
        </button>
        <h3 className="font-bold text-[#0D1A15]">{t?.profile?.crop ?? 'Zuschneiden'}</h3>
        <button onClick={handleSave} className="text-[#C29901] font-bold text-sm">
          {t?.profile?.done ?? 'Fertig'}
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-[#0D1A15]/5">
        <p className="text-xs text-[#88887D] mb-4">Verschieben & Zoomen</p>
        <div
          className="relative w-[250px] h-[250px] rounded-full overflow-hidden border-4 border-white shadow-xl cursor-move touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <img
            ref={imgRef}
            src={imageSrc}
            alt="To Crop"
            draggable={false}
            className="absolute max-w-none origin-center"
            style={{
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              left: '50%',
              top: '50%',
            }}
          />
        </div>
        <div className="w-full max-w-[250px] mt-8 flex items-center gap-4">
          <Leaf size={16} className="text-[#88887D]" />
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-[#88887D]/20 rounded-lg appearance-none cursor-pointer accent-[#0D1A15]"
          />
          <Leaf size={24} className="text-[#0D1A15]" />
        </div>
      </div>
    </div>
  )
}
