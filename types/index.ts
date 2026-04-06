export interface ChatMessage {
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  imageUrls: string[] | null
  model: string | null
  promptTokens: number | null
  completionTokens: number | null
  creditsUsed: number | null
  isStreaming: boolean | null
  createdAt: Date
}

export interface ConversationWithLastMessage {
  id: string
  userId: string
  title: string
  model: string
  isPinned: boolean
  lastMessageAt: Date
  createdAt: Date
  updatedAt: Date
}
