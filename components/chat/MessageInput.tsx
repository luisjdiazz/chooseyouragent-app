"use client"
import { useState, useRef, useCallback } from "react"
import { ImageUpload } from "./ImageUpload"

interface MessageInputProps {
  onSend: (content: string, imageUrls?: string[]) => void
  disabled?: boolean
  supportsVision?: boolean
}

export function MessageInput({ onSend, disabled, supportsVision }: MessageInputProps) {
  const [text, setText] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed && imageUrls.length === 0) return
    onSend(trimmed, imageUrls.length > 0 ? imageUrls : undefined)
    setText("")
    setImageUrls([])
    if (textareaRef.current) textareaRef.current.style.height = "auto"
  }, [text, imageUrls, onSend])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto"
      el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }
  }

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-[#333] bg-[#0f0f0f] pb-[env(safe-area-inset-bottom)] md:sticky">
      {imageUrls.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-4 pt-3">
          {imageUrls.map((url, i) => (
            <div key={i} className="relative flex-shrink-0">
              <img src={url} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
        {supportsVision && (
          <ImageUpload
            onImageUploaded={(url) => setImageUrls((prev) => [...prev, url])}
            disabled={disabled}
          />
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Escribe un mensaje..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-base text-white placeholder-gray-500 outline-none transition-colors focus:border-emerald-500/50 disabled:opacity-50"
        />

        <button
          onClick={handleSend}
          disabled={disabled || (!text.trim() && imageUrls.length === 0)}
          className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-emerald-600 text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
