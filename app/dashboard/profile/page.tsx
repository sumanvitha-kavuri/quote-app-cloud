"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Building2, Mail } from "lucide-react"

export default function Profile() {
  const router = useRouter()

  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>({})
  const [originalProfile, setOriginalProfile] = useState<any>({})
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
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

    const { data: quotesData } = await supabase
      .from("quotes")
      .select("*")
      .eq("user_id", user.id)

    setProfile(profileData || {})
    setOriginalProfile(profileData || {})
    setQuotes(quotesData || [])
    setLoading(false)
  }

  async function handleSave() {
    const { error } = await supabase
      .from("users")
      .update({
        name: profile.name,
        business_name: profile.business_name,
      })
      .eq("id", user.id)

    if (!error) {
      setEditing(false)
      setOriginalProfile(profile)
      setMessage("Saved successfully")
      setTimeout(() => setMessage(""), 3000)
    }
  }

  function handleCancel() {
    setProfile(originalProfile)
    setEditing(false)
  }

  const totalQuotes = quotes.length
  const revenue = quotes
    .filter(q => q.status === "paid")
    .reduce((sum, q) => sum + (q.amount || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-400 font-medium">
        Loading profile...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900">
      <div className="bg-white border-b border-zinc-200 px-8 py-5">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2 text-zinc-500 hover:text-indigo-600 transition-all font-bold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-8 space-y-6">
        <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-black">
              {profile.name?.[0] || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-black">{profile.name || "Your Profile"}</h1>
              <p className="text-indigo-200 text-sm mt-1">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 space-y-5 shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="font-black text-sm uppercase tracking-widest text-zinc-400">Account Details</h2>
            {!editing ? (
              <button onClick={() => setEditing(true)} className="text-indigo-600 text-sm font-bold">
                Edit
              </button>
            ) : (
              <div className="flex gap-3 text-sm font-bold">
                <button onClick={handleCancel} className="text-zinc-400">Cancel</button>
                <button onClick={handleSave} className="text-indigo-600">Save</button>
              </div>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <User className="w-3 h-3" /> Full Name
            </p>
            <input
              disabled={!editing}
              value={profile.name || ""}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 outline-none disabled:opacity-80 font-bold text-sm focus:border-indigo-600"
            />
          </div>

          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> Business Name
            </p>
            <input
              disabled={!editing}
              value={profile.business_name || ""}
              onChange={(e) => setProfile({ ...profile, business_name: e.target.value })}
              className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 outline-none disabled:opacity-80 font-bold text-sm focus:border-indigo-600"
            />
          </div>

          <div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email
            </p>
            <input
              value={user.email}
              disabled
              className="w-full p-4 rounded-xl bg-zinc-50 border border-zinc-200 opacity-60 font-bold text-sm"
            />
          </div>

          {message && (
            <p className="text-sm text-emerald-600 text-center font-medium">{message}</p>
          )}
        </div>

        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm">
          <h2 className="font-black text-sm uppercase tracking-widest text-zinc-400 mb-6">Account Summary</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-zinc-900">{totalQuotes}</p>
              <p className="text-zinc-400 text-xs font-bold uppercase mt-1">Quotes</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 text-center">
              <p className="text-3xl font-black text-emerald-700">₹{revenue.toLocaleString()}</p>
              <p className="text-emerald-600 text-xs font-bold uppercase mt-1">Revenue</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
