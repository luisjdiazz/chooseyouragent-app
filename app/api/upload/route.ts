import { createServerClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("Unauthorized", { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File
  if (!file) return new Response("No file", { status: 400 })

  if (file.size > 10 * 1024 * 1024) return new Response("File too large", { status: 413 })

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowed.includes(file.type)) return new Response("Invalid type", { status: 400 })

  const fileName = `${user.id}/${Date.now()}-${file.name}`
  const { data, error } = await supabase.storage
    .from("chat-images")
    .upload(fileName, file, { contentType: file.type, upsert: false })

  if (error) return new Response("Upload failed", { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from("chat-images").getPublicUrl(data.path)

  return Response.json({ url: publicUrl })
}
