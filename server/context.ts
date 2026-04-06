import { createServerClient } from "@/lib/supabase/server"
import { db } from "@/db"

export async function createContext() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  return {
    db,
    user,
    supabase,
  }
}

export type Context = Awaited<ReturnType<typeof createContext>>
