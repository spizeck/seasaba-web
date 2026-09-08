import { beforeEach, expect, it, vi } from "vitest";
import { track } from "@vercel/analytics";
import { sanitizeAnalyticsUrl, trackEvent, trackLinkClick, trackBookingClick } from "@/lib/analytics";

const layer = () => (window as unknown as { dataLayer: Record<string, unknown>[] }).dataLayer;
beforeEach(() => { (window as unknown as { dataLayer: unknown[] }).dataLayer = []; });
it.each([
  ["mailto:info@seasaba.com?subject=Private&body=Secret", "mailto:info@seasaba.com"],
  ["tel:+5994162246?name=Private", "tel:+5994162246"],
  ["https://wa.me/5994162246?text=Private#secret", "https://wa.me/5994162246"],
  ["https://api.whatsapp.com/send?text=Private", "https://api.whatsapp.com/send"],
  ["https://user:password@seasaba.checkfront.com/reserve/?item=244#private", "https://seasaba.checkfront.com/reserve/?item=244"],
])("sanitizes contact payload %s", (input, expected) => expect(sanitizeAnalyticsUrl(input)).toBe(expected));
it("keeps conversion events usable without leaking message bodies", () => {
  trackLinkClick("whatsapp_click", "https://wa.me/5994162246?text=Private customer message");
  expect(layer()[0]).toMatchObject({ event: "whatsapp_click", link_text: "WhatsApp", outbound: true, link_url: "https://wa.me/5994162246" });
  expect(JSON.stringify(layer())).not.toContain("Private");
});
it("records booking item, placement and internal-link status", () => {
  trackBookingClick("/book?item=classic", "Book", "header");
  expect(layer()[0]).toMatchObject({ event: "book_now_click", booking_item: "classic", button_location: "header", outbound: false });
});
it("continues safely when analytics is blocked and removes undefined values", () => {
  vi.mocked(track).mockImplementationOnce(() => { throw new Error("blocked"); });
  expect(() => trackEvent("contact_click", { button_location: "footer", unused: undefined })).not.toThrow();
  expect(layer()[0]).not.toHaveProperty("unused");
  expect(layer()[0]).toHaveProperty("event", "contact_click");
});
it.each([
  ["mailto:info@seasaba.com", "Email", "email"], ["tel:+5994162246", "Phone", "phone"],
  ["https://seasaba.checkfront.com/reserve", "Checkfront", "seasaba.checkfront.com"],
  ["https://www.facebook.com/seasaba", "Facebook", "www.facebook.com"],
  ["https://instagram.com/seasaba", "Instagram", "instagram.com"],
  ["https://linkedin.com/company/seasaba", "LinkedIn", "linkedin.com"],
  ["https://x.com/seasaba", "Twitter/X", "x.com"],
  ["https://youtu.be/example", "YouTube", "youtu.be"],
  ["https://www.google.com/maps", "Directions", "www.google.com"],
  ["https://checkfront.com.evil.example", "Link", "checkfront.com.evil.example"],
])("classifies actual domains for %s", (href, text, domain) => {
  trackLinkClick("contact_click", href);
  expect(layer()[0]).toMatchObject({ link_text: text, link_domain: domain });
});
