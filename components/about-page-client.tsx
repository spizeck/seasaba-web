"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { FeatureImage } from "@/components/feature-image";
import { OPERATIONS } from "@/data/operations";
import {
  TEAM_MEMBERS,
  teamMemberProfilePath,
  type TeamMember,
} from "@/data/team";

function getCardsPerView(): number {
  if (typeof window === "undefined") return 3;
  if (window.innerWidth >= 1024) return 3;
  if (window.innerWidth >= 640) return 2;
  return 1;
}

function TeamCard({
  member,
  linkTabIndex,
}: {
  member: TeamMember;
  linkTabIndex?: number;
}) {
  const initials = member.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
  const profileHref =
    member.slug && member.isPerson !== false
      ? teamMemberProfilePath(member)
      : undefined;

  return (
    <div className="relative rounded-2xl border border-border/50 bg-card overflow-hidden flex flex-col h-full">
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

        {profileHref && (
          <Link
            href={profileHref}
            tabIndex={linkTabIndex}
            className="mt-4 inline-flex w-fit items-center rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline focus-ring after:absolute after:inset-0 after:content-['']"
          >
            View full biography
          </Link>
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
  // Distance travelled by the active pointer. Clicks following a real drag
  // are swallowed so swiping a linked card never navigates accidentally.
  const dragDistance = useRef(0);

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
      // the index pointing at space past the rendered clones. Any active drag
      // is cancelled — its pixel step is stale under the new widths.
      drag.current = null;
      setDragDelta(null);
      setInstant(true);
      if (memberCount > 0) {
        setIndex((i) => ((i % memberCount) + memberCount) % memberCount);
      }
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
    if (memberCount === 0) return;
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
    dragDistance.current = 0;
    setDragDelta(startDelta);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.stepPx === 0) return;
    const i = indexRef.current;
    dragDistance.current = Math.max(
      dragDistance.current,
      Math.abs(e.clientX - d.startX)
    );
    // Capture only once movement crosses the click-suppression threshold.
    // Below it, the eventual click must still reach the card link.
    if (dragDistance.current > 8 && !e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
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
    if (cancelled || d.stepPx === 0) {
      dragDistance.current = 0;
      return;
    }
    // Snap to the nearest card; at least half a card of travel commits a move.
    const steps = Math.round(-d.delta / d.stepPx);
    if (steps !== 0) setIndex((i) => clampIndex(i + steps));
  };

  const onPointerUp = () => endDrag(false);
  const onPointerCancel = () => endDrag(true);

  const onClickCapture = (e: React.MouseEvent) => {
    if (dragDistance.current <= 8) return;
    e.preventDefault();
    e.stopPropagation();
    dragDistance.current = 0;
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    // Card links are interactive content, not carousel controls; moving the
    // carousel beneath a focused link would inert that exact DOM node.
    if ((e.target as HTMLElement).closest("a, button")) return;
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
          onClickCapture={onClickCapture}
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
              // Match the exact slides inside the viewport. Wrapped windows
              // necessarily include clones at one end, while every duplicate
              // outside the viewport stays hidden from assistive tech.
              const firstVisibleSlide = index + memberCount;
              const isVisible =
                slideIdx >= firstVisibleSlide &&
                slideIdx < firstVisibleSlide + cardsPerView;
              return (
                <div
                  key={slideIdx}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${(slideIdx % memberCount) + 1} of ${memberCount}`}
                  aria-hidden={!isVisible}
                  inert={!isVisible}
                  className="flex-shrink-0 px-2.5"
                  style={{ width: `${slidePct}%` }}
                >
                  <TeamCard
                    member={members[slideIdx % memberCount]}
                    linkTabIndex={isVisible ? undefined : -1}
                  />
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
          role="group"
          aria-label="Crew members"
        >
          {members.map((member, i) => (
            <button
              key={member.name}
              aria-current={i === logicalIndex}
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
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={teamMemberProfilePath("chad-nuttall")}
            className="rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline focus-ring"
          >
            Chad&apos;s full biography
          </Link>
          <Link
            href={teamMemberProfilePath("katy-nuttall")}
            className="rounded-md text-sm font-semibold text-primary underline-offset-4 hover:underline focus-ring"
          >
            Katy&apos;s full biography
          </Link>
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

