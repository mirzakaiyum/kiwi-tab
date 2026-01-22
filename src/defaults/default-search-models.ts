// AI model configurations
export const MODELS = [
    {
        id: "chatgpt",
        name: "ChatGPT",
        icon:
            "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/chatgpt-icon.png",
        url: (q: string) => `https://chatgpt.com/?q=${encodeURIComponent(q)}`,
    },
    {
        id: "perplexity",
        name: "Perplexity",
        icon:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Perplexity_AI_Turquoise_on_White.png/960px-Perplexity_AI_Turquoise_on_White.png?20250123162739",
        url: (q: string) =>
            `https://www.perplexity.ai/search?q=${encodeURIComponent(q)}`,
    },
    {
        id: "google-ai",
        name: "Google AI Mode",
        icon:
            "https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png?20150901215638",
        url: (q: string) =>
            `https://www.google.com/search?sourceid=chrome&udm=50&q=${encodeURIComponent(q)}`,
    },
] as const;

// Search engine configurations
export const SEARCH_ENGINES = [
    {
        id: "google",
        name: "Google",
        icon: "https://www.google.com/favicon.ico",
        url: (q: string) =>
            `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    },
    {
        id: "bing",
        name: "Bing",
        icon: "https://www.bing.com/favicon.ico",
        url: (q: string) =>
            `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    },
    {
        id: "duckduckgo",
        name: "DuckDuckGo",
        icon: "https://duckduckgo.com/favicon.ico",
        url: (q: string) =>
            `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
    },
] as const; 