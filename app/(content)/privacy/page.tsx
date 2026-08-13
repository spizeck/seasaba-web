import { createMetadata } from "@/lib/metadata";
import { TrackedContactLink } from "@/components/tracked-contact-link";
import Link from "next/link";

export const metadata = createMetadata({
  title: "Privacy Policy",
  description:
    "Sea Saba privacy policy. Learn how we collect, use, and protect your personal information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Privacy Policy
      </h1>

      <p className="mt-4 text-base font-medium text-foreground">
        Sea Saba respects your privacy and is committed to protecting your personal information.
      </p>

      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: August 2026
      </p>

      <div className="mt-10 space-y-10">
        <section>
          <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            When you contact Sea Saba, make a reservation, or use our website, we may collect:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone and WhatsApp number</li>
            <li>Travel dates and booking details</li>
            <li>Certification level and dive experience</li>
            <li>Information submitted through reservation forms</li>
            <li>Information submitted through liability waivers or medical questionnaires, when applicable</li>
            <li>Messages and inquiries</li>
            <li>Payment and transaction information necessary to process reservations</li>
            <li>Website and device information collected through cookies, analytics, and similar technologies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We use your information to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Respond to inquiries</li>
            <li>Create and manage reservations</li>
            <li>Process payments</li>
            <li>Communicate about trips, courses, charters, schedule changes, and reservations</li>
            <li>Provide customer service</li>
            <li>Meet safety, certification, waiver, and operational requirements</li>
            <li>Meet legal and accounting obligations</li>
            <li>Improve our website</li>
            <li>Perform analytics</li>
            <li>Measure and attribute advertising, subject to cookie consent where applicable</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sea Saba does not sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Booking Systems and Third Parties</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sea Saba uses third-party service providers to help operate the business. Depending on
            how you interact with us, these may include:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Rezdy (reservations and booking management)</li>
            <li>Payment processors used in connection with reservations</li>
            <li>Respond.io (customer and WhatsApp communication)</li>
            <li>Email providers</li>
            <li>Analytics providers</li>
            <li>Advertising and measurement platforms</li>
            <li>Cookie and consent-management providers</li>
            <li>Social media platforms</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Information necessary to complete and manage a booking may be processed by Rezdy and
            applicable payment providers under their own privacy policies and legal obligations.
            These and other third-party services may collect information according to their own
            privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Cookies and Analytics</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Depending on the consent choices you make, our website may use cookies and similar
            technologies to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Operate the website</li>
            <li>Measure traffic and usage</li>
            <li>Improve the website</li>
            <li>Measure advertising effectiveness</li>
            <li>Attribute visits, inquiries, and bookings to advertising campaigns</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Depending on the technology and your consent choices, information collected may include:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Pages visited</li>
            <li>Device and browser information</li>
            <li>Approximate location</li>
            <li>Referring websites</li>
            <li>Website interactions</li>
            <li>Advertising and campaign attribution information</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            For a full list of cookies used on this site, the categories they belong to, and how
            to change your consent preferences, see our{" "}
            <Link href="/cookie-policy" className="underline hover:text-foreground">
              Cookie Policy
            </Link>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Email and WhatsApp Communication</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            If you contact Sea Saba through email, WhatsApp, or website forms, we may retain those communications to provide customer service and assist with future inquiries.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Marketing Communications</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sea Saba does not send marketing emails without permission.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            You may contact us at any time to request that we stop future communications.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We take reasonable steps to protect your information. However, no online transmission or storage system can guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Third-Party Links</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Our website may contain links to external websites. Sea Saba is not responsible for the privacy practices or content of those sites.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Children&apos;s Privacy</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sea Saba does not knowingly collect personal information from children without parental consent.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Subject to applicable law, you may request:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Access to your personal information</li>
            <li>Correction of inaccurate information</li>
            <li>Deletion of personal information where legally permitted</li>
            <li>Restriction of, or objection to, certain processing where applicable</li>
            <li>Withdrawal of marketing consent</li>
            <li>Information about how your personal data is used</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Requests may be made by contacting us directly at{" "}
            <TrackedContactLink
              href="mailto:info@seasaba.com"
              eventName="email_click"
              buttonText="Email"
              className="text-primary transition-colors hover:text-primary/80"
            >
              info@seasaba.com
            </TrackedContactLink>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Contact Information</h2>
          <div className="mt-3 text-sm leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">Sea Saba Dive Center</p>
            <p>66 Fort Bay Harbor</p>
            <p>The Bottom, Saba</p>
            <p>Caribbean Netherlands</p>
            <p className="mt-3">Phone / WhatsApp: +599 416 2246</p>
            <p>
              Email:{" "}
              <TrackedContactLink
                href="mailto:info@seasaba.com"
                eventName="email_click"
                buttonText="Email"
                className="text-primary transition-colors hover:text-primary/80"
              >
                info@seasaba.com
              </TrackedContactLink>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
