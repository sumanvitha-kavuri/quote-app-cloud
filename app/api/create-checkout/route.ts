import Stripe from "stripe"
import { NextResponse } from "next/server"
import { getSiteUrl } from "@/lib/site-url"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const amount = body.amount
    const quoteId = body.quoteId

    if (!amount || !quoteId) {
      return NextResponse.json({ error: "Missing amount or quoteId" }, { status: 400 })
    }

    const siteUrl = getSiteUrl(req)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Deposit Payment",
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: {
        quoteId: quoteId,
      },
      success_url: `${siteUrl}/payment-success`,
      cancel_url: `${siteUrl}/quote/${quoteId}`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error("CHECKOUT ERROR:", error)
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 })
  }
}