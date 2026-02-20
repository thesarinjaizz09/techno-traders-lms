import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useSocket } from "@/providers/socket-provider";

export function ChatConnectionBanner() {
    const { connected, isConnecting, reconnect } = useSocket();

    if (connected) return null;

    return (
        <div className="flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full rounded-sm border border-white/10 bg-[#0f1115] p-3 shadow-xl">
                <div className="flex items-center justify-between text-center gap-4">
                    {isConnecting ? (
                        <>
                            <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2 text-amber-400">
                                    <Spinner className="size-4" />
                                    <span className="text-sm font-semibold">
                                        Retrying Connection
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    We are trying to establish a real-time connection.
                                    Please wait.
                                </p>
                            </div>

                            <Button
                                disabled
                                size="sm"
                                className="gap-2 text-xs"
                                variant="secondary"
                            >
                                <Spinner className="size-3.5" />
                                Connecting...
                            </Button>
                        </>
                    ) : (
                        <>
                            <div className="flex flex-col items-start gap-1">
                                <div className="flex items-center gap-2 text-rose-400">
                                    <AlertTriangle className="size-5" />
                                    <span className="text-sm font-semibold">
                                        Connection failed
                                    </span>
                                </div>

                                <p className="text-xs text-muted-foreground">
                                    We couldn’t establish a real-time connection.
                                    This may be due to network issues or server downtime.
                                </p>
                            </div>

                            <Button
                                onClick={reconnect}
                                size="sm"
                                className="gap-2 text-xs"
                                variant="secondary"
                            >
                                <RefreshCcw className="size-3.5" />
                                Reconnect
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
