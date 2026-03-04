import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  PRO_COOKIE_NAME,
  verifyProCookieValue,
} from "@/app/features/billing/server/proCookie";

export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();
  const value = cookieStore.get(PRO_COOKIE_NAME)?.value;
  return NextResponse.json({ isPro: verifyProCookieValue(value) });
}
