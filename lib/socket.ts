"use client";

import { type Socket, io } from "socket.io-client";

/**
 * Singleton Socket.IO client.
 *
 * Socket.IO's built-in reconnection (reconnection: true, reconnectionAttempts: Infinity)
 * handles re-connection automatically. Application code only needs to subscribe/emit.
 */

const getSocketUrl = () => {
  if (typeof window === "undefined") return "";
  const host = process.env.NEXT_PUBLIC_API_URL?.replace(/^https?:\/\//, "") || "localhost:3000";
  return `${host}/realtime`;
};

const getAuth = () => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") ?? undefined : undefined;
  const sessionId =
    typeof window !== "undefined"
      ? sessionStorage.getItem("guest_session_id") ?? undefined
      : undefined;
  return { token, sessionId };
};

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), {
      auth: getAuth(),
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });
  }
  return socket;
}
