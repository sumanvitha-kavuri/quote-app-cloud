"use client"

import { supabase } from "@/lib/supabase"
import { logEvent } from "@/lib/events"

export default function RequestChangeButton({ quoteId }: { quoteId: string }) {

  async function requestChange() {

    const { error } = await supabase
      .from("quotes")
      .update({
        status: "rejected"
      })
      .eq("id", quoteId)

    if (error) {
      alert("Failed to request change")
    } else {
      await logEvent(quoteId, "revision_requested", "Customer requested changes")
      alert("Revision request sent")
      window.location.reload()
    }
  }

  return (
    <button
      onClick={requestChange}
      className="flex-1 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-xl font-bold transition-all"
    >
      Request Change
    </button>
  )
}