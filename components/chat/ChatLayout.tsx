"use client"
import { useState } from "react"
import { Sidebar } from "./Sidebar"
import { ChatArea } from "./ChatArea"
import { DEFAULT_MODEL } from "@/lib/models"
import { useRouter } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function ChatLayout() {
  const router = useRouter()
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>()
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleConversationSelect = (id: string) => {
    setActiveConversationId(id)
    setSidebarOpen(false)
  }

  const handleNewConversation = () => {
    setActiveConversationId(undefined)
    setModel(DEFAULT_MODEL)
    setSidebarOpen(false)
  }

  const handleConversationCreated = (id: string) => {
    setActiveConversationId(id)
  }

  return (
    <div className="flex h-dvh bg-[#0f0f0f]">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeConversationId={activeConversationId}
          onConversationSelect={handleConversationSelect}
          onNewConversation={handleNewConversation}
        />
      </div>

      {/* Mobile sidebar */}
      <div className="md:hidden">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-[#1a1a1a] text-white md:hidden">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] border-[#333] bg-[#0f0f0f] p-0">
            <Sidebar
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
              onNewConversation={handleNewConversation}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Chat area */}
      <ChatArea
        conversationId={activeConversationId}
        model={model}
        onModelChange={setModel}
        onConversationCreated={handleConversationCreated}
      />
    </div>
  )
}
