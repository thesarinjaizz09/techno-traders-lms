import { MessageSquare, TrendingUp } from "lucide-react";
import { channels } from "../utils";

export function EmptyState({
    channel,
    setComposer,
    textareaRef
}: {
    channel: (typeof channels)[number] | null;
    setComposer: (content: string) => void;
    textareaRef: React.RefObject<HTMLTextAreaElement | null>;
}) {
    return (
        <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center animate-fade-in">
            {/* Subtle background gradient circle */}
            <div className="relative mb-6">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 blur-xl opacity-70" />
                <div className="relative size-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border border-primary/30 shadow-sm">
                    <MessageSquare className="size-7 text-primary/70" strokeWidth={1.5} />
                </div>
            </div>

            {/* Main heading */}
            <h3 className="text-lg font-semibold text-foreground mb-2">
                Welcome to #{channel?.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                This is the start of the <span className="font-medium text-foreground">#{channel?.name}</span> conversation.<br />
                Say hi, share a trade idea, or ask a question — the floor is yours!
            </p>

            {/* Spark conversation prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg mb-8">
                <button
                    onClick={() => {
                        setComposer("Hey everyone! What's the market vibe today? 🚀");
                        textareaRef?.current?.focus();
                    }}
                    className="flex items-center gap-3 rounded-sm border bg-card/50 px-4 py-3 text-sm hover:bg-accent/50 transition-colors text-left group"
                >
                    <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="size-3.5 text-primary" />
                    </div>
                    <div>
                        <p className="font-medium group-hover:text-primary transition-colors">Say hi to the community</p>
                        <p className="text-xs text-muted-foreground">Break the ice</p>
                    </div>
                </button>

                <button
                    onClick={() => {
                        setComposer("Just spotted a setup on [asset]... thoughts? 📈");
                        textareaRef?.current?.focus();
                    }}
                    className="flex items-center gap-3 rounded-sm border bg-card/50 px-4 py-3 text-sm hover:bg-accent/50 transition-colors text-left group"
                >
                    <div className="size-9 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="size-4 text-emerald-500" />
                    </div>
                    <div>
                        <p className="font-medium group-hover:text-emerald-600 transition-colors">Share a trade idea</p>
                        <p className="text-xs text-muted-foreground">Start the discussion</p>
                    </div>
                </button>
            </div>

            {/* Subtle footer encouragement */}
            <p className="text-xs text-muted-foreground/70 italic">
                First message gets the floor 🔥
            </p>
        </div>
    );
}
