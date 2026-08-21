/**
 * Booking Utilities - Business logic helpers
 * Separates business logic from UI components
 */

import type { PassengerFormData } from "@/types/booking-form-type";

/**
 * Calculate default DOB based on passenger type and flight date
 * @param passengerType - ADT, CHD, or INF
 * @param flightDate - Flight departure date
 * @returns DOB string in YYYY-MM-DD format
 */
export function getDefaultDOB(passengerType: string, flightDate: Date): string {
  const flightDateCopy = new Date(flightDate);

  switch (passengerType) {
    case "ADT":
      // Adult: 18 years old at flight date (ensures >= 12 and can accompany infants)
      flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 18);
      break;
    case "CHD":
      // Child: 6 years old at flight date (middle of 2-11 range)
      flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 6);
      break;
    case "INF":
      // Infant: 1 year old at flight date (ensures < 2 years)
      flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 1);
      break;
    default:
      // Default to ADT if unknown type
      flightDateCopy.setFullYear(flightDateCopy.getFullYear() - 18);
  }

  // Format as YYYY-MM-DD
  const year = flightDateCopy.getFullYear();
  const month = String(flightDateCopy.getMonth() + 1).padStart(2, "0");
  const day = String(flightDateCopy.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * Initialize passengers array based on number of passengers
 */
export function initializePassengers(numberOfPassengers: number): PassengerFormData[] {
  const passengers: PassengerFormData[] = [];

  for (let i = 0; i < numberOfPassengers; i++) {
    passengers.push({
      passengerType: "ADT", // Default to ADT, user can change
      fullname: "",
      dob: "",
      gender: "",
      documentNumber: "",
      loyaltyNumber: "",
      isCurrentUser: false, // Will be set by user selection
    });
  }

  return passengers;
}

/**
 * Transform booking form data to API request format
 */
export function transformBookingData(values: any) {
  return {
    passengers: values.passengers.map((p: any) => {
      // Build passenger object
      // ADT requires documentNumber, CHD and INF do not need it (field is hidden)
      const passengerData: any = {
        passengerType: p.passengerType,
        fullname: p.fullname,
        dob: p.dob,
        gender: p.gender,
        loyaltyNumber: p.loyaltyNumber,
      };

      // Only include documentNumber for ADT passengers
      // CHD and INF: field is hidden, so documentNumber should not be sent
      if (p.passengerType === "ADT" && p.documentNumber && p.documentNumber.trim().length > 0) {
        passengerData.documentNumber = p.documentNumber.trim();
      }
      // For CHD and INF, documentNumber is not included in the request

      return passengerData;
    }),
    contactFullname: values.contactFullname,
    contactEmail: values.contactEmail,
    contactPhone: values.contactPhone,
    channel: "web",
  };
}

/**
 * Get initial booking form values
 */
export function getInitialBookingValues(user: any, numberOfPassengers: number) {
  return {
    contactFullname: user?.fullname || "",
    contactEmail: user?.email || "",
    contactPhone: user?.phone ? String(user.phone) : "",
    passengers: initializePassengers(numberOfPassengers),
    isUserTraveling: false, // User must explicitly choose
    userPassengerIndex: undefined,
  };
}
