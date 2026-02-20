'use client'

import { Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBecomeMember } from "@/features/users/hooks/use-users";
import { Spinner } from "@/components/ui/spinner";
import { useSocket } from "@/providers/socket-provider";

export function MemberProtectionBanner() {
    const { socket } = useSocket();
    const { mutate: becomeMember, isPending } = useBecomeMember();

    const registerMember = () => {
        if (isPending) return;

        becomeMember(
            undefined,
            {
                onSuccess: (message) => {
                    if (socket) {
                        socket.emit("private:message:new", { message });
                    }
                },
            },
        );
    }

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <div className="w-full max-w-md rounded-sm border border-white/10 bg-[#0f1115] p-6 shadow-2xl">
                <div className="flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className="flex size-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400">
                        <Lock className="size-6" />
                    </div>

                    {/* Title */}
                    <h3 className="text-sm font-semibold tracking-wide text-foreground">
                        Members-only channel
                    </h3>

                    {/* Description */}
                    <p className="text-xs leading-relaxed text-muted-foreground">
                        This conversation is available exclusively to verified members.
                        Join the community to participate in real-time discussions,
                        share insights, and connect with others.
                    </p>

                    {/* CTA */}
                    <div className="grid w-full grid-cols-2 gap-2 pt-2">
                        <Button className="gap-2" onClick={registerMember} disabled={isPending}>
                            {
                                isPending ? <Spinner className="size-4" /> : <ShieldCheck className="size-4" />
                            }

                            {
                                isPending ? "Registering member..." : "Become a member"
                            }
                        </Button>

                        <Button variant="outline" className="text-muted-foreground">
                            Learn more
                        </Button>
                    </div>

                    {/* Subtle hint */}
                    <p className="pt-1 text-[11px] text-muted-foreground">
                        Membership unlocks private channels, live chat, and more.
                    </p>
                </div>
            </div>
        </div>
    );
}
