import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Shared 404 body used by each locale subtree's not-found boundary. */
export function NotFoundContent() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold tracking-tight text-primary">404</h1>
      <p className="mt-4 text-xl font-semibold text-foreground">
        Page not found
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact Us</Link>
        </Button>
      </div>
      <nav aria-label="Popular pages" className="mt-8">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Popular pages
        </p>
        <ul className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
          <li>
            <Link href="/diving" className="font-medium text-primary underline-offset-2 hover:underline">
              Diving
            </Link>
          </li>
          <li>
            <Link href="/dive-sites" className="font-medium text-primary underline-offset-2 hover:underline">
              Dive Sites
            </Link>
          </li>
          <li>
            <Link href="/plan-your-trip" className="font-medium text-primary underline-offset-2 hover:underline">
              Plan Your Trip
            </Link>
          </li>
          <li>
            <Link href="/book" className="font-medium text-primary underline-offset-2 hover:underline">
              Book a Dive
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
