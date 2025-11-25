import { SeatItem } from "@/types/seat-type";

/**
 * Extract row number from seat number (e.g., "10A" -> 10, "21B" -> 21)
 */
export function extractRowNumber(seatNumber: string): number {
  const match = seatNumber.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Extract seat letter from seat number (e.g., "10A" -> "A", "21B" -> "B")
 */
export function extractSeatLetter(seatNumber: string): string {
  const match = seatNumber.match(/^\d+([A-Z])/);
  return match ? match[1] : "";
}

/**
 * Group seats by row number for efficient rendering
 */
export interface SeatRow {
  rowNumber: number;
  seats: SeatItem[];
  leftSeats: SeatItem[];
  rightSeats: SeatItem[];
}

export function groupSeatsByRow(seats: SeatItem[]): SeatRow[] {
  // Group by row number
  const rowMap = new Map<number, SeatItem[]>();
  
  seats.forEach((seat) => {
    const rowNumber = extractRowNumber(seat.seatNumber);
    if (!rowMap.has(rowNumber)) {
      rowMap.set(rowNumber, []);
    }
    rowMap.get(rowNumber)!.push(seat);
  });

  // Convert to array and sort by row number
  const rows: SeatRow[] = Array.from(rowMap.entries())
    .map(([rowNumber, seats]) => {
      // Sort seats by letter (A, B, C, D, E, F)
      const sortedSeats = [...seats].sort((a, b) => {
        const letterA = extractSeatLetter(a.seatNumber);
        const letterB = extractSeatLetter(b.seatNumber);
        return letterA.localeCompare(letterB);
      });

      // Split into left and right
      const leftSeats = sortedSeats.filter((s) => s.position === "left");
      const rightSeats = sortedSeats.filter((s) => s.position === "right");

      return {
        rowNumber,
        seats: sortedSeats,
        leftSeats,
        rightSeats,
      };
    })
    .sort((a, b) => a.rowNumber - b.rowNumber);

  return rows;
}

/**
 * Divide rows into sections (front, middle, back) for better UX
 */
export interface SeatSection {
  name: "front" | "middle" | "back";
  rows: SeatRow[];
  startRow: number;
  endRow: number;
}

export function divideRowsIntoSections(rows: SeatRow[]): SeatSection[] {
  if (rows.length === 0) return [];

  const totalRows = rows.length;
  const frontCount = Math.ceil(totalRows * 0.3); // 30% front
  const middleCount = Math.ceil(totalRows * 0.4); // 40% middle
  // Remaining goes to back

  const front = rows.slice(0, frontCount);
  const middle = rows.slice(frontCount, frontCount + middleCount);
  const back = rows.slice(frontCount + middleCount);

  const sections: SeatSection[] = [];

  if (front.length > 0) {
    sections.push({
      name: "front",
      rows: front,
      startRow: front[0].rowNumber,
      endRow: front[front.length - 1].rowNumber,
    });
  }

  if (middle.length > 0) {
    sections.push({
      name: "middle",
      rows: middle,
      startRow: middle[0].rowNumber,
      endRow: middle[middle.length - 1].rowNumber,
    });
  }

  if (back.length > 0) {
    sections.push({
      name: "back",
      rows: back,
      startRow: back[0].rowNumber,
      endRow: back[back.length - 1].rowNumber,
    });
  }

  return sections;
}

/**
 * Filter seats by selectability and availability
 */
export function filterSelectableSeats(seats: SeatItem[]): SeatItem[] {
  return seats.filter(
    (seat) => seat.isSelectable !== false && seat.isAvailable
  );
}

