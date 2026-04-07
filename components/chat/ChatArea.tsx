"use client"
import { useState, useCallback, useRef } from "react"
import { api } from "@/lib/trpc/client"
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
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const activeConvIdRef = useRef<string | undefined>(conversationId)
  activeConvIdRef.current = conversationId

  const { data: serverMessages } = api.messages.list.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId }
  )

  const createConversation = api.conversations.create.useMutation()
  const updateModel = api.conversations.updateModel.useMutation()
  const utils = api.useUtils()

  const doStream = useCallback(async (convId: string, content: string, imageUrls?: string[]) => {
    setIsStreaming(true)
    setStreamingContent("")
    setError(null)

    abortRef.current = new AbortController()

    try {
      console.log("Calling /api/chat with:", { conversationId: convId, model })
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: convId, content, imageUrls, model }),
        signal: abortRef.current.signal,
      })

      if (res.status === 402) {
        setError("insufficient_credits")
        setIsStreaming(false)
        return
      }
      if (!res.ok) {
        const errText = await res.text()
        console.error("Chat API error:", res.status, errText)
        throw new Error(`Error ${res.status}: ${errText}`)
      }

      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let accumulated = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n\n")

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          const data = line.slice(6).trim()
          if (data === "[DONE]") break
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) { setError(parsed.error); break }
            if (parsed.content) {
              accumulated += parsed.content
              setStreamingContent(accumulated)
            }
          } catch {
            // partial chunk
          }
        }
      }
    } catch (err: unknown) {
      console.error("Stream catch error:", err, typeof err)
      const isAbort = err instanceof Error && err.name === "AbortError"
      if (!isAbort) {
        const msg = err instanceof Error ? err.message : String(err)
        setError(msg || "stream_error")
      }
    } finally {
      setIsStreaming(false)
      setStreamingContent("")
      setOptimisticMessages([])
      utils.messages.list.invalidate({ conversationId: convId })
      utils.conversations.list.invalidate()
      utils.credits.getBalance.invalidate()
    }
  }, [model, utils])

  const handleSend = useCallback(async (content: string, imageUrls?: string[]) => {
    let convId = conversationId

    try {
      if (!convId) {
        const conv = await createConversation.mutateAsync({ model })
        convId = conv.id
      }
    } catch (err) {
      console.error("Failed to create conversation:", err)
      setError("Error al crear la conversación")
      return
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

    await doStream(convId, content, imageUrls)

    // Update parent after stream completes so component doesn't unmount mid-stream
    if (!conversationId) {
      onConversationCreated?.(convId)
    }
  }, [conversationId, model, createConversation, onConversationCreated, doStream])

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

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

      {error && (
        <div className="mx-4 mt-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error === "insufficient_credits" ? "No tienes suficientes créditos" : error}
        </div>
      )}

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
