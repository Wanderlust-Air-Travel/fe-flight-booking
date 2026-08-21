/**
 * Utility functions for passenger type determination and validation
 * Mirrors backend logic in be-flight-booking/src/shared/utils/passenger-type.util.ts
 */

export type PassengerType = "ADT" | "CHD" | "INF";

/**
 * Calculate age in years from date of birth to a specific date
 * @param dob Date of birth (Date object or string in YYYY-MM-DD format)
 * @param referenceDate Reference date (default: today). Usually the flight departure date
 * @returns Age in years
 */
export function calculateAge(dob: Date | string, referenceDate: Date = new Date()): number {
  const today = new Date(referenceDate);
  const birthDate = typeof dob === "string" ? new Date(dob) : new Date(dob);

  if (Number.isNaN(birthDate.getTime())) {
    return -1; // Invalid date
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Determine passenger type based on age at flight date
 * - INF: Under 2 years old (has not reached 2nd birthday)
 * - CHD: 2 to under 12 years old (has reached 2nd birthday but not 12th birthday)
 * - ADT: 12 years old and above (has reached 12th birthday)
 *
 * @param dob Date of birth (Date object or string in YYYY-MM-DD format)
 * @param flightDate Flight departure date (reference date for age calculation)
 * @returns PassengerType or null if invalid date
 */
export function determinePassengerType(dob: Date | string, flightDate: Date): PassengerType | null {
  const age = calculateAge(dob, flightDate);

  if (age < 0) {
    return null; // Invalid date
  }

  if (age < 2) {
    return "INF";
  }
  if (age < 12) {
    return "CHD";
  }
  return "ADT";
}

/**
 * Check if a passenger is an adult (18+ years old) at flight date
 * Used to validate if an adult can accompany an infant
 *
 * @param dob Date of birth (Date object or string in YYYY-MM-DD format)
 * @param flightDate Flight departure date
 * @returns true if passenger is 18 or older, false otherwise
 */
export function isAdult(dob: Date | string, flightDate: Date): boolean {
  const age = calculateAge(dob, flightDate);
  return age >= 18;
}

/**
 * Get flight date from ticket data or use current date as fallback
 * @param ticketData Ticket data from Zustand store
 * @returns Flight departure date
 */
export function getFlightDate(ticketData: { startDate?: string; [key: string]: any }): Date {
  if (ticketData?.startDate) {
    const flightDate = new Date(ticketData.startDate);
    if (!Number.isNaN(flightDate.getTime())) {
      return flightDate;
    }
  }
  // Fallback to current date if no flight date available
  return new Date();
}
