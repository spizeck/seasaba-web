"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface TeamMember {
  name: string;
  title: string;
  bio: string;
  image?: string;
  funFact?: string;
  languages?: string[];
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Chad & Katy",
    title: "Owners",
    bio: "Chad and Katy moved from the United States to Saba in 2021 with their children, Caleb and Skylar, to continue the Sea Saba tradition. Together they oversee daily operations and are committed to preserving the relaxed, professional atmosphere that has made Sea Saba special since 1985.",
    funFact: "Sea Saba is truly a family business.",
  },
  {
    name: "Mel",
    title: "Guest Services Manager",
    bio: "Originally from Germany and the Netherlands, Mel helps guests with reservations, questions, and trip planning. She keeps everything organized behind the scenes and is often the first point of contact for visitors.",
    languages: ["English", "Dutch", "German"],
  },
  {
    name: "Jeanine & Marc",
    title: "Dive Operations Manager & Dive Instructors",
    bio: "Originally from the Netherlands, Jeanine and Marc help coordinate daily diving operations while teaching and guiding guests. Their experience and enthusiasm help keep everything running smoothly both in the shop and on the boats.",
    languages: ["English", "Dutch"],
  },
  {
    name: "Otto",
    title: "Head Boat Captain & Dive Instructor",
    bio: "Born and raised on Saba, Otto has spent decades on the water and brings unmatched local knowledge to every trip. His calm personality and experience make him one of the island's most respected captains.",
    funFact: "More than 40 years operating boats around Saba.",
  },
  {
    name: "Aaron",
    title: "Senior Boat Captain & Dive Instructor",
    bio: "Originally from the United States, Aaron is a USCG 150-ton Master Captain and experienced instructor. He combines professionalism with a relaxed approach that guests appreciate.",
  },
  {
    name: "Lenny",
    title: "Boat Captain & Divemaster",
    bio: "Originally from St. Vincent, Lenny brings years of boating experience and is known for his friendly attitude and attention to guests. He has become a favorite among returning divers.",
  },
  {
    name: "Robins",
    title: "Boat Captain & Divemaster",
    bio: "Originally from Haiti, Robins combines excellent boat handling with a passion for diving. Guests appreciate his humor and easygoing personality.",
    languages: ["English", "French"],
  },
  {
    name: "Lynn",
    title: "Divemaster",
    bio: "Originally from Sint Maarten, Lynn assists with guiding and daily operations. Her enthusiasm and welcoming personality help guests feel at home.",
  },
  {
    name: "Lionel",
    title: "Dive Instructor",
    bio: "A Saban native, Lionel shares his knowledge of the island and its marine life with guests while helping create safe and enjoyable diving experiences.",
  },
  {
    name: "Anthony",
    title: "Guest Transportation",
    bio: "Originally from Sint Maarten, Anthony provides transportation for Sea Saba guests around the island. His warm personality and local stories are often guests' first introduction to Saba.",
  },
  {
    name: "Gunner",
    title: "Dock Dog — American Vizsla",
    bio: "Gunner is Sea Saba's four-legged ambassador and favorite dock greeter. He enjoys boat rides, meeting guests, and making sure everyone feels welcome.",
    funFact: "Always available for pets and photos.",
  },
  {
    name: "Julijana",
    title: "Dive Instructor",
    bio: "Originally from Serbia, Julijana brings international experience and a passion for teaching. She enjoys introducing divers to Saba's world-famous pinnacles and reefs.",
    languages: ["English", "Serbian"],
  },
];

export function TeamCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative">
      {/* Desktop Navigation */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-card shadow-lg border border-border flex items-center justify-center transition-opacity ${
          canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-white dark:bg-card shadow-lg border border-border flex items-center justify-center transition-opacity ${
          canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {TEAM_MEMBERS.map((member) => (
          <div
            key={member.name}
            className="flex-shrink-0 w-80 snap-start"
          >
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden h-full flex flex-col">
              {/* Photo or Placeholder */}
              <div className="relative h-64 bg-gradient-to-br from-primary/10 to-primary/5">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={`Photo of ${member.name}, ${member.title} at Sea Saba`}
                    fill
                    className="object-cover"
                    sizes="320px"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-28 h-28 rounded-full bg-muted border-4 border-white dark:border-card shadow-lg flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary">
                        {member.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm font-medium text-primary">{member.title}</p>
                {member.languages && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {member.languages.map((lang) => (
                      <span
                        key={lang}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary/10 text-primary"
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
                  <div className="mt-4 pt-3 border-t border-border/40">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground italic">
                        {member.funFact}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
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

