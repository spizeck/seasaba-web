import { expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact-form";
import { trackEvent, trackLinkClick } from "@/lib/analytics";
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackLinkClick: vi.fn() }));

it.each(["email", "WhatsApp"])("blocks empty %s submissions with accessible errors", async (method) => {
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  render(<ContactForm />);
  await userEvent.click(screen.getByRole("button", { name: `Send inquiry by ${method}` }));
  for (const message of ["Please enter your name.", "Please enter your email address.", "Please select an inquiry type.", "Please enter a message."]) expect(screen.getByText(message)).toBeVisible();
  expect(screen.getByRole("textbox", { name: /^Email/ })).toHaveAttribute("aria-invalid", "true");
  expect(open).not.toHaveBeenCalled();
  expect(trackEvent).not.toHaveBeenCalled();
});
it("validates email on blur and recovers after correction", async () => {
  render(<ContactForm />);
  const email = screen.getByRole("textbox", { name: /^Email/ });
  await userEvent.type(email, "invalid");
  await userEvent.tab();
  expect(email).toHaveAccessibleDescription("Please enter a valid email address.");
  await userEvent.clear(email);
  await userEvent.type(email, "guest@example.test");
  await userEvent.tab();
  expect(email).toHaveAttribute("aria-invalid", "false");
});
it("prefills supported course inquiries and ignores unknown interests", () => {
  const { unmount } = render(<ContactForm initialInterest="tdi-technical" />);
  expect(screen.getByRole("combobox")).toHaveValue("tdi-technical");
  expect((screen.getByRole("textbox", { name: /^Message/ }) as HTMLTextAreaElement).value).toContain("TDI Technical Diving");
  unmount();
  render(<ContactForm initialInterest="unknown" />);
  expect(screen.getByRole("combobox")).toHaveValue("");
});
it("builds an encoded WhatsApp handoff with course and travel details", async () => {
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  render(<ContactForm />);
  await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), " Alex & Sam ");
  await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
  await userEvent.selectOptions(screen.getByRole("combobox"), "try-scuba");
  await userEvent.type(screen.getByLabelText("Planned travel dates"), "October 10–12");
  await userEvent.click(screen.getByRole("radio", { name: "WhatsApp" }));
  await userEvent.click(screen.getByRole("button", { name: "Send inquiry by WhatsApp" }));
  expect(open).toHaveBeenCalledOnce();
  const url = new URL(String(open.mock.calls[0][0]));
  expect(url.origin + url.pathname).toBe("https://wa.me/5994162246");
  expect(url.searchParams.get("text")).toContain("Alex & Sam");
  expect(url.searchParams.get("text")).toContain("October 10–12");
  expect(url.searchParams.get("text")).toContain("Try Scuba");
  expect(open.mock.calls[0].slice(1)).toEqual(["_blank", "noopener,noreferrer"]);
  expect(trackLinkClick).toHaveBeenCalledWith("whatsapp_click", url.toString(), "WhatsApp Sea Saba", expect.objectContaining({ method: "whatsapp" }));
});

it("builds the email draft with optional fields and preserves special characters", async () => {
  render(<ContactForm />);
  await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), " Alex & Sam ");
  await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
  await userEvent.selectOptions(screen.getByRole("combobox"), "book-diving");
  await userEvent.type(screen.getByLabelText("WhatsApp phone number"), "+15555550100");
  await userEvent.type(screen.getByLabelText("Planned travel dates"), "October 10–12");
  await userEvent.type(screen.getByLabelText("Number of divers/students"), "2");
  await userEvent.type(screen.getByLabelText("Certification level"), "Advanced");
  await userEvent.type(screen.getByLabelText("Logged dives"), "50");
  await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Availability & prices?\nThanks!");
  await userEvent.click(screen.getByRole("radio", { name: "WhatsApp" }));
  await userEvent.click(screen.getByRole("button", { name: "Send inquiry by email" }));
  const call = vi.mocked(trackLinkClick).mock.calls.find(([event]) => event === "email_click")!;
  expect(call).toBeDefined();
  const url = new URL(call[1]);
  expect(url.protocol + url.pathname).toBe("mailto:info@seasaba.com");
  expect(url.searchParams.get("subject")).toBe("Book Diving Inquiry");
  for (const text of ["Name: Alex & Sam", "Number of students: 2", "Certification level: Advanced", "Logged dives: 50", "Preferred contact method: WhatsApp", "Availability & prices?\nThanks!"]) expect(url.searchParams.get("body")).toContain(text);
});
