"use client"

import { useState } from "react"
import Signup from "@/app/signup/page"
import Login from "@/app/login/page"

export default function AuthModal({ initialMode, onClose }: any) {
  const [mode, setMode] = useState<"login" | "signup">(initialMode)

  return (
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black text-lg"
        >
          ✕
        </button>

        {mode === "login" ? (
          <>
            <Login embedded />
            <p className="text-sm text-center mt-5 text-gray-500">
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-600 font-medium hover:underline"
              >
                Sign up
              </button>
            </p>
          </>
        ) : (
          <>
            {/* ✅ PASS SWITCH FUNCTION */}
            <Signup embedded switchToLogin={() => setMode("login")} />

            <p className="text-sm text-center mt-5 text-gray-500">
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="text-blue-600 font-medium hover:underline"
              >
                Login
              </button>
            </p>
          </>
        )}

      </div>
  )
}