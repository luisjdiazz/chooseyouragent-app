import { pgTable, text, timestamp, integer, boolean, real } from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"

export const userProfiles = pgTable("user_profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  creditBalance: integer("credit_balance").default(0).notNull(),
  defaultModel: text("default_model").default("gpt-4o-mini").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const conversations = pgTable("conversations", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  title: text("title").default("Nueva conversación").notNull(),
  model: text("model").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const messages = pgTable("messages", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  conversationId: text("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role", { enum: ["user", "assistant", "system"] }).notNull(),
  content: text("content").notNull(),
  imageUrls: text("image_urls").array(),
  model: text("model"),
  promptTokens: integer("prompt_tokens"),
  completionTokens: integer("completion_tokens"),
  creditsUsed: real("credits_used"),
  isStreaming: boolean("is_streaming").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const creditTransactions = pgTable("credit_transactions", {
  id: text("id").primaryKey().$defaultFn(() => createId()),
  userId: text("user_id").notNull().references(() => userProfiles.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type", { enum: ["purchase", "consumption", "refund", "bonus"] }).notNull(),
  description: text("description"),
  messageId: text("message_id").references(() => messages.id),
  stripePaymentId: text("stripe_payment_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
