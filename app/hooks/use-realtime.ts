"use client";

import { getSocket } from "@/lib/socket";
import { type Socket } from "socket.io-client";
import { useCallback, useEffect, useState } from "react";

/**
 * Realtime WebSocket Hook (lightweight).
 * Uses the singleton socket connection; reconnection is handled by socket.io.
 */
export function useRealtime() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onError = (err: Error) => setError(err.message);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("connect_error", onError);

    if (s.connected) {
      setIsConnected(true);
    }

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("connect_error", onError);
    };
  }, []);

  const subscribe = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: string, handler: (data: any) => void) => {
      if (!socket) return () => {};
      socket.on(event, handler);
      return () => {
        socket.off(event, handler);
      };
    },
    [socket]
  );

  const emit = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (event: string, data?: any) => {
      if (!socket?.connected) return;
      socket.emit(event, data);
    },
    [socket]
  );

  return {
    socket,
    isConnected,
    error,
    subscribe,
    emit,
  };
}
