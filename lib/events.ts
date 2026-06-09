import { supabase } from "@/lib/supabase"

export async function logEvent(
  quoteId: string,
  type: string,
  message: string
) {
  await supabase.from("events").insert([
    {
      quote_id: quoteId,
      type,
      message,
    }
  ])
}