export type AssetStatus = "complete" | "pending" | "missing" | "needs-update";

export interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  spotify?: string;
  soundcloud?: string;
  youtube?: string;
  website?: string;
}

export interface LogoAsset {
  status: AssetStatus;
  path?: string;
  variants?: string[];
}

export interface PhotosAsset {
  status: AssetStatus;
  count: number;
  paths?: string[];
}

export interface BioAsset {
  status: AssetStatus;
  wordCount: number;
  path?: string;
  versions?: {
    short?: string;
    medium?: string;
    long?: string;
  };
}

export interface SocialAsset {
  status: AssetStatus;
  links: SocialLinks;
  verified?: boolean;
}

export interface MusicAsset {
  status: AssetStatus;
  trackCount: number;
  releases?: {
    title: string;
    status: AssetStatus;
    releaseDate?: string;
  }[];
}

export interface PressKitAsset {
  status: AssetStatus;
  path?: string;
  lastUpdated?: string;
}

export interface BrandGuidelinesAsset {
  status: AssetStatus;
  path?: string;
  includes?: {
    colors?: boolean;
    typography?: boolean;
    logoUsage?: boolean;
    voice?: boolean;
  };
}

export interface ArtistAssets {
  id: string;
  name: string;
  genre: string;
  badge: "wlp" | "ai";
  logo: LogoAsset;
  photos: PhotosAsset;
  bio: BioAsset;
  social: SocialAsset;
  music: MusicAsset;
  pressKit: PressKitAsset;
  brandGuidelines: BrandGuidelinesAsset;
  lastUpdated: string;
}

export const artistAssets: ArtistAssets[] = [
  {
    id: "animal",
    name: "ANIMAL",
    genre: "DJ / Producer",
    badge: "wlp",
    logo: {
      status: "complete",
      path: "/artists/animal/logo.svg",
      variants: ["logo-dark.svg", "logo-light.svg", "logo-icon.svg"],
    },
    photos: {
      status: "complete",
      count: 12,
      paths: ["/artists/animal/photos/"],
    },
    bio: {
      status: "complete",
      wordCount: 245,
      path: "/artists/animal/bio.md",
      versions: {
        short: "Eric Mills. DJ, producer, 25+ years. WLP founder.",
        medium: "ANIMAL is the alias of Eric Mills, a DJ and producer with over 25 years in the electronic music scene. Founder of WLP.",
        long: "ANIMAL is the alias of Eric Mills, a DJ and producer with over 25 years in the electronic music scene. Founder of WLP, his sound blends techno, house, and progressive elements into a signature style that has moved dancefloors worldwide.",
      },
    },
    social: {
      status: "complete",
      links: {
        instagram: "https://instagram.com/animal",
        twitter: "https://twitter.com/animal",
        spotify: "https://open.spotify.com/artist/animal",
        soundcloud: "https://soundcloud.com/animal",
      },
      verified: true,
    },
    music: {
      status: "complete",
      trackCount: 47,
      releases: [
        { title: "Night Shift EP", status: "complete", releaseDate: "2025-01-15" },
        { title: "Pulse Drive", status: "complete", releaseDate: "2025-02-20" },
      ],
    },
    pressKit: {
      status: "complete",
      path: "/artists/animal/press-kit.pdf",
      lastUpdated: "2026-03-20",
    },
    brandGuidelines: {
      status: "complete",
      path: "/artists/animal/brand-guidelines.pdf",
      includes: {
        colors: true,
        typography: true,
        logoUsage: true,
        voice: true,
      },
    },
    lastUpdated: "2026-03-27",
  },
  {
    id: "kade-rivers",
    name: "Kade Rivers",
    genre: "Rock",
    badge: "ai",
    logo: {
      status: "pending",
      path: "/artists/kade-rivers/logo-draft.png",
    },
    photos: {
      status: "complete",
      count: 8,
      paths: ["/artists/kade-rivers/photos/"],
    },
    bio: {
      status: "complete",
      wordCount: 180,
      path: "/artists/kade-rivers/bio.md",
      versions: {
        short: "Guitar-forward rock that hits before you process it.",
        medium: "Guitar-forward rock that hits before you process it. Classic credibility meets modern production.",
        long: "Guitar-forward rock that hits before you process it. Classic credibility meets modern production — mainstream-ready without losing the edge.",
      },
    },
    social: {
      status: "missing",
      links: {},
      verified: false,
    },
    music: {
      status: "pending",
      trackCount: 3,
      releases: [
        { title: "Rivers Run", status: "pending" },
        { title: "Stone Cold", status: "pending" },
      ],
    },
    pressKit: {
      status: "missing",
    },
    brandGuidelines: {
      status: "missing",
    },
    lastUpdated: "2026-03-27",
  },
  {
    id: "madison-blair",
    name: "Madison Blair",
    genre: "Pop",
    badge: "ai",
    logo: {
      status: "pending",
      path: "/artists/madison-blair/logo-draft.png",
    },
    photos: {
      status: "complete",
      count: 10,
      paths: ["/artists/madison-blair/photos/"],
    },
    bio: {
      status: "complete",
      wordCount: 165,
      path: "/artists/madison-blair/bio.md",
      versions: {
        short: "Bright, energetic pop built for radio and streaming.",
        medium: "Bright, energetic pop built for radio and streaming. High visual appeal with crossover potential.",
        long: "Bright, energetic pop built for radio and streaming. High visual appeal with a sound that crosses comfortably into Top 40.",
      },
    },
    social: {
      status: "missing",
      links: {},
      verified: false,
    },
    music: {
      status: "complete",
      trackCount: 5,
      releases: [
        { title: "Neon Nights", status: "complete", releaseDate: "2026-02-14" },
        { title: "Heartbeat", status: "pending" },
      ],
    },
    pressKit: {
      status: "missing",
    },
    brandGuidelines: {
      status: "missing",
    },
    lastUpdated: "2026-03-27",
  },
  {
    id: "aria-vale",
    name: "Aria Vale",
    genre: "Electronic / Pop",
    badge: "ai",
    logo: {
      status: "pending",
      path: "/artists/aria-vale/logo-draft.png",
    },
    photos: {
      status: "complete",
      count: 9,
      paths: ["/artists/aria-vale/photos/"],
    },
    bio: {
      status: "complete",
      wordCount: 155,
      path: "/artists/aria-vale/bio.md",
      versions: {
        short: "Electronic and pop woven together.",
        medium: "Electronic and pop woven together — pulsing synths and crystalline vocals.",
        long: "Electronic and pop woven together — pulsing synths, crystalline vocals, and a visual presence that cuts through the noise.",
      },
    },
    social: {
      status: "missing",
      links: {},
      verified: false,
    },
    music: {
      status: "pending",
      trackCount: 2,
      releases: [
        { title: "Digital Dreams", status: "pending" },
        { title: "Echo Chamber", status: "pending" },
      ],
    },
    pressKit: {
      status: "missing",
    },
    brandGuidelines: {
      status: "missing",
    },
    lastUpdated: "2026-03-27",
  },
  ,
  {
    id: "jusniiga",
    name: "JusNiiga",
    genre: "Afro EDM",
    badge: "wlp",
    logo: {
      status: "missing",
    },
    photos: {
      status: "complete",
      count: 3,
      paths: ["/artists/jusniiga.jpg", "/artists/jusniiga-2.jpg", "/artists/jusniiga-3.jpg"],
    },
    bio: {
      status: "pending",
      wordCount: 0,
      versions: {
        short: "Afro EDM fusion — infectious rhythms meet electronic energy.",
        medium: "Afro EDM fusion — infectious rhythms layered over electronic energy that moves between continents and crowds.",
        long: "JusNiiga brings Afro EDM fusion to the dancefloor — infectious rhythms layered over electronic energy that moves between continents and crowds. A sound that feels both rooted and forward-moving, built for stages and streaming alike.",
      },
    },
    social: {
      status: "missing",
      links: {},
      verified: false,
    },
    music: {
      status: "pending",
      trackCount: 1,
      releases: [
        { title: "Love is Rare", status: "pending", releaseDate: "2026-05-06" },
      ],
    },
    pressKit: {
      status: "missing",
    },
    brandGuidelines: {
      status: "missing",
    },
    lastUpdated: "2026-04-06",
  },
];

export function getCompletionPercentage(artist: ArtistAssets): number {
  const assets = [
    artist.logo.status,
    artist.photos.status,
    artist.bio.status,
    artist.social.status,
    artist.music.status,
    artist.pressKit.status,
    artist.brandGuidelines.status,
  ];
  
  const complete = assets.filter((s) => s === "complete").length;
  const pending = assets.filter((s) => s === "pending").length * 0.5;
  const needsUpdate = assets.filter((s) => s === "needs-update").length * 0.25;
  
  return Math.round(((complete + pending + needsUpdate) / assets.length) * 100);
}

export function getStatusCounts() {
  const allStatuses = artistAssets.flatMap((a) => [
    a.logo.status,
    a.photos.status,
    a.bio.status,
    a.social.status,
    a.music.status,
    a.pressKit.status,
    a.brandGuidelines.status,
  ]);
  
  return {
    complete: allStatuses.filter((s) => s === "complete").length,
    pending: allStatuses.filter((s) => s === "pending").length,
    missing: allStatuses.filter((s) => s === "missing").length,
    needsUpdate: allStatuses.filter((s) => s === "needs-update").length,
  };
}

export function getArtistById(id: string): ArtistAssets | undefined {
  return artistAssets.find((a) => a.id === id);
}
