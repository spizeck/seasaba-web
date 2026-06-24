"use client";

import { useState } from "react";
import { DiveSiteModal } from "@/components/dive-site-modal";
import { DIVE_SITE_MAP, DIVE_SITES } from "@/data/dive-site-videos";
import type { DiveSite } from "@/data/dive-site-videos";

type Props = {
  sites: readonly string[];
};

export function DiveAreaSites({ sites }: Props) {
  const [activeSite, setActiveSite] = useState<DiveSite | null>(null);

  // Only sites that exist in the data file are clickable with a modal
  const openSite = (name: string) => {
    const site = DIVE_SITE_MAP[name];
    if (site) setActiveSite(site);
  };

  return (
    <>
      <div className="mt-2 flex flex-wrap gap-2">
        {sites.map((site) => {
          const hasData = Boolean(DIVE_SITE_MAP[site]);
          return (
            <button
              key={site}
              onClick={() => openSite(site)}
              disabled={!hasData}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                hasData
                  ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                  : "bg-primary/10 text-primary cursor-default"
              }`}
            >
              {site}
            </button>
          );
        })}
      </div>

      {activeSite && (
        <DiveSiteModal
          site={activeSite}
          allSites={DIVE_SITES}
          onClose={() => setActiveSite(null)}
          onNavigate={(s) => setActiveSite(s)}
        />
      )}
    </>
  );
}
