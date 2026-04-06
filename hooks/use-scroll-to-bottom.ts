"use client"
import { useEffect, useRef, useCallback } from "react"

export function useScrollToBottom(dependency: unknown) {
  const containerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [dependency, scrollToBottom])

  return { containerRef, scrollToBottom }
}
