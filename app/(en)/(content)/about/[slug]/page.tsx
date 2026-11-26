import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Award,
  Briefcase,
  FileText,
  Languages,
  MapPin,
  Sparkles,
} from "lucide-react";
import { createMetadata } from "@/lib/metadata";
import { Button } from "@/components/ui/button";
import { JsonLd, personJsonLd } from "@/components/structured-data";
import { TrackedInternalButton } from "@/components/tracked-internal-button";
import { divingAnchors } from "@/lib/anchors";
import {
  DIVE_SITES,
  diveSitePath,
} from "@/data/dive-site-videos";
import {
  PROFILE_MEMBERS,
  TEAM_MEMBER_BY_SLUG,
  teamMemberBiography,
  teamMemberDisplayName,
  teamMemberProfilePath,
  teamMemberProfileUrl,
  type TeamMember,
} from "@/data/team";

export function generateStaticParams() {
  return PROFILE_MEMBERS.map((member) => ({ slug: member.slug }));
}

// Unknown people are genuine 404s; staff profiles are statically generated
// only when an approved canonical team record exists.
export const dynamicParams = false;

function metaDescription(text: string): string {
  if (text.length <= 160) return text;
  const cut = text.slice(0, 160);
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const member = TEAM_MEMBER_BY_SLUG[slug];
  if (!member) return {};
  const name = teamMemberDisplayName(member);
  return createMetadata({
    title: `${name}, ${member.title}`,
    description: metaDescription(member.bio),
    path: teamMemberProfilePath(member),
  });
}

function initials(member: TeamMember): string {
  return teamMemberDisplayName(member)
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
}

function ProfileSection({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Award;
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-lg border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-relaxed text-muted-foreground">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const member = TEAM_MEMBER_BY_SLUG[slug];
  if (!member) notFound();

  const name = teamMemberDisplayName(member);
  const biography = teamMemberBiography(member);
  const favoriteSites = (member.favoriteDiveSites ?? [])
    .map((siteName) => DIVE_SITES.find((site) => site.name === siteName))
    .filter((site) => site !== undefined);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          ...personJsonLd(member),
          mainEntityOfPage: teamMemberProfileUrl(member),
        }}
      />

      <div className="not-prose">
        <Link
          href="/about#meet-the-crew"
          className="inline-flex rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-ring"
        >
          ← Back to Meet the Crew
        </Link>

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-center">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border/50 bg-card">
            {member.image ? (
              <Image
                src={member.image}
                alt={`${name}, ${member.title} at Sea Saba`}
                fill
                priority
                className="object-cover"
                style={{ objectPosition: member.objectPosition ?? "center center" }}
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/30">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-card bg-background shadow-md">
                  <span className="text-3xl font-bold text-primary select-none">
                    {initials(member)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Sea Saba {member.isOwner ? "Owner" : "Team"}
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {name}
            </h1>
            <p className="mt-2 text-lg font-medium text-muted-foreground">
              {member.title}
            </p>

            {member.languages && member.languages.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Languages className="h-4 w-4 text-primary" />
                  Languages
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {member.languages.map((language) => (
                    <span
                      key={language}
                      className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {member.bio}
            </p>
          </div>
        </section>

        <section className="mt-12 max-w-3xl">
          <h2 className="text-xl font-semibold text-foreground">About {name}</h2>
          <div className="mt-4 space-y-4">
            {biography.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </section>

        {(member.qualifications?.length ||
          member.experience?.length ||
          member.interests?.length ||
          member.funFact) && (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {member.qualifications?.length ? (
              <ProfileSection
                icon={Award}
                title="Professional qualifications"
                items={member.qualifications}
              />
            ) : null}
            {member.experience?.length ? (
              <ProfileSection
                icon={Briefcase}
                title="Professional experience"
                items={member.experience}
              />
            ) : null}
            {member.interests?.length ? (
              <ProfileSection
                icon={Sparkles}
                title="Interests"
                items={member.interests}
              />
            ) : null}
            {member.funFact && (
              <section className="rounded-lg border border-border/60 bg-card p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <h2 className="text-base font-semibold text-foreground">Fun fact</h2>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {member.funFact}
                </p>
              </section>
            )}
          </div>
        )}

        {favoriteSites.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Favorite Saba dive sites
              </h2>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {favoriteSites.map((site) => (
                <Link
                  key={site.name}
                  href={diveSitePath(site.name)}
                  className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20 pressable focus-ring"
                >
                  {site.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {member.additionalImages?.length ? (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-foreground">More photos</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {member.additionalImages.map((image) => (
                <div
                  key={image.src}
                  className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border/40"
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover"
                    style={{ objectPosition: image.objectPosition ?? "center center" }}
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {member.relatedLinks?.length ? (
          <section className="mt-12">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">
                Articles and dive guides
              </h2>
            </div>
            <ul className="mt-4 space-y-3">
              {member.relatedLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="rounded-md text-sm font-medium text-primary underline-offset-4 hover:underline focus-ring"
                  >
                    {link.title}
                  </Link>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {link.relationship === "authored" ? "Written by" : "Reviewed by"} {name}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="mt-14 rounded-lg border border-border/40 bg-muted/20 p-8 text-center">
          <h2 className="text-xl font-semibold text-foreground">Dive with Sea Saba</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
            Experience professional, small-group diving with the people who know
            Saba&apos;s reefs, boats, and conditions best.
          </p>
          <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <TrackedInternalButton
              size="lg"
              className="text-base font-semibold"
              href="/book"
              eventName="book_now_click"
              buttonText="Book Diving"
              buttonLocation="team_profile_footer_cta"
            >
              Book Diving
            </TrackedInternalButton>
            <Button asChild variant="outline" size="lg" className="text-base font-semibold">
              <Link href={`/diving#${divingAnchors.options}`}>View Diving Options</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
