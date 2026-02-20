"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket, destroySocket } from "@/lib/socket";
import { useCurrentUser } from "@/features/users/hooks/use-users";
import { useAuthReset } from "./auth-reset-provider";


type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
});

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useCurrentUser();
  const { version } = useAuthReset();

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // HARD RESET on auth version change
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      destroySocket();
      socketRef.current = null;
      setConnected(false);
    }

    if (isLoading || !user) return;

    const socket = createSocket({
      token: user.sessions?.[0]?.token,
    });

    socketRef.current = socket;
    socket.connect();

    socket.on("connect", () => {
      console.log("✅ Socket connected", socket.id);
      setConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setConnected(false);
    });

    socket.on("connect_error", (err) => {
      console.error("🔥 Socket connect error:", err.message);
      setConnected(false);
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
      destroySocket();
      socketRef.current = null;
    };
  }, [user, isLoading, version]); // version forces teardown

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
