import * as React from "react";

const GREETING_ENABLED_KEY = "kiwi-greeting-enabled";
const GREETING_STORAGE_KEY = "kiwi-greeting";
const NAME_STORAGE_KEY = "kiwi-name";

function isGreetingEnabled(): boolean {
    return localStorage.getItem(GREETING_ENABLED_KEY) !== "false";
}

function getGreeting(): string {
    const customGreeting = localStorage.getItem(GREETING_STORAGE_KEY);
    if (customGreeting) return customGreeting;

    const hr = new Date().getHours();
    if (hr >= 5 && hr < 12) return "Good Morning";
    if (hr >= 12 && hr < 17) return "Good Afternoon";
    if (hr >= 17 && hr < 21) return "Good Evening";
    return "Hello";
}

function getDisplayName(): string {
    return localStorage.getItem(NAME_STORAGE_KEY) || "there";
}

export function Greeting() {
    const [greetingEnabled, setGreetingEnabled] =
        React.useState(isGreetingEnabled);
    const [greeting, setGreeting] = React.useState(getGreeting);
    const [displayName, setDisplayName] = React.useState(getDisplayName);

    // Listen for settings changes
    React.useEffect(() => {
        const handleSettingsChange = () => {
            setGreeting(getGreeting());
            setDisplayName(getDisplayName());
            setGreetingEnabled(isGreetingEnabled());
        };
        window.addEventListener("kiwi-settings-changed", handleSettingsChange);
        return () =>
            window.removeEventListener(
                "kiwi-settings-changed",
                handleSettingsChange,
            );
    }, []);

    if (!greetingEnabled) return null;

    return (
        <h2 className="text-lg sm:text-4xl mb-8 text-center">
            {greeting}, {displayName}!
        </h2>
    );
}
