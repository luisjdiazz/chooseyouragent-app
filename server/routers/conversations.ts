import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/trpc"
import { db } from "@/db"
import { conversations } from "@/db/schema"
import { eq, and, desc } from "drizzle-orm"
import { TRPCError } from "@trpc/server"
import { DEFAULT_MODEL } from "@/lib/models"

export const conversationsRouter = createTRPCRouter({
  list: protectedProcedure.query(async ({ ctx }) => {
    return db
      .select()
      .from(conversations)
      .where(eq(conversations.userId, ctx.user.id))
      .orderBy(desc(conversations.lastMessageAt))
  }),

  create: protectedProcedure
    .input(z.object({ model: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const [conv] = await db.insert(conversations).values({
        userId: ctx.user.id,
        model: input.model ?? DEFAULT_MODEL,
        title: "Nueva conversación",
      }).returning()
      return conv
    }),

  updateModel: protectedProcedure
    .input(z.object({ conversationId: z.string(), model: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const [conv] = await db
        .update(conversations)
        .set({ model: input.model, updatedAt: new Date() })
        .where(and(eq(conversations.id, input.conversationId), eq(conversations.userId, ctx.user.id)))
        .returning()
      if (!conv) throw new TRPCError({ code: "NOT_FOUND" })
      return conv
    }),

  delete: protectedProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await db
        .delete(conversations)
        .where(and(eq(conversations.id, input.conversationId), eq(conversations.userId, ctx.user.id)))
    }),

  rename: protectedProcedure
    .input(z.object({ conversationId: z.string(), title: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      await db
        .update(conversations)
        .set({ title: input.title })
        .where(and(eq(conversations.id, input.conversationId), eq(conversations.userId, ctx.user.id)))
    }),
})
