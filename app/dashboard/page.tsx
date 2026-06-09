"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { 
  Home, 
  Bell, 
  LayoutDashboard, 
  FileText, 
  AlertCircle, 
  BarChart3,
  LogOut,
  User
} from "lucide-react"

type DashboardView = "overview" | "all" | "action" | "lost" | "activity"

export default function Dashboard() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [quotes, setQuotes] = useState<any[]>([])
  const [prevQuotes, setPrevQuotes] = useState<any[]>([])

  const [notifications, setNotifications] = useState<string[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [loading, setLoading] = useState(true)

  const [activeView, setActiveView] = useState<DashboardView>("overview")

  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      init()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (prevQuotes.length === 0) {
      setPrevQuotes(quotes)
      return
    }

    const newNotifications: string[] = []

    quotes.forEach((q) => {
      const old = prevQuotes.find(p => p.id === q.id)
      if (!old) return

      if (old.status !== q.status) {
        if (q.status === "accepted") newNotifications.push("Customer accepted a quote")
        if (q.status === "rejected") newNotifications.push("Customer requested changes")
        if (q.status === "paid") newNotifications.push("Payment received")
        if (q.status === "opened") newNotifications.push("Customer viewed the quote")
        if (q.status === "schedule_ready") newNotifications.push("Quote is ready to schedule")
        if (q.status === "question_pending") newNotifications.push("Customer asked a question")
        if (q.status === "declined") newNotifications.push("Customer declined a quote")
      }
    })

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev])
    }

    setPrevQuotes(quotes)
  }, [quotes])

  async function init() {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.replace("/login")
      return
    }

    setUser(user)

    const { data: profileData } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(profileData || {})

    const { data } = await supabase
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)

    setQuotes(data || [])
    setLoading(false)
  }

  function handleFocus(columnId: string) {
    setActiveView("overview")
    setTimeout(() => {
      document.getElementById(columnId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }, 50)
  }

  const pendingQuotes = quotes.filter(
    q => q.status === "pending" || q.status === "awaiting_response"
  )

  const openedQuotes = quotes.filter(q => q.status === "opened")
  const changeRequested = quotes.filter(q => q.status === "rejected")
  const questionPending = quotes.filter(q => q.status === "question_pending")
  const declinedQuotes = quotes.filter(q => q.status === "declined")

  const unpaidAccepted = quotes.filter(
    q => q.status === "accepted" && q.payment_status !== "paid"
  )
  const totalPipelineValue = quotes.reduce((sum, q) => sum + (q.amount || 0), 0)

  const moneyWaiting = quotes
    .filter(q => q.status === "accepted" && q.payment_status !== "paid")
    .reduce((sum, q) => sum + (q.amount || 0), 0)

  const needsActionCount =
    pendingQuotes.length +
    openedQuotes.length +
    changeRequested.length +
    questionPending.length +
    unpaidAccepted.length

  const actionQuotes = quotes.filter(
    q =>
      ["pending", "awaiting_response", "opened", "rejected", "question_pending"].includes(q.status) ||
      (q.status === "accepted" && q.payment_status !== "paid")
  )

  function navButtonClass(view: DashboardView) {
    return view === activeView
      ? "w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-600 text-white text-base font-semibold shadow-sm transition-all"
      : "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-100 text-base font-medium transition-all"
  }

  function getNextAction(q: any) {
    if (q.status === "pending") return "Send follow-up"
    if (q.status === "opened") return "Follow up (customer viewed)"
    if (q.status === "accepted" && q.payment_status !== "paid") return "Collect payment"
    if (q.status === "rejected") return "Revise quote"
    if (q.status === "paid") return "Schedule job"
    if (q.status === "schedule_ready") return "Confirm schedule"
    return "No action"
  }

  function getSmartMessage(q: any) {
    const last = new Date(q.updated_at || q.created_at).getTime()
    const now = Date.now()
    const diffHours = (now - last) / (1000 * 60 * 60)
    const days = Math.floor(diffHours / 24)

    if (q.status === "pending" || q.status === "opened") {
      if (days >= 2) return `Follow-up overdue by ${days}d`
      if (days >= 1) return `Follow up today`
      return "Recently contacted"
    }

    if (q.status === "accepted" && q.payment_status !== "paid") {
      if (days >= 2) return `Payment overdue by ${days}d`
      return "Waiting for payment"
    }

    if (q.status === "rejected") {
      return "Revise and resend"
    }

    if (q.status === "question_pending") {
      return "Answer customer question"
    }

    if (q.status === "declined") {
      return "Quote declined"
    }

    if (q.status === "paid") {
      return "Ready to schedule"
    }

    if (q.status === "schedule_ready") {
      return "Confirm schedule"
    }

    return "No action needed"
  }

  function getUrgency(q: any) {
    const last = new Date(q.updated_at || q.created_at).getTime()
    const now = new Date().getTime()
    const diffHours = (now - last) / (1000 * 60 * 60)

    if (diffHours > 48) return "high"
    if (diffHours > 24) return "medium"
    return "low"
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) return "Just now"
    if (hours < 24) return `${hours}h ago`

    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-400 font-medium">
        Loading Dashboard...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-50/50 overflow-hidden text-zinc-900">
      {/* SIDEBAR */}
      <div className="w-72 bg-white border-r border-zinc-200 h-screen px-5 py-8 flex flex-col justify-between shadow-sm">
        <div>
          {/* PROFILE */}
          <div className="flex items-center gap-4 mb-10 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              {profile?.name?.[0] || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-base font-semibold text-zinc-900 truncate">
                {profile?.name || "User Name"}
              </p>
              <p className="text-[11px] text-zinc-500 truncate font-medium">
                {user?.email}
              </p>
            </div>
          </div>

          {/* NAV */}
          <div className="space-y-2">
            <button onClick={() => setActiveView("overview")} className={navButtonClass("overview")}>
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button onClick={() => setActiveView("all")} className={navButtonClass("all")}>
              <FileText className="w-5 h-5" />
              All Quotes
            </button>

            <button onClick={() => setActiveView("action")} className={navButtonClass("action")}>
              <AlertCircle className="w-5 h-5" />
              Needs Action
              {needsActionCount > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                  {needsActionCount}
                </span>
              )}
            </button>

            <button onClick={() => setActiveView("lost")} className={navButtonClass("lost")}>
              <BarChart3 className="w-5 h-5" />
              Lost Quotes
              {declinedQuotes.length > 0 && (
                <span className="ml-auto bg-zinc-200 text-zinc-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {declinedQuotes.length}
                </span>
              )}
            </button>

            <button onClick={() => { setActiveView("activity"); setShowNotifications(true) }} className={navButtonClass("activity")}>
              <Bell className="w-5 h-5" />
              Activity
            </button>

            <button onClick={() => router.push("/dashboard/profile")} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-700 hover:bg-zinc-100 text-base font-medium transition-all">
              <User className="w-5 h-5" />
              Profile
            </button>
          </div>
        </div>

        {/* LOGOUT */}
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.replace("/")
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-base font-medium text-zinc-600 hover:bg-zinc-100 border border-zinc-200 transition-all active:scale-[0.98]"
        >
          <LogOut className="w-5 h-5" />
          Logout Account
        </button>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* NAVBAR - PREMIUM HIGHLIGHT */}
        <div className="flex justify-between items-center px-8 py-5 bg-white border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-zinc-900 tracking-tight">
              Quote<span className="text-indigo-600"> to </span>Booking
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/")} className="p-2.5 hover:bg-zinc-50 rounded-xl border border-zinc-200 bg-white transition-all">
              <Home className="w-4 h-4 text-zinc-600" />
            </button>

            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2.5 hover:bg-zinc-50 rounded-xl border border-zinc-200 bg-white transition-all relative">
                <Bell className="w-4 h-4 text-zinc-600" />
                {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white"></span>}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-2 z-50">
                  {notifications.length === 0
                    ? <p className="text-xs text-zinc-400 text-center py-6">No new activity</p>
                    : notifications.map((n, i) => (
                      <div key={i} className="text-xs p-4 hover:bg-zinc-50 rounded-xl text-zinc-600 border-b border-zinc-50 last:border-0">
                        {n}
                      </div>
                    ))
                  }
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-10 bg-zinc-50/50">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <div>
                <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-1">Manager Overview</p>
                <h2 className="text-3xl font-black text-zinc-900 tracking-tight">
                  Welcome back, {profile?.name || user?.email?.split("@")[0]}
                </h2>
              </div>
              <button
                onClick={() => router.push("/dashboard/quotes/new")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-7 py-3 rounded-xl shadow-lg shadow-indigo-100 font-bold transition-all text-sm active:scale-95"
              >
                + New Quote
              </button>
            </div>

            {/* PIPELINE STATS */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white border border-zinc-200 rounded-2xl p-7 shadow-sm">
                <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Total Pipeline</p>
                <h3 className="text-3xl font-black text-zinc-900">
                  ₹{totalPipelineValue.toLocaleString()}
                </h3>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-7 shadow-sm">
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider mb-2">Money Waiting</p>
                <h3 className="text-3xl font-black text-emerald-700">
                  ₹{moneyWaiting.toLocaleString()}
                </h3>
              </div>
              <div className={`rounded-2xl p-7 shadow-sm border ${needsActionCount === 0 ? "bg-white border-zinc-200 text-zinc-900" : "bg-rose-50 border-rose-100 text-rose-900"}`}>
                <p className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${needsActionCount === 0 ? "text-zinc-400" : "text-rose-600"}`}>Needs Action</p>
                <h3 className="text-3xl font-black">
                  {needsActionCount} <span className="text-sm font-medium opacity-60">Quotes</span>
                </h3>
              </div>
            </div>

            {/* ACTION REQUIRED */}
            <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-6">
              <h3 className="text-amber-900 font-bold mb-4 text-[11px] uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Immediate Attention
              </h3>
              <div className="flex flex-wrap gap-5 text-sm font-semibold">
                {pendingQuotes.length > 0 && (
                  <p onClick={() => handleFocus("awaiting_response")} className="cursor-pointer text-zinc-600 hover:text-indigo-600 transition-colors">
                    • {pendingQuotes.length} pending
                  </p>
                )}
                {openedQuotes.length > 0 && (
                  <p onClick={() => handleFocus("opened")} className="cursor-pointer text-indigo-700 hover:underline underline-offset-4 transition-colors">
                    • {openedQuotes.length} viewed
                  </p>
                )}
                {changeRequested.length > 0 && (
                  <p onClick={() => handleFocus("awaiting_response")} className="cursor-pointer text-amber-700 hover:underline underline-offset-4 transition-colors">
                    • {changeRequested.length} change requests
                  </p>
                )}
                {questionPending.length > 0 && (
                  <p onClick={() => handleFocus("awaiting_response")} className="cursor-pointer text-violet-700 hover:underline underline-offset-4 transition-colors">
                    • {questionPending.length} questions
                  </p>
                )}
                {unpaidAccepted.length > 0 && (
                  <p onClick={() => handleFocus("accepted")} className="cursor-pointer text-rose-700 hover:underline underline-offset-4 transition-colors">
                    • {unpaidAccepted.length} unpaid
                  </p>
                )}
              </div>
            </div>

            {activeView === "all" && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Customer</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Amount</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Status</th>
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-wider text-zinc-400">Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotes.map((q) => (
                      <tr
                        key={q.id}
                        onClick={() => router.push(`/dashboard/quotes/${q.id}`)}
                        className="border-b border-zinc-50 hover:bg-zinc-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 font-bold">{q.customer_name}</td>
                        <td className="px-6 py-4 font-black">₹{q.amount?.toLocaleString()}</td>
                        <td className="px-6 py-4 capitalize">{q.status?.replace("_", " ")}</td>
                        <td className="px-6 py-4 text-zinc-400">{timeAgo(q.updated_at || q.created_at)}</td>
                      </tr>
                    ))}
                    {quotes.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">No quotes yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeView === "action" && (
              <div className="grid md:grid-cols-2 gap-4">
                {actionQuotes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => router.push(`/dashboard/quotes/${q.id}`)}
                    className="bg-white border border-zinc-200 p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                  >
                    <p className="font-bold text-zinc-900">{q.customer_name}</p>
                    <p className="text-sm text-zinc-400 mb-3">{q.customer_email}</p>
                    <p className="text-xl font-black">₹{q.amount?.toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase mt-3 text-rose-600">{getNextAction(q)}</p>
                  </div>
                ))}
                {actionQuotes.length === 0 && (
                  <p className="text-zinc-400 col-span-2 text-center py-12">No quotes need action right now</p>
                )}
              </div>
            )}

            {activeView === "lost" && (
              <div className="grid md:grid-cols-2 gap-4">
                {declinedQuotes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => router.push(`/dashboard/quotes/${q.id}`)}
                    className="bg-white border border-rose-100 p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-all"
                  >
                    <p className="font-bold text-zinc-900">{q.customer_name}</p>
                    <p className="text-sm text-zinc-400 mb-3">{q.customer_email}</p>
                    <p className="text-xl font-black">₹{q.amount?.toLocaleString()}</p>
                    <p className="text-[10px] font-black uppercase mt-3 text-rose-600">Declined</p>
                  </div>
                ))}
                {declinedQuotes.length === 0 && (
                  <p className="text-zinc-400 col-span-2 text-center py-12">No lost quotes</p>
                )}
              </div>
            )}

            {activeView === "activity" && (
              <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-6">Recent Activity</h3>
                {notifications.length === 0 ? (
                  <p className="text-zinc-400 text-center py-12">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {notifications.map((n, i) => (
                      <div key={i} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-600">
                        {n}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* KANBAN */}
            {activeView === "overview" && <div className="overflow-x-auto pb-8">
              <div className="flex gap-6 min-w-max">
                {[
                  { title: "Follow Up", key: "opened", color: "bg-zinc-400" },
                  { title: "Awaiting", key: "awaiting_response", color: "bg-indigo-500" },
                  { title: "Accepted", key: "accepted", color: "bg-orange-500" },
                  { title: "Paid", key: "paid", color: "bg-emerald-500" },
                  { title: "Ready", key: "schedule_ready", color: "bg-violet-500" },
                ].map((col) => {
                  const columnQuotes = quotes.filter(q => {
                    if (col.key === "awaiting_response") {
                      return ["pending", "awaiting_response", "rejected", "question_pending"].includes(q.status)
                    }
                    return q.status === col.key
                  })

                  return (
                    <div
                      id={col.key}
                      key={col.key}
                      className={`w-[300px] rounded-2xl p-4 border
                        ${col.key === "opened" ? "bg-zinc-100/40 border-zinc-200" : ""}
                        ${col.key === "awaiting_response" ? "bg-indigo-50/30 border-indigo-100" : ""}
                        ${col.key === "accepted" ? "bg-orange-50/30 border-orange-100" : ""}
                        ${col.key === "paid" ? "bg-emerald-50/30 border-emerald-100" : ""}
                        ${col.key === "schedule_ready" ? "bg-violet-50/30 border-violet-100" : ""}
                      `}
                    >
                      <h3 className="mb-4 font-black text-[10px] uppercase tracking-widest flex items-center justify-between px-1">
                        <span className="flex items-center gap-2 text-zinc-500">
                          <span className={`w-2.5 h-2.5 rounded-full ${col.color}`}></span>
                          {col.title}
                        </span>
                        <span className="bg-white px-2.5 py-1 rounded-lg border border-zinc-200 text-zinc-900">
                          {columnQuotes.length}
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {columnQuotes.map((q) => {
                          const urgency = getUrgency(q)
                          return (
                            <div
                              key={q.id}
                              onClick={() => router.push(`/dashboard/quotes/${q.id}`)}
                              className={`bg-white border p-5 rounded-2xl cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all
                                ${col.key === "opened" ? "border-l-4 border-l-zinc-400" : ""}
                                ${col.key === "awaiting_response" ? "border-l-4 border-l-indigo-500" : ""}
                                ${col.key === "accepted" ? "border-l-4 border-l-orange-500" : ""}
                                ${col.key === "paid" ? "border-l-4 border-l-emerald-500" : ""}
                                ${col.key === "schedule_ready" ? "border-l-4 border-l-violet-500" : ""}
                              `}
                            >
                              <div className="flex justify-between items-start mb-1">
                                <p className="font-bold text-zinc-900 text-[15px] truncate tracking-tight">{q.customer_name}</p>
                                {urgency === "high" && <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
                              </div>
                              <p className="text-[12px] text-zinc-400 truncate mb-4">{q.customer_email}</p>
                              <p className="text-xl font-black text-zinc-900 tracking-tighter">₹{q.amount?.toLocaleString()}</p>
                              
                              <div className="mt-5 pt-4 border-t border-zinc-50 flex flex-col gap-2">
                                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Updated {timeAgo(q.updated_at || q.created_at)}</p>
                                <span className={`text-[10px] px-3 py-2 rounded-lg font-black uppercase text-center 
                                  ${urgency === "high" ? "bg-rose-50 text-rose-600" : ""}
                                  ${urgency === "medium" ? "bg-amber-50 text-amber-600" : ""}
                                  ${urgency === "low" ? "bg-zinc-50 text-zinc-500 border border-zinc-100" : ""}
                                `}>
                                  {getSmartMessage(q)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                        {columnQuotes.length === 0 && (
                          <div className="border-2 border-dashed border-zinc-200 rounded-2xl py-12 flex flex-col items-center justify-center">
                            <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">No Quotes</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>}
          </div>
        </div>
      </div>
    </div>
  )
}