"use client"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface SidebarItemProps {
  id: string
  title: string
  isActive: boolean
  onClick: () => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}

export function SidebarItem({ id, title, isActive, onClick, onDelete, onRename }: SidebarItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(title)

  const handleRename = () => {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== title) {
      onRename(id, trimmed)
    } else {
      setEditTitle(title)
    }
    setIsEditing(false)
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors cursor-pointer",
        isActive
          ? "bg-emerald-500/10 text-emerald-400"
          : "text-gray-400 hover:bg-[#242424] hover:text-white"
      )}
      onClick={() => !isEditing && onClick()}
    >
      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>

      {isEditing ? (
        <input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleRename()
            if (e.key === "Escape") { setEditTitle(title); setIsEditing(false) }
          }}
          autoFocus
          className="flex-1 bg-transparent text-sm outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="flex-1 truncate">{title}</span>
      )}

      <div className="hidden items-center gap-1 group-hover:flex">
        <button
          onClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
          className="rounded p-1 text-gray-500 hover:text-white"
          title="Renombrar"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(id) }}
          className="rounded p-1 text-gray-500 hover:text-red-400"
          title="Eliminar"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
