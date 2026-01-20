// Types for our image configuration
interface ImageCredit {
  id: string;
  caption: string;
  filename: string;
  url: string;
  credit: string;
  creditLink: string;
}

interface ImageProvider {
  name: string;
  baseUrl: string;
  parameters: string;
  imageIds: ImageCredit[];
}

interface ImageCollection {
  [key: string]: ImageProvider;
}

export const Images: ImageCollection = {
  "pexels": {
    name: "Pexels",
    baseUrl: "https://images.pexels.com/photos",
    parameters: "?auto=compress&cs=tinysrgb&dpr=1&w=1920",
    imageIds: [
      {
        id: "1350197",
        caption: "Close-up Photo of Water",
        filename: "pexels-photo-1350197.jpeg",
        url: "https://www.pexels.com/photo/close-up-photo-of-water-1350197",
        credit: "Louis Courbiere",
        creditLink: "https://www.pexels.com/@earano",
      },
      {
        id: "1631677",
        caption: "Calm Body Of Water During Golden Hour",
        filename: "pexels-photo-1631677.jpeg",
        url:
          "https://www.pexels.com/photo/calm-body-of-water-during-golden-hour-1631677",
        credit: "Abdullah Ghatasheh",
        creditLink: "https://www.pexels.com/@abdghat",
      },
      {
        id: "268533",
        caption: "Green Tree",
        filename: "pexels-photo-268533.jpeg",
        url: "https://www.pexels.com/photo/green-tree-268533",
        credit: "Pixabay",
        creditLink: "https://www.pexels.com/@pixabay",
      },
      {
        id: "2850287",
        caption: "Two Person on Boat in Body of Water during Golden Hour",
        filename: "pexels-photo-2850287.jpeg",
        url:
          "https://www.pexels.com/photo/two-person-on-boat-in-body-of-water-during-golden-hour-2850287",
        credit: "Johannes Plenio",
        creditLink: "https://www.pexels.com/@jplenio",
      },
      {
        id: "189349",
        caption: "Calm Body Of Water During Golden Hour",
        filename: "pexels-photo-189349.jpeg",
        url:
          "https://www.pexels.com/photo/calm-body-of-water-during-golden-hour-1631677",
        credit: "Sebastian Voortman",
        creditLink: "https://www.pexels.com/@sebastian/",
      },
      {
        id: "18661066",
        caption: "Dawn Seen From Beach Cave",
        filename: "pexels-photo-18661066.jpeg",
        url: "https://www.pexels.com/photo/dawn-seen-from-beach-cave-18661066",
        credit: "Christopher Politano",
        creditLink: "https://www.pexels.com/@christopher-politano-978995",
      },
      {
        id: "169905",
        caption: "Green Island Near The Ocean During Daytime",
        filename: "pexels-photo-169905.jpeg",
        url:
          "https://www.pexels.com/photo/green-island-near-the-ocean-during-daytime-169905",
        credit: "Nikolay Draganov",
        creditLink: "https://www.pexels.com/@nickybaby",
      },
      {
        id: "169905",
        caption: "Green Island Near The Ocean During Daytime",
        filename: "pexels-photo-169905.jpeg",
        url:
          "https://www.pexels.com/photo/green-island-near-the-ocean-during-daytime-169905",
        credit: "Nikolay Draganov",
        creditLink: "https://www.pexels.com/@nickybaby",
      },
      {
        id: "35610506",
        caption: "Vibrant Toucan In Lush Brazilian Habitat",
        filename: "pexels-photo-35610506.jpeg",
        url:
          "https://www.pexels.com/photo/vibrant-toucan-in-lush-brazilian-habitat-35610506",
        credit: "Kaká Souza",
        creditLink: "https://www.pexels.com/@kaka-souza-2898340",
      },
      {
        id: "18327284",
        caption: "Hummingbirds In Flight By Flower",
        filename: "pexels-photo-18327284.jpeg",
        url:
          "https://www.pexels.com/photo/hummingbirds-in-flight-by-flower-18327284",
        credit: "Janice Carriger",
        creditLink: "https://www.pexels.com/@jmhcarriger/",
      },
    ],
  },
};

// Helper to generate full URLs based on provider specifics
export const getBackgroundImages = (): string[] => {
  return Object.entries(Images).flatMap(([key, provider]) => {
    switch (key) {
      case "pexels":
        return provider.imageIds.map((img) =>
          `${provider.baseUrl}/${img.id}/${img.filename}${provider.parameters}`
        );
      default:
        return [];
    }
  });
};

// Export backward-compatible array
export const images = getBackgroundImages();

export const getImageByUrl = (url: string): ImageCredit | undefined => {
  for (const provider of Object.values(Images)) {
    const fullUrlMatch = provider.imageIds.find((img) =>
      url.includes(img.filename) // Simple match, or build the full URL to compare
    );
    // Better: reconstruction check or just storing the full URL in the mapped object if we could.
    // Since we generate URLs in getBackgroundImages, let's reverse match or search.
    // Given the structure, constructing the URL to check is safest or checking inclusion of ID/filename if unique.

    // Let's try to find exact match if possible, or effectively reconstruct.
    if (fullUrlMatch) {
      // Double check against the generated URL logic to be sure?
      // Logic: `${provider.baseUrl}/${img.id}/${img.filename}${provider.parameters}`
      const generated =
        `${provider.baseUrl}/${fullUrlMatch.id}/${fullUrlMatch.filename}${provider.parameters}`;
      if (generated === url) return fullUrlMatch;
    }
  }
  return undefined;
};
