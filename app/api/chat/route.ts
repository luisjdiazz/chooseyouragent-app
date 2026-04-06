import { createServerClient } from "@/lib/supabase/server"
import { getKieClient } from "@/lib/kie"
import { db } from "@/db"
import { messages, conversations, userProfiles, creditTransactions } from "@/db/schema"
import { getModelById } from "@/lib/models"
import { eq, and, asc } from "drizzle-orm"
import { z } from "zod"
import type OpenAI from "openai"

const bodySchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(32000),
  imageUrls: z.array(z.string().url()).optional(),
  model: z.string(),
})

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const body = await req.json()
  const parsed = bodySchema.safeParse(body)
  if (!parsed.success) return new Response("Bad Request", { status: 400 })
  const { conversationId, content, imageUrls, model } = parsed.data

  const [conversation] = await db
    .select()
    .from(conversations)
    .where(and(eq(conversations.id, conversationId), eq(conversations.userId, user.id)))
  if (!conversation) return new Response("Not Found", { status: 404 })

  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, user.id))
  const modelMeta = getModelById(model)
  if (!modelMeta) return new Response("Invalid model", { status: 400 })
  if (!profile || profile.creditBalance <= 0) {
    return new Response(JSON.stringify({ error: "insufficient_credits" }), {
      status: 402,
      headers: { "Content-Type": "application/json" },
    })
  }

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(asc(messages.createdAt))

  const userMsgContent: unknown = imageUrls?.length
    ? [
        ...imageUrls.map((url) => ({ type: "image_url" as const, image_url: { url } })),
        { type: "text" as const, text: content },
      ]
    : content

  await db.insert(messages).values({
    conversationId,
    role: "user",
    content,
    imageUrls: imageUrls ?? [],
  }).returning()

  const apiMessages: OpenAI.ChatCompletionMessageParam[] = [
    ...history.map((m): OpenAI.ChatCompletionMessageParam => {
      if (m.role === "assistant") {
        return { role: "assistant", content: m.content }
      }
      return {
        role: "user",
        content: m.imageUrls?.length
          ? [
              ...m.imageUrls.map((url): OpenAI.ChatCompletionContentPartImage => ({
                type: "image_url",
                image_url: { url },
              })),
              { type: "text", text: m.content },
            ]
          : m.content,
      }
    }),
    {
      role: "user",
      content: userMsgContent as string,
    },
  ]

  const [assistantMessage] = await db.insert(messages).values({
    conversationId,
    role: "assistant",
    content: "",
    model,
    isStreaming: true,
  }).returning()

  let fullContent = ""
  let promptTokens = 0
  let completionTokens = 0

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const kieStream = await getKieClient().chat.completions.create({
          model,
          messages: apiMessages,
          stream: true,
          max_tokens: 4096,
        })

        for await (const chunk of kieStream) {
          const delta = chunk.choices[0]?.delta?.content ?? ""
          if (delta) {
            fullContent += delta
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: delta })}\n\n`))
          }

          if (chunk.usage) {
            promptTokens = chunk.usage.prompt_tokens ?? 0
            completionTokens = chunk.usage.completion_tokens ?? 0
          }
        }

        const creditsUsed =
          (promptTokens / 1000) * modelMeta.creditsPerInputToken +
          (completionTokens / 1000) * modelMeta.creditsPerOutputToken

        await db.update(messages).set({
          content: fullContent,
          isStreaming: false,
          promptTokens,
          completionTokens,
          creditsUsed,
        }).where(eq(messages.id, assistantMessage.id))

        await db.update(userProfiles)
          .set({ creditBalance: profile.creditBalance - Math.ceil(creditsUsed) })
          .where(eq(userProfiles.id, user.id))

        await db.insert(creditTransactions).values({
          userId: user.id,
          amount: -Math.ceil(creditsUsed),
          type: "consumption",
          description: `Mensaje con ${modelMeta.name}`,
          messageId: assistantMessage.id,
        })

        await db.update(conversations)
          .set({ lastMessageAt: new Date(), model, updatedAt: new Date() })
          .where(eq(conversations.id, conversationId))

        if (history.length === 0) {
          generateConversationTitle(conversationId, content).catch(console.error)
        }

        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      } catch {
        await db.delete(messages).where(eq(messages.id, assistantMessage.id))
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "stream_error" })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

async function generateConversationTitle(conversationId: string, firstMessage: string) {
  const response = await getKieClient().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: `Generate a short title (max 6 words) for a chat that starts with: "${firstMessage.slice(0, 200)}". Reply ONLY with the title, no quotes.`,
      },
    ],
    max_tokens: 20,
  })
  const title = response.choices[0]?.message?.content?.trim() ?? "Nueva conversación"
  await db.update(conversations).set({ title }).where(eq(conversations.id, conversationId))
}
