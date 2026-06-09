"use client"

import { supabase } from "@/lib/supabase"
import { logEvent } from "@/lib/events"

export default function DeclineQuoteButton({ quoteId }: { quoteId: string }) {

  async function declineQuote() {

    const { error } = await supabase
      .from("quotes")
      .update({
        status: "declined"
      })
      .eq("id", quoteId)

    if (error) {
      alert("Failed to decline quote")
    } else {
      await logEvent(quoteId, "declined", "Customer declined the quote")
      alert("Quote declined")
      window.location.reload()
    }
  }

  return (
    <button
      onClick={declineQuote}
      className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-4 py-3 rounded-xl font-bold transition-all"
    >
      Decline Quote
    </button>
  )
}