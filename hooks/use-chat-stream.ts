"use client"
import { useState, useRef, useCallback } from "react"

interface UseChatStreamOptions {
  conversationId: string
  model: string
  onMessageComplete?: (content: string) => void
}

export function useChatStream({ conversationId, model, onMessageComplete }: UseChatStreamOptions) {
  const [streamingContent, setStreamingContent] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(async (content: string, imageUrls?: string[]) => {
    setIsStreaming(true)
    setStreamingContent("")
    setError(null)

    abortRef.current = new AbortController()

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, content, imageUrls, model }),
        signal: abortRef.current.signal,
      })

      if (res.status === 402) {
        setError("insufficient_credits")
        return
      }
      if (!res.ok) throw new Error("Error en el servidor")

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
          if (data === "[DONE]") {
            onMessageComplete?.(accumulated)
            break
          }
          try {
            const parsed = JSON.parse(data)
            if (parsed.error) { setError(parsed.error); break }
            if (parsed.content) {
              accumulated += parsed.content
              setStreamingContent(accumulated)
            }
          } catch {
            // ignore parse errors for partial chunks
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name !== "AbortError") setError("stream_error")
    } finally {
      setIsStreaming(false)
    }
  }, [conversationId, model, onMessageComplete])

  const stopStream = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
  }, [])

  return { sendMessage, stopStream, streamingContent, isStreaming, error }
}
