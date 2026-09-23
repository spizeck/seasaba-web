import "../globals.css";

/**
 * Operational root layout for /sentry-check (#129). Deliberately NOT the
 * marketing SiteShell: no header, footer, analytics, chat widget or
 * structured data. This is an English-only ops page outside both locale
 * subtrees — it gets no /nl variant and no hreflang alternates.
 */
export default function SentryCheckLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background px-6 py-10 text-foreground">{children}</body>
    </html>
  );
}
