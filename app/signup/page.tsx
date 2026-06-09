"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Eye, EyeOff } from "lucide-react"

export default function Signup({ switchToLogin, embedded = false }: { switchToLogin?: () => void; embedded?: boolean }) {

  const [name, setName] = useState("")
  const [business, setBusiness] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [infoMsg, setInfoMsg] = useState("")

  const getStrength = (pass: string) => {
    let score = 0
    if (pass.length >= 8) score++
    if (pass.length >= 12) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "25%" }
    if (score <= 4) return { label: "Medium", color: "bg-yellow-500", width: "60%" }
    return { label: "Strong", color: "bg-green-500", width: "100%" }
  }

  const strength = getStrength(password)

  const handleSignup = async () => {
    if (loading) return

    setErrorMsg("")
    setInfoMsg("")

    if (!name || !business || !email || !password || !confirmPassword) {
      setErrorMsg("All fields are required")
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match")
      return
    }

    setLoading(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id

    if (!userId) {
      setErrorMsg("Signup failed. Try again.")
      setLoading(false)
      return
    }

    const { error: dbError } = await supabase.from("users").insert({
      id: userId,
      email,
      name,
      business_name: business,
    })

    if (dbError) {
      setErrorMsg(dbError.message)
      setLoading(false)
      return
    }

    setLoading(false)

    // ✅ SUCCESS MESSAGE
    setInfoMsg("Registered successfully")

    // ✅ SWITCH MODAL → LOGIN
    setTimeout(() => {
      switchToLogin?.()
    }, 500)
  }

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleSignup()
      }}
      className="space-y-5"
    >
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Create your account
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Start sending quotes and getting paid faster
        </p>
      </div>

      {/* NAME */}
      <input
        placeholder="Full Name"
        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 text-black"
        onChange={(e) => setName(e.target.value)}
      />

      {/* BUSINESS */}
      <input
        placeholder="Business Name"
        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 text-black"
        onChange={(e) => setBusiness(e.target.value)}
      />

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Email"
        className="w-full border p-3 rounded-lg outline-none focus:ring-2 focus:ring-slate-900 text-black"
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* PASSWORD */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full border p-3 rounded-lg pr-12 outline-none focus:ring-2 focus:ring-slate-900 text-black"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* STRENGTH */}
      {password && (
        <div>
          <div className="h-2 bg-gray-200 rounded">
            <div
              className={`h-2 rounded ${strength.color}`}
              style={{ width: strength.width }}
            />
          </div>
          <p className="text-xs mt-1 text-gray-600">
            Strength: {strength.label}
          </p>
        </div>
      )}

      {/* CONFIRM */}
      <div className="relative">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm Password"
          className="w-full border p-3 rounded-lg pr-12 outline-none focus:ring-2 focus:ring-slate-900 text-black"
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* ERROR */}
      {errorMsg && (
        <p className="text-sm text-red-500 text-center">{errorMsg}</p>
      )}

      {/* SUCCESS */}
      {infoMsg && (
        <p className="text-sm text-green-600 text-center">{infoMsg}</p>
      )}

      {/* BUTTON */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>
    </form>
  )

  if (embedded) return form

  return (
    <div className="min-h-screen bg-zinc-50/50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-[2rem] shadow-xl p-8">
        {form}
      </div>
    </div>
  )
}