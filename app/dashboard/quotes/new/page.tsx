"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { logEvent } from "@/lib/events"
import { 
  ArrowLeft, 
  User, 
  Mail, 
  IndianRupee, 
  ShieldCheck, 
  Send,
  Copy,
  Check
} from "lucide-react"

export default function NewQuotePage() {
  const router = useRouter()
  
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [amount, setAmount] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [quoteLink, setQuoteLink] = useState("")
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(quoteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      alert("You must be logged in")
      setLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("quotes")
      .insert([
        {
          customer_name: customerName,
          customer_email: customerEmail,
          amount: Number(amount),
          deposit_amount: Number(depositAmount),
          status: "pending",
          payment_status: "unpaid",
          user_id: user.id,
        }
      ])
      .select()

    if (error) {
      alert(error.message)
      setLoading(false)
      return
    }

    const id = data?.[0]?.id
    const link = `${window.location.origin}/quote/${id}`

    setQuoteLink(link)
    setLoading(false)

    // Background tasks
    logEvent(id, "quote_created", "Quote created")
    fetch(`${window.location.origin}/api/send-quote-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: customerEmail, name: customerName, quoteId: id }),
    })
    logEvent(id, "email_sent", "Quote email sent")
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">New Transaction</span>
        </div>
      </div>

      <main className="max-w-3xl mx-auto p-6 md:p-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900">Create New Quote</h1>
          <p className="text-zinc-500 mt-2 font-medium">Fill in the details to generate a secure booking link.</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
          {!quoteLink ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 ml-1">Customer Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                      placeholder="e.g. Rahul Sharma"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 ml-1">Customer Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="email"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                      placeholder="rahul@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 ml-1">Total Amount (₹)</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="number"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-wider text-zinc-400 ml-1">Deposit Required (₹)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      required
                      type="number"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-11 pr-4 py-4 text-sm font-bold focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                disabled={loading}
                className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl mt-6 shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Creating Quote..." : (
                  <>
                    Generate & Send Quote <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900">Quote Created!</h2>
              <p className="text-zinc-500 font-medium mb-8">The link has been sent to {customerEmail}</p>
              
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-2 flex items-center gap-2">
                <input
                  value={quoteLink}
                  readOnly
                  className="flex-1 bg-transparent border-none text-xs font-bold px-4 outline-none text-zinc-600"
                />
                <button 
                  onClick={copyToClipboard}
                  className="bg-white border border-zinc-200 px-4 py-2 rounded-xl text-xs font-black text-zinc-700 hover:bg-zinc-50 transition-all flex items-center gap-2"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <button 
                onClick={() => router.push('/dashboard')}
                className="mt-8 text-sm font-bold text-indigo-600 hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}