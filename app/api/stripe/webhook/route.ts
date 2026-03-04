import { NextResponse } from "next/server";
import Stripe from "stripe";
import { markSessionPaid } from "@/app/features/billing/server/proStore";
import { getStripe } from "@/app/features/billing/server/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET" },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const payload = await req.text();
    const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      markSessionPaid(session.id);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error", error);
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }
}
