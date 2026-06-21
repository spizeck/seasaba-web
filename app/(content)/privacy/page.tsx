import { createMetadata } from "@/lib/metadata";

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
        Last updated: June 2026
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
            <li>Phone number</li>
            <li>WhatsApp number</li>
            <li>Travel dates and booking details</li>
            <li>Certification level and dive experience</li>
            <li>Messages and inquiries submitted through forms</li>
            <li>Information required to process reservations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We use your information to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Respond to inquiries</li>
            <li>Process bookings and reservations</li>
            <li>Communicate regarding dive trips, courses, and charters</li>
            <li>Provide customer support</li>
            <li>Improve our website and services</li>
            <li>Meet legal and safety requirements</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            We do not sell your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Booking Systems and Third Parties</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Sea Saba uses trusted third-party services including:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Checkfront (reservations)</li>
            <li>Respond.io (WhatsApp communication)</li>
            <li>Email providers</li>
            <li>Google Analytics (website performance and traffic statistics)</li>
            <li>Social media platforms such as Facebook and Instagram</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            These services may collect information according to their own privacy policies.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-foreground">Cookies and Analytics</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Our website may use cookies and analytics tools to understand website traffic and improve the visitor experience.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            These tools may collect:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Pages visited</li>
            <li>Device information</li>
            <li>Browser type</li>
            <li>Approximate location</li>
            <li>Referring websites</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This information is used only for analytics and website improvements.
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
            You may request to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted-foreground">
            <li>Access the information we have about you</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of personal information where legally permitted</li>
          </ul>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Requests may be made by contacting us directly.
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
              <a
                href="mailto:info@seasaba.com"
                className="text-primary transition-colors hover:text-primary/80"
              >
                info@seasaba.com
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
