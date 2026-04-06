"use client"
import { api } from "@/lib/trpc/client"

export function CreditsDisplay() {
  const { data: balance } = api.credits.getBalance.useQuery()

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[#1a1a1a] px-3 py-2 text-sm">
      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-gray-400">
        {balance !== undefined ? balance.toLocaleString() : "..."} créditos
      </span>
    </div>
  )
}
