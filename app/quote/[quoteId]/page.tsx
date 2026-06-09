"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"

import AcceptQuoteButton from "@/components/AcceptQuoteButton"
import PayDepositButton from "@/components/PayDepositButton"
import AskQuestionBox from "@/components/AskQuestionBox"
import RequestChangeButton from "@/components/RequestChangeButton"
import DeclineQuoteButton from "@/components/DeclineQuoteButton"

export default function QuotePage() {
  const { quoteId } = useParams<{ quoteId: string }>()

  const [quote, setQuote] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!quoteId) return
    fetchData()
    markOpened()
  }, [quoteId])

  async function fetchData() {
    const { data: quoteData, error } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", quoteId)
      .single()

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setQuote(quoteData)

    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .eq("quote_id", quoteId)
      .order("created_at", { ascending: false })

    setEvents(eventsData || [])
    setLoading(false)
  }

  async function markOpened() {
    const { data: current } = await supabase
      .from("quotes")
      .select("status")
      .eq("id", quoteId)
      .single()

    if (!current || !["pending", "awaiting_response"].includes(current.status)) {
      return
    }

    await supabase
      .from("quotes")
      .update({
        status: "opened",
        last_viewed_at: new Date().toISOString(),
      })
      .eq("id", quoteId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-400 font-medium">
        Loading quote...
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-500">
        Quote not found
      </div>
    )
  }

  const canRespond = quote.status === "pending" || quote.status === "opened"
  const canPayDeposit =
    quote.status === "accepted" && quote.payment_status !== "paid"
  const isPaid = quote.status === "paid" || quote.payment_status === "paid"
  const isDeclined = quote.status === "declined"

  return (
    <main className="min-h-screen bg-zinc-50/50 flex justify-center p-4 md:p-8">
      <div className="w-full max-w-xl bg-white border border-zinc-200 rounded-[2rem] shadow-xl p-6 md:p-8">
        <h1 className="text-2xl font-black mb-6 text-center text-zinc-900 tracking-tight">
          Quote Details
        </h1>

        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">Customer</p>
              <p className="font-bold text-zinc-900">{quote.customer_name}</p>
            </div>
            <div>
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-wider">Email</p>
              <p className="font-bold text-zinc-900 truncate">{quote.customer_email}</p>
            </div>
          </div>

          <div className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total Amount</p>
            <p className="text-2xl font-black text-zinc-900">₹{quote.amount?.toLocaleString()}</p>
          </div>

          <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Deposit Required</p>
            <p className="text-2xl font-black text-indigo-700">₹{quote.deposit_amount?.toLocaleString()}</p>
          </div>

          <div className="flex justify-between text-sm pt-2">
            <span className="text-zinc-500">Status</span>
            <span className="font-bold text-zinc-900 capitalize">{quote.status?.replace("_", " ")}</span>
          </div>
        </div>

        {canRespond && (
          <div className="space-y-3 mb-8">
            <AcceptQuoteButton quoteId={quote.id} />
            <div className="flex gap-2">
              <RequestChangeButton quoteId={quote.id} />
              <DeclineQuoteButton quoteId={quote.id} />
            </div>
            <AskQuestionBox quoteId={quote.id} />
          </div>
        )}

        {canPayDeposit && (
          <div className="mb-8">
            <p className="text-sm text-emerald-700 font-medium mb-3 text-center">
              Quote accepted! Pay your deposit to confirm the booking.
            </p>
            <PayDepositButton amount={quote.deposit_amount} quoteId={quote.id} />
          </div>
        )}

        {isPaid && (
          <div className="mb-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
            <p className="text-emerald-800 font-bold">Payment received — booking confirmed!</p>
          </div>
        )}

        {isDeclined && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-center">
            <p className="text-rose-800 font-bold">This quote has been declined.</p>
          </div>
        )}

        {quote.status === "rejected" && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl text-center">
            <p className="text-amber-800 font-bold">Change request submitted. The business will follow up.</p>
          </div>
        )}

        {quote.status === "question_pending" && quote.customer_question && (
          <div className="mb-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Your Question</p>
            <p className="text-amber-900 font-medium">{quote.customer_question}</p>
            <p className="text-xs text-amber-600 mt-2">Waiting for a response from the business.</p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Timeline</h2>

          {events.length === 0 ? (
            <p className="text-sm text-zinc-400">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {events.map((event: any) => (
                <div key={event.id} className="border border-zinc-100 rounded-xl p-4 bg-zinc-50/50">
                  <p className="text-sm font-medium text-zinc-800">{event.message}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {new Date(event.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
