import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/trpc"
import { db } from "@/db"
import { messages, conversations } from "@/db/schema"
import { eq, and, asc } from "drizzle-orm"

export const messagesRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [conv] = await db
        .select()
        .from(conversations)
        .where(and(eq(conversations.id, input.conversationId), eq(conversations.userId, ctx.user.id)))
      if (!conv) return []

      return db
        .select()
        .from(messages)
        .where(eq(messages.conversationId, input.conversationId))
        .orderBy(asc(messages.createdAt))
    }),
})
