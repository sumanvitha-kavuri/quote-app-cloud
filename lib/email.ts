import { Resend } from "resend"
import { getSiteUrl } from "@/lib/site-url"

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendQuoteEmail(
  email: string,
  name: string,
  quoteId: string
) {
  const link = `${getSiteUrl()}/quote/${quoteId}`
  const now = new Date().toLocaleString()

  await resend.emails.send({
    from: "Acme Quotes <onboarding@resend.dev>",
    to: email,
    subject: "Your Quote is Ready",
    html: `
      <div style="font-family: Arial; padding: 20px;">
        <h2>Hello ${name},</h2>

        <p>Your quote has been prepared.</p>

        <p><b>Date:</b> ${now}</p>

        <a href="${link}" 
           style="display:inline-block;margin-top:15px;padding:10px 16px;background:black;color:white;text-decoration:none;border-radius:6px;">
          View Quote
        </a>

        <p style="margin-top:20px;font-size:12px;color:gray;">
          Thank you.
        </p>
      </div>
    `
  })
}