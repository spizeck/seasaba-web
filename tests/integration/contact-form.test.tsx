import { expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/contact-form";
import { trackEvent, trackLinkClick } from "@/lib/analytics";
vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn(), trackLinkClick: vi.fn() }));

const sendButton = () => screen.getByRole("button", { name: "Send inquiry by email" });

async function fillValidForm() {
  await userEvent.type(screen.getByRole("textbox", { name: /^Name/ }), "Alex Diver");
  await userEvent.type(screen.getByRole("textbox", { name: /^Email/ }), "guest@example.test");
  await userEvent.selectOptions(screen.getByRole("combobox"), "book-diving");
  await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), "Availability?");
}

function mockFetchOnce(result: { status?: number; body?: unknown } | "reject") {
  const fetchMock = vi.mocked(global.fetch);
  if (result === "reject") fetchMock.mockRejectedValueOnce(new Error("network"));
  else fetchMock.mockResolvedValueOnce(
    new Response(JSON.stringify(result.body ?? { ok: true }), {
      status: result.status ?? 200,
      headers: { "Content-Type": "application/json" },
    })
  );
  return fetchMock;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

it.each(["email", "WhatsApp"])("blocks empty %s submissions with accessible errors", async (method) => {
  const open = vi.spyOn(window, "open").mockReturnValue(null);
  render(<ContactForm />);
  await userEvent.click(screen.getByRole("button", { name: `Send inquiry by ${method}` }));
  for (const message of ["Please enter your name.", "Please enter your email address.", "Please select an inquiry type.", "Please enter a message."]) expect(screen.getByText(message)).toBeVisible();
  expect(screen.getByRole("textbox", { name: /^Email/ })).toHaveAttribute("aria-invalid", "true");
  expect(open).not.toHaveBeenCalled();
  expect(global.fetch).not.toHaveBeenCalled();
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
it.each(["sunset-cruise", "saba-lace", "jewelry-making", "glass-art"])(
  "prefills the %s inquiry linked from plan-your-trip",
  (value) => {
    render(<ContactForm initialInterest={value} />);
    expect(screen.getByRole("combobox")).toHaveValue(value);
  }
);
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

it("submits to the server endpoint and shows the success state", async () => {
  mockFetchOnce({});
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(sendButton());
  expect(await screen.findByRole("status")).toHaveTextContent("Your inquiry has been sent.");
  const [, init] = vi.mocked(global.fetch).mock.calls[0];
  const body = JSON.parse(String(init?.body));
  expect(vi.mocked(global.fetch).mock.calls[0][0]).toBe("/api/contact");
  expect(body).toMatchObject({
    name: "Alex Diver",
    email: "guest@example.test",
    inquiryType: "book-diving",
    message: "Availability?",
  });
  expect(typeof body.submissionId).toBe("string");
  expect(trackEvent).toHaveBeenCalledWith("contact_form_submit", expect.objectContaining({ method: "email", inquiry_type: "Book Diving" }));
  expect(trackLinkClick).not.toHaveBeenCalledWith("email_click", expect.anything(), expect.anything(), expect.anything());
});

it("keeps the entered fields and allows retry after a provider failure", async () => {
  mockFetchOnce({ status: 502, body: { ok: false, error: "Your message could not be sent right now." } });
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(sendButton());
  expect(await screen.findByRole("alert")).toHaveTextContent("could not be sent");
  expect(screen.getByRole("textbox", { name: /^Message/ })).toHaveValue("Availability?");
  expect(trackEvent).toHaveBeenCalledWith("contact_form_error", expect.objectContaining({ method: "email" }));
  expect(trackEvent).not.toHaveBeenCalledWith("contact_form_submit", expect.anything());

  mockFetchOnce({});
  await userEvent.click(sendButton());
  expect(await screen.findByRole("status")).toHaveTextContent("Your inquiry has been sent.");
});

it("sends the same idempotency key on an identical retry and a new key after edits", async () => {
  mockFetchOnce({ status: 502, body: { ok: false } });
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(sendButton());
  await screen.findByRole("alert");
  const firstKey = JSON.parse(String(vi.mocked(global.fetch).mock.calls[0][1]?.body)).submissionId;

  mockFetchOnce({ status: 502, body: { ok: false } });
  await userEvent.click(sendButton());
  await screen.findByRole("alert");
  const retryKey = JSON.parse(String(vi.mocked(global.fetch).mock.calls[1][1]?.body)).submissionId;
  expect(retryKey).toBe(firstKey);

  await userEvent.type(screen.getByRole("textbox", { name: /^Message/ }), " Updated.");
  mockFetchOnce({});
  await userEvent.click(sendButton());
  await screen.findByRole("status");
  const editedKey = JSON.parse(String(vi.mocked(global.fetch).mock.calls[2][1]?.body)).submissionId;
  expect(editedKey).not.toBe(firstKey);
});

it("ignores a second click while a submission is in flight", async () => {
  let release!: (r: Response) => void;
  vi.mocked(global.fetch).mockImplementationOnce(
    () => new Promise<Response>((res) => { release = res; })
  );
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(sendButton());
  const pending = sendButton();
  expect(pending).toBeDisabled();
  expect(pending).toHaveTextContent("Sending…");
  await userEvent.click(pending);
  release(new Response(JSON.stringify({ ok: true })));
  await screen.findByRole("status");
  expect(global.fetch).toHaveBeenCalledTimes(1);
});

it("includes the honeypot field in the payload", async () => {
  mockFetchOnce({});
  render(<ContactForm />);
  await fillValidForm();
  await userEvent.click(sendButton());
  await screen.findByRole("status");
  const body = JSON.parse(String(vi.mocked(global.fetch).mock.calls[0][1]?.body));
  expect(body.website).toBe("");
});
