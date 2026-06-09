import { supabase } from "@/lib/supabase"
import { logEvent } from "@/lib/events"
import { getSiteUrl } from "@/lib/site-url"

export async function sendReminderEmails() {
  const siteUrl = getSiteUrl()

  const { data: quotes } = await supabase
    .from("quotes")
    .select("*")
    .eq("status", "pending")

  if (!quotes) return

  for (const quote of quotes) {

    const createdAt = new Date(quote.created_at)
    const now = new Date()

    const hoursPassed =
      (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)

    // First reminder after 24 hours
    if (hoursPassed > 24 && quote.reminder_count === 0) {

      await fetch(`${siteUrl}/api/send-quote-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: quote.customer_email,
          name: quote.customer_name,
          quoteId: quote.id,
        }),
      })

      await supabase.from("quotes")
        .update({
          reminder_count: 1,
          last_reminder_sent: new Date()
        })
        .eq("id", quote.id)

      // 🔥 LOG EVENT
      await logEvent(quote.id, "reminder", "Reminder email sent")
    }

    // Second reminder after 48 hours
    if (hoursPassed > 48 && quote.reminder_count === 1) {

      await fetch(`${siteUrl}/api/send-quote-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: quote.customer_email,
          name: quote.customer_name,
          quoteId: quote.id,
        }),
      })

      await supabase.from("quotes")
        .update({
          reminder_count: 2,
          last_reminder_sent: new Date()
        })
        .eq("id", quote.id)

      // 🔥 LOG EVENT
      await logEvent(quote.id, "reminder", "Final reminder sent")
    }
  }
}