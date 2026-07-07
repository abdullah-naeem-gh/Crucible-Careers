"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ImageCropModalProps {
  imageSrc: string | null
  onCancel: () => void
  onApply: (dataUrl: string) => void
  aspectRatio?: number
}

export default function ImageCropModal({ imageSrc, onCancel, onApply, aspectRatio = 1 }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragStart, setDragStart] = useState<{ x: number; y: number; offset: { x: number; y: number } } | null>(null)

  useEffect(() => {
    if (!imageSrc) return

    const image = new Image()
    image.onload = () => {
      imageRef.current = image
      setZoom(1)
      setOffset({ x: 0, y: 0 })
      drawCrop(image, 1, { x: 0, y: 0 })
    }
    image.src = imageSrc
  }, [imageSrc])

  useEffect(() => {
    if (imageRef.current) drawCrop(imageRef.current, zoom, offset)
  }, [zoom, offset])

  const drawCrop = (image: HTMLImageElement, nextZoom: number, nextOffset: { x: number; y: number }) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const width = canvas.width
    const height = canvas.height
    const coverScale = Math.max(width / image.width, height / image.height) * nextZoom
    const drawnWidth = image.width * coverScale
    const drawnHeight = image.height * coverScale
    const x = (width - drawnWidth) / 2 + nextOffset.x
    const y = (height - drawnHeight) / 2 + nextOffset.y

    context.clearRect(0, 0, width, height)
    context.fillStyle = "#f8fafc"
    context.fillRect(0, 0, width, height)
    context.drawImage(image, x, y, drawnWidth, drawnHeight)
  }

  const applyCrop = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    onApply(canvas.toDataURL("image/png"))
  }

  return (
    <AnimatePresence>
      {imageSrc && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] grid place-items-center p-4"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.64)" }}
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="solid-popup-modal w-full max-w-md rounded-[24px] border border-gray-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/[0.07] dark:bg-[#171717]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FF6B00]">Crop image</p>
              <h3 className="mt-1 text-lg font-semibold text-gray-950 dark:text-white">Position your photo</h3>
            </div>
            <div className="grid place-items-center rounded-2xl border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-[#101010]">
              <canvas
                ref={canvasRef}
                width={420}
                height={Math.round(420 / aspectRatio)}
                className="max-h-[52vh] w-full cursor-grab rounded-xl object-contain active:cursor-grabbing"
                onPointerDown={(event) => {
                  event.currentTarget.setPointerCapture(event.pointerId)
                  setDragStart({ x: event.clientX, y: event.clientY, offset })
                }}
                onPointerMove={(event) => {
                  if (!dragStart) return
                  setOffset({
                    x: dragStart.offset.x + event.clientX - dragStart.x,
                    y: dragStart.offset.y + event.clientY - dragStart.y,
                  })
                }}
                onPointerUp={() => setDragStart(null)}
                onPointerCancel={() => setDragStart(null)}
              />
            </div>
            <label className="mt-4 block text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-white/35">Zoom</label>
            <input
              type="range"
              min="1"
              max="2.8"
              step="0.05"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-2 w-full accent-[#FF6B00]"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={onCancel} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-white/10 dark:bg-white/[0.035] dark:text-white/65 dark:hover:bg-white/[0.055]">
                Cancel
              </button>
              <button type="button" onClick={applyCrop} className="rounded-xl bg-gradient-to-r from-[#FF6B00] to-[#FF914D] px-4 py-2 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(255,107,0,0.18)]">
                Use image
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}