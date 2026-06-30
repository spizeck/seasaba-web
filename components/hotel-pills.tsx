"use client";

import { useState } from "react";
import { HotelModal } from "@/components/hotel-modal";
import type { Hotel } from "@/components/hotel-modal";

const HOTELS: Hotel[] = [
  {
    name: "Juliana's Hotel",
    description:
      "A long-standing favorite perched in Windwardside with lush tropical gardens, a pool, and a welcoming atmosphere. Juliana's combines comfort with genuine Saban character, making it a natural base for divers who want easy access to the village.",
    image: "/images/optimized/windwardside-village-saba.webp",
    imageAlt: "Windwardside village on Saba with traditional cottages and tropical greenery",
    website: "https://www.julianashotelsaba.com/",
    village: "Windwardside",
    minutesFromSeaSaba: 5,
    restaurant: true,
    pool: true,
    priceCategory: "$$",
    bestFor: "Divers wanting village access and amenities",
  },
  {
    name: "Saba Arawak Hotel",
    description:
      "A comfortable, centrally located hotel in Windwardside offering clean, modern rooms and a relaxed atmosphere. The Arawak is a practical choice for divers who want reliable accommodation close to the heart of the island's social scene.",
    image: "/images/optimized/saba-volcanic-scenery.webp",
    imageAlt: "Saba's lush volcanic scenery and traditional architecture",
    website: "https://sabaarawak.com/",
    village: "Windwardside",
    minutesFromSeaSaba: 5,
    restaurant: false,
    pool: false,
    priceCategory: "$",
    bestFor: "Budget-conscious divers in a central location",
  },
  {
    name: "El Momo Cottages",
    description:
      "Charming wooden cottages nestled in a hillside garden above Windwardside. El Momo offers a peaceful, back-to-nature retreat with sweeping views and a genuine sense of seclusion — ideal for visitors who want to disconnect after a day of diving.",
    image: "/images/optimized/saba-volcanic-coastline.webp",
    imageAlt: "Saba's dramatic volcanic coastline seen from the hillside",
    website: "https://elmomocottages.com/",
    village: "Windwardside",
    minutesFromSeaSaba: 7,
    restaurant: false,
    pool: false,
    priceCategory: "$",
    bestFor: "Couples and solo travelers seeking peace and nature",
  },
  {
    name: "Cottage Club",
    description:
      "A collection of private self-contained cottages set in beautifully maintained gardens with a pool. The Cottage Club suits guests who value privacy, space, and a home-away-from-home feel while remaining close to the island's amenities.",
    image: "/images/optimized/cove-bay-saba.webp",
    imageAlt: "Cove Bay and Saba's tropical hillsides",
    website: "https://www.cottage-club.com/",
    village: "Windwardside",
    minutesFromSeaSaba: 5,
    restaurant: false,
    pool: true,
    priceCategory: "$$",
    bestFor: "Guests wanting privacy and self-catering flexibility",
  },
  {
    name: "Scenery Hotel",
    description:
      "A modern boutique hotel in The Bottom with panoramic views across Saba's dramatic landscape. Scenery Hotel offers stylish, well-appointed rooms and is ideally positioned for guests who want to experience the island's capital village.",
    image: "/images/optimized/saba-island-aerial-golden-hour.webp",
    imageAlt: "Aerial view of Saba island at golden hour",
    website: "https://sceneryhotelsaba.com/",
    village: "The Bottom",
    minutesFromSeaSaba: 12,
    restaurant: true,
    pool: false,
    priceCategory: "$$",
    bestFor: "Guests wanting modern comfort and panoramic views",
  },
];

export function HotelPills() {
  const [active, setActive] = useState<Hotel | null>(null);

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-2">
        {HOTELS.map((hotel) => (
          <button
            key={hotel.name}
            onClick={() => setActive(hotel)}
            className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
          >
            {hotel.name}
          </button>
        ))}
      </div>

      {active && (
        <HotelModal hotel={active} onClose={() => setActive(null)} />
      )}
    </>
  );
}
