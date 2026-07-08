'use client'

import { useRef, useState } from 'react'
import { IconUpload, IconX } from '@tabler/icons-react'
import ImageCropModal from '@/components/ui/ImageCropModal'
import { createBrowserSupabaseClient } from '@/lib/shared/supabase/client'

export interface Step6Data {
  logoUrl: string | null
}

interface Props {
  data: Step6Data
  onChange: (d: Step6Data) => void
}

export default function EmployerStep6({ data, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createBrowserSupabaseClient()

  const uploadToStorage = async (fileOrBlob: File | Blob) => {
    setIsUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const ext = fileOrBlob.type.split('/')[1] || 'png'
      const filename = `logo-${crypto.randomUUID()}.${ext}`
      const filePath = `${user.id}/${filename}`

      const { data, error } = await supabase.storage.from('employer-assets').upload(filePath, fileOrBlob, {
        cacheControl: '3600',
        upsert: false
      })
      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('employer-assets').getPublicUrl(filePath)
      return publicUrl
    } catch (e) {
      console.error("Upload error", e)
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setPending(ev.target?.result as string)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Company logo</h2>
        <p className="mt-1 text-sm text-white/40">Upload your logo so candidates recognise your brand.</p>
      </div>

      <div className="flex flex-col items-center gap-5">
        {/* Preview */}
        <div
          className="relative w-28 h-28 rounded-2xl border border-white/[0.08] bg-[#121212] flex items-center justify-center overflow-hidden cursor-pointer group"
          onClick={() => fileRef.current?.click()}
        >
          {data.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-white/20 group-hover:text-white/40 transition-colors">
              <IconUpload size={28} />
              <span className="text-[10px] font-medium">{isUploading ? 'Uploading...' : 'Click to upload'}</span>
            </div>
          )}
          {/* Hover overlay */}
          {data.logoUrl && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <IconUpload size={22} className="text-white" />
            </div>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={isUploading} />

        {data.logoUrl && (
          <button
            type="button"
            onClick={() => onChange({ logoUrl: null })}
            className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-sm text-red-400 hover:bg-red-500/[0.12] transition-colors"
          >
            <IconX size={14} />
            Remove
          </button>
        )}

        <p className="text-[11px] text-white/25">PNG, JPG or SVG · max 2 MB · recommended 256×256px</p>
      </div>

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-xs font-medium text-white/50 mb-2.5">Preview</p>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-white/[0.08] bg-[#141414] flex items-center justify-center overflow-hidden shrink-0">
            {data.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.logoUrl} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-white/20 text-lg font-bold">?</span>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-white/70">Your company</div>
            <div className="text-xs text-white/30">This is how you appear on job listings</div>
          </div>
        </div>
      </div>

      <ImageCropModal
        imageSrc={pending}
        onCancel={() => setPending(null)}
        onApply={async (dataUrl) => {
          setPending(null)
          const response = await fetch(dataUrl)
          const blob = await response.blob()
          const publicUrl = await uploadToStorage(blob)
          if (publicUrl) onChange({ logoUrl: publicUrl })
        }}
      />
    </div>
  )
}
