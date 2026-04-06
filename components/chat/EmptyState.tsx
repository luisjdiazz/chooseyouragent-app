"use client"
import { motion } from "framer-motion"

interface EmptyStateProps {
  onSuggestionClick: (text: string) => void
}

const suggestions = [
  "Explica la relatividad general como si tuviera 5 años",
  "Escríbeme un poema sobre la inteligencia artificial",
  "Dame 5 ideas de proyectos con Next.js",
  "¿Cuál es la diferencia entre Python y JavaScript?",
]

export function EmptyState({ onSuggestionClick }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="mb-2 text-3xl font-bold text-white">ChooseYourAgent</h1>
        <p className="mb-8 text-gray-400">Elige un modelo y comienza a chatear</p>

        <div className="grid max-w-lg gap-3 sm:grid-cols-2">
          {suggestions.map((text) => (
            <button
              key={text}
              onClick={() => onSuggestionClick(text)}
              className="rounded-xl border border-[#333] bg-[#1a1a1a] p-4 text-left text-sm text-gray-300 transition-colors hover:border-emerald-500/50 hover:bg-[#242424]"
            >
              {text}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
