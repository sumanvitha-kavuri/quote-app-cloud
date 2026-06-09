import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export default function PaymentSuccess() {
  return (
    <main className="min-h-screen bg-zinc-50/50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-[2rem] shadow-xl p-10 text-center">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 mb-2">Payment Successful</h1>
        <p className="text-zinc-500 font-medium mb-8">
          Your deposit has been paid. Your booking is confirmed.
        </p>
        <Link
          href="/"
          className="inline-block w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
        >
          Done
        </Link>
      </div>
    </main>
  )
}
