"use client";

import { memo, useRef, useEffect } from "react";
import { SeatSection as SeatSectionType } from "@/app/utils/seat-utils";
import SeatRow from "./SeatRow";
import { SeatItem } from "@/types/seat-type";

interface SeatSectionProps {
  section: SeatSectionType;
  cabinType: "business" | "economy";
  selectedSeats: string[];
  onSeatToggle: (seatId: string, checked: boolean) => void;
  isSelectable: boolean;
  sectionId: string;
}

/**
 * Memoized SeatSection component that renders a group of rows
 * Uses intersection observer for lazy loading if needed
 */
const SeatSection = memo(function SeatSection({
  section,
  cabinType,
  selectedSeats,
  onSeatToggle,
  isSelectable,
  sectionId,
}: SeatSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={sectionRef}
      id={sectionId}
      className="mb-[2rem] scroll-mt-[2rem]"
    >
      {/* Section Header */}
      <div className="mb-[1rem] pb-[0.5rem] border-b border-[var(--cl-third)]">
        <h3 className="text-[1.4rem] font-bold text-[var(--cl-four)] uppercase">
          {section.name} Section (Rows {section.startRow} - {section.endRow})
        </h3>
      </div>

      {/* Rows */}
      <div className="space-y-[0.5rem]">
        {section.rows.map((row) => (
          <SeatRow
            key={`row-${row.rowNumber}`}
            row={row}
            cabinType={cabinType}
            selectedSeats={selectedSeats}
            onSeatToggle={onSeatToggle}
            isSelectable={isSelectable}
          />
        ))}
      </div>
    </div>
  );
});

SeatSection.displayName = "SeatSection";

export default SeatSection;

