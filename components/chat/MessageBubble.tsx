"use client"
import { motion } from "framer-motion"
import { MarkdownRenderer } from "@/components/shared/MarkdownRenderer"
import { getModelById } from "@/lib/models"

interface MessageBubbleProps {
  role: "user" | "assistant" | "system"
  content: string
  model?: string | null
  imageUrls?: string[] | null
  isStreaming?: boolean
}

export function MessageBubble({ role, content, model, imageUrls, isStreaming }: MessageBubbleProps) {
  const isUser = role === "user"
  const modelMeta = model ? getModelById(model) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
          isUser
            ? "bg-emerald-600 text-white"
            : "bg-[#242424] text-gray-100"
        }`}
      >
        {!isUser && modelMeta && (
          <div className="mb-1 text-[11px] font-medium text-gray-500">
            {modelMeta.name}
          </div>
        )}

        {imageUrls && imageUrls.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {imageUrls.map((url, i) => (
              <img
                key={i}
                src={url}
                alt="Uploaded"
                className="max-h-48 rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {isUser ? (
          <p className="text-base whitespace-pre-wrap">{content}</p>
        ) : (
          <div className="prose-invert text-base">
            <MarkdownRenderer content={content} />
            {isStreaming && (
              <span className="inline-block h-4 w-1 animate-pulse bg-emerald-400 ml-0.5" />
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
