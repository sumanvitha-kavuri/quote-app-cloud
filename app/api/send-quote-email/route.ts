import { NextResponse } from "next/server"
import { sendQuoteEmail } from "@/lib/email"

export async function POST(req: Request) {
  try {
    const body = await req.json()

    console.log("Sending email to:", body.email)

    await sendQuoteEmail(
      body.email,
      body.name,
      body.quoteId
    )

    console.log("Email sent successfully")

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("EMAIL ERROR:", error)

    return NextResponse.json({
      success: false,
      error: "Email failed"
    })
  }
}