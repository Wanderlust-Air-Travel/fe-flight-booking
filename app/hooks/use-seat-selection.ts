"use client";
import type { SeatGroup, SeatItem } from "@/types/seat-type";
import { useCallback, useMemo, useState } from "react";

type SelectedSeat = { flightSeatId: string; seatNumber: string };

type UseSeatSelectionArgs = {
  seatBusiness: SeatGroup | null;
  seatEconomy: SeatGroup | null;
  maxSeats: number;
};

type UseSeatSelectionResult = {
  chooseBusiness: string[];
  chooseEconomy: string[];
  selectedSeats: SelectedSeat[];
  error: string | null;
  setError: (error: string | null) => void;
  handleToggle: (cabinType: "business" | "economy") => (seatId: string, checked: boolean) => void;
  reset: () => void;
};

const findSeat = (groups: Array<SeatGroup | null>, seatId: string): SeatItem | null => {
  const all = groups.flatMap((g) => g?.list ?? []);
  return (
    all.find((s) => s.flightSeatId === seatId) ??
    all.find(
      (s) =>
        `${s.seatNumber}-left` === seatId ||
        `${s.seatNumber}-right` === seatId ||
        s.idCabin === seatId
    ) ??
    null
  );
};

export function useSeatSelection({
  seatBusiness,
  seatEconomy,
  maxSeats,
}: UseSeatSelectionArgs): UseSeatSelectionResult {
  const [chooseBusiness, setChooseBusiness] = useState<string[]>([]);
  const [chooseEconomy, setChooseEconomy] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([]);
  const [error, setError] = useState<string | null>(null);

  const groups = useMemo(() => [seatBusiness, seatEconomy], [seatBusiness, seatEconomy]);

  const handleToggle = useCallback(
    (cabinType: "business" | "economy") => (seatId: string, checked: boolean) => {
      const seat = findSeat(groups, seatId);

      if (!seat?.flightSeatId) {
        setError("Seat not found. Please try selecting again.");
        return;
      }

      if (!seat.isSelectable || !seat.isAvailable) {
        setError("This seat is not available or selectable.");
        return;
      }

      if (checked) {
        if (selectedSeats.length >= maxSeats) {
          setError(
            `You can only select ${maxSeats} seat(s) for ${maxSeats} passenger(s). Infants do not require seats.`
          );
          return;
        }

        if (selectedSeats.some((s) => s.flightSeatId === seat.flightSeatId)) {
          return;
        }

        setSelectedSeats((prev) => [
          ...prev,
          { flightSeatId: seat.flightSeatId, seatNumber: seat.seatNumber },
        ]);
        setError(null);
      } else {
        setSelectedSeats((prev) =>
          prev.filter((s) => s.flightSeatId !== seat.flightSeatId)
        );
        setError(null);
      }

      if (cabinType === "business") {
        setChooseBusiness((prev) =>
          checked ? [...prev, seatId] : prev.filter((id) => id !== seatId)
        );
      } else {
        setChooseEconomy((prev) =>
          checked ? [...prev, seatId] : prev.filter((id) => id !== seatId)
        );
      }
    },
    [groups, maxSeats, selectedSeats]
  );

  const reset = useCallback(() => {
    setChooseBusiness([]);
    setChooseEconomy([]);
    setSelectedSeats([]);
    setError(null);
  }, []);

  return {
    chooseBusiness,
    chooseEconomy,
    selectedSeats,
    error,
    setError,
    handleToggle,
    reset,
  };
}
