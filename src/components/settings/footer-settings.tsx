function FooterSettings() {
    return (
        <div className="text-center py-4 space-y-1">
            <p className="text-xs text-muted-foreground/60">
                Kiwi Tab v{__APP_VERSION__}
            </p>
            <p className="text-xs text-muted-foreground/60">
                Made with ❤️ in Bangladesh!
            </p>
            <p className="text-xs text-muted-foreground/60">By Kaiyum Mirza.</p>
            <button
                onClick={() => {
                    if (
                        confirm(
                            "This will reset all settings and reload the page. Continue?",
                        )
                    ) {
                        localStorage.clear();
                        window.location.reload();
                    }
                }}
                className="text-xs text-primary hover:text-foreground mt-2 cursor-pointer"
            >
                Reset Settings
            </button>
        </div>
    );
}

export { FooterSettings };
