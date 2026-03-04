import { createHmac, timingSafeEqual } from "node:crypto";

export const PRO_COOKIE_NAME = "simplethyzer_pro";
const PRO_COOKIE_TTL_SECONDS = 60 * 60 * 24 * 30;

function getCookieSecret() {
  const secret =
    process.env.PRO_COOKIE_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error("Missing PRO_COOKIE_SECRET (or STRIPE_WEBHOOK_SECRET)");
  }
  return secret;
}

function sign(payload: string) {
  return createHmac("sha256", getCookieSecret()).update(payload).digest("hex");
}

export function createProCookieValue() {
  const exp = Math.floor(Date.now() / 1000) + PRO_COOKIE_TTL_SECONDS;
  const payload = `pro:${exp}`;
  const sig = sign(payload);
  return `${payload}:${sig}`;
}

export function verifyProCookieValue(value: string | undefined) {
  if (!value) return false;
  const parts = value.split(":");
  if (parts.length !== 3) return false;
  if (parts[0] !== "pro") return false;

  const exp = Number(parts[1]);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;

  const payload = `pro:${parts[1]}`;
  const expectedSig = sign(payload);
  const inputSig = parts[2];
  const expectedBuf = Buffer.from(expectedSig, "utf8");
  const inputBuf = Buffer.from(inputSig, "utf8");
  if (expectedBuf.length !== inputBuf.length) return false;

  return timingSafeEqual(expectedBuf, inputBuf);
}

export const PRO_COOKIE_MAX_AGE = PRO_COOKIE_TTL_SECONDS;
