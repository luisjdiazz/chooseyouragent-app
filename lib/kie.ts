import OpenAI from "openai"

let _client: OpenAI | null = null

export function getKieClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.KIE_AI_API_KEY!,
      baseURL: process.env.KIE_AI_BASE_URL ?? "https://api.kie.ai/v1",
    })
  }
  return _client
}
