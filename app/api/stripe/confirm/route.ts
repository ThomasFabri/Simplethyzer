import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createProCookieValue,
  PRO_COOKIE_MAX_AGE,
  PRO_COOKIE_NAME,
} from "@/app/features/billing/server/proCookie";
import { markSessionPaid } from "@/app/features/billing/server/proStore";
import { getStripe } from "@/app/features/billing/server/stripe";

export const runtime = "nodejs";

type ConfirmBody = {
  sessionId?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ConfirmBody;
    if (!body.sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);
    const paid =
      session.status === "complete" &&
      (session.payment_status === "paid" || session.mode === "subscription");

    if (!paid) {
      return NextResponse.json({ error: "Session not paid" }, { status: 400 });
    }

    markSessionPaid(session.id);

    const cookieStore = await cookies();
    cookieStore.set(PRO_COOKIE_NAME, createProCookieValue(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: PRO_COOKIE_MAX_AGE,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to confirm checkout session", error);
    return NextResponse.json(
      { error: "Failed to confirm checkout session" },
      { status: 500 },
    );
  }
}
