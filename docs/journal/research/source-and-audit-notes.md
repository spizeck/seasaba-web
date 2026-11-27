# Evergreen content source and audit notes

Research snapshot: 2026-11-26. These notes support unpublished owner-review drafts only.

## Repository and workflow audit

- `master` has no Journal routes or publishing workflow. `/journal` exists only in unmerged PR #247 (`feat/243-journal-foundation`), based on old commit `18c8613`.
- PR #247 uses typed TSX article modules, has six demo articles, and is explicitly marked "Not intended for merge yet." It has no owner-approved draft workflow.
- Because no merged or suitable draft workflow exists on `master`, this initiative uses individual Markdown review drafts under `docs/journal/drafts/`, as permitted by the assignment. They are documentation files, not public routes; they are absent from navigation, sitemap, robots, RSS, and production rendering.
- Master includes the ISR homepage hotfix from PR #318 (`e92a324`). This branch does not touch homepage or app code, so the hotfix and visual work in #313/#314 are unaffected.
- Existing high-value pages already cover many topics in summary form: `/plan-your-trip`, `/diving`, `/courses`, `/dive-sites`, individual dive-site pages, `/about`, staff biographies, and `/dive-log`. Drafts are written as deeper editorial resources linking back to those canonical pages rather than replacing them.
- Existing image library has 69 files under `public/images`, most in `public/images/optimized`. Some homepage captions identify photographers: Candice Landau for two diving/boat images and Chris Kurzatkowski for the Windwardside image. Most other approved site images lack machine-readable photographer attribution, so owner confirmation is required before adding credit lines.

## Canonical operational facts from repository

Source: `data/operations.ts` and `docs/OPERATIONS.md` unless noted.

- Sea Saba established in 1985 and operates from Fort Bay Harbor.
- Maximum recreational guided group ratio: 8 divers per guide.
- Complimentary 32% Nitrox for certified Nitrox divers.
- Conservation contributions: $3 per diver per dive Saba Marine Park fee plus $1 per diver per dive hyperbaric chamber contribution; presented as a combined $4 per dive. Snorkeling park fee: $3 per person.
- Classic 2-Tank Dive: taxi pickups begin 10:00 AM, boat departs 10:30 AM, returns approximately 3:00 PM; dives are slots 2 and 3.
- Advanced 2-Tank Dive: taxi pickups begin 8:30 AM, boat departs 9:00 AM, returns approximately 1:00 PM; dives are slots 1 and 2. Eligibility: AOW + 20 logged dives or OW + 50 logged dives. Nitrox required on first dive.
- Afternoon 1-Tank Dive: taxi pickups begin 12:30 PM, boat departs 1:00 PM, returns approximately 3:00 PM.
- Afternoon Snorkel Trip shares the afternoon boat schedule.
- Scuba Diver-certified guests may book Classic or Afternoon with no logged-dive minimum but require a private guide.
- Refresher guidance: recommended after more than 1 year out of the water, generally required past roughly 3 years, always subject to Sea Saba discretion. A private guide may be the better arrangement.
- Private guide recommended for families diving with children under 12; junior divers remain within certification limits.
- Taxi pickup times are when pickups begin, not guaranteed individual pickup times.
- Dive computers are required; rentals are available.
- Rental equipment includes BCD, regulator, wetsuit, mask, fins, and dive computer.
- Boats described on `/diving`: custom 38-foot Caribbean-built power catamarans, shaded seating, spacious decks, bow lounging, marine heads, camera tables, freshwater rinse tanks/hoses, large deep ladders, emergency oxygen, first aid, spare equipment, Save-a-Dive kits, filtered drinking water and Gatorade. Fin & Tonic has an upper observation deck.
- At the end of the final dive day, Sea Saba rinses, stores, and delivers guest equipment back to accommodation.
- Checkfront owns live availability and prices. The site intentionally shows no prices. Do not scrape or duplicate pricing as a separate canonical source.
- Dive-log boat names in public records: Fin & Tonic and Shark Bait dominate current records; Northern Sky appears less often. Owner confirmation needed before describing the current fleet or individual boat specifications beyond published copy.

## Staff and biography facts useful for authorship

Source: `data/team.ts`; public attribution still requires individual approval.

- Otto de Vries: Dive Instructor, Captain and Saba Diving Pioneer. Began diving in 1978, became Sea Saba's first employee in 1985 and Saba's first local dive instructor in 1988. Best potential reviewer for diving history and site development.
- Aaron Smith: Scuba Instructor and Captain. Certified instructor in 2009, joined Sea Saba in 2011, USCG 100-ton offshore captain and Lionfish Hunting Instructor. Best potential reviewer for local sites, operations, sharks/marine life and photography.
- Jake Mulford and Lilian Caro: Open Water Scuba Instructors. Potential reviewers for beginner and training content.
- Julijana Masic: Dive Professional with cave and sidemount interest. Not enough verified technical qualification for technical review; do not assign technical authority without owner confirmation.
- Chad Nuttall and Katy Nuttall: owners/management, appropriate reviewers for operations, travel logistics, business history and behind-the-scenes practices.
- Mel Marks: Guest Services Manager, 12 years under previous ownership, returned April 2026; useful reviewer for bookings, guest logistics and operations.
- Use Sea Saba as organizational author unless a named person explicitly approves authorship or review credit.

## Primary external sources collected

- Saba Tourism Getting Here: https://www.sabatourism.com/getting-here/ — Saba is 28 miles southwest of St. Maarten; 12-minute air connection or approximately 90-minute ferry; Winair has 4 daily flights; passports/visas; $10 cash airport/harbor departure tax; no ATMs at airport/harbor.
- Saba Tourism About Saba: https://www.sabatourism.com/about-saba/ — island size, villages, St. Maarten hub, special municipality status, village descriptions.
- Winair St. Maarten hub: https://www.winair.sx/info/sxm-hub-52 — Saba service daily, schedules subject to change.
- Winair SXM-Saba route: https://flights.winair.sx/en/flights-from-sint-maarten-to-saba — flight approximately 15 minutes, nonstop, DHC-6 Twin Otter, multiple daily flights, one of world's shortest commercial runways. November/December 2026 displayed one-way fares from $117 but date-specific fares vary widely.
- Winair baggage: https://www.winair.sx/info/cabin-luggage-1 and https://www.winair.sx/info/special-baggage-4 — allowances depend on fare; scuba equipment accepted as checked baggage subject to fees/space; tanks must be empty with valve removed.
- Winair fare families: https://www.winair.sx/fare-families — Saba/Eustatius first checked bag fees in Saver/Lite shown as $15 online/$25 airport, higher for additional/overweight/oversized bags; allowances depend on fare and date.
- Makana Ferry: https://makanaferryservice.com/ — current schedules and rates. Saba-St. Maarten adult round trip $134, one way $94.50 from Saba or $84.50 from St. Maarten in the displayed matrix; child rates lower. Schedule varies by day and some services marked suspended slow season. Rates include departure taxes, port fees and bunker surcharges per site note. One personal item, one carry-on and one checked bag included; additional/overweight bags $30 each; carry-on max 30 lb, checked max 50 lb.
- Saba C-Transport Makana: https://www.sabaferry.com/makana — 72-foot Sabre catamaran, maximum 150 passengers, 23 knots, Saba-St. Maarten 75 minutes, two air-conditioned decks and open sun deck. Passports/local ID required.
- Public Entity Saba PSO announcement: https://www.sabagov.nl/news/saba-st-eustatius-and-makana-ferry-sign-pso-to-strengthen-regional-connectivity — March 2026 PSO, revised fares effective April 15, 2026, example Saba-St. Maarten round trip reduced to $134.
- West Indies Helicopters: linked from Saba Tourism; use only general private-transfer claims unless current official details are checked.
- Saba Tourism hiking: https://www.sabatourism.com/hiking/ — 20 trails, Mount Scenery 887 m, cloud forest, trail preparation, $1 nature fee per night collected by hotel for trail upkeep.
- Saba Conservation Foundation plan your hike: https://sabapark.org/mount-scenery-national-park/plan-your-hike/ — trail conditions, guided hikes, closures.
- Saba National Marine Park: https://sabapark.org/saba-national-marine-park/ — established 1987; circles island from high-water mark to 60 m/200 ft including seabed and overlying waters; zoning plan; permanent mooring buoys prevent coral damage; revenue through visitor fees, souvenirs, donations; one of few self-sustaining marine parks.
- Saba Tourism diving: https://www.sabatourism.com/diving/ — shore diving prohibited due to steep coastal zone; all diving must be with licensed dive centers; marine park rules include no touching coral/wildlife, no removal, no feeding, no gloves except holding line at safety stop, no light sticks, photographers must adjust settings before framing and avoid reef contact.
- SCF nature management: https://sabapark.org/saba-national-marine-park/nature-management/ — restrictions on fishing/anchoring and diver education; over 150 species recorded; common pelagics include horse-eye jacks, barracuda, wahoo, tarpon and five shark species.
- Saba marine environment law: https://lokaleregelgeving.overheid.nl/CVDR36668 — official zoning and legal framework.
- DCNA shark research PDFs: nurse sharks and Caribbean reef sharks are common around Saba/Saba Bank; BRUV studies use scientific monitoring. Do not equate recreational sightings with population trends.
- DAN flying after diving: https://world.dan.org/health-medicine/health-resource/health-safety-guidelines/guidelines-for-flying-after-diving/ and https://dan.org/health-medicine/health-resource/smart-guides/know-before-you-go-how-to-plan-your-dive-trip/tips-for-health-and-safety/ — minimum 12 hours after a single no-decompression dive, 18 hours after multiple dives or multiple days, longer after decompression/heliox/trimix; ascent to altitude by ground transportation also increases decompression stress.
- DAN insurance: https://dan.org/membership-insurance/dive-insurance/ — dive accident insurance can cover eligible accident medical expenses, chamber treatment, emergency transportation and some travel disruption benefits; plan details vary.
- SDI Open Water standards: https://www.tdisdi.com/wp-content/uploads/files/sandp/currentYear/SDI/part%202/pdf/individual/SDI%20Diver%20Standards_07_Open_Water_Scuba_Diver.pdf — graduate may dive in similar conditions to 18 m/60 ft without direct instructor supervision; minimum age/junior rules; 4 open-water training dives.
- TDI Decompression Procedures: https://www.tdisdi.com/tdi/get-certified/decompression-procedures-diver/ — planned staged decompression to maximum 45 m/150 ft; prerequisites include advanced certification and 25 logged dives; advanced nitrox often foundation combination.
- Saba entry requirements: https://www.netherlandsworldwide.nl/caribbean-visa/visa-needed-caribbean — visa depends on nationality. Saba Tourism says valid passport required.
- Saba restaurants: https://www.sabatourism.com/places/category/restaurants/ — small but varied dining scene, seafood/Saba lobster; opening days vary.
- Saba villages: https://www.sabatourism.com/about-saba/ — The Bottom is capital, Windwardside main tourism village, St. John's and Zion's Hill/Hell's Gate.
- KNMI Caribbean Netherlands: https://www.knmi.nl/nederland-nu/weer/waarschuwingen-en-verwachtingen/caribisch-nederland — official weather warnings for Saba and St. Eustatius.
- Saba nature brochure: https://www.sabatourism.com/wp-content/uploads/2023/04/Saba-Brochure-Nature.pdf — average annual rainfall about 1,000 mm/40 in; dry season normally December-July; hurricane season July-November; elevation strongly affects temperature/rainfall/vegetation.
- Cottage Club rates: https://www.cottage-club.com/ — example published accommodation pricing: cottages starting $160 low season/$200 high season, penthouse $225 low/$300 high, plus 5% government tax and $1 nature fee per guest per night; date-sensitive and only one property.
- Lonely Planet cost guide: https://www.lonelyplanet.com/articles/first-time-guide-saba — secondary source, 2024: hotel room $129-235, cottage/villa $450-950 per night, coffee $3, sandwich $7.50, dinner for two $120, beer $3-5. Use cautiously as dated secondary information or omit in favor of owner-verified current ranges.

## Original dive-log data extract

Source: public production `/dive-log` RSC payload fetched 2026-11-26. Raw export intentionally omitted from git because it is a large generated snapshot; the method and aggregate results are documented here. Read-only. The page's existing `buildPublicDives` output already deduplicates multiple records describing one physical dive by date, slot, boat and site, merging per-species counts by maximum.

Dataset: 3,351 grouped physical dives, 2023-09-24 through 2026-11-25. 2023 and 2026 are partial years. Species counts are recorded sightings per dive, not unique animals or population estimates. Missing sightings, changing logging practices, training/shore/unknown records and data-entry errors limit interpretation. Site names include legacy/variant names and 302 blank/unknown/uncoded records, so site frequency percentages should use named-record denominators.

Temperature method: use valid readings 20-33°C only, consistent with `lib/dive-stats.ts`. Monthly means below use 2024-2026 records through November 2026; December lacks 2025-2026 complete-year comparability in the extract.

| Month | Mean water temp | Valid readings | Grouped dives |
| --- | ---: | ---: | ---: |
| Jan | 27.1°C / 81°F | 324 | 334 |
| Feb | 26.8°C / 80°F | 260 | 269 |
| Mar | 26.8°C / 80°F | 255 | 267 |
| Apr | 27.1°C / 81°F | 302 | 306 |
| May | 27.5°C / 82°F | 292 | 297 |
| Jun | 28.1°C / 83°F | 265 | 272 |
| Jul | 28.3°C / 83°F | 209 | 212 |
| Aug | 28.6°C / 84°F | 222 | 227 |
| Sep | 29.2°C / 85°F | 126 | 128 |
| Oct | 29.7°C / 85°F | 302 | 306 |
| Nov | 29.1°C / 84°F | 289 | 292 |
| Dec | 28.1°C / 83°F | 187 | 194 |

Complete-year summaries:

| Year | Grouped dives | Distinct site IDs | Mean valid temp | Valid temp readings |
| --- | ---: | ---: | ---: | ---: |
| 2024 | 972 | 37 | 28.0°C | 965 |
| 2025 | 1006 | 39 | 27.8°C | 988 |
| 2026 through Nov 25 | 1126 | 39 | 28.1°C | 1080 |

Most frequent named sites, all extracted records, denominator 3,049 dives with usable names: Hot Springs 343 (11.2%), Tent Shallow 243 (8.0%), Babylon 202 (6.6%), Customs House 175 (5.7%), Diamond Rock 169 (5.5%), Tent Reef 150 (4.9%), Third Encounter 147 (4.8%), Man O'War Shoals 134 (4.4%), Tent Boulders 120 (3.9%), Hole in the Corner 115 (3.8%).

All-extract species indicators:

| Category | Recorded sightings | Dives with at least one recorded sighting | Share of 3,351 dives |
| --- | ---: | ---: | ---: |
| Turtles (green + hawksbill) | 9,300 | 2,207 | 65.9% |
| Sharks (nurse + Caribbean reef + blacktip reef) | 5,564 | 2,289 | 68.3% |
| Atlantic Nurse Shark | 3,103 | 1,600 | 47.7% |
| Caribbean Reef Shark | 2,386 | 1,420 | 42.4% |
| Green Turtle | 8,474 | 2,107 | 62.9% |
| Hawksbill Turtle | 826 | 564 | 16.8% |

Complete-year shark/turtle context:

| Year | Turtle sightings / dives with turtles | Shark sightings / dives with sharks |
| --- | --- | --- |
| 2024 | 2,537 / 629 of 972 (64.7%) | 1,358 / 642 of 972 (66.0%) |
| 2025 | 2,866 / 619 of 1006 (61.5%) | 1,374 / 625 of 1006 (62.1%) |

Site-specific patterns worth editorial caution, all extracted records, sites with at least 30 dives:

- Highest turtle encounter-rate examples: 50/50 95.2% of 83 dives, Diamond Rock 91.7% of 169, Man O'War Shoals 91.0% of 134, Customs House 87.4% of 175, Hot Springs 86.0% of 343.
- Lowest turtle encounter-rate examples: Outer Limits 2.6% of 39, Twilight Zone 7.3% of 110, Third Encounter 8.8% of 147. This supports the editorial distinction between shallow/turtle sites and deep pinnacle/pelagic sites, but not causal claims.
- Highest shark encounter-rate examples: 50/50 92.8% of 83, Babylon 90.6% of 202, Ladder Bay Drift 90.2% of 82, Third Encounter 87.1% of 147, Ladder Labyrinth 84.3% of 70, Hot Springs 81.6% of 343.
- Shark Shoals itself was 56.2% of 48 records, illustrating why a site name is not a promise and why honest copy must avoid guarantees.
- These are sightings recorded during recreational dives, not unique animals, scientific transects, or population trends. High percentages may reflect both true local abundance and inconsistent recording behavior.

## Content overlap and consolidation decisions

1. `How to Get to Saba` expands the transportation section of `/plan-your-trip`; keep `/plan-your-trip` as canonical overview and position the article as a detailed arrival/logistics guide.
2. `What to Expect on a Diving Day` overlaps `/diving` “A Day with Sea Saba.” Keep `/diving` as product/commercial overview; the article should be a chronological guest experience. Before publication, consider linking the diving-page section to the article rather than repeating every detail.
3. `Where to Stay`, `What to Pack`, `Best Time`, and `Non-Diving Partner` expand concise sections of `/plan-your-trip` rather than duplicating them.
4. `A First-Time Diver's Guide to Saba` and `Is Saba Suitable for Beginner Divers?` are consolidated into one article because both answer the same search intent. Recommended title: `Is Saba Suitable for Beginner Divers? A First-Time Guide`.
5. `Technical Diving in Saba` overlaps the technical section of `/diving`; article should focus on expedition planning, prerequisites, equipment ownership and advance coordination, leaving commercial summary on `/diving`.
6. `How the Saba National Marine Park Protects Our Reefs` expands but must not replace the marine-park summary on `/diving`; it should explain the park's history, zoning, moorings and rules with authoritative links.
7. Batch C articles cannot be fully factual without owner input. Drafts use only already approved public facts and explicitly mark operational gaps. Do not publish until owner supplies or confirms details.
