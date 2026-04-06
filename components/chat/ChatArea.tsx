"use client"
import { useState, useCallback } from "react"
import { api } from "@/lib/trpc/client"
import { useChatStream } from "@/hooks/use-chat-stream"
import { MessageList } from "./MessageList"
import { MessageInput } from "./MessageInput"
import { ModelPicker } from "./ModelPicker"
import { EmptyState } from "./EmptyState"
import { getModelById } from "@/lib/models"
import type { ChatMessage } from "@/types"

interface ChatAreaProps {
  conversationId?: string
  model: string
  onModelChange: (model: string) => void
  onConversationCreated?: (id: string) => void
}

export function ChatArea({ conversationId, model, onModelChange, onConversationCreated }: ChatAreaProps) {
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([])

  const { data: serverMessages } = api.messages.list.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  )

  const createConversation = api.conversations.create.useMutation()
  const updateModel = api.conversations.updateModel.useMutation()
  const utils = api.useUtils()

  const { sendMessage, streamingContent, isStreaming, stopStream } = useChatStream({
    conversationId: conversationId ?? "",
    model,
    onMessageComplete: () => {
      setOptimisticMessages([])
      if (conversationId) {
        utils.messages.list.invalidate({ conversationId })
        utils.conversations.list.invalidate()
        utils.credits.getBalance.invalidate()
      }
    },
  })

  const handleSend = useCallback(async (content: string, imageUrls?: string[]) => {
    let convId = conversationId

    if (!convId) {
      const conv = await createConversation.mutateAsync({ model })
      convId = conv.id
      onConversationCreated?.(convId)
    }

    const optimistic: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversationId: convId,
      role: "user",
      content,
      imageUrls: imageUrls ?? null,
      model: null,
      promptTokens: null,
      completionTokens: null,
      creditsUsed: null,
      isStreaming: null,
      createdAt: new Date(),
    }
    setOptimisticMessages((prev) => [...prev, optimistic])

    sendMessage(content, imageUrls)
  }, [conversationId, model, createConversation, onConversationCreated, sendMessage])

  const handleModelChange = async (newModel: string) => {
    onModelChange(newModel)
    if (conversationId) {
      await updateModel.mutateAsync({ conversationId, model: newModel })
    }
  }

  const allMessages = [...(serverMessages ?? []), ...optimisticMessages] as ChatMessage[]
  const currentModel = getModelById(model)

  return (
    <div className="flex flex-1 flex-col bg-[#0f0f0f]">
      <div className="flex items-center justify-between border-b border-[#333] px-4 py-3">
        <ModelPicker currentModel={model} onModelChange={handleModelChange} />
        {isStreaming && (
          <button
            onClick={stopStream}
            className="rounded-lg border border-[#333] px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-red-500/50 hover:text-red-400"
          >
            Detener
          </button>
        )}
      </div>

      {allMessages.length === 0 && !isStreaming ? (
        <EmptyState onSuggestionClick={(text) => handleSend(text)} />
      ) : (
        <MessageList
          messages={allMessages}
          streamingContent={streamingContent}
          isStreaming={isStreaming}
          streamingModel={model}
        />
      )}

      <MessageInput
        onSend={handleSend}
        disabled={isStreaming}
        supportsVision={currentModel?.supportsVision}
      />
    </div>
  )
}
