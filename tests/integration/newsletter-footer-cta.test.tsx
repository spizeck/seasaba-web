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

  it.each(["/newsletter", "/nl/newsletter"])(
    "is hidden on %s so the page never shows two signup prompts",
    (path) => {
      mockPathname = path;
      const { container } = render(<NewsletterFooterCta />);
      expect(container).toBeEmptyDOMElement();
    }
  );

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
