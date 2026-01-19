// Types for our image configuration
interface ImageCredit {
  id: string;
  caption: string;
  filename: string;
  credit: string;
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
        credit: "Louis Courbiere"
      },
      {
        id: "1631677",
        caption: "Calm Body Of Water During Golden Hour",
        filename: "pexels-photo-1631677.jpeg",
        credit: "Abdullah Ghatasheh"
      }
    ]
  }
};

// Helper to generate full URLs based on provider specifics
export const getBackgroundImages = (): string[] => {
  return Object.entries(Images).flatMap(([key, provider]) => {
    switch (key) {
        case "pexels":
            return provider.imageIds.map(img => 
                `${provider.baseUrl}/${img.id}/${img.filename}${provider.parameters}`
            );
        default:
            return [];
    }
  });
};

// Export backward-compatible array
export const images = getBackgroundImages();
