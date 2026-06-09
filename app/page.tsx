"use client"

import { useState } from "react"
import AuthModal from "@/components/AuthModal"
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Zap, 
  CreditCard, 
  ArrowRight,
  FileText,
  MousePointer2
} from "lucide-react"

export default function Home() {
  const [showModal, setShowModal] = useState(false)
  const [mode, setMode] = useState<"login" | "signup">("login")

  // 🔥 CENTRAL HANDLER (Logic preserved)
  const openModal = (type: "login" | "signup") => {
    setMode(type)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex flex-col relative">

      {/* NAVBAR - Styled to match Dashboard Navbar */}
      <div className="flex justify-between items-center px-4 sm:px-8 py-5 bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
            Quote<span className="text-indigo-600"> to </span>Booking
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openModal("login")}
            className="px-4 py-2 text-sm font-semibold text-zinc-600 hover:text-indigo-600 transition-all"
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => openModal("signup")}
            className="bg-indigo-600 px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
          >
            Get Started
          </button>
        </div>
      </div>

      {/* HERO - Styled for Premium SaaS feel */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-24 text-center overflow-hidden">
        
        {/* Subtle Background Accent */}
        <div className="absolute top-0 w-[800px] h-[400px] bg-indigo-100/40 opacity-50 blur-[120px] rounded-full -z-10"></div>

        <div className="mb-6 px-4 py-1 text-[11px] font-bold uppercase tracking-[0.2em] bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full">
          Built for service businesses
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 leading-[1.1] max-w-4xl tracking-tighter text-zinc-900">
          Close deals faster with{" "}
          <span className="text-indigo-600">instant quotes & payments</span>
        </h1>

        <p className="text-zinc-500 text-lg md:text-xl mb-10 max-w-2xl font-medium leading-relaxed">
          Send quotes, track approvals, and collect deposits — all in one seamless flow designed to grow your business.
        </p>

        {/* BUTTONS - Matched to Dashboard Button Styles */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => openModal("signup")}
            className="bg-indigo-600 px-8 py-4 rounded-2xl text-lg font-bold text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all w-full sm:w-auto flex items-center justify-center gap-2 active:scale-95"
          >
            Get Started <ArrowRight className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => openModal("login")}
            className="px-8 py-4 rounded-2xl text-lg font-bold text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 transition-all w-full sm:w-auto shadow-sm active:scale-95"
          >
            Login to Dashboard
          </button>
        </div>

        <div className="flex items-center gap-6 mt-10 text-zinc-400 font-bold text-[11px] uppercase tracking-widest">
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No setup required</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
          <span className="flex items-center gap-2"><MousePointer2 className="w-4 h-4 text-indigo-500" /> Mobile Ready</span>
        </div>
      </div>

      {/* HOW IT WORKS - Dashboard Card Styling */}
      <div className="py-24 px-6 max-w-6xl mx-auto">
        <h2 className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.3em] text-center mb-4">Streamlined Workflow</h2>
        <h3 className="text-3xl font-black text-center text-zinc-900 mb-16 tracking-tight">How it works</h3>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Create Quote", 
              icon: <Zap className="w-6 h-6" />, 
              desc: "Generate professional quotes in seconds with all your line items and pricing details." 
            },
            { 
              title: "Share Link", 
              icon: <FileText className="w-6 h-6" />, 
              desc: "Send a simple, branded link to your customer. No PDF attachments or messy emails needed." 
            },
            { 
              title: "Get Paid", 
              icon: <CreditCard className="w-6 h-6" />, 
              desc: "Customer reviews, accepts, and pays deposits instantly from any device." 
            }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-white rounded-[2rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all">
              <div className="w-14 h-14 bg-zinc-50 text-indigo-600 border border-zinc-100 rounded-2xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="text-xl font-black mb-3 text-zinc-900 tracking-tight">{item.title}</h3>
              <p className="text-zinc-500 font-medium leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DASHBOARD PREVIEW - Direct UI Match to Dashboard Stat Cards */}
      <div className="py-24 px-6 flex justify-center bg-zinc-100/50 border-y border-zinc-200">
        <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 md:p-12 max-w-5xl w-full shadow-2xl relative">
          
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Management Console</span>
            </div>
            <div className="hidden sm:block text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
              Last update: Just now
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
            <div className="p-6 bg-white border border-zinc-200 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2">Total Pipeline</p>
              <h3 className="text-2xl font-black text-zinc-900">₹84,000</h3>
            </div>

            <div className="p-6 bg-amber-50 border border-amber-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-2">Awaiting</p>
              <h3 className="text-2xl font-black text-amber-700">6</h3>
            </div>

            <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl shadow-sm">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-wider mb-2">Paid</p>
              <h3 className="text-2xl font-black text-emerald-700">4</h3>
            </div>

            <div className="p-6 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
              <p className="text-[10px] font-black text-indigo-100 uppercase tracking-wider mb-2 opacity-80">Revenue</p>
              <h3 className="text-2xl font-black text-white">₹32,000</h3>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { name: "Rahul Sharma", price: "₹5,000", status: "Awaiting", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
              { name: "Ankit Verma", price: "₹8,000", status: "Approved", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
              { name: "Sneha Gupta", price: "₹3,000", status: "Paid", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" }
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-white border border-zinc-100 rounded-xl hover:border-zinc-300 transition-all cursor-default">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[12px] font-bold text-zinc-500">
                    {row.name[0]}
                  </div>
                  <span className="font-bold text-zinc-800 text-sm md:text-base">{row.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-black text-zinc-900 text-sm md:text-base">{row.price}</span>
                  <span className={`text-[10px] px-3 py-1.5 rounded-lg font-black uppercase border ${row.bg} ${row.color} ${row.border}`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FINAL CTA */}
      <div className="text-center py-32 px-6">
        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter text-zinc-900 leading-tight">
          Ready to stop <span className="text-indigo-600">chasing clients?</span>
        </h2>

        <button
          type="button"
          onClick={() => openModal("signup")}
          className="bg-indigo-600 px-10 py-5 rounded-2xl text-xl font-bold text-white hover:bg-indigo-700 shadow-2xl shadow-indigo-200 transition-all active:scale-95"
        >
          Start Free Account
        </button>
        <p className="text-zinc-400 font-medium mt-6">Join 500+ service businesses closing deals today.</p>
      </div>

      {/* 🔥 MODAL (Logic preserved) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md animate-in zoom-in-95 duration-200">
            <AuthModal
              initialMode={mode}
              onClose={() => setShowModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  )
}