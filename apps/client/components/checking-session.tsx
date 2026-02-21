// components/auth/CheckingSession.tsx
"use client";

import { Loader2 } from "lucide-react";

export default function CheckingSession() {
    return (
        <div className="w-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/30 p-8 rounded-lg shadow-lg animate-fade-in border border-muted/50">
            {/* Animated orbiting circles */}


            <div className="relative flex items-center mb-3 gap-2">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="size-5 rounded-full border border-primary/20 animate-ping-slow opacity-40" />
                    </div>
                    <div className="relative flex size-4 items-center justify-center rounded-full bg-primary/10 border border-primary/30 shadow-xl">
                        <Loader2 className="size-4 text-primary animate-spin" />
                    </div>
                </div>
                <p className="text-md font-semibold text-muted-foreground">
                    Verifying your session...
                </p>
            </div>

            <p className="text-sm text-muted-foreground/80 max-w-xs text-center">
                Ensuring secure access to your trading dashboard and community
            </p>

            {/* Tiny animated dots */}
            <div className="mt-8 flex gap-2">
                <div className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
                <div className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
                <div className="size-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
            </div>
        </div>
    );
}

