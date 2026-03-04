import { NextResponse } from "next/server";
import { getStripe } from "@/app/features/billing/server/stripe";

export const runtime = "nodejs";

type CheckoutBody = {
  email?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CheckoutBody;
    const stripe = getStripe();
    const priceId = process.env.STRIPE_PRO_PRICE_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    if (!priceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_PRO_PRICE_ID" },
        { status: 500 },
      );
    }

    const price = await stripe.prices.retrieve(priceId);
    const checkoutMode: "payment" | "subscription" = price.recurring
      ? "subscription"
      : "payment";

    const session = await stripe.checkout.sessions.create({
      mode: checkoutMode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: body.email || undefined,
      allow_promotion_codes: true,
      success_url: `${appUrl}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?checkout=cancelled`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Unable to create checkout URL" },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Failed to create checkout session", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
