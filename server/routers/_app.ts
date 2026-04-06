import { createTRPCRouter } from "@/server/trpc"
import { conversationsRouter } from "./conversations"
import { messagesRouter } from "./messages"
import { creditsRouter } from "./credits"

export const appRouter = createTRPCRouter({
  conversations: conversationsRouter,
  messages: messagesRouter,
  credits: creditsRouter,
})

export type AppRouter = typeof appRouter
