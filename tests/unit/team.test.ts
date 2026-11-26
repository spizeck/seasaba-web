import { describe, expect, it } from "vitest";
import { DIVE_SITES } from "@/data/dive-site-videos";
import {
  PROFILE_MEMBERS,
  TEAM_MEMBERS,
  TEAM_MEMBER_BY_SLUG,
  teamMemberEntityId,
} from "@/data/team";

describe("canonical team roster", () => {
  it("keeps the active crew roster aligned with the approved staff list", () => {
    expect(TEAM_MEMBERS.map((member) => member.name)).toEqual([
      "Mel",
      "Otto",
      "Aaron",
      "Lenny",
      "Robins",
      "Lionel",
      "Anthony",
      "Julijana",
      "Jake Mulford",
      "Lilian Caro",
      "Gunner",
    ]);
  });

  it("removes former staff while adding Jake and Lilian", () => {
    const names = TEAM_MEMBERS.map((member) => member.name);
    expect(names).not.toContain("Jeanine & Marc");
    expect(names).not.toContain("Jeanine");
    expect(names).not.toContain("Marc");
    expect(names).toContain("Jake Mulford");
    expect(names).toContain("Lilian Caro");
  });

  it("uses unique profile slugs for every identifiable person", () => {
    const slugs = PROFILE_MEMBERS.map((member) => member.slug);
    expect(slugs.every(Boolean)).toBe(true);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(Object.keys(TEAM_MEMBER_BY_SLUG).sort()).toEqual([...slugs].sort());
  });

  it("gives every active human crew member a profile but excludes Gunner", () => {
    const crewProfiles = TEAM_MEMBERS.filter((member) => member.isPerson !== false);
    expect(crewProfiles.every((member) => Boolean(member.slug))).toBe(true);
    expect(PROFILE_MEMBERS.map((member) => member.name)).not.toContain("Gunner");
    expect(TEAM_MEMBER_BY_SLUG.gunner).toBeUndefined();
    expect(TEAM_MEMBER_BY_SLUG.constructor).toBeUndefined();
    expect(TEAM_MEMBER_BY_SLUG.toString).toBeUndefined();
  });

  it("uses stable profile-based Person entity identifiers", () => {
    const jake = TEAM_MEMBER_BY_SLUG["jake-mulford"];
    expect(jake).toBeDefined();
    expect(teamMemberEntityId(jake!)).toBe(
      "https://www.seasaba.com/about/jake-mulford#person"
    );
  });

  it("only links favorite dive sites that exist in the catalogue", () => {
    const diveSiteNames = new Set(DIVE_SITES.map((site) => site.name));
    for (const member of PROFILE_MEMBERS) {
      for (const favorite of member.favoriteDiveSites ?? []) {
        expect(diveSiteNames.has(favorite), `${member.name}: ${favorite}`).toBe(true);
      }
    }
  });
});
