"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import { createSocket, destroySocket } from "@/lib/socket";
import { useCurrentUser } from "@/features/users/hooks/use-users";

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

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // ⛔️ Wait until auth is resolved
    if (isLoading) return;

    // ⛔️ No user → ensure socket is disconnected
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        destroySocket();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    // ✅ User exists → ensure socket is connected
    if (!socketRef.current) {
      const socket = createSocket(); // no token needed
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
    }

    return () => {
      // cleanup on unmount only
    };
  }, [user, isLoading]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
