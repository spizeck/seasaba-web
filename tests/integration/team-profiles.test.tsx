import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TeamMemberPage, {
  generateMetadata,
  generateStaticParams,
} from "@/app/(en)/(content)/about/[slug]/page";
import { PROFILE_MEMBERS } from "@/data/team";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

function jsonLdBlocks(container: HTMLElement): Record<string, unknown>[] {
  return Array.from(
    container.querySelectorAll('script[type="application/ld+json"]')
  ).map((script) => JSON.parse(script.textContent ?? "null"));
}

describe("team profile static generation", () => {
  it("generates exactly the canonical staff profile routes", () => {
    const params = generateStaticParams();
    expect(params).toHaveLength(PROFILE_MEMBERS.length);
    expect(params.map((entry) => entry.slug)).toEqual(
      PROFILE_MEMBERS.map((member) => member.slug)
    );
    expect(params.map((entry) => entry.slug)).toContain("jake-mulford");
    expect(params.map((entry) => entry.slug)).toContain("lilian-caro");
    expect(params.map((entry) => entry.slug)).not.toContain("gunner");
    expect(params.map((entry) => entry.slug)).not.toContain("jeanine-marc");
  });

  it("creates unique canonical metadata for Jake", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "jake-mulford" }),
    });
    expect(metadata.title).toBe("Jake Mulford, Scuba Instructor");
    expect(metadata.description).toContain("Born in South Florida");
    expect(metadata.alternates?.canonical).toBe(
      "https://www.seasaba.com/about/jake-mulford"
    );
    expect(metadata.openGraph).toMatchObject({
      title: "Jake Mulford, Scuba Instructor",
      url: "https://www.seasaba.com/about/jake-mulford",
    });
  });

  it("unknown profile slugs use notFound", async () => {
    await expect(
      TeamMemberPage({ params: Promise.resolve({ slug: "not-a-team-member" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});

describe("team profile pages", () => {
  it("renders Jake's approved biography, qualifications, and accurate Person schema", async () => {
    const ui = await TeamMemberPage({
      params: Promise.resolve({ slug: "jake-mulford" }),
    });
    const { container } = render(ui);

    expect(screen.getByRole("heading", { level: 1, name: "Jake Mulford" })).toBeInTheDocument();
    expect(screen.getByText("Scuba Instructor")).toBeInTheDocument();
    expect(screen.getByText(/cool mountain rivers of North Carolina/)).toBeInTheDocument();
    expect(screen.getByText(/Python script to organize and edit/)).toBeInTheDocument();
    expect(screen.getByText("Open Water Scuba Instructor")).toBeInTheDocument();
    expect(screen.queryByText("Favorite Saba dive sites")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Back to Meet the Crew/ })).toHaveAttribute(
      "href",
      "/about#meet-the-crew"
    );

    const [person] = jsonLdBlocks(container);
    expect(person).toMatchObject({
      "@type": "Person",
      "@id": "https://www.seasaba.com/about/jake-mulford#person",
      name: "Jake Mulford",
      jobTitle: "Scuba Instructor",
      url: "https://www.seasaba.com/about/jake-mulford",
      mainEntityOfPage: "https://www.seasaba.com/about/jake-mulford",
    });
    expect(person.worksFor).toEqual({
      "@id": "https://www.seasaba.com/#business",
    });
  });

  it("renders Lilian's approved biography and languages", async () => {
    const ui = await TeamMemberPage({
      params: Promise.resolve({ slug: "lilian-caro" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { level: 1, name: "Lilian Caro" })).toBeInTheDocument();
    expect(screen.getByText(/teaching law and sharing her passion/)).toBeInTheDocument();
    expect(screen.getByText(/tears of pure happiness/)).toBeInTheDocument();
    expect(screen.getByText("Spanish")).toBeInTheDocument();
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(screen.getByText("A little Portuñol")).toBeInTheDocument();
  });

  it("does not repeat the short biography when no extended biography exists", async () => {
    const ui = await TeamMemberPage({
      params: Promise.resolve({ slug: "mel" }),
    });
    render(ui);

    expect(screen.getAllByText(/A Saba resident for over 20 years/)).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "About Mel" })).not.toBeInTheDocument();
    expect(screen.getByText("Saba resident for over 20 years")).toBeInTheDocument();
  });

  it("does not repeat owner introduction text in the extended biography", async () => {
    const ui = await TeamMemberPage({
      params: Promise.resolve({ slug: "chad-nuttall" }),
    });
    render(ui);

    expect(screen.getAllByText(/moved to Saba with Katy/)).toHaveLength(1);
    expect(screen.getByText(/oversee daily operations/)).toBeInTheDocument();
  });

  it("uses verified full names and portrait photography for established crew", async () => {
    const ui = await TeamMemberPage({
      params: Promise.resolve({ slug: "otto-de-vries" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { level: 1, name: "Otto de Vries" })).toBeInTheDocument();
    expect(screen.getByAltText("Otto de Vries, Head Boat Captain & Dive Instructor at Sea Saba")).toBeInTheDocument();
    expect(screen.getByText("Sea Saba's first Divemaster in 1985")).toBeInTheDocument();
  });
});
