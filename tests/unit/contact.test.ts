import { beforeEach, describe, expect, it, vi } from "vitest";

const send = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { POST } from "@/app/api/contact/route";
import {
  CONTACT_LIMITS,
  contactEmailHtml,
  contactEmailText,
  contactSubject,
  validateContactSubmission,
} from "@/lib/contact";
import { CONTACT } from "@/lib/constants";

const VALID = {
  name: "Alex Diver",
  email: "alex@example.test",
  inquiryType: "sdi-open-water",
  message: "I would like to book a course in March.",
  preferredContact: "email",
  submissionId: "test-submission-1",
};

function post(body: unknown, headers: Record<string, string> = {}) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: typeof body === "string" ? body : JSON.stringify(body),
    })
  );
}

beforeEach(() => {
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("RESEND_EMAIL_DOMAIN", "mail.seasaba.com");
  send.mockResolvedValue({ data: { id: "email_123" }, error: null });
});

describe("validateContactSubmission", () => {
  it("accepts a complete valid submission and resolves the inquiry context", () => {
    const result = validateContactSubmission(VALID);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.inquiryLabel).toBe("SDI Open Water Diver");
      expect(result.data.inquirySubject).toBe("SDI Open Water Diver Inquiry");
    }
  });

  it.each([
    ["missing name", { ...VALID, name: "" }, "name"],
    ["missing email", { ...VALID, email: "" }, "email"],
    ["malformed email", { ...VALID, email: "not-an-email" }, "email"],
    ["unknown inquiry type", { ...VALID, inquiryType: "free-ipad" }, "inquiryType"],
    ["missing inquiry type", { ...VALID, inquiryType: "" }, "inquiryType"],
    ["missing message", { ...VALID, message: "   " }, "message"],
    ["over-long name", { ...VALID, name: "x".repeat(CONTACT_LIMITS.name + 1) }, "name"],
    ["over-long message", { ...VALID, message: "x".repeat(CONTACT_LIMITS.message + 1) }, "message"],
    ["over-long optional field", { ...VALID, dates: "x".repeat(CONTACT_LIMITS.dates + 1) }, "dates"],
    ["non-string field", { ...VALID, name: { evil: true } }, "name"],
  ])("rejects %s", (_label, body, field) => {
    const result = validateContactSubmission(body);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors[field]).toBeDefined();
  });

  it("strips newlines from fields that can reach the email subject", () => {
    const result = validateContactSubmission({ ...VALID, name: "Alex\r\nBcc: all@evil.test" });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).not.toMatch(/[\r\n]/);
  });
});

describe("email construction", () => {
  const data = (() => {
    const r = validateContactSubmission(VALID);
    if (!r.ok) throw new Error("fixture invalid");
    return r.data;
  })();

  it("builds a canonical subject without visitor-controlled extras", () => {
    expect(contactSubject(data)).toBe("SDI Open Water Diver Inquiry — Alex Diver");
  });

  it("escapes HTML in the HTML body", () => {
    const xss = validateContactSubmission({ ...VALID, name: '<img onerror="x">' });
    if (!xss.ok) throw new Error("fixture invalid");
    const html = contactEmailHtml(xss.data);
    expect(html).not.toContain('<img onerror="x">');
    expect(html).toContain("&lt;img");
  });

  it("includes inquiry context and submission source in the text body", () => {
    const text = contactEmailText(data);
    expect(text).toContain("SDI Open Water Diver");
    expect(text).toContain("alex@example.test");
    expect(text).toContain("seasaba.com");
  });
});

describe("POST /api/contact", () => {
  it("sends a valid submission through Resend and returns ok", async () => {
    const res = await post(VALID);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledOnce();
    const [email, options] = send.mock.calls[0];
    expect(email.to).toBe(CONTACT.email);
    expect(email.from).toBe("Sea Saba Website <website@mail.seasaba.com>");
    expect(email.replyTo).toBe("alex@example.test");
    expect(email.subject).toBe("SDI Open Water Diver Inquiry — Alex Diver");
    expect(email.text).toContain("I would like to book a course");
    expect(email.html).toContain("I would like to book a course");
    expect(options).toEqual({ idempotencyKey: "test-submission-1" });
  });

  it("returns field errors for invalid payloads without sending", async () => {
    const res = await post({ ...VALID, email: "nope" });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(body.errors.email).toBeDefined();
    expect(send).not.toHaveBeenCalled();
  });

  it("accepts-and-drops a filled honeypot without sending", async () => {
    const res = await post({ ...VALID, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects malformed JSON", async () => {
    const res = await post("{not json");
    expect(res.status).toBe(400);
    expect(send).not.toHaveBeenCalled();
  });

  it("rejects oversized request bodies", async () => {
    const res = await post(VALID, { "content-length": String(64 * 1024) });
    expect(res.status).toBe(413);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns a safe error and never reports success when the provider rejects", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "internal detail" } });
    const res = await post(VALID);
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.ok).toBe(false);
    expect(JSON.stringify(body)).not.toContain("internal detail");
  });

  it("returns a safe error when the provider throws", async () => {
    send.mockRejectedValue(new Error("socket hangup"));
    const res = await post(VALID);
    expect(res.status).toBe(502);
    expect((await res.json()).ok).toBe(false);
  });

  it("fails closed when the provider is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await post(VALID);
    expect(res.status).toBe(500);
    expect((await res.json()).ok).toBe(false);
    expect(send).not.toHaveBeenCalled();
  });

  it("never exposes the API key or env details in any response", async () => {
    for (const res of [
      await post(VALID),
      await post({ ...VALID, email: "bad" }),
      await post("{broken"),
    ]) {
      const text = JSON.stringify(await res.json());
      expect(text).not.toContain("re_test_key");
      expect(text).not.toContain("mail.seasaba.com");
      expect(text.toLowerCase()).not.toContain("resend");
    }
  });
});
