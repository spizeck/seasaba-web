import { NextResponse } from "next/server";
import { Resend } from "resend";
import { CONTACT } from "@/lib/constants";
import {
  contactEmailHtml,
  contactEmailText,
  contactSubject,
  validateContactSubmission,
} from "@/lib/contact";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best-effort rate limiting. This is per-instance memory: on Vercel it limits
// bursts hitting one warm function instance, but it is NOT durable across
// instances or regions — treat it as a basic abuse brake, not a guarantee.
// Distributed limiting would need a shared store (e.g. Vercel KV / Upstash);
// deliberately out of scope for a small-business contact form.
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map<string, number[]>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  // Bound the map so a spray of unique keys can't grow it without limit.
  if (hits.size > 5000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= RATE_WINDOW_MS)) hits.delete(k);
    }
  }
  return false;
}

const MAX_BODY_BYTES = 32 * 1024;
const GENERIC_FAILURE =
  "Your message could not be sent right now. Please try again, or reach us on WhatsApp.";

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) return json({ ok: false, error: GENERIC_FAILURE }, 413);

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: GENERIC_FAILURE }, 400);
  }

  // Honeypot: the field is invisible and unfocusable for humans; a filled
  // value means an automated submitter. Accept-and-drop — never send.
  if (typeof (payload as Record<string, unknown>).website === "string" &&
      (payload as Record<string, unknown>).website !== "") {
    return json({ ok: true }, 200);
  }

  const result = validateContactSubmission(payload);
  if (!result.ok) return json({ ok: false, errors: result.errors }, 400);

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: GENERIC_FAILURE }, 429);

  const apiKey = process.env.RESEND_API_KEY;
  const domain = process.env.RESEND_EMAIL_DOMAIN;
  if (!apiKey || !domain) {
    console.error("contact: RESEND_API_KEY or RESEND_EMAIL_DOMAIN is not configured");
    return json({ ok: false, error: GENERIC_FAILURE }, 500);
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send(
      {
        from: `Sea Saba Website <website@${domain}>`,
        to: CONTACT.email,
        replyTo: result.data.email,
        subject: contactSubject(result.data),
        text: contactEmailText(result.data),
        html: contactEmailHtml(result.data),
      },
      // Idempotent sends: a retried client request carrying the same
      // submissionId is deduplicated by Resend instead of sending twice.
      result.data.submissionId
        ? { idempotencyKey: result.data.submissionId }
        : undefined
    );
    if (error) {
      console.error("contact: provider rejected the message", error.name);
      return json({ ok: false, error: GENERIC_FAILURE }, 502);
    }
    return json({ ok: true }, 200);
  } catch (err) {
    console.error("contact: send failed", err instanceof Error ? err.name : "unknown");
    return json({ ok: false, error: GENERIC_FAILURE }, 502);
  }
}
