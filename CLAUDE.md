@AGENTS.md

# ChooseYourAgent — Multi-model AI Chat Platform

## Stack
- Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, shadcn/ui (base-ui)
- tRPC v11, Drizzle ORM, PostgreSQL via Supabase, Supabase Auth
- KIE.AI API (OpenAI-compatible) for multi-model LLM access
- Upstash Redis for rate limiting

## Key commands
```bash
npm run dev          # Dev server
npx tsc --noEmit     # Type check (run before commits)
npx drizzle-kit generate && npx drizzle-kit push  # After schema changes
npx shadcn@latest add [component]  # Add shadcn component
```

## Architecture
- API key (`KIE_AI_API_KEY`) is server-only — never expose to frontend
- Streaming via SSE at `POST /api/chat`
- Image upload at `POST /api/upload` (Supabase Storage)
- tRPC routers: conversations, messages, credits
- Auth guard in `app/(chat)/layout.tsx` (server-side redirect)
- Lazy initialization for DB and KIE client (build-time safe)

## Conventions
- Components: PascalCase.tsx, hooks: use-kebab-case.ts
- Server Components by default, `'use client'` only when needed
- Zod validation on all inputs
- shadcn v4 uses base-ui (no `asChild` prop)
