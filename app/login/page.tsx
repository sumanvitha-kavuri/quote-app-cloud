"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

export default function Login({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [infoMsg, setInfoMsg] = useState("")

  const handleLogin = async () => {
    if (loading) return

    setErrorMsg("")
    setInfoMsg("")

    if (!email || !password) {
      setErrorMsg("Enter email and password")
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
      return
    }

    await supabase.auth.getSession()
    setLoading(false)

    // ✅ SUCCESS MESSAGE + DELAY
    setInfoMsg("Login successful")

    setTimeout(() => {
      router.replace("/dashboard")
    }, 500)
  }

  const handleForgotPassword = async () => {
    setErrorMsg("")
    setInfoMsg("")

    if (!email) {
      setErrorMsg("Enter your email first")
      return
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email)

    if (error) {
      setErrorMsg(error.message)
    } else {
      setInfoMsg("Password reset email sent")
    }
  }

  const form = (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        handleLogin()
      }}
      className="space-y-6"
    >
      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Welcome back
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Login to your account
        </p>
      </div>

      {/* INPUTS */}
      <div className="space-y-4">

        {/* EMAIL */}
        <div className="space-y-1">
          <p className="text-sm text-gray-700 font-medium">Email</p>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="space-y-1">
          <p className="text-sm text-gray-700 font-medium">Password</p>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
              value={password}
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
        </div>

        {/* FORGOT PASSWORD */}
        <div className="text-right">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

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
        className="w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
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