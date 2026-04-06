export interface AIModel {
  id: string
  name: string
  provider: string
  description: string
  supportsVision: boolean
  supportsStreaming: boolean
  contextWindow: number
  creditsPerInputToken: number
  creditsPerOutputToken: number
  isRecommended?: boolean
  isFast?: boolean
  isPowerful?: boolean
}

export const MODELS: AIModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "El modelo más capaz de OpenAI. Excelente para tareas complejas.",
    supportsVision: true,
    supportsStreaming: true,
    contextWindow: 128000,
    creditsPerInputToken: 5,
    creditsPerOutputToken: 15,
    isPowerful: true,
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Rápido y económico. Perfecto para la mayoría de tareas.",
    supportsVision: true,
    supportsStreaming: true,
    contextWindow: 128000,
    creditsPerInputToken: 0.15,
    creditsPerOutputToken: 0.6,
    isRecommended: true,
    isFast: true,
  },
  {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    description: "Excelente para escritura, análisis y código.",
    supportsVision: true,
    supportsStreaming: true,
    contextWindow: 200000,
    creditsPerInputToken: 3,
    creditsPerOutputToken: 15,
    isPowerful: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    provider: "Google",
    description: "Muy rápido y con contexto extendido.",
    supportsVision: true,
    supportsStreaming: true,
    contextWindow: 1000000,
    creditsPerInputToken: 0.075,
    creditsPerOutputToken: 0.3,
    isFast: true,
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct",
    name: "Llama 3.3 70B",
    provider: "Meta",
    description: "Open source y muy capaz. Sin censura corporativa.",
    supportsVision: false,
    supportsStreaming: true,
    contextWindow: 128000,
    creditsPerInputToken: 0.5,
    creditsPerOutputToken: 0.8,
    isFast: true,
  },
]

export function getModelById(id: string): AIModel | undefined {
  return MODELS.find((m) => m.id === id)
}

export const DEFAULT_MODEL = "gpt-4o-mini"
