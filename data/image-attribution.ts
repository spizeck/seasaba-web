/**
 * Verified public image attribution kept outside optimized image binaries.
 * One entry per image asset. Optional fields stay empty unless the owner or
 * source metadata verifies them; never fill them by inference.
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

export const IMAGE_ATTRIBUTIONS = {
  "divers-above-pinnacle-saba.webp": {
    description: "The Needle",
    photographer: "Candice Landau",
    dateTaken: "2025-03",
    location: "The Needle, Saba",
    imageUrl: "/images/optimized/divers-above-pinnacle-saba.webp",
  },
  "fin-and-tonic-boat-diamond-rock.webp": {
    description: "Fin & Tonic at Diamond Rock",
    photographer: "Candice Landau",
    location: "Diamond Rock, Saba",
    imageUrl: "/images/optimized/fin-and-tonic-boat-diamond-rock.webp",
  },
  "windwardside-village-saba.webp": {
    description: "Windwardside from the Mas Cahones lookout",
    photographer: "Chris Kurzatkowski",
    location: "Windwardside, Saba",
    imageUrl: "/images/optimized/windwardside-village-saba.webp",
  },
  "diver-volcanic-pinnacle-saba.webp": {
    description: "Diver descending toward one of Saba's underwater pinnacles",
    imageUrl: "/images/optimized/diver-volcanic-pinnacle-saba.webp",
  },
  "green-turtle-tent-reef.webp": {
    description: "Green turtle gliding over coral reef",
    imageUrl: "/images/optimized/green-turtle-tent-reef.webp",
  },
  "nurse-shark-ladder-bay-saba.webp": {
    description: "Nurse shark resting beneath a rocky reef ledge",
    imageUrl: "/images/optimized/nurse-shark-ladder-bay-saba.webp",
  },
  "wells-bay-dive-site-saba.webp": {
    description: "Coral- and sponge-covered reef underwater",
    imageUrl: "/images/optimized/wells-bay-dive-site-saba.webp",
  },
  "windwardside-dive-site-saba.webp": {
    description: "Elkhorn coral growing on a shallow coral reef",
    imageUrl: "/images/optimized/windwardside-dive-site-saba.webp",
  },
} as const satisfies Record<string, ImageAttribution>;

export type ImageAssetKey = keyof typeof IMAGE_ATTRIBUTIONS;

export const HOME_DIVE_AREA_IMAGES = {
  pinnacles: IMAGE_ATTRIBUTIONS["diver-volcanic-pinnacle-saba.webp"],
  tentReef: IMAGE_ATTRIBUTIONS["green-turtle-tent-reef.webp"],
  ladderBay: IMAGE_ATTRIBUTIONS["nurse-shark-ladder-bay-saba.webp"],
  wellsBay: IMAGE_ATTRIBUTIONS["wells-bay-dive-site-saba.webp"],
  windwardside: IMAGE_ATTRIBUTIONS["windwardside-dive-site-saba.webp"],
} as const;
