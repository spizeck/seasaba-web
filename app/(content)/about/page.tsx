import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "About",
  description:
    "Learn about Sea Saba — a professional scuba diving operation in Saba, Dutch Caribbean. Experienced guides, conservation-minded diving, and a commitment to safety.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        About Sea Saba
      </h1>

      <p className="mt-6 text-base leading-relaxed text-muted-foreground">
        Sea Saba is a professional scuba diving operation based on the island of
        Saba in the Dutch Caribbean. We specialize in guided dives, certifications,
        and underwater experiences on one of the Caribbean&apos;s most pristine and
        least-visited marine environments.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Our Approach
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        We believe in small groups, personal attention, and a deep respect for the
        marine environment. Every dive is led by experienced professionals who know
        Saba&apos;s waters intimately — from the dramatic pinnacles to the vibrant
        wall dives that make this island legendary among divers.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Conservation First
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Saba&apos;s marine park is one of the oldest in the Caribbean, and we take
        our role as stewards seriously. We follow strict environmental guidelines,
        support local conservation efforts, and educate every diver on responsible
        reef interaction.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">
        Why Saba?
      </h2>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Saba is a five-square-mile volcanic island with no beaches and no cruise
        ships — just world-class diving. The island&apos;s remote location and
        protected marine park mean healthy reefs, abundant marine life, and
        uncrowded dive sites. If you&apos;re looking for an authentic, unhurried
        diving experience, this is it.
      </p>
    </>
  );
}
