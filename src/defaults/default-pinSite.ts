export interface PinnedSite {
  id: string;
  url: string;
  title: string;
  backgroundColor?: string;
}

// Default popular sites
export const DEFAULT_PINNED_SITES: PinnedSite[] = [
  { id: "1", url: "https://youtube.com", title: "YouTube", backgroundColor: "#fff" },
  { id: "2", url: "https://facebook.com", title: "Facebook", backgroundColor: "#0866ff" },
  { id: "3", url: "https://x.com", title: "X", backgroundColor: "#000" },
  { id: "4", url: "https://reddit.com", title: "Reddit", backgroundColor: "#fff" },
  { id: "5", url: "https://amazon.com", title: "Amazon", backgroundColor: "#fff" },
  { id: "6", url: "https://spotify.com", title: "Spotify", backgroundColor: "#000" },
  { id: "7", url: "https://netflix.com", title: "Netflix", backgroundColor: "#000" },
  { id: "8", url: "https://pinterest.com", title: "Pinterest", backgroundColor: "#fff" },
];