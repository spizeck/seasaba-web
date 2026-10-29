import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NewsletterFooterCta } from "@/components/newsletter-footer-cta";

const push = vi.fn();
let mockPathname = "/";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => mockPathname,
}));

vi.mock("@/lib/analytics", () => ({ trackEvent: vi.fn() }));

afterEach(() => {
  cleanup();
  push.mockClear();
  sessionStorage.clear();
  mockPathname = "/";
});

describe("NewsletterFooterCta", () => {
  it("renders the banner on ordinary pages", () => {
    mockPathname = "/about";
    render(<NewsletterFooterCta />);
    expect(
      screen.getByRole("textbox", { name: /newsletter email/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Subscribe" })).toBeInTheDocument();
  });

  it("is hidden on /newsletter so the page never shows two signup prompts", () => {
    mockPathname = "/newsletter";
    const { container } = render(<NewsletterFooterCta />);
    expect(container).toBeEmptyDOMElement();
  });

  it.each(["/newsletter/confirm", "/newsletter/unsubscribe"])(
    "is hidden on %s — the band is redundant or contradictory on token pages",
    (mockPath) => {
      mockPathname = mockPath;
      const { container } = render(<NewsletterFooterCta />);
      expect(container).toBeEmptyDOMElement();
    }
  );

  it("keeps query strings intact when matching token routes", () => {
    // A token-bearing URL must still match — the band reads the pathname
    // only, never the query.
    mockPathname = "/newsletter/confirm";
    const { container } = render(<NewsletterFooterCta />);
    expect(container).toBeEmptyDOMElement();
  });

  it("stays visible where no newsletter page exists (e.g. /nl/newsletter)", () => {
    // /nl/newsletter has no published Dutch page yet — hiding the band
    // there would remove the visitor's only signup entry point.
    mockPathname = "/nl/newsletter";
    render(<NewsletterFooterCta />);
    expect(
      screen.getByRole("textbox", { name: /newsletter email/i })
    ).toBeInTheDocument();
  });

  it("stays visible on unpublished localized token routes (e.g. /nl/newsletter/confirm)", () => {
    // No Dutch newsletter pages are published yet — the band remains the
    // only signup entry point on those routes.
    mockPathname = "/nl/newsletter/confirm";
    render(<NewsletterFooterCta />);
    expect(
      screen.getByRole("textbox", { name: /newsletter email/i })
    ).toBeInTheDocument();
    mockPathname = "/nl/newsletter/unsubscribe";
    render(<NewsletterFooterCta />);
    expect(
      screen.getByRole("textbox", { name: /newsletter email/i })
    ).toBeInTheDocument();
  });

  it("hands the email to /newsletter via sessionStorage, never the URL", async () => {
    mockPathname = "/";
    const user = userEvent.setup();
    render(<NewsletterFooterCta />);
    await user.type(
      screen.getByRole("textbox", { name: /newsletter email/i }),
      "Diver@Example.com"
    );
    await user.click(screen.getByRole("button", { name: "Subscribe" }));

    expect(sessionStorage.getItem("nl-prefill-email")).toBe("Diver@Example.com");
    expect(push).toHaveBeenCalledTimes(1);
    const dest = push.mock.calls[0][0] as string;
    expect(dest.startsWith("/newsletter?")).toBe(true);
    expect(dest).not.toContain("email");
    const params = new URLSearchParams(dest.split("?")[1]);
    expect(params.get("placement")).toBe("footer");
    expect(params.get("source")).toBe("website");
    // The field clears on handoff so an abandoned signup doesn't leave
    // the address sitting in the band when the visitor navigates back.
    expect(
      screen.getByRole("textbox", { name: /newsletter email/i })
    ).toHaveValue("");
  });

  it("blocks an empty submit and stores nothing", () => {
    render(<NewsletterFooterCta />);
    // requestSubmit runs constraint validation: a required empty email
    // means no navigation and no prefill.
    screen
      .getByRole("button", { name: "Subscribe" })
      .closest("form")!
      .requestSubmit();
    expect(sessionStorage.getItem("nl-prefill-email")).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });
});
