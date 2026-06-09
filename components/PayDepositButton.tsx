"use client"

import { logEvent } from "@/lib/events"

export default function PayDepositButton({
  amount,
  quoteId
}: {
  amount: number
  quoteId: string
}) {

  async function payDeposit() {
    await logEvent(quoteId, "payment_started", "Customer started payment")

    const res = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount,
        quoteId
      })
    })

    const data = await res.json()

    if (!res.ok || !data.url) {
      alert(data.error || "Failed to start payment. Please try again.")
      return
    }

    window.location.href = data.url
  }

  return (
    <button
      onClick={payDeposit}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold transition-all"
    >
      Pay Deposit
    </button>
  )
}