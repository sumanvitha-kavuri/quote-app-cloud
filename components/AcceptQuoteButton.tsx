"use client"

import { supabase } from "@/lib/supabase"
import { logEvent } from "@/lib/events"

export default function AcceptQuoteButton({ quoteId }: { quoteId: string }) {

  async function acceptQuote() {
    const { error } = await supabase
      .from("quotes")
      .update({ status: "accepted" })
      .eq("id", quoteId)

    if (error) {
      alert("Error accepting quote")
    } else {

      // 🔥 LOG EVENT
      await logEvent(quoteId, "approved", "Customer approved the quote")

      alert("Quote accepted!")
      window.location.reload()
    }
  }

  return (
    <button
      onClick={acceptQuote}
      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl font-bold transition-all"
    >
      Accept Quote
    </button>
  )
}