import { createMetadata } from "@/lib/metadata";
import Link from "next/link";
import Script from "next/script";
import { CookieSettingsButton } from "@/components/cookie-settings-button";

export const metadata = createMetadata({
  title: "Cookie Policy",
  description:
    "Sea Saba cookie policy. Learn what cookies our website uses, how to control them, and how to change your consent preferences.",
  path: "/cookie-policy",
});

const cookiebotCbid = process.env.NEXT_PUBLIC_COOKIEBOT_CBID;

export default function CookiePolicyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Cookie Policy
      </h1>

      <p className="mt-4 text-base font-medium text-foreground">
        This page explains what cookies Sea Saba uses, why we use them, and how you can control
        your preferences at any time.
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: {new Date().getFullYear()}
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-foreground">What Are Cookies?</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Cookies are small text files placed on your device when you visit a website. They
            help the site function correctly, remember your preferences, and let us understand
            how visitors use the site so we can improve it.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Cookie Categories</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We use Cookiebot, an independent consent management platform, to categorize cookies
            and only activate non-essential cookies after you give consent. The categories are:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Necessary</strong> — required for the website
              and booking process to function. These cannot be switched off.
            </li>
            <li>
              <strong className="text-foreground">Preferences</strong> — remember choices you
              make, such as language or display settings.
            </li>
            <li>
              <strong className="text-foreground">Statistics</strong> — help us understand how
              visitors use the site (for example, Google Analytics and Microsoft Clarity).
            </li>
            <li>
              <strong className="text-foreground">Marketing</strong> — used to measure and
              improve advertising effectiveness (for example, Google Ads, Microsoft Advertising,
              and Meta).
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Cookie Declaration</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            The list below is generated automatically by Cookiebot and reflects the cookies
            actually detected on this domain.
          </p>
          <div className="mt-4 rounded-lg border border-border/40 p-4">
            {cookiebotCbid ? (
              <Script
                id="CookieDeclaration"
                src={`https://consent.cookiebot.com/${cookiebotCbid}/cd.js`}
                strategy="afterInteractive"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Cookie declaration is unavailable because{" "}
                <code className="rounded bg-muted px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_COOKIEBOT_CBID
                </code>{" "}
                has not been configured yet.
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Managing Your Preferences</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You can change or withdraw your consent at any time using the button below, or via the
            &ldquo;Cookie Settings&rdquo; link in the site footer.
          </p>
          <div className="mt-4">
            <CookieSettingsButton />
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Related Policies</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            For more information on how we handle personal information generally, see our{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </>
  );
}
