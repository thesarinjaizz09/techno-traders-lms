// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function createSocket({token}: {token?: string}) {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    auth: { token },
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true, // critical
    reconnection: true,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function destroySocket() {
  if (socket) {
    socket.disconnect();
    socket.removeAllListeners();
    socket = null;
  }
}
