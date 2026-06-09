import { NextResponse } from "next/server"
import { sendReminderEmails } from "@/lib/reminders"

export async function GET() {

  await sendReminderEmails()

  return NextResponse.json({ success: true })
}