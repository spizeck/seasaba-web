"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { FeatureImage } from "@/components/feature-image";

interface TeamMember {
  name: string;
  title: string;
  bio: string;
  image?: string;
  objectPosition?: string;
  funFact?: string;
  languages?: string[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Mel",
    title: "Guest Services Manager",
    bio: "A Saba resident for over 20 years, Mel is your go-to source for island tips, hidden gems, and neighboring island adventures. After spending 12 years with Sea Saba, she recently returned to the team and will likely be your first point of contact. When she's not helping guests plan their perfect trip, you'll probably find her hiking one of Saba's trails or dreaming up new ideas for the shop.",
    image: "/images/optimized/mel.webp",
    languages: ["English", "Dutch", "German"],
    objectPosition: "center 30%",
  },
  {
    name: "Jeanine & Marc",
    title: "Dive Operations Manager & Dive Instructors",
    bio: "Originally from the Netherlands, Jeanine and Marc arrived on Saba after years working in the Maldives. Jeanine is the organizational force behind Sea Saba, keeping everything running smoothly, while Marc is always chasing his next adventure. Whether underwater with a camera or on a snowboard, he rarely sits still. Together, they bring experience, laughter, and the welcoming atmosphere that keeps guests coming back.",    image: "/images/optimized/marc-and-jeanine.webp",
    languages: ["English", "Dutch", "German"],
  },
  {
    name: "Otto",
    title: "Head Boat Captain & Dive Instructor",
    bio: "Born and raised on Saba, Otto has been diving and running boats for decades. He doesn't have much of a filter, loves to laugh, and believes diving should always be an adventure. A passionate technical diver and fisherman, Otto is happiest when he's on the water, below it, or telling stories about both.",
    image: "/images/optimized/otto.webp",
    languages: ["English", "Spanish"],
    funFact: "Sea Saba's first Divemaster in 1985",
  },
  {
    name: "Aaron",
    title: "Senior Boat Captain & Dive Instructor",
    bio: "Originally from the United States, Aaron has spent more than 14 years with Sea Saba. A USCG 100-ton Master Captain and instructor, he's known for his calm professionalism and easygoing personality. Off the boat, you'll usually find him watching Texas football or spoiling his cats. His experience and sense of humor have made him a favorite with guests and crew alike.",
    languages: ["English"],
    image: "/images/optimized/aaron.webp",
  },
  {
    name: "Lenny",
    title: "Boat Captain & Divemaster",
    bio: "Originally from St. Vincent, Lenny earned every certification along the way, progressing from Open Water Diver to Divemaster with Sea Saba. A guest favorite and sunset cruise entertainer, he's known for his big smile, great sense of humor, and ability to make everyone feel like part of the family.",    image: "/images/optimized/lenny.webp",
    languages: ["English"],
    objectPosition: "center 100%",
    funFact: "Lenny is known as Captain Giggles.",
  },
  {
    name: "Robins",
    title: "Boat Captain & Divemaster",
    bio: "Originally from Haiti, Robins combines excellent boat handling with a passion for diving and a personality that keeps everyone smiling. Known for his humor, easygoing attitude, and love of dancing, he's happiest when he's on the water, underwater, or finding a reason to celebrate. Guests quickly discover that a day with Robins is never boring.",
    image: "/images/optimized/robins.webp",
    objectPosition: "center 100%",
    languages: ["English", "French", "Spanish", "Haitian Creole"],
  },
  {
    name: "Lynn",
    title: "Divemaster",
    bio: "Originally from Sint Maarten, Lynn brings warmth, positivity, and a love of culture and wellness to the Sea Saba family. She enjoys helping guests relax, embrace island life, and create unforgettable memories both above and below the water.",
    languages: ["English", "Dutch"],
    image: "/images/optimized/lynn.webp",
  },
  {
    name: "Lionel",
    title: "Dive Instructor",
    bio: "A Saban native, freelance instructor, and harbor master, Lionel simply can't stay away from the ocean. Whether he's leading REEF surveys, hunting lionfish, or sharing his love of Saba's reefs with guests, he's happiest in the water. If there's a chance to dive, chances are Lionel is already geared up.",
    languages: ["English"],
    image: "/images/optimized/lionel.webp",
    funFact: "Lionel is a professional smiler.",
  },
  {
    name: "Anthony",
    title: "Guest Transportation",
    bio: "Originally from Sint Maarten, Anthony is often the first friendly face guests meet on Saba. Loaded with island knowledge and always happy to share it, he loves introducing visitors to the people, history, and stories that make Saba special. A ride with Anthony is usually equal parts transportation and island tour.",
    image: "/images/optimized/anthony.webp",
    languages: ["English", "Spanish", "Dutch"],
    objectPosition: "center bottom",
  },
  {
    name: "Julijana",
    title: "Dive Instructor",
    bio: "Growing up in Cuba, Julijana developed a love for the ocean and adventure that eventually led her to technical diving. When she's not underwater, you'll likely find her practicing yoga or lost in a good book. Her calm energy and passion for exploration make every dive feel a little more special.",
    image: "/images/optimized/julijana.webp",
    languages: ["English", "Serbian", "Spanish"],
  },
    {
    name: "Gunner",
    title: "Dive Dog, American Vizsla",
    bio: "Gunner is Sea Saba's four-legged ambassador and chief food inspector. He loves meeting guests and making sure everyone feels welcome. From greeting divers at the dock to investigating unattended sandwiches, Gunner takes his responsibilities very seriously.",
    image: "/images/optimized/gunner-dive-dog.webp",
    languages: ["Woof"],
    funFact: "Do NOT leave food unattended in his presence.",
  },
];

function getCardsPerView(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

function TeamCard({ member }: { member: TeamMember }) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col h-full">
      {/* Photo */}
      <div className="relative aspect-[4/5] w-full flex-shrink-0 overflow-hidden">
        {member.image ? (
          <Image
            src={member.image}
            alt={`${member.name}, ${member.title} at Sea Saba`}
            fill
            className="object-cover"
            style={{ objectPosition: member.objectPosition ?? "center center" }}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-end justify-center pb-5">
            <div className="w-24 h-24 rounded-full bg-background border-4 border-card shadow-md flex items-center justify-center">
              <span className="text-2xl font-bold text-primary select-none">
                {initials}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div>
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {member.name}
          </h3>
          <p className="mt-0.5 text-xs font-medium text-primary uppercase tracking-wide">
            {member.title}
          </p>
        </div>

        {member.languages && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {member.languages.map((lang) => (
              <span
                key={lang}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/8 text-primary border border-primary/15"
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
          {member.bio}
        </p>

        {member.funFact && (
          <div className="mt-4 pt-3 border-t border-border/40 flex items-start gap-2">
            <Sparkles className="h-3.5 w-3.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground italic leading-relaxed">
              {member.funFact}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function TeamCarousel() {
  const [index, setIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const isDragging = useRef(false);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalGroups = Math.ceil(TEAM_MEMBERS.length / cardsPerView);

  useEffect(() => {
    const update = () => {
      const cpv = getCardsPerView();
      setCardsPerView(cpv);
      setIndex((prev) => {
        const maxGroup = Math.ceil(TEAM_MEMBERS.length / cpv) - 1;
        return Math.min(prev, maxGroup);
      });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goTo = useCallback(
    (target: number) => {
      setIndex((target % totalGroups + totalGroups) % totalGroups);
    },
    [totalGroups]
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // Autoplay
  useEffect(() => {
    if (isPaused || totalGroups <= 1) return;
    autoplayRef.current = setInterval(() => {
      setIndex((current) => (current + 1) % totalGroups);
    }, 5000);
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [isPaused, totalGroups]);

  const onPointerDown = (e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    isDragging.current = false;
    setIsPaused(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 5) isDragging.current = true;
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = dragStart.current - e.clientX;
    dragStart.current = null;
    setIsPaused(false);
    if (!isDragging.current) return;
    if (delta > 40) next();
    else if (delta < -40) prev();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      prev();
      setIsPaused(true);
    }
    if (e.key === "ArrowRight") {
      next();
      setIsPaused(true);
    }
  };

  const translateX = -(index * 100);

  return (
    <div className="space-y-5">
      <div className="relative">
        {/* Prev button */}
        <button
          onClick={() => {
            prev();
            setIsPaused(true);
          }}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-5 z-10 w-9 h-9 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground transition-all hover:text-foreground hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Previous team members"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Next button */}
        <button
          onClick={() => {
            next();
            setIsPaused(true);
          }}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-5 z-10 w-9 h-9 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground transition-all hover:text-foreground hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Next team members"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Track container */}
        <div
          className="overflow-hidden"
          role="region"
          aria-label="Team members carousel"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          tabIndex={0}
          style={{ cursor: isDragging.current ? "grabbing" : "grab" }}
        >
          <div
            ref={trackRef}
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(${translateX}%)` }}
            aria-live="polite"
          >
            {Array.from({ length: totalGroups }).map((_, groupIdx) => (
              <div
                key={groupIdx}
                className="w-full flex-shrink-0 grid gap-5"
                style={{
                  gridTemplateColumns: `repeat(${cardsPerView}, minmax(0, 1fr))`,
                }}
                aria-hidden={groupIdx !== index}
              >
                {TEAM_MEMBERS.slice(
                  groupIdx * cardsPerView,
                  groupIdx * cardsPerView + cardsPerView
                ).map((member) => (
                  <TeamCard key={member.name} member={member} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pagination dots */}
      {totalGroups > 1 && (
        <div
          className="flex justify-center gap-2 pt-1"
          role="tablist"
          aria-label="Carousel pages"
        >
          {Array.from({ length: totalGroups }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={`Go to page ${i + 1} of ${totalGroups}`}
              onClick={() => {
                goTo(i);
                setIsPaused(true);
              }}
              className={`rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-ring ${
                i === index
                  ? "w-5 h-2 bg-primary"
                  : "w-2 h-2 bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function OwnerFeature() {
  return (
    <FeatureImage
      src="/images/optimized/chad-and-katy-nuttall.webp"
      alt="Chad and Katy Nuttall, owners of Sea Saba, with their children Caleb and Skylar"
      centerText
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          Owners since 2021
        </p>
        <h3 className="mt-2 text-2xl font-bold text-foreground">
          Chad &amp; Katy
        </h3>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Chad and Katy moved to Saba with their children, Caleb and Skylar,
            in 2021 to continue the Sea Saba tradition. Together they oversee
            daily operations and are committed to preserving the relaxed,
            professional atmosphere that has made Sea Saba special since 1985.
          </p>
          <p>
            Sea Saba is a family business, and their goal is simple: help guests
            experience the best of Saba above and below the water.
          </p>
        </div>
      </div>
    </FeatureImage>
  );
}

export function TimelineItem({ year, title, description, isLast }: { year: string; title: string; description: string; isLast?: boolean }) {
  return (
    <div className="relative flex gap-6">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[19px] top-10 bottom-0 w-px bg-border" />
      )}
      
      {/* Year circle */}
      <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <span className="text-xs font-bold text-white">{year}</span>
      </div>
      
      {/* Content */}
      <div className="pb-8">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

