// providers/socket-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket, destroySocket } from "@/lib/socket";
import { getSession } from "@/lib/auth/client";

type SocketContextValue = {
    socket: Socket | null;
    connected: boolean;
};

const SocketContext = createContext<SocketContextValue>({
    socket: null,
    connected: false,
});

function extractToken(value: unknown): string | null {
    if (!value || typeof value !== "object") return null;

    const record = value as Record<string, unknown>;

    if (record.data && typeof record.data === "object") {
        return extractToken(record.data);
    }

    if (typeof record.token === "string") {
        return record.token;
    }

    if (record.session && typeof record.session === "object") {
        const sessionRecord = record.session as Record<string, unknown>;
        if (typeof sessionRecord.token === "string") {
            return sessionRecord.token;
        }
    }

    return null;
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        (async () => {
            const session = await getSession();
            if (!mounted) return;
            setToken(extractToken(session));
        })();

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        if (!token) return;

        const s = createSocket(token);
        setSocket(s);

        s.connect(); // manual connect

        s.on("connect", () => {
            console.log("Socket connected", s.id);
            setConnected(true);
        });

        s.on("disconnect", () => {
            console.log("Socket disconnected");
            setConnected(false);
        });

        s.on("connect_error", (err) => {
            console.error("Socket connect error:", err.message);
            setConnected(false);
        });

        return () => {
            destroySocket();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, connected }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    return useContext(SocketContext);
}
