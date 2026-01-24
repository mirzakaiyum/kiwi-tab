// Check onboarding status using dual-storage pattern
// Primary: localStorage (instant sync) | Backup: chrome.storage.local (persistent)
(function () {
    const ONBOARDING_KEY = "kiwi-onboarded";
    
    // Instant synchronous check from localStorage
    const isOnboarded = localStorage.getItem(ONBOARDING_KEY) === "true";
    
    if (!isOnboarded) {
        document.documentElement.classList.add("onboarding");
    }
    
    // Background sync: restore from chrome.storage.local if localStorage was cleared
    if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
    ) {
        chrome.storage.local.get([ONBOARDING_KEY], function (result) {
            if (result[ONBOARDING_KEY] === true && !isOnboarded) {
                // Restore to localStorage from chrome.storage
                localStorage.setItem(ONBOARDING_KEY, "true");
                // Reload to apply the restored state
                location.reload();
            }
        });
    }
})();
