"use client";

import { divideRowsIntoSections, groupSeatsByRow } from "@/app/utils/seat-utils";
import type { CabinSectionProps } from "@/types/seat-map-component-type";
import type { SeatSection as SeatSectionType } from "@/types/seat-utils-type";
import { memo, useMemo } from "react";
import SeatSection from "./SeatSection";

/**
 * Memoized CabinSection component that handles a full cabin (business or economy)
 * Optimizes data processing with useMemo
 */
const CabinSection = memo(function CabinSection({
  seatGroup,
  cabinType,
  selectedSeats,
  onSeatToggle,
  isSelectable,
}: CabinSectionProps) {
  // Memoize row grouping and sectioning for performance
  const sections = useMemo<SeatSectionType[]>(() => {
    if (!seatGroup?.list || seatGroup.list.length === 0) {
      return [];
    }

    const rows = groupSeatsByRow(seatGroup.list);
    return divideRowsIntoSections(rows);
  }, [seatGroup?.list]);

  if (!seatGroup || sections.length === 0) {
    return null;
  }

  return (
    <div
      className={`w-full bg-[#F5F7FA] rounded-md p-[1.2rem] ${
        isSelectable ? "" : "opacity-50 pointer-events-none"
      }`}
    >
      {/* Cabin Type Header */}
      <div className="mb-[1.5rem] pb-[0.8rem] border-b-2 border-[var(--cl-third)]">
        <h2 className="text-[1.6rem] font-bold uppercase text-center">
          {cabinType === "business" ? (
            <span className="text-[var(--cl-pri)]">Business Class</span>
          ) : (
            <span className="text-[var(--cl-five)]">Economy Class</span>
          )}
        </h2>
      </div>

      {/* Sections */}
      <div className="space-y-[2rem]">
        {sections.map((section) => (
          <SeatSection
            key={`${cabinType}-${section.name}`}
            section={section}
            cabinType={cabinType}
            selectedSeats={selectedSeats}
            onSeatToggle={onSeatToggle}
            isSelectable={isSelectable}
            sectionId={`${cabinType}-${section.name}`}
          />
        ))}
      </div>
    </div>
  );
});

CabinSection.displayName = "CabinSection";

export default CabinSection;
