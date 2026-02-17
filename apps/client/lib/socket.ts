// lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function createSocket() {
  if (socket) return socket;

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
    transports: ["websocket"],
    withCredentials: true,
    autoConnect: false, // critical
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
