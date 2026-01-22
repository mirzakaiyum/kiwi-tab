// Default shortcuts and experts configuration

export type UserShortcut = {
    id: string;
    name: string;
    prompt: string;
};

export type Expert = {
    id: string;
    name: string;
    prompt: string;
    icon: string;
};

export const DEFAULT_SHORTCUTS: UserShortcut[] = [
    {
        id: "prep-a-meal",
        name: "/prep-a-meal",
        prompt: `Act as an expert meal prep coach. Create a 5-day meal prep plan for [number of servings, e.g., 4 lunches] using affordable, easy-to-find ingredients suitable for [dietary preferences, e.g., vegetarian, high-protein, or Bangladeshi flavors]. Include:\n\nA shopping list with estimated costs.\n\nStep-by-step prep instructions with total time under 2 hours.\n\nBalanced macros per serving (calories, protein, carbs, fats).\n\nStorage tips and reheating instructions.\nKeep recipes simple, nutritious, and tasty. Suggest substitutions for common allergies or restrictions.`,
    },
    {
        id: "explain-simply",
        name: "/explain-simply",
        prompt: `Explain the following concept like I am a beginner with no prior knowledge. Use a relatable analogy, avoid jargon, and keep the explanation under 200 words.`,
    },
    {
        id: "action-items",
        name: "/action-items",
        prompt: `Read the following text and extract all specific tasks, deadlines, and owners. Format them into a clean, bulleted list of actionable steps.`,
    },
    {
        id: "steel-man",
        name: "/steel-man",
        prompt: `I am going to provide an argument or an idea. Point out the potential flaws, suggest 3 strong counter-arguments, and tell me how I could strengthen my original position to address these critiques.`,
    },
    {
        id: "tldr-news",
        name: "/tldr-news",
        prompt: `Analyze the provided URL or text. Give me a 3-bullet point summary of the 'who, what, and why,' and then list any potential biases or missing perspectives in the reporting.`,
    },
    {
        id: "code-fix",
        name: "/code-fix",
        prompt: `Review this code snippet. Identify any bugs or inefficiencies, provide the corrected version, and explain briefly why the change was necessary.`,
    },
    {
        id: "tone-check",
        name: "/tone-check",
        prompt: `Rewrite the following text to sound more [Professional/Friendly/Empathetic]. Ensure the core message remains the same but adjust the vocabulary to be more appropriate for a [Client/Colleague/Friend].`,
    },
];

export const DEFAULT_EXPERTS: Expert[] = [
    {
        id: "engineer",
        name: "Engineer",
        prompt: "You are an expert software engineer. Provide detailed, technically accurate solutions with best practices, clean code examples, and thorough explanations. Consider performance, scalability, and maintainability.",
        icon: "Code",
    },
    {
        id: "scholar",
        name: "Scholar",
        prompt: "You are an academic scholar with deep expertise across disciplines. Provide well-researched, nuanced answers with citations where relevant. Explain complex topics clearly while maintaining intellectual rigor.",
        icon: "GraduationCap",
    },
    {
        id: "mentor",
        name: "Mentor",
        prompt: "You are a wise and supportive mentor. Guide the user through challenges with patience, encourage growth, ask thoughtful questions, and provide actionable advice while respecting their autonomy.",
        icon: "Heart",
    },
    {
        id: "designer",
        name: "Creative Designer",
        prompt: "You are a creative designer with expertise in UX/UI, visual design, and brand identity. Offer innovative design solutions, explain design principles, and provide practical recommendations for creating beautiful, user-friendly experiences.",
        icon: "Palette",
    },
];

