export default function ThankYouPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 via-white to-slate-100 px-4">

      <div className="w-full max-w-md bg-white border rounded-2xl shadow-xl p-8 text-center">

        {/* BRAND */}
        <h1 className="text-lg font-semibold mb-4">
          <span className="text-gray-900">Quote</span>{" "}
          <span className="text-slate-700">to Booking</span>
        </h1>

        {/* MESSAGE */}
        <h2 className="text-2xl font-semibold mb-2">
          🎉 Registration Successful
        </h2>

        <p className="text-gray-500 mb-6">
          Your account has been created successfully.
        </p>

        {/* BUTTON */}
        <a
          href="/login"
          className="inline-block w-full bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition"
        >
          Back to Login
        </a>

      </div>

    </div>
  )
}