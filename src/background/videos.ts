// Types for video configuration
export interface VideoCredit {
    id: string;
    caption: string;
    filename: string;
    url: string;
    credit: string;
    creditLink: string;
}

interface VideoProvider {
    name: string;
    baseUrl: string;
    videoIds: VideoCredit[];
}

interface VideoCollection {
    [key: string]: VideoProvider;
}

export const Videos: VideoCollection = {
    "pexels": {
        name: "Pexels",
        baseUrl: "https://videos.pexels.com/video-files",
        videoIds: [
            {
                id: "14842032", // 1 Pine Cone
                caption: "Captivating Close-Up of Pine Cone on Tree Branch",
                filename: "14842032_1920_1080_25fps.mp4",
                url: "https://www.pexels.com/video/captivating-close-up-of-pine-cone-on-tree-branch-35037587",
                credit: "Efrem Efrem",
                creditLink: "https://www.pexels.com/@efrem-efre-2786187",
            },
            {
                id: "857251", // 2 Night Time Lapse
                caption: "Beautiful Timelapse of the Night Sky with Reflections in a Lake",
                filename: "857251-hd_1620_1080_25fps.mp4",
                url: "https://www.pexels.com/video/beautiful-timelapse-of-the-night-sky-with-reflections-in-a-lake-857251",
                credit: "eberhard grossgasteiger",
                creditLink: "https://www.pexels.com/@eberhardgross",
            },
            {
                id: "7513671", // 3 Ocean
                caption: "The Ocean is Dark and Rough with Waves",
                filename: "7513671-hd_1920_1080_24fps.mp4",
                url: "https://www.pexels.com/video/the-ocean-is-dark-and-rough-with-waves-7513671",
                credit: "Rostislav Uzunov",
                creditLink: "https://www.pexels.com/@rostislav",
            },
            {
                id: "13533038", // 4 Campfire
                caption: "Calm Campfire at Sunset with Vibrant Sky",
                filename: "13533038_1920_1080_30fps.mp4",
                url: "https://www.pexels.com/video/calm-campfire-at-sunset-with-vibrant-sky-31766451",
                credit: "Carlos Basstos",
                creditLink: "https://www.pexels.com/@carlosbasstos/",
            },
            {
                id: "13876715", // 5 Sunset
                caption: "Serene Sunset with Swaying Grasses",
                filename: "13876715_1920_1080_30fps.mp4",
                url: "https://www.pexels.com/video/serene-sunset-with-swaying-grasses-32539231",
                credit: "Mehmet Ali",
                creditLink: "https://www.pexels.com/@aydinjpg",
            },
            {
                id: "1757800", // 6 Waves
                caption: "Waves Rushing to the Shore",
                filename: "1757800-hd_1920_1080_25fps.mp4",
                url: "https://www.pexels.com/video/waves-rushing-to-the-shore-1757800",
                credit: "Engin Akyurt",
                creditLink: "https://www.pexels.com/@enginakyurt",
            },
            {
                id: "2556894", // 7 Underwater
                caption: "Underwater Footage",
                filename: "2556894-hd_1920_1080_25fps.mp4",
                url: "https://www.pexels.com/video/underwater-footage-2556894",
                credit: "Magda Ehlers",
                creditLink: "https://www.pexels.com/@magda-ehlers-pexels",
            },
            {
                id: "13427499", // 8 Spring Blossoms
                caption: "Beautiful Spring Blossoms on Fruit Tree Branches",
                filename: "13427499_1920_1080_24fps.mp4",
                url: "https://www.pexels.com/video/beautiful-spring-blossoms-on-fruit-tree-branches-31491999",
                credit: "Nicky Pe",
                creditLink: "https://www.pexels.com/@nicky",
            },
            {
                id: "19408916", // 9 Cat Sleeping
                caption: "A Cat Sleeping on Top of a Cushion",
                filename: "19408916-hd_1920_1080_30fps.mp4",
                url: "https://www.pexels.com/video/a-cat-sleeping-on-top-of-a-cushion-19408916",
                credit: "Boris Hamer",
                creditLink: "https://www.pexels.com/@borishamer",
            },
            {
                id: "15151651",
                caption: "Scenic Drive Through Canyon Roads at Sunrise",
                filename: "15151651_1920_1080_60fps.mp4",
                url: "https://www.pexels.com/video/scenic-drive-through-canyon-roads-at-sunrise-35745344/",
                credit: "Alex Moliski",
                creditLink: "https://www.pexels.com/@alexmoliski/",
            }
        ],
    },
};

// Helper to extract Pexels ID from URL
const getPexelsId = (url: string) => {
    const match = url.match(/-(\d+)$/);
    return match ? match[1] : null;
};

// Generate direct URLs
export const getBackgroundVideos = (): string[] => {
    return Object.entries(Videos).flatMap(([key, provider]) => {
        switch (key) {
            case "pexels":
                return provider.videoIds.map((v) => {
                    const pexelsId = getPexelsId(v.url);
                    if (!pexelsId) return "";
                    return `${provider.baseUrl}/${pexelsId}/${v.filename}`;
                }).filter((url) => url !== "");
            default:
                return [];
        }
    });
};

export const videos = getBackgroundVideos();

export const getVideoByUrl = (directUrl: string): VideoCredit | undefined => {
    for (const provider of Object.values(Videos)) {
        const match = provider.videoIds.find((v) =>
            directUrl.includes(v.filename)
        );
        if (match) return match;
    }
    return undefined;
};
