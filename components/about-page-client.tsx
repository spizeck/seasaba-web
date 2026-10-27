"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { FeatureImage } from "@/components/feature-image";
import { OPERATIONS } from "@/data/operations";

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

export function TeamCarousel({ members = TEAM_MEMBERS }: { members?: TeamMember[] }) {
  const [index, setIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [instant, setInstant] = useState(false);
  // Pixel offset applied to the track while a pointer drag is in progress;
  // null at rest, when the transform is expressed purely in percentages.
  const [dragDelta, setDragDelta] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    startX: number;
    startDelta: number;
    delta: number;
    stepPx: number;
  } | null>(null);
  // Synchronous mirror of index for event handlers, which may fire before a
  // queued re-render commits (e.g. transitionend during rapid clicks).
  const indexRef = useRef(index);

  const memberCount = members.length;
  const logicalIndex = ((index % memberCount) + memberCount) % memberCount;
  // Valid index positions keep every visible slide inside the rendered strip:
  // the viewport covers slides [index + n, index + n + cardsPerView) ⊆ [0, 3n).
  const maxIndex = memberCount * 2 - cardsPerView;
  const clampIndex = useCallback(
    (i: number) => Math.min(Math.max(i, -memberCount), maxIndex),
    [memberCount, maxIndex]
  );

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  useEffect(() => {
    const update = () => {
      setCardsPerView(getCardsPerView());
      // A resize recomputes every slide width and can shrink the valid index
      // range; normalize without animating so a resize mid-wrap cannot leave
      // the index pointing at space past the rendered clones.
      setInstant(true);
      setIndex((i) => ((i % memberCount) + memberCount) % memberCount);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [memberCount]);

  // Two frames: the first lets the transition-disabled snap actually paint —
  // clearing `instant` in the same frame could coalesce with the transform
  // jump and animate the wrap backwards.
  useEffect(() => {
    if (!instant) return;
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setInstant(false));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [instant]);

  // Landing outside the real strip means the viewport is showing cloned
  // slides; snapping back by exactly memberCount positions swaps them for
  // pixel-identical real slides, which is what makes the loop seamless.
  const normalizeIndex = useCallback(() => {
    if (drag.current) return; // a pointer is down; the release re-evaluates
    const i = indexRef.current;
    const logical = ((i % memberCount) + memberCount) % memberCount;
    if (logical === i) return;
    setInstant(true);
    setIndex(logical);
  }, [memberCount]);

  // transitionend is not guaranteed (reduced-motion renders no transition, and
  // a retargeted transition may never settle on a clone position), so
  // normalize on a timer whenever the index sits outside the real strip.
  useEffect(() => {
    if (index >= 0 && index < memberCount) return;
    if (dragDelta !== null) return;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fallback = setTimeout(normalizeIndex, reduced ? 0 : 450);
    return () => clearTimeout(fallback);
  }, [index, memberCount, dragDelta, normalizeIndex]);

  const onTrackTransitionEnd = (e: React.TransitionEvent) => {
    if (e.target !== e.currentTarget) return;
    if (indexRef.current < 0 || indexRef.current >= memberCount) {
      normalizeIndex();
    }
  };

  // Positions past the ends are cloned slides; the generous cloned runway
  // (a full copy each side) absorbs rapid consecutive presses while a wrap
  // transition is still in flight, so no click lands on empty space.
  const prev = useCallback(
    () => setIndex((i) => Math.max(i - 1, -memberCount)),
    [memberCount]
  );
  const next = useCallback(
    () => setIndex((i) => Math.min(i + 1, memberCount * 2 - cardsPerView)),
    [memberCount, cardsPerView]
  );
  const goTo = useCallback(
    (target: number) =>
      setIndex(((target % memberCount) + memberCount) % memberCount),
    [memberCount]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const track = trackRef.current;
    if (!track) return;
    const stepPx = track.getBoundingClientRect().width / cardsPerView;
    // Grabbing mid-transition freezes the track where it is: the residual
    // between the computed transform and the pending target becomes the
    // drag's starting offset instead of the track snapping ahead first.
    let startDelta = 0;
    try {
      const m = new DOMMatrixReadOnly(getComputedStyle(track).transform);
      startDelta = m.m41 + (indexRef.current + memberCount) * stepPx;
      if (!Number.isFinite(startDelta)) startDelta = 0;
    } catch {
      startDelta = 0;
    }
    drag.current = { startX: e.clientX, startDelta, delta: startDelta, stepPx };
    setDragDelta(startDelta);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.stepPx === 0) return;
    const i = indexRef.current;
    // Clamp the dragged offset so the strip is never pulled past the ends of
    // the rendered clones into empty space.
    d.delta = Math.min(
      Math.max(
        d.startDelta + (e.clientX - d.startX),
        (i - (memberCount * 2 - cardsPerView)) * d.stepPx
      ),
      (i + memberCount) * d.stepPx
    );
    setDragDelta(d.delta);
  };

  const endDrag = (cancelled: boolean) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setDragDelta(null);
    if (cancelled || d.stepPx === 0) return;
    // Snap to the nearest card; at least half a card of travel commits a move.
    const steps = Math.round(-d.delta / d.stepPx);
    if (steps !== 0) setIndex((i) => clampIndex(i + steps));
  };

  const onPointerUp = () => endDrag(false);
  const onPointerCancel = () => endDrag(true);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") prev();
    if (e.key === "ArrowRight") next();
  };

  if (memberCount === 0) return null;

  // Fewer members than fit in one view: render them centered at card width
  // with no controls, clones, or empty grid cells.
  if (memberCount <= cardsPerView) {
    return (
      <div
        className="flex flex-wrap justify-center gap-5"
        role="region"
        aria-label="Team members carousel"
      >
        {members.map((member) => (
          <div
            key={member.name}
            className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <TeamCard member={member} />
          </div>
        ))}
      </div>
    );
  }

  // The member list renders three times and the middle copy is the "real"
  // strip — member i sits at slide index i + memberCount. Index positions
  // outside [0, memberCount) show cloned slides that are pixel-identical to
  // the real position exactly memberCount slides away, so the post-transition
  // snap home is invisible. Each slide holds one card, so navigation moves
  // exactly one card per click.
  const slidePct = 100 / cardsPerView;
  const baseOffset = -((index + memberCount) * slidePct);
  const transform =
    dragDelta !== null
      ? `translateX(calc(${baseOffset}% + ${dragDelta}px))`
      : `translateX(${baseOffset}%)`;

  return (
    <div className="space-y-5">
      <div className="relative">
        {/* Prev button */}
        <button
          onClick={prev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-5 z-10 w-9 h-9 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground pressable hover:text-foreground hover:shadow-md focus-ring"
          aria-label="Previous team members"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Next button */}
        <button
          onClick={next}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-5 z-10 w-9 h-9 rounded-full bg-card border border-border/60 shadow-sm flex items-center justify-center text-muted-foreground pressable hover:text-foreground hover:shadow-md focus-ring"
          aria-label="Next team members"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Track container */}
        <div
          className={`overflow-hidden cursor-grab active:cursor-grabbing touch-pan-y ${
            dragDelta !== null ? "select-none" : ""
          }`}
          role="region"
          aria-roledescription="carousel"
          aria-label="Team members carousel"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          // Without this, dragging a card photo starts a native image drag and
          // cancels the pointer stream mid-swipe.
          onDragStart={(e) => e.preventDefault()}
          onKeyDown={onKeyDown}
          tabIndex={0}
        >
          {/* The track's -mx cancels the slides' px so the first and last
              visible cards stay flush with the content column while keeping
              a full gap between cards. */}
          <div
            ref={trackRef}
            className="-mx-2.5 flex transition-transform duration-300 ease-out motion-reduce:transition-none"
            style={{
              transform,
              transition: instant || dragDelta !== null ? "none" : undefined,
            }}
            onTransitionEnd={onTrackTransitionEnd}
            aria-live="polite"
          >
            {Array.from({ length: memberCount * 3 }, (_, slideIdx) => {
              const position = slideIdx - memberCount;
              const isVisible =
                slideIdx >= memberCount &&
                slideIdx < memberCount * 2 &&
                position >= logicalIndex &&
                position < logicalIndex + cardsPerView;
              return (
                <div
                  key={slideIdx}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${(slideIdx % memberCount) + 1} of ${memberCount}`}
                  aria-hidden={!isVisible}
                  className="flex-shrink-0 px-2.5"
                  style={{ width: `${slidePct}%` }}
                >
                  <TeamCard member={members[slideIdx % memberCount]} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Navigation dots — one per crew member */}
      {memberCount > 1 && (
        <div
          className="flex justify-center gap-2 pt-1"
          role="tablist"
          aria-label="Crew members"
        >
          {members.map((member, i) => (
            <button
              key={member.name}
              role="tab"
              aria-selected={i === logicalIndex}
              aria-label={`Go to ${member.name}`}
              onClick={() => goTo(i)}
              className={`rounded-full transition-[width,background-color] duration-200 focus-ring ${
                i === logicalIndex
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
      objectPosition="center 40%"
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
            professional atmosphere that has made Sea Saba special since {OPERATIONS.establishedYear}.
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
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

