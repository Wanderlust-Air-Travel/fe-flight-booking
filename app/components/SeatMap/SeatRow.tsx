"use client";

import type { SeatRowProps } from "@/types/seat-map-component-type";
import type { SeatItem } from "@/types/seat-type";
import { memo } from "react";

/**
 * Memoized SeatRow component for optimal rendering performance
 * Only re-renders when props change
 */
const SeatRow = memo(function SeatRow({
  row,
  cabinType,
  selectedSeats,
  onSeatToggle,
  isSelectable: sectionSelectable,
}: SeatRowProps) {
  const renderSeat = (seat: SeatItem, side: "left" | "right") => {
    // CRITICAL: Always use flightSeatId as the primary identifier
    // If flightSeatId is missing, use fallback but log warning
    if (!seat.flightSeatId) {
      console.warn(
        `[SeatRow] Seat ${seat.seatNumber} (${side}) missing flightSeatId. Using fallback ID.`
      );
    }
    // Use flightSeatId as primary, fallback to generated ID for display/tracking
    const seatId = seat.flightSeatId || `${seat.seatNumber}-${side}`;
    const seatSelectable =
      seat.isSelectable !== false && seat.isAvailable && sectionSelectable && !!seat.flightSeatId; // Disable if no flightSeatId
    // CRITICAL: Check if seat is selected by seatNumber (for display) or by flightSeatId (for logic)
    // This ensures deselect works correctly
    // Ensure isSelected is always a boolean (not boolean | "")
    const isSelected = Boolean(
      selectedSeats.includes(seat.seatNumber) ||
        (seat.flightSeatId && selectedSeats.includes(seat.flightSeatId))
    );
    const isOccupied = !seat.isAvailable;

    const baseClasses =
      "rounded-[0.5rem] overflow-hidden p-[0.5rem] w-full bg-[var(--cl-seven)] text-[1.2rem] font-bold flex flex-col text-center justify-center items-center uppercase transition ease-linear";

    const colorClasses =
      cabinType === "business"
        ? "text-[var(--cl-pri)] hover:bg-[var(--cl-pri)] hover:text-white"
        : "text-[var(--cl-five)] hover:bg-[var(--cl-five)] hover:text-white";

    const stateClasses = isSelected
      ? cabinType === "business"
        ? "!bg-[var(--cl-pri)] !text-white"
        : "!bg-[var(--cl-five)] !text-white"
      : isOccupied
        ? "!bg-gray-400 !text-white opacity-75"
        : "";

    const disabledClasses = seatSelectable ? "cursor-pointer" : "opacity-50 pointer-events-none";

    const widthClass = cabinType === "business" ? "w-[calc(100%/2)]" : "w-[calc(100%/3)]";
    const heightClass = cabinType === "business" ? "h-[6rem]" : "h-[5rem]";

    return (
      <label
        key={seatId}
        htmlFor={seatId}
        className={`${widthClass} block flex-shrink-0 px-[0.15rem] ${disabledClasses}`}
      >
        <input
          type="checkbox"
          id={seatId}
          name={`choose${cabinType === "business" ? "Business" : "Economy"}`}
          checked={isSelected}
          onChange={(e) => onSeatToggle(seatId, e.target.checked)}
          disabled={!seatSelectable}
          className="hidden"
        />
        <span className={`${baseClasses} ${colorClasses} ${stateClasses} ${heightClass}`}>
          <span>{seat.seatNumber}</span>
          {seat.note && <span className="text-[1rem] font-medium">{seat.note}</span>}
        </span>
      </label>
    );
  };

  return (
    <div className="flex gap-[1rem] justify-between mb-[1rem] items-start">
      {/* Left Side Seats */}
      <div className="flex flex-wrap gap-y-[0.5rem] -mx-[0.15rem] flex-1">
        {row.leftSeats.map((seat) => renderSeat(seat, "left"))}
      </div>

      {/* Row Number Label (Centered) */}
      <div className="flex items-center justify-center w-[2rem] flex-shrink-0">
        <span className="text-[1rem] font-bold text-[var(--cl-four)]">{row.rowNumber}</span>
      </div>

      {/* Right Side Seats */}
      <div className="flex flex-wrap gap-y-[0.5rem] -mx-[0.15rem] flex-1">
        {row.rightSeats.map((seat) => renderSeat(seat, "right"))}
      </div>
    </div>
  );
});

SeatRow.displayName = "SeatRow";

export default SeatRow;
