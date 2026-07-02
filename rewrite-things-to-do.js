import { readFileSync, writeFileSync } from 'fs';

const filePath = 'c:/Users/chadn/CodingProjects/seasaba-web/app/(content)/plan-your-trip/page.tsx';
let content = readFileSync(filePath, 'utf-8');

const sectionRegex = /      \{\/\* Things to Do on Saba \*\/\}\r?\n      <section id=\{planYourTripAnchors\.experiences\} className="mt-12 scroll-mt-24">[\s\S]*?      <\/section>/;

const newSection = `      {/* Things to Do on Saba */}
      <section id={planYourTripAnchors.experiences} className="mt-12 scroll-mt-24">
        <div className="flex items-center gap-3">
          <Compass className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold text-foreground">Things to Do on Saba</h2>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Saba offers far more than world-class diving. Spend a day hiking through cloud forests, exploring local art galleries, snorkeling crystal-clear waters, enjoying a sunset cruise, or discovering one of the Caribbean&apos;s most unique island communities.
        </p>

        <div className="mt-8 flex flex-col gap-16 lg:gap-20">
          <FeatureImage
            src="/images/optimized/saba-sunset-cruise.webp"
            alt="Guests watching the sunset from the deck of a Sea Saba boat off Saba's coast"
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Sunset Cruise</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Sea Saba runs private sunset cruises along the island&apos;s rugged coastline. Watch the sun drop behind Saba, enjoy drinks on deck, and see the island from the water.
              </p>
              <Button asChild className="mt-4">
                <Link href="/contact?interest=sunset-cruise">Book a Sunset Cruise &rarr;</Link>
              </Button>
            </div>
          </FeatureImage>

          <FeatureImage
            src="/images/optimized/saba-hiking-signs.webp"
            alt="Trail signs marking hiking routes across Saba's rainforest and cloud forest"
            imageRight
            centerText
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">Hiking on Saba</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Saba&apos;s award-winning trail network winds through dry coastal hillsides, lush rainforest, and misty cloud forests near the summit of Mount Scenery. Free trail maps are available.
              </p>
            </div>
          </FeatureImage>

          <div>
            <h3 className="text-lg font-semibold text-foreground">Arts &amp; Crafts</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Saba has a long tradition of handmade work, from delicate Saba lace to glass-melting demonstrations and local art studios. Visitors can watch artisans at work and take home a piece of the island.
            </p>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <ImageCard
                src="/images/optimized/saba-indigo-arts.webp"
                alt="Indigo dye and textile work on Saba"
                heading="Indigo &amp; Textiles"
                body="Traditional dyeing and textile work reflect the island's creative heritage. Watch artisans at work and find a unique piece to take home."
              />
              <ImageCard
                src="/images/optimized/saba-paint-arts.webp"
                alt="Paint and artwork from a Saba artist's studio"
                heading="Local Art &amp; Painting"
                body="Local studios and galleries showcase paintings, glasswork, and crafts inspired by Saba's landscapes and marine life."
              />
            </div>
          </div>

          {/* Snorkeling & Sea & Learn */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">Snorkeling</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Saba&apos;s shallow reefs are excellent for snorkeling. The afternoon snorkel trip runs alongside the dive boats, so snorkelers stay at the surface while divers go deeper. No certification required.
              </p>
            </div>
            <div className="rounded-lg border border-border/40 bg-muted/20 p-4">
              <h3 className="text-sm font-semibold text-foreground">Sea &amp; Learn</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Each October, visiting scientists lead a week of free programs on marine biology, coral ecology, and island conservation. Sea &amp; Learn is a unique event in the Caribbean.
              </p>
            </div>
          </div>
        </div>
      </section>`;

if (!sectionRegex.test(content)) {
  console.error('Things to Do section not found');
  process.exit(1);
}

content = content.replace(sectionRegex, newSection);
writeFileSync(filePath, content);
console.log('Things to Do section rewritten successfully.');
