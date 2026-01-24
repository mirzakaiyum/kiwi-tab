import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronRight } from "lucide-react";

const NAME_STORAGE_KEY = "kiwi-name";

interface OnboardingProps {
    onComplete: () => void;
}

function StepIndicator({ currentStep }: { currentStep: number }) {
    return (
        <div className="flex gap-2 mb-8">
            {[1, 2, 3].map((step) => (
                <div
                    key={step}
                    className={`h-2 w-12 rounded-full transition-all duration-300 ${
                        step === currentStep
                            ? "bg-primary"
                            : step < currentStep
                            ? "bg-primary/80"
                            : "bg-foreground/20"
                    }`}
                />
            ))}
        </div>
    );
}

function StepOne({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Instructions - Left */}
            <div className="flex-1 text-left space-y-4">
                <h2 className="text-4xl font-bold">Keep Your New Tab</h2>
                <p className="text-foreground/70 text-lg leading-relaxed">
                    When it asks if you want to keep the changes, click{" "}
                    <span className="font-semibold text-foreground">
                        "Keep Changes"
                    </span>{" "}
                    to use Kiwi Tab as your new tab page.
                </p>
                <Button
                    onClick={onNext}
                    size="lg"
                    className="gap-2 mt-6 rounded-full font-semibold"
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Screenshot - Right */}
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-border/30">
                <img
                    src="/onboarding/onboarding-keep-changes.png"
                    alt="Chrome Keep Changes popup"
                    className="w-full"
                />
            </div>
        </div>
    );
}

function StepTwo({ onNext }: { onNext: () => void }) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Instructions - Left */}
            <div className="flex-1 text-left space-y-4">
                <h2 className="text-4xl font-semibold">Customize Your Space</h2>
                <p className="text-foreground/70 text-lg leading-relaxed">
                    Right-click on empty space at the bottom to access the
                    context menu. You can use it to{" "}
                    <span className="font-semibold text-foreground">
                        hide the footer
                    </span>{" "}
                    .
                </p>
                <Button
                    onClick={onNext}
                    size="lg"
                    className="gap-2 mt-6 rounded-full font-semibold"
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>

            {/* Screenshot - Right */}
            <div className="flex-1 rounded-xl overflow-hidden shadow-2xl border border-border/30">
                <img
                    src="/onboarding/onboarding-hide-footer.png"
                    alt="Right-click menu with Hide Footer option"
                    className="w-full"
                />
            </div>
        </div>
    );
}

function StepThree({ onComplete }: { onComplete: (name: string) => void }) {
    const [name, setName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onComplete(name.trim());
    };

    return (
        <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="mb-6 text-6xl">👋</div>
            <h2 className="text-4xl font-semibold mb-3">
                What should we call you?
            </h2>
            <p className="text-foreground/70 text-lg mb-8 max-w-md">
                Enter your name you prefer to be called.
            </p>
            <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
                <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className="text-center text-lg h-12 bg-background/50 backdrop-blur-sm"
                    autoFocus
                />
                <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 rounded-full font-semibold"
                >
                    Continue <Check className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(1);

    const handleStepThreeComplete = (name: string) => {
        // Save name to localStorage (if provided)
        if (name) {
            localStorage.setItem(NAME_STORAGE_KEY, name);
        }

        // Dual-storage pattern: Save to BOTH localStorage (instant sync) AND chrome.storage.local (backup)
        // localStorage provides instant synchronous access on next page load
        localStorage.setItem("kiwi-onboarded", "true");

        // chrome.storage.local provides persistence even if localStorage is cleared
        if (typeof chrome !== "undefined" && chrome.storage?.local) {
            chrome.storage.local.set({ "kiwi-onboarded": true });
        }

        document.documentElement.classList.remove("onboarding");

        // Notify other components
        window.dispatchEvent(new Event("kiwi-settings-changed"));
        // Complete onboarding
        onComplete();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: "url(/onboarding/onboarding-bg.jpg)",
                }}
            />

            {/* Content card with backdrop blur */}
            <div className="relative z-10 flex flex-col items-center p-8 md:p-12 rounded-2xl bg-ring/20 backdrop-blur-2xl border border-border/20 shadow-2xl max-w-5xl mx-4 w-full">
                <StepIndicator currentStep={currentStep} />

                {currentStep === 1 && (
                    <StepOne onNext={() => setCurrentStep(2)} />
                )}
                {currentStep === 2 && (
                    <StepTwo onNext={() => setCurrentStep(3)} />
                )}
                {currentStep === 3 && (
                    <StepThree onComplete={handleStepThreeComplete} />
                )}
            </div>
        </div>
    );
}

export default Onboarding;
