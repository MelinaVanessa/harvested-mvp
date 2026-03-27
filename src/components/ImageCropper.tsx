import { useMemo, useRef, useState } from 'react'
import { X, Leaf } from 'lucide-react'

interface ImageCropperProps {
  imageSrc: string
  onCancel: () => void
  onSave: (dataUrl: string) => void
  t: Record<string, Record<string, string>>
}

export function ImageCropper({ imageSrc, onCancel, onSave, t }: ImageCropperProps) {
  const PREVIEW_SIZE = 250
  const EXPORT_SIZE = 300
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const imgRef = useRef<HTMLImageElement>(null)
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 })
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map())
  const dragStartRef = useRef<{ pointerX: number; pointerY: number; offsetX: number; offsetY: number } | null>(null)
  const pinchStartRef = useRef<{ distance: number; zoom: number; midpointX: number; midpointY: number; offsetX: number; offsetY: number } | null>(null)

  const coverSize = useMemo(() => {
    const w = imageNaturalSize.width
    const h = imageNaturalSize.height
    if (!w || !h) return { width: PREVIEW_SIZE, height: PREVIEW_SIZE }
    const coverScale = Math.max(PREVIEW_SIZE / w, PREVIEW_SIZE / h)
    return {
      width: w * coverScale,
      height: h * coverScale,
    }
  }, [imageNaturalSize.width, imageNaturalSize.height])

  const clampZoom = (value: number) => Math.min(3, Math.max(0.1, value))

  const handlePointerDown = (e: React.PointerEvent) => {
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pointers = Array.from(activePointersRef.current.values())

    if (pointers.length === 1) {
      dragStartRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
      }
      pinchStartRef.current = null
      return
    }

    if (pointers.length >= 2) {
      const p1 = pointers[0]!
      const p2 = pointers[1]!
      const distance = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const midpointX = (p1.x + p2.x) / 2
      const midpointY = (p1.y + p2.y) / 2
      pinchStartRef.current = {
        distance,
        zoom,
        midpointX,
        midpointY,
        offsetX: offset.x,
        offsetY: offset.y,
      }
      dragStartRef.current = null
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activePointersRef.current.has(e.pointerId)) return
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY })

    const pointers = Array.from(activePointersRef.current.values())
    if (pointers.length >= 2 && pinchStartRef.current) {
      const p1 = pointers[0]!
      const p2 = pointers[1]!
      const currentDistance = Math.hypot(p2.x - p1.x, p2.y - p1.y)
      const currentMidX = (p1.x + p2.x) / 2
      const currentMidY = (p1.y + p2.y) / 2
      const base = pinchStartRef.current
      const rawZoom = base.zoom * (currentDistance / Math.max(1, base.distance))
      const nextZoom = clampZoom(rawZoom)
      setZoom(nextZoom)
      setOffset({
        x: base.offsetX + (currentMidX - base.midpointX),
        y: base.offsetY + (currentMidY - base.midpointY),
      })
      return
    }

    if (pointers.length === 1 && dragStartRef.current) {
      const base = dragStartRef.current
      setOffset({
        x: base.offsetX + (e.clientX - base.pointerX),
        y: base.offsetY + (e.clientY - base.pointerY),
      })
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId)
    const pointers = Array.from(activePointersRef.current.values())

    if (pointers.length === 1) {
      const p = pointers[0]!
      dragStartRef.current = {
        pointerX: p.x,
        pointerY: p.y,
        offsetX: offset.x,
        offsetY: offset.y,
      }
      pinchStartRef.current = null
    } else if (pointers.length < 1) {
      dragStartRef.current = null
      pinchStartRef.current = null
    }
  }

  const handleSave = () => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = EXPORT_SIZE
    canvas.height = EXPORT_SIZE
    if (ctx && imgRef.current) {
      ctx.fillStyle = '#FCFAF7'
      ctx.fillRect(0, 0, EXPORT_SIZE, EXPORT_SIZE)

      const scaleFactor = EXPORT_SIZE / PREVIEW_SIZE
      const drawnWidth = coverSize.width * zoom * scaleFactor
      const drawnHeight = coverSize.height * zoom * scaleFactor
      const x = EXPORT_SIZE / 2 - drawnWidth / 2 + offset.x * scaleFactor
      const y = EXPORT_SIZE / 2 - drawnHeight / 2 + offset.y * scaleFactor
      const img = imgRef.current
      ctx.drawImage(img, x, y, drawnWidth, drawnHeight)
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
            onLoad={(e) => {
              const el = e.currentTarget
              setImageNaturalSize({ width: el.naturalWidth, height: el.naturalHeight })
            }}
            className="absolute max-w-none origin-center"
            style={{
              transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              left: '50%',
              top: '50%',
              width: `${coverSize.width}px`,
              height: `${coverSize.height}px`,
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
            onChange={(e) => setZoom(clampZoom(parseFloat(e.target.value)))}
            className="flex-1 h-2 bg-[#88887D]/20 rounded-lg appearance-none cursor-pointer accent-[#0D1A15]"
          />
          <Leaf size={24} className="text-[#0D1A15]" />
        </div>
      </div>
    </div>
  )
}
