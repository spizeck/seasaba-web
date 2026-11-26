/**
 * Verified public image attribution kept outside optimized image binaries.
 * Fields are optional because filenames, embedded metadata, and owner review
 * verify different facts for different photographs. Never fill these by inference.
 */
export interface ImageAttribution {
  description: string;
  photographer?: string;
  dateTaken?: string;
  location?: string;
  copyrightHolder?: string;
  copyrightNotice?: string;
  license?: string;
  imageUrl: string;
}

export function formatImageCaption(image: ImageAttribution): string {
  return image.photographer
    ? `${image.description} - ${image.photographer}`
    : image.description;
}

export const HOME_DIVE_AREA_IMAGES = {
  pinnacles: {
    description: "The Needle",
    photographer: "Vidar Skålevik",
    dateTaken: "2015-11-26",
    location: "The Needle, Saba",
    copyrightHolder: "Vidar Skålevik",
    imageUrl: "/images/optimized/diver-volcanic-pinnacle-saba.webp",
  },
  tentReef: {
    description: "Green turtle at Tent Reef",
    location: "Tent Reef, Saba",
    imageUrl: "/images/optimized/green-turtle-tent-reef.webp",
  },
  ladderBay: {
    description: "Nurse shark at Ladder Bay",
    location: "Ladder Bay, Saba",
    imageUrl: "/images/optimized/nurse-shark-ladder-bay-saba.webp",
  },
  wellsBay: {
    description: "Diamond Rock",
    dateTaken: "2013-05-03",
    location: "Diamond Rock, Saba",
    imageUrl: "/images/optimized/wells-bay-dive-site-saba.webp",
  },
  windwardside: {
    description: "Elkhorn coral on Saba's Windwardside",
    location: "Windwardside, Saba",
    imageUrl: "/images/optimized/windwardside-dive-site-saba.webp",
  },
} as const satisfies Record<string, ImageAttribution>;
