"use client";

import { useState } from "react";
import { HotelModal } from "@/components/hotel-modal";
import type { Hotel } from "@/components/hotel-modal";

const HOTELS: Hotel[] = [
  {
    name: "Juliana's Hotel",
    description:
      "A Saba favorite for more than 30 years, Juliana's Hotel combines boutique island charm with modern comforts in the heart of Windwardside. Guests enjoy easy walking access to restaurants, hiking trails, shops, and museums, along with Tropics Café, one of the island's most popular dining destinations.",
    image: "/images/optimized/julianas-hotel.webp",
    imageAlt: "Juliana's Hotel in Windwardside, Saba",
    website: "https://www.julianashotelsaba.com/",
    specs: [
      { icon: "📍", label: "Windwardside" },
      { icon: "⏱", label: "15 min to Fort Bay Harbor" },
      { icon: "🛏", label: "17 rooms, suites & cottages" },
      { icon: "❄️", label: "Air conditioning" },
      { icon: "🍽", label: "Tropics Café & The Dive Bar" },
      { icon: "🏊", label: "Pool with Caribbean views" },
    ],
    recommendation:
      "An excellent choice for divers, couples, and families who want boutique accommodations within walking distance of restaurants, shops, hiking trails, and one of Saba's most popular restaurants.",
  },
  {
    name: "Saba Arawak Hotel",
    description:
      "A comfortable, centrally located hotel in Windwardside offering clean, modern rooms and a relaxed atmosphere. The Arawak is a practical choice for divers who want reliable accommodation close to the heart of the island's social scene.",
    image: "/images/optimized/arawak-hotel.webp",
    imageAlt: "Saba Arawak Hotel in Windwardside, Saba",
    website: "https://sabaarawak.com/",
    specs: [
      { icon: "📍", label: "Windwardside" },
      { icon: "⏱", label: "15 min to Fort Bay Harbor" },
      { icon: "🛏", label: "27 rooms" },
      { icon: "❄️", label: "Air conditioning" },
      { icon: "🚶", label: "Walking distance to village" },
      { icon: "🌐", label: "Free Wi-Fi" },
    ],
    recommendation:
      "A solid, no-fuss base for divers who want a central location, reliable amenities, and easy access to Windwardside's restaurants and shops without paying a premium.",
  },
  {
    name: "El Momo Cottages",
    description:
      "Perched on the lush slopes of Booby Hill, El Momo Cottages is a peaceful retreat surrounded by tropical gardens and sweeping Caribbean views. These charming private cottages offer an authentic island experience where nature, tranquility, and warm Saban hospitality take center stage.",
    image: "/images/optimized/el-momo-cottages.webp",
    imageAlt: "El Momo Cottages on the slopes of Booby Hill, Saba",
    website: "https://elmomocottages.com/",
    specs: [
      { icon: "📍", label: "Booby Hill, Windwardside" },
      { icon: "⏱", label: "15 min to Fort Bay Harbor" },
      { icon: "🏡", label: "7 private wooden cottages" },
      { icon: "🌬", label: "No A/C — elevation & breeze" },
      { icon: "🌿", label: "Tropical gardens & hammocks" },
      { icon: "🚶", label: "5-min walk to Windwardside" },
    ],
    recommendation:
      "Perfect for nature lovers, hikers, and photographers looking for a peaceful retreat surrounded by tropical gardens, ocean views, and easy access to Saba's hiking trails.",
  },
  {
    name: "Cottage Club",
    description:
      "A charming collection of private gingerbread-style cottages nestled along a scenic ridge in Windwardside. Surrounded by tropical gardens with beautiful views of Mount Scenery and the Caribbean Sea, it offers a peaceful retreat within walking distance of restaurants, shops, and dive services.",
    image: "/images/optimized/cottage-club.webp",
    imageAlt: "Cottage Club private cottages with gardens in Windwardside, Saba",
    website: "https://www.cottage-club.com/",
    specs: [
      { icon: "📍", label: "Windwardside" },
      { icon: "⏱", label: "15 min to Fort Bay Harbor" },
      { icon: "🏡", label: "8 private cottages" },
      { icon: "❄️", label: "Air conditioning" },
      { icon: "🍳", label: "Full kitchens" },
      { icon: "🏊", label: "Pool with panoramic views" },
    ],
    recommendation:
      "A great fit for couples and independent travelers who want privacy, space, and a home-away-from-home feel. Full kitchens and a stunning pool make it especially appealing for longer stays.",
  },
  {
    name: "Scenery Hotel",
    description:
      "One of Saba's newest accommodations, offering modern rooms and suites with panoramic views of the island and Caribbean Sea. Located in Windwardside, it provides contemporary comfort, an infinity-edge pool, and convenient access to hiking trails, restaurants, and Saba's world-class diving.",
    image: "/images/optimized/scenery-hotel.webp",
    imageAlt: "Scenery Hotel in Windwardside, Saba with panoramic Caribbean Sea views",
    website: "https://sceneryhotelsaba.com/",
    specs: [
      { icon: "📍", label: "Windwardside" },
      { icon: "⏱", label: "15 min to Fort Bay Harbor" },
      { icon: "🛏", label: "30 rooms & suites" },
      { icon: "❄️", label: "Air conditioning" },
      { icon: "🍽", label: "Grand Scenery Lounge" },
      { icon: "♾️", label: "Infinity-edge pool" },
    ],
    recommendation:
      "The best choice for travelers who want modern amenities, premium comfort, and sweeping Caribbean views — all within easy reach of hiking, dining, and Saba's world-class diving.",
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
