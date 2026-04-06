import { getModelById } from "./models"

export function calculateCreditsUsed(
  modelId: string,
  promptTokens: number,
  completionTokens: number
): number {
  const model = getModelById(modelId)
  if (!model) return 0

  return (
    (promptTokens / 1000) * model.creditsPerInputToken +
    (completionTokens / 1000) * model.creditsPerOutputToken
  )
}
