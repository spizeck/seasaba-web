import { Breadcrumbs } from "@/components/breadcrumbs";
import { DIVE_SITES, diveSiteSlug } from "@/data/dive-site-videos";
import { PROFILE_MEMBERS, teamMemberDisplayName } from "@/data/team";

const BREADCRUMB_DIVE_SITES = DIVE_SITES.map((site) => ({
  slug: diveSiteSlug(site.name),
  label: site.name,
}));

const BREADCRUMB_TEAM_MEMBERS = PROFILE_MEMBERS.map((member) => ({
  slug: member.slug,
  label: teamMemberDisplayName(member),
}));

export default function ContentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-6 pt-4 sm:px-6 sm:pt-6 lg:px-8">
      <Breadcrumbs
        diveSites={BREADCRUMB_DIVE_SITES}
        teamMembers={BREADCRUMB_TEAM_MEMBERS}
      />
      <article className="prose prose-slate max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>p]:max-w-3xl">{children}</article>
    </div>
  );
}
