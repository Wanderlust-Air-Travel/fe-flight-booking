"use client";

import type {
  ReservationCountdownExpiredEvent,
  ReservationCountdownUpdateEvent,
} from "@/types/realtime-types";
import { useCallback, useEffect, useState } from "react";
import { useRealtime } from "./use-realtime";

/**
 * Hook for subscribing to reservation countdown timer
 * High Priority: Business critical - syncs countdown from server
 */
export function useReservationCountdown(reservationId: string | null) {
  const { socket, isConnected, subscribe, emit } = useRealtime();
  const [countdown, setCountdown] = useState<ReservationCountdownUpdateEvent | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  /**
   * Subscribe to reservation countdown updates
   */
  const subscribeToCountdown = useCallback(() => {
    if (!reservationId || !isConnected || !socket) return;

    emit("subscribe:reservation-countdown", { reservationId });

    // Listen for subscription confirmation
    const unsubscribeConfirm = subscribe("subscribed:reservation-countdown", (data) => {
      if (data.reservationId === reservationId) {
        setIsSubscribed(true);
      }
    });

    // Listen for countdown updates
    const unsubscribeUpdate = subscribe(
      "reservation-countdown:update",
      (data: ReservationCountdownUpdateEvent) => {
        if (data.reservationId === reservationId) {
          setCountdown(data);
        }
      }
    );

    // Listen for expiration event
    const unsubscribeExpired = subscribe(
      "reservation-countdown:expired",
      (data: ReservationCountdownExpiredEvent) => {
        if (data.reservationId === reservationId) {
          setCountdown((prev) => (prev ? { ...prev, remainingSeconds: 0, isExpired: true } : null));
        }
      }
    );

    return () => {
      unsubscribeConfirm();
      unsubscribeUpdate();
      unsubscribeExpired();
    };
  }, [reservationId, isConnected, socket, emit, subscribe]);

  /**
   * Unsubscribe from reservation countdown updates
   */
  const unsubscribeFromCountdown = useCallback(() => {
    if (!reservationId || !isConnected || !socket) return;

    emit("unsubscribe:reservation-countdown", { reservationId });

    // Listen for unsubscription confirmation
    const unsubscribeConfirm = subscribe("unsubscribed:reservation-countdown", (data) => {
      if (data.reservationId === reservationId) {
        setIsSubscribed(false);
      }
    });

    return unsubscribeConfirm;
  }, [reservationId, isConnected, socket, emit, subscribe]);

  // Auto-subscribe when reservationId is available and connected
  useEffect(() => {
    if (!reservationId || !isConnected) {
      setIsSubscribed(false);
      setCountdown(null);
      return;
    }

    const cleanup = subscribeToCountdown();

    return () => {
      if (cleanup) cleanup();
      unsubscribeFromCountdown();
    };
  }, [reservationId, isConnected, subscribeToCountdown, unsubscribeFromCountdown]);

  /**
   * Format remaining seconds to MM:SS
   */
  const formatCountdown = useCallback((seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }, []);

  return {
    isSubscribed,
    countdown,
    remainingSeconds: countdown?.remainingSeconds ?? 0,
    isExpired: countdown?.isExpired ?? false,
    formattedCountdown: countdown ? formatCountdown(countdown.remainingSeconds) : "00:00",
    subscribe: subscribeToCountdown,
    unsubscribe: unsubscribeFromCountdown,
  };
}
