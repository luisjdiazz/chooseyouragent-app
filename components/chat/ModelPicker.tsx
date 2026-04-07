"use client"
import { MODELS, type AIModel } from "@/lib/models"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface ModelPickerProps {
  currentModel: string
  onModelChange: (modelId: string) => void
}

export function ModelPicker({ currentModel, onModelChange }: ModelPickerProps) {
  const current = MODELS.find((m) => m.id === currentModel)
  const grouped = MODELS.reduce<Record<string, AIModel[]>>((acc, model) => {
    if (!acc[model.provider]) acc[model.provider] = []
    acc[model.provider].push(model)
    return acc
  }, {})

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-[#333] bg-[#1a1a1a] px-3 py-2 text-sm text-white transition-colors hover:border-emerald-500/50 hover:bg-[#242424]">
        <span className="font-medium">{current?.name ?? "Seleccionar modelo"}</span>
        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 border-[#333] bg-[#1a1a1a] text-white" align="start">
        <p className="px-2 py-1.5 text-xs text-gray-500">
          Cambiar modelo no borra el historial
        </p>
        <DropdownMenuSeparator className="bg-[#333]" />
        {Object.entries(grouped).map(([provider, models]) => (
          <DropdownMenuGroup key={provider}>
            <DropdownMenuLabel className="text-xs text-gray-500">{provider}</DropdownMenuLabel>
            {models.map((model) => (
              <DropdownMenuItem
                key={model.id}
                onClick={() => onModelChange(model.id)}
                className={`cursor-pointer flex-col items-start gap-1 rounded-md px-3 py-2 focus:bg-[#242424] ${
                  currentModel === model.id ? "bg-emerald-500/10 text-emerald-400" : "text-gray-300"
                }`}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">{model.name}</span>
                  <div className="flex gap-1">
                    {model.isRecommended && <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 text-[10px]">Recomendado</Badge>}
                    {model.isFast && <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 text-[10px]">Rápido</Badge>}
                    {model.isPowerful && <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 text-[10px]">Potente</Badge>}
                    {model.supportsVision && <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 text-[10px]">Visión</Badge>}
                  </div>
                </div>
                <p className="text-xs text-gray-500">{model.description}</p>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="bg-[#333]" />
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
