import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import JournalPage from "@/app/(en)/journal/page";
import JournalArticlePage, {
  generateMetadata,
  generateStaticParams,
} from "@/app/(en)/journal/[slug]/page";
import { GET as feedGET } from "@/app/(en)/journal/feed.xml/route";
import { JournalIndex } from "@/components/journal/journal-index";
import { JOURNAL_ARTICLES } from "@/data/journal";
import { articleUrl, listArticles } from "@/lib/journal";
import { SITE_URL } from "@/lib/constants";

// Breadcrumbs is a client component reading the current route; keep the real
// notFound() so invalid-slug paths still throw the genuine 404 error.
let mockPathname = "/journal";
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/navigation")>();
  return {
    ...actual,
    usePathname: () => mockPathname,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
    useSearchParams: () => new URLSearchParams(),
  };
});

const [latest] = listArticles();
const params = (slug: string) => Promise.resolve({ slug });

function jsonLdBlocks(container: HTMLElement): Record<string, unknown>[] {
  return Array.from(
    container.querySelectorAll('script[type="application/ld+json"]')
  ).map((s) => JSON.parse(s.textContent ?? "null"));
}

describe("journal index", () => {
  it("renders the section heading, intro, and RSS link", () => {
    render(<JournalPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Sea Saba Journal" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Subscribe via RSS" })
    ).toHaveAttribute("href", "/journal/feed.xml");
  });

  it("features the newest article as the lead story and cards for the rest", () => {
    render(<JournalPage />);
    const leadLink = screen.getByRole("link", { name: new RegExp(latest.title) });
    expect(leadLink).toHaveAttribute("href", `/journal/${latest.slug}`);
    expect(leadLink).toHaveTextContent("Latest story");

    // Every remaining article is a card linking to its route.
    for (const article of listArticles().slice(1)) {
      expect(
        screen.getByRole("link", { name: new RegExp(article.title) })
      ).toHaveAttribute("href", `/journal/${article.slug}`);
    }
  });

  it("renders an honest empty state when no articles exist", () => {
    render(<JournalIndex articles={[]} />);
    expect(
      screen.getByText("The Journal is just getting started")
    ).toBeInTheDocument();
    // Still a valid page: heading + breadcrumb remain.
    expect(
      screen.getByRole("heading", { level: 1, name: "Sea Saba Journal" })
    ).toBeInTheDocument();
  });

  it("shows breadcrumb trail Home / Journal", () => {
    mockPathname = "/journal";
    render(<JournalPage />);
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(nav).getByText("Journal")).toBeInTheDocument();
  });
});

describe("journal article route", () => {
  it("statically generates exactly the registry slugs", () => {
    const slugs = generateStaticParams().map((p) => p.slug).sort();
    expect(slugs).toEqual(JOURNAL_ARTICLES.map((a) => a.slug).sort());
  });

  it("renders headline hierarchy, byline, dates, and breadcrumbs", async () => {
    mockPathname = `/journal/${latest.slug}`;
    const { container } = render(
      await JournalArticlePage({ params: params(latest.slug) })
    );

    const articleEl = container.querySelector("article");
    expect(articleEl).toBeTruthy();

    // Exactly one h1, carrying the article title.
    const h1s = container.querySelectorAll("h1");
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(latest.title);

    // Category, byline, published date markup.
    expect(articleEl).toHaveTextContent(latest.category);
    expect(articleEl).toHaveTextContent(`By`);
    expect(
      container.querySelector(`time[datetime="${latest.publishedAt}"]`)
    ).toBeTruthy();
    if (latest.updatedAt) {
      expect(
        container.querySelector(`time[datetime="${latest.updatedAt}"]`)
      ).toBeTruthy();
    }

    // Breadcrumb: Home / Journal / <title>
    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(within(nav).getByRole("link", { name: "Journal" })).toHaveAttribute(
      "href",
      "/journal"
    );

    // Hero image with descriptive alt.
    expect(
      container.querySelector(`img[alt="${latest.hero.alt}"]`)
    ).toBeTruthy();
  });

  it("marks demo fixtures visibly so placeholder copy is never mistaken for publication", async () => {
    const demo = JOURNAL_ARTICLES.find((a) => a.demo)!;
    const { container } = render(
      await JournalArticlePage({ params: params(demo.slug) })
    );
    expect(container.textContent).toContain("Demonstration article");
  });

  it("renders related articles linking to real routes, never to itself", async () => {
    const { container } = render(
      await JournalArticlePage({ params: params(latest.slug) })
    );
    const related = screen.getByRole("region", {
      name: "More from the Journal",
    });
    const links = within(related).getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links.length).toBeLessThanOrEqual(3);
    for (const link of links) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^\/journal\/[a-z0-9-]+$/);
      expect(href).not.toBe(`/journal/${latest.slug}`);
    }
    // BreadcrumbList + Article JSON-LD both present.
    const types = jsonLdBlocks(container).map((b) => b["@type"]);
    expect(types).toContain("Article");
    expect(types).toContain("BreadcrumbList");
  });

  it("renders the contextual CTA when the article declares one", async () => {
    const withCta = JOURNAL_ARTICLES.find((a) => a.cta)!;
    render(await JournalArticlePage({ params: params(withCta.slug) }));
    expect(
      screen.getByRole("link", { name: withCta.cta!.label })
    ).toHaveAttribute("href", withCta.cta!.href);
  });

  it("resolves invalid slugs through the normal not-found path", async () => {
    await expect(
      JournalArticlePage({ params: params("no-such-article") })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
    await expect(
      generateMetadata({ params: params("no-such-article") })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });
});

describe("journal article metadata", () => {
  it("produces canonical, OG article, Twitter, and RSS metadata", async () => {
    const meta = await generateMetadata({ params: params(latest.slug) });
    expect(meta.title).toBe(`${latest.title} — Sea Saba Journal`);
    expect(meta.description).toBe(latest.description);
    expect(meta.alternates?.canonical).toBe(articleUrl(latest));
    // OpenGraph is a discriminated union; narrow to the article shape.
    const og = meta.openGraph as {
      type?: string;
      url?: string;
      article?: Record<string, unknown>;
      images?: { url: string; alt?: string }[];
    };
    expect(og.type).toBe("article");
    expect(og.url).toBe(articleUrl(latest));
    // Article OG tags + hero image.
    const article = og.article!;
    expect(article.publishedTime).toBe(latest.publishedAt);
    expect(article.modifiedTime).toBe(latest.updatedAt ?? latest.publishedAt);
    expect(article.section).toBe(latest.category);
    expect(article.authors).toEqual([latest.author.name]);
    const images = og.images!;
    expect(images[0].url).toBe(latest.hero.src);
    expect(images[0].alt).toBe(latest.hero.alt);
    expect(meta.twitter?.images).toEqual([latest.hero.src]);
    // RSS advertised via <link rel="alternate">.
    const types = meta.alternates?.types as Record<string, string>;
    expect(types["application/rss+xml"]).toBe(`${SITE_URL}/journal/feed.xml`);
    // Indexable.
    expect(meta.robots).toBeUndefined();
  });
});

describe("journal RSS route", () => {
  it("serves an RSS document for every published article", async () => {
    const response = feedGET();
    expect(response.headers.get("content-type")).toContain(
      "application/rss+xml"
    );
    const body = await response.text();
    expect(body).toContain("<rss version=\"2.0\"");
    expect(body).toContain("<title>Sea Saba Journal</title>");
    for (const article of listArticles()) {
      expect(body).toContain(articleUrl(article));
    }
  });
});
