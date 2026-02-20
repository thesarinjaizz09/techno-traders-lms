import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function SkeletonMessage({ reverse }: { reverse: boolean }) {
    return (
        <div className={`flex gap-2.5 ${reverse ? "flex-row-reverse" : ""}`}>
            <Avatar className="size-8 rounded-sm">
                <AvatarFallback className="animate-pulse bg-muted" />
            </Avatar>

            <div className="w-72 space-y-2 rounded-sm border bg-muted/40 p-3 animate-pulse">
                <div className="h-3 w-24 rounded bg-muted-foreground/20" />
                <div className="h-8 w-full rounded bg-muted-foreground/20" />
            </div>
        </div>
    );
}