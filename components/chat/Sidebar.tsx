"use client"
import { api } from "@/lib/trpc/client"
import { SidebarItem } from "./SidebarItem"
import { CreditsDisplay } from "./CreditsDisplay"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeConversationId?: string
  onConversationSelect: (id: string) => void
  onNewConversation: () => void
}

export function Sidebar({ activeConversationId, onConversationSelect, onNewConversation }: SidebarProps) {
  const router = useRouter()
  const { data: conversations } = api.conversations.list.useQuery()
  const deleteMutation = api.conversations.delete.useMutation()
  const renameMutation = api.conversations.rename.useMutation()
  const utils = api.useUtils()

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync({ conversationId: id })
    utils.conversations.list.invalidate()
    if (id === activeConversationId) {
      onNewConversation()
    }
  }

  const handleRename = async (id: string, title: string) => {
    await renameMutation.mutateAsync({ conversationId: id, title })
    utils.conversations.list.invalidate()
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-[#333] bg-[#0f0f0f]">
      <div className="flex items-center justify-between p-4">
        <h1 className="text-lg font-bold text-white">ChooseYourAgent</h1>
      </div>

      <button
        onClick={onNewConversation}
        className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white transition-colors hover:border-emerald-500/50 hover:bg-[#242424]"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nueva conversación
      </button>

      <div className="flex-1 overflow-y-auto px-2">
        {conversations?.map((conv) => (
          <SidebarItem
            key={conv.id}
            id={conv.id}
            title={conv.title}
            isActive={conv.id === activeConversationId}
            onClick={() => onConversationSelect(conv.id)}
            onDelete={handleDelete}
            onRename={handleRename}
          />
        ))}
      </div>

      <div className="border-t border-[#333] p-3">
        <CreditsDisplay />
        <button
          onClick={handleLogout}
          className="mt-2 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-[#242424] hover:text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
