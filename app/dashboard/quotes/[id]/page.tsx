"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logEvent } from "@/lib/events"
import { getSiteUrl } from "@/lib/site-url"
import {
  ArrowLeft,
  User,
  IndianRupee,
  FileText,
  CheckCircle2,
  Calendar,
  History,
  Send,
  Save,
  X,
} from "lucide-react"

export default function QuoteDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [quote, setQuote] = useState<any>(null)
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [resending, setResending] = useState(false)
  const [form, setForm] = useState({
    customer_name: "",
    customer_email: "",
    amount: "",
    deposit_amount: "",
  })

  useEffect(() => {
    if (!id) return
    fetchQuote()
  }, [id])

  async function fetchQuote() {
    const { data } = await supabase
      .from("quotes")
      .select("*")
      .eq("id", id)
      .single()

    if (data) {
      setQuote(data)
      setForm({
        customer_name: data.customer_name || "",
        customer_email: data.customer_email || "",
        amount: String(data.amount || ""),
        deposit_amount: String(data.deposit_amount || ""),
      })

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("quote_id", id)
        .order("created_at", { ascending: false })

      setEvents(eventsData || [])
    }

    setLoading(false)
  }

  async function handleSave() {
    setSaving(true)

    const { error } = await supabase
      .from("quotes")
      .update({
        customer_name: form.customer_name,
        customer_email: form.customer_email,
        amount: Number(form.amount),
        deposit_amount: Number(form.deposit_amount),
      })
      .eq("id", id)

    if (error) {
      alert(error.message)
    } else {
      await logEvent(id, "quote_updated", "Quote details updated")
      setEditing(false)
      await fetchQuote()
    }

    setSaving(false)
  }

  async function handleResend() {
    if (!quote) return
    setResending(true)

    try {
      const res = await fetch("/api/send-quote-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: quote.customer_email,
          name: quote.customer_name,
          quoteId: quote.id,
        }),
      })

      if (!res.ok) throw new Error("Failed to send")

      await logEvent(id, "email_resent", "Quote link resent to customer")
      alert("Quote link resent successfully")
      await fetchQuote()
    } catch {
      alert("Failed to resend quote link")
    }

    setResending(false)
  }

  function copyQuoteLink() {
    const link = `${getSiteUrl()}/quote/${id}`
    navigator.clipboard.writeText(link)
    alert("Quote link copied to clipboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-400 font-medium">
        Loading Details...
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

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900">
      <div className="bg-white border-b border-zinc-200 px-8 py-5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-all font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <span
            className={`text-[10px] px-4 py-1.5 rounded-full font-black uppercase tracking-widest border shadow-sm
              ${quote.status === "paid" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                quote.status === "accepted" ? "bg-orange-50 text-orange-600 border-orange-100" :
                quote.status === "declined" ? "bg-rose-50 text-rose-600 border-rose-100" :
                "bg-zinc-100 text-zinc-500 border-zinc-200"}`}
          >
            {quote.status}
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-8 md:p-12 space-y-10">
        <div>
          <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] mb-2">Quote Management</p>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <FileText className="w-6 h-6 text-white" />
            </div>
            Quote for {quote.customer_name}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" /> Customer Information
                </h2>
                {!editing ? (
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(false)} className="p-2 text-zinc-400 hover:text-zinc-600">
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1 text-xs font-bold text-emerald-600"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Full Name</label>
                    <input
                      className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold"
                      value={form.customer_name}
                      onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Email</label>
                    <input
                      type="email"
                      className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold"
                      value={form.customer_email}
                      onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Total Amount (₹)</label>
                    <input
                      type="number"
                      className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Deposit (₹)</label>
                    <input
                      type="number"
                      className="w-full mt-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-bold"
                      value={form.deposit_amount}
                      onChange={(e) => setForm({ ...form, deposit_amount: e.target.value })}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Full Name</p>
                    <p className="text-xl font-bold text-zinc-900">{quote.customer_name}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Email Address</p>
                    <p className="text-xl font-bold text-zinc-900">{quote.customer_email}</p>
                  </div>
                </div>
              )}

              {quote.customer_question && (
                <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                  <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1">Customer Question</p>
                  <p className="text-amber-900 font-medium">{quote.customer_question}</p>
                </div>
              )}
            </div>

            <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-10 shadow-sm">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-10 flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-500" /> Activity History
              </h2>

              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                      <p className="text-sm font-medium text-zinc-800">{event.message}</p>
                      <p className="text-xs text-zinc-400 mt-1">
                        {new Date(event.created_at).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-10 relative before:absolute before:inset-0 before:ml-[23px] before:w-[2px] before:bg-zinc-100">
                  <div className="relative flex items-center gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-indigo-600 flex items-center justify-center z-10 shadow-sm">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="p-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 flex-1">
                      <p className="text-base font-bold text-zinc-900">Quote created</p>
                      <p className="text-sm text-zinc-400 font-medium">
                        {new Date(quote.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {quote.status === "accepted" && (
                    <div className="relative flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-orange-500 flex items-center justify-center z-10 shadow-sm">
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      </div>
                      <div className="p-5 bg-orange-50/50 rounded-[1.5rem] border border-orange-100 flex-1">
                        <p className="text-base font-bold text-orange-900">Accepted by customer</p>
                        <p className="text-sm text-orange-600/70 font-medium">Awaiting payment or scheduling</p>
                      </div>
                    </div>
                  )}

                  {quote.status === "paid" && (
                    <div className="relative flex items-center gap-6 group">
                      <div className="w-12 h-12 rounded-2xl bg-white border-2 border-emerald-500 flex items-center justify-center z-10 shadow-sm">
                        <IndianRupee className="w-5 h-5 text-emerald-500" />
                      </div>
                      <div className="p-5 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100 flex-1">
                        <p className="text-base font-bold text-emerald-900">Payment received</p>
                        <p className="text-sm text-emerald-600/70 font-medium">Transaction completed</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>

              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-3">Total Amount</p>
              <h3 className="text-5xl font-black tracking-tighter mb-8 flex items-center gap-1">
                <span className="text-2xl opacity-50 italic font-medium">₹</span>
                {quote.amount?.toLocaleString()}
              </h3>

              <div className="pt-8 border-t border-white/10 space-y-5">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-indigo-200">Deposit</span>
                  <span>₹{quote.deposit_amount?.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-indigo-200">Status</span>
                  <span>{quote.status === "paid" ? "Completed" : quote.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-indigo-200">Date</span>
                  <span>{new Date(quote.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-6">Manager Actions</h3>
              <div className="grid gap-3">
                <button
                  onClick={() => setEditing(true)}
                  className="w-full py-4 bg-zinc-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
                >
                  Edit Quote
                </button>
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {resending ? "Sending..." : "Resend Link"}
                </button>
                <button
                  onClick={copyQuoteLink}
                  className="w-full py-4 bg-white border border-zinc-200 text-zinc-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all active:scale-95"
                >
                  Copy Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
