"use client";

import { useState } from "react";
import { ExternalLink, Play } from "lucide-react";

/**
 * Click-to-play YouTube facade. Rendering the iframe on page load would
 * contact YouTube before the visitor interacts — this gate keeps the video
 * off the network until a deliberate click, and the embed itself uses the
 * privacy-enhanced youtube-nocookie.com domain. CSP frame-src is
 * whitelisted in next.config.ts.
 */
export function YouTubeEmbed({ videoId, title }: { videoId: string; title: string }) {
  const [play, setPlay] = useState(false);

  if (play) {
    return (
      <div className="overflow-hidden rounded-xl border border-border/50 bg-black">
        <div className="relative aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1`}
            title={title}
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/30">
      <button
        onClick={() => setPlay(true)}
        className="group flex aspect-video w-full flex-col items-center justify-center gap-3 pressable focus-ring"
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white transition-transform group-hover:scale-105">
          <Play className="h-6 w-6 fill-current" />
        </span>
        <span className="px-4 text-sm font-medium text-foreground">
          Watch the {title} video
        </span>
        <span className="text-xs text-muted-foreground">
          Loads from YouTube when you press play
        </span>
      </button>
      <div className="border-t border-border/40 px-4 py-2 text-center">
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Open on YouTube <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
