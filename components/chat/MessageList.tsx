"use client"
import { MessageBubble } from "./MessageBubble"
import { ThinkingDots } from "@/components/shared/ThinkingDots"
import { useScrollToBottom } from "@/hooks/use-scroll-to-bottom"
import type { ChatMessage } from "@/types"

interface MessageListProps {
  messages: ChatMessage[]
  streamingContent: string
  isStreaming: boolean
  streamingModel?: string
}

export function MessageList({ messages, streamingContent, isStreaming, streamingModel }: MessageListProps) {
  const { containerRef } = useScrollToBottom(streamingContent || messages.length)

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto pb-32">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            role={msg.role}
            content={msg.content}
            model={msg.model}
            imageUrls={msg.imageUrls}
          />
        ))}

        {isStreaming && !streamingContent && <ThinkingDots />}

        {streamingContent && (
          <MessageBubble
            role="assistant"
            content={streamingContent}
            model={streamingModel}
            isStreaming
          />
        )}
      </div>
    </div>
  )
}
