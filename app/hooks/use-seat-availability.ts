"use client";

import type { SeatAvailabilityChange, SeatAvailabilityUpdateEvent } from "@/types/realtime-types";
import type { SeatItem } from "@/types/seat-type";
import { useCallback, useEffect, useState } from "react";
import { useRealtime } from "./use-realtime";

/**
 * Hook for subscribing to seat availability updates
 * High Priority: Prevents seat selection conflicts
 */
export function useSeatAvailability(flightInstanceId: string | null) {
  const { socket, isConnected, subscribe, emit } = useRealtime();
  const [seatChanges, setSeatChanges] = useState<SeatAvailabilityChange[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);

  /**
   * Subscribe to seat availability updates
   */
  const subscribeToSeatAvailability = useCallback(() => {
    if (!flightInstanceId || !isConnected || !socket) return;

    emit("subscribe:seat-availability", { flightInstanceId });

    // Listen for subscription confirmation
    const unsubscribeConfirm = subscribe("subscribed:seat-availability", (data) => {
      if (data.flightInstanceId === flightInstanceId) {
        setIsSubscribed(true);
      }
    });

    // Listen for seat availability updates
    const unsubscribeUpdate = subscribe(
      "seat-availability:update",
      (data: SeatAvailabilityUpdateEvent) => {
        if (data.flightInstanceId === flightInstanceId) {
          setSeatChanges((prev) => [...prev, ...data.changes]);
        }
      }
    );

    return () => {
      unsubscribeConfirm();
      unsubscribeUpdate();
    };
  }, [flightInstanceId, isConnected, socket, emit, subscribe]);

  /**
   * Unsubscribe from seat availability updates
   */
  const unsubscribeFromSeatAvailability = useCallback(() => {
    if (!flightInstanceId || !isConnected || !socket) return;

    emit("unsubscribe:seat-availability", { flightInstanceId });

    // Listen for unsubscription confirmation
    const unsubscribeConfirm = subscribe("unsubscribed:seat-availability", (data) => {
      if (data.flightInstanceId === flightInstanceId) {
        setIsSubscribed(false);
      }
    });

    return unsubscribeConfirm;
  }, [flightInstanceId, isConnected, socket, emit, subscribe]);

  // Auto-subscribe when flightInstanceId is available and connected
  useEffect(() => {
    if (!flightInstanceId || !isConnected) {
      setIsSubscribed(false);
      return;
    }

    const cleanup = subscribeToSeatAvailability();

    return () => {
      if (cleanup) cleanup();
      unsubscribeFromSeatAvailability();
    };
  }, [flightInstanceId, isConnected, subscribeToSeatAvailability, unsubscribeFromSeatAvailability]);

  /**
   * Apply seat changes to seat map
   * This function updates the seat status based on real-time changes
   */
  const applySeatChanges = useCallback(
    (seats: SeatItem[]): SeatItem[] => {
      if (seatChanges.length === 0) return seats;

      return seats.map((seat) => {
        const change = seatChanges.find(
          (c) => c.flightSeatId === seat.flightSeatId || c.seatNumber === seat.seatNumber
        );

        if (change) {
          return {
            ...seat,
            is_available: change.status === "available",
            // You can add more status fields here if needed
          };
        }

        return seat;
      });
    },
    [seatChanges]
  );

  /**
   * Clear seat changes (after applying them)
   */
  const clearSeatChanges = useCallback(() => {
    setSeatChanges([]);
  }, []);

  return {
    isSubscribed,
    seatChanges,
    applySeatChanges,
    clearSeatChanges,
    subscribe: subscribeToSeatAvailability,
    unsubscribe: unsubscribeFromSeatAvailability,
  };
}
