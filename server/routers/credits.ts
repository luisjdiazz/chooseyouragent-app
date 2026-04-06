import { z } from "zod"
import { createTRPCRouter, protectedProcedure } from "@/server/trpc"
import { db } from "@/db"
import { userProfiles, creditTransactions } from "@/db/schema"
import { eq, desc } from "drizzle-orm"

export const creditsRouter = createTRPCRouter({
  getBalance: protectedProcedure.query(async ({ ctx }) => {
    const [profile] = await db.select({ creditBalance: userProfiles.creditBalance })
      .from(userProfiles)
      .where(eq(userProfiles.id, ctx.user.id))
    return profile?.creditBalance ?? 0
  }),

  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      return db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, ctx.user.id))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(input.limit)
    }),
})
