import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact-form";
import { trackEvent, trackLinkClick } from "@/lib/analytics";
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackLinkClick: vi.fn() }));

const emailButton = () => screen.getByRole("button", { name: "Continue to email" });
const open = () => vi.mocked(window.open);

/** Decode the mailto: URI handed to window.open (first call, first arg). */
function lastMailto() {
  const calls = open().mock.calls;
  const href = String(calls[calls.length - 1][0]);
  const url = new URL(href);
  return {
    href,
    to: url.pathname,
    subject: url.searchParams.get("subject") ?? "",
    body: url.searchParams.get("body") ?? "",
  };
}

async function fillValidForm() {
  await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), "Alex Diver");
  await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
  await userEvent.selectOptions(screen.getByRole("combobox"), "book-diving");
  await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Availability?");
}

beforeEach(() => {
  vi.spyOn(window, "open").mockReturnValue(null);
  vi.stubGlobal("fetch", vi.fn());
});

it.each(["email", "WhatsApp"])("blocks empty %s submissions with accessible errors", async (method) => {
  render(<ContactForm />);
  const label = method === "email" ? "Continue to email" : "Send inquiry by WhatsApp";
  await userEvent.click(screen.getByRole("button", { name: label }));
  for (const message of ["Please enter your name.", "Please enter your email address.", "Please select an inquiry type.", "Please enter a message."]) expect(screen.getByText(message)).toBeVisible();
  expect(screen.getByRole("textbox", { name: /^Email/ })).toHaveAttribute("aria-invalid", "true");
  expect(open()).not.toHaveBeenCalled();
  expect(trackEvent).not.toHaveBeenCalled();
  expect(trackLinkClick).not.toHaveBeenCalled();
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
it.each(["sunset-cruise", "saba-lace", "jewelry-making", "glass-art"])(
  "prefills the %s inquiry linked from plan-your-trip",
  (value) => {
    render(<ContactForm initialInterest={value} />);
    expect(screen.getByRole("combobox")).toHaveValue(value);
  }
);
it("builds an encoded WhatsApp handoff with course and travel details", async () => {
  render(<ContactForm />);
  await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), " Alex & Sam ");
  await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
  await userEvent.selectOptions(screen.getByRole("combobox"), "try-scuba");
  await userEvent.type(screen.getByLabelText(/^Planned travel dates/), "October 10–12");
  await userEvent.click(screen.getByRole("button", { name: "Send inquiry by WhatsApp" }));
  expect(open()).toHaveBeenCalledOnce();
  const url = new URL(String(open().mock.calls[0][0]));
  expect(url.origin + url.pathname).toBe("https://wa.me/5994162246");
  expect(url.searchParams.get("text")).toContain("Alex & Sam");
  expect(url.searchParams.get("text")).toContain("October 10–12");
  expect(url.searchParams.get("text")).toContain("Try Scuba");
  expect(open().mock.calls[0].slice(1)).toEqual(["_blank", "noopener,noreferrer"]);
  expect(trackLinkClick).toHaveBeenCalledWith("whatsapp_click", url.toString(), "WhatsApp Sea Saba", expect.objectContaining({ method: "whatsapp" }));
});

it("opens the visitor's email app with a structured inquiry and sends nothing to a server", async () => {
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(emailButton());
  expect(open()).toHaveBeenCalledOnce();
  const mailto = lastMailto();
  expect(mailto.to).toBe("info@seasaba.com");
  expect(mailto.subject).toBe("Book Diving Inquiry — Alex Diver");
  expect(mailto.body).toContain("Name: Alex Diver");
  expect(mailto.body).toContain("Email: guest@example.test");
  expect(mailto.body).toContain("Inquiry: Book Diving");
  expect(mailto.body).toContain("Preferred contact method: Email");
  expect(mailto.body).toContain("Message:\r\nAvailability?");
  // Handoff targets the same window — no blank tab left behind.
  expect(open().mock.calls[0].slice(1)).toEqual(["_self"]);
  // No server round-trip: the browser constructs the email locally.
  expect(global.fetch).not.toHaveBeenCalled();
});

it("shows a handoff notice — never a delivery confirmation", async () => {
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(emailButton());
  const notice = await screen.findByRole("status");
  expect(notice).toHaveTextContent("Your email app should open with your inquiry ready to send");
  expect(notice).not.toHaveTextContent(/sent|received|in touch/i);
  // The notice offers a reopen link carrying the same mailto href.
  const reopen = notice.querySelector("a") as HTMLAnchorElement;
  expect(reopen.href).toBe(lastMailto().href);
  // The form stays editable — nothing is locked or cleared.
  expect(screen.getByRole("textbox", { name: /^Message/ })).toHaveValue("Availability?");
  // Truthful analytics: an email handoff, not a confirmed submission.
  expect(trackLinkClick).toHaveBeenCalledWith("email_click", lastMailto().href, "Continue to Email", expect.objectContaining({ method: "email", inquiry_type: "Book Diving" }));
  expect(trackEvent).not.toHaveBeenCalledWith("contact_form_submit", expect.objectContaining({ method: "email" }));
});

it("reopens the mail client with updated content after the visitor edits", async () => {
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(emailButton());
  await screen.findByRole("status");
  await userEvent.clear(screen.getByRole("textbox", { name: /^Message/ }));
  await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Edited question.");
  await lastEmailGuardBump();
  await userEvent.click(emailButton());
  expect(lastMailto().body).toContain("Edited question.");
});

// The 1s double-click guard otherwise swallows the second activation in a
// single test tick — wait it out with a real timer boundary.
function lastEmailGuardBump() {
  return new Promise<void>((resolve) => setTimeout(resolve, 1100));
}

// Progressive disclosure: contextual fields are driven by each inquiry's
// `fields` list in data/operations.ts — these tests prove the contract.
describe("progressive inquiry fields", () => {
  const contextual = () => ({
    whatsapp: screen.queryByLabelText(/^WhatsApp number/),
    dates: screen.queryByLabelText(/^Planned travel dates/),
    students: screen.queryByLabelText(/^Number of/),
    groupSize: screen.queryByLabelText(/^Group size/),
    certification: screen.queryByLabelText(/^Certification level/),
    loggedDives: screen.queryByLabelText(/^Logged dives/),
  });

  it("renders a compact default form with no contextual fields", () => {
    render(<ContactForm />);
    expect(screen.getByRole("textbox", { name: /^Name/ })).toBeVisible();
    expect(screen.getByRole("textbox", { name: /^Email/ })).toBeVisible();
    expect(screen.getByRole("combobox")).toBeVisible();
    expect(screen.getByRole("textbox", { name: /^Message/ })).toBeVisible();
    for (const el of Object.values(contextual())) expect(el).toBeNull();
    // No preferred-contact radio group anymore.
    expect(screen.queryByRole("radio")).toBeNull();
  });

  it("reveals the full diving field set for a certified-diving inquiry", async () => {
    render(<ContactForm />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "book-diving");
    const c = contextual();
    expect(c.whatsapp).toBeVisible();
    expect(c.dates).toBeVisible();
    expect(screen.getByLabelText(/^Number of divers/)).toBeVisible();
    expect(c.certification).toBeVisible();
    expect(c.loggedDives).toBeVisible();
  });

  it("does not ask Try Scuba or Open Water visitors for credentials", async () => {
    render(<ContactForm />);
    for (const value of ["try-scuba", "sdi-open-water"]) {
      await userEvent.selectOptions(screen.getByRole("combobox"), value);
      const c = contextual();
      expect(c.certification, value).toBeNull();
      expect(c.loggedDives, value).toBeNull();
      expect(c.dates, value).toBeVisible();
      expect(c.whatsapp, value).toBeVisible();
    }
    expect(screen.getByLabelText(/^Number of students/)).toBeVisible();
  });

  it("shows no scuba fields for non-diving inquiries", async () => {
    render(<ContactForm />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "sunset-cruise");
    const c = contextual();
    expect(c.certification).toBeNull();
    expect(c.loggedDives).toBeNull();
    expect(screen.getByLabelText(/^Number of guests/)).toBeVisible();
    expect(c.dates).toBeVisible();
  });

  it("keeps general inquiries minimal", async () => {
    render(<ContactForm />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "general");
    const c = contextual();
    expect(c.whatsapp).toBeVisible();
    expect(c.dates).toBeNull();
    expect(c.certification).toBeNull();
    expect(c.loggedDives).toBeNull();
    expect(c.students).toBeNull();
    expect(c.groupSize).toBeNull();
  });

  it("preselects a valid ?interest= and reveals its fields immediately", () => {
    render(<ContactForm initialInterest="sdi-divemaster" />);
    expect(screen.getByRole("combobox")).toHaveValue("sdi-divemaster");
    expect(screen.getByLabelText(/^Certification level/)).toBeVisible();
    expect(screen.getByLabelText(/^Logged dives/)).toBeVisible();
    expect(screen.getByLabelText(/^Number of students/)).toBeVisible();
  });

  it("keeps an unknown ?interest= compact and safe", () => {
    render(<ContactForm initialInterest="not-real" />);
    expect(screen.getByRole("combobox")).toHaveValue("");
    for (const el of Object.values(contextual())) expect(el).toBeNull();
  });

  it("clears and omits stale scuba values when the inquiry changes", async () => {
    render(<ContactForm />);
    await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), "Alex Diver");
    await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
    await userEvent.selectOptions(screen.getByRole("combobox"), "book-diving");
    await userEvent.type(screen.getByLabelText(/^Certification level/), "Advanced");
    await userEvent.type(screen.getByLabelText(/^Logged dives/), "100");
    await userEvent.type(screen.getByLabelText(/^Number of divers/), "2");
    await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Availability?");

    // Switching to a non-diving inquiry removes the fields entirely.
    await userEvent.selectOptions(screen.getByRole("combobox"), "sunset-cruise");
    expect(screen.queryByLabelText(/^Certification level/)).toBeNull();
    expect(screen.queryByLabelText(/^Logged dives/)).toBeNull();

    await userEvent.click(emailButton());
    const mailto = lastMailto();
    expect(mailto.subject).toBe("Sunset Cruise Inquiry — Alex Diver");
    expect(mailto.body).not.toContain("Certification");
    expect(mailto.body).not.toContain("Logged dives");
    // Party size applies to the cruise too — its value correctly survives
    // the switch under the "Number of guests" label.
    expect(mailto.body).toContain("Number of guests: 2");
  });

  it("keeps email as the preferred channel when only a WhatsApp number is given", async () => {
    // A number is alternate contact info, not a WhatsApp-first request —
    // Respond.io/WhatsApp outreach requires explicit opt-in.
    render(<ContactForm />);
    await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), "Alex Diver");
    await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
    await userEvent.selectOptions(screen.getByRole("combobox"), "sunset-cruise");
    await userEvent.type(screen.getByLabelText(/^WhatsApp number/), "+599 416 0000");
    await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Two seats Friday?");
    await userEvent.click(emailButton());
    const mailto = lastMailto();
    expect(mailto.body).toContain("WhatsApp: +599 416 0000");
    expect(mailto.body).toContain("Preferred contact method: Email");
  });

  it("marks WhatsApp preferred only when the visitor explicitly opts in", async () => {
    render(<ContactForm />);
    await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), "Alex Diver");
    await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
    await userEvent.selectOptions(screen.getByRole("combobox"), "sunset-cruise");
    await userEvent.type(screen.getByLabelText(/^WhatsApp number/), "+599 416 0000");
    await userEvent.click(screen.getByRole("checkbox", { name: /prefer to be contacted on WhatsApp/i }));
    await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Two seats Friday?");
    await userEvent.click(emailButton());
    const mailto = lastMailto();
    expect(mailto.body).toContain("WhatsApp: +599 416 0000");
    expect(mailto.body).toContain("Preferred contact method: WhatsApp");
  });

  it("defaults to email when no WhatsApp number is provided", async () => {
    render(<ContactForm />);
    await fillValidForm(); // book-diving — WhatsApp field visible, left empty
    await userEvent.click(emailButton());
    const mailto = lastMailto();
    expect(mailto.body).not.toContain("WhatsApp:");
    expect(mailto.body).toContain("Preferred contact method: Email");
  });

  it("drops the WhatsApp preference when the number is removed", async () => {
    render(<ContactForm />);
    await userEvent.selectOptions(screen.getByRole("combobox"), "sunset-cruise");
    const number = screen.getByLabelText(/^WhatsApp number/);
    const checkbox = screen.getByRole("checkbox", { name: /prefer to be contacted on WhatsApp/i });
    await userEvent.type(number, "+599 416 0000");
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();

    // Removing the number auto-unchecks: a preference with no number is
    // meaningless and must not survive into the email.
    await userEvent.clear(number);
    expect(checkbox).not.toBeChecked();

    await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), "Alex Diver");
    await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
    await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Two seats Friday?");
    await userEvent.click(emailButton());
    expect(lastMailto().body).toContain("Preferred contact method: Email");
  });
});
