/**
 * Booking Validation Schemas
 * Separates validation logic from UI components
 */

import { calculateAge, isAdult } from "@/lib/passenger-utils";
import { z } from "zod";

/**
 * Create passenger validation schema
 */
export const createPassengerSchema = (flightDate: Date) =>
  z.object({
    passengerType: z.enum(["ADT", "CHD", "INF"], {
      message: "Invalid passenger type",
    }),

    fullname: z.string().min(1, "Full name is required"),

    dob: z
      .string()
      .min(1, "Date of birth is required")
      .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), {
        message: "Date of birth must be in YYYY-MM-DD format",
      })
      .refine((value) => !Number.isNaN(new Date(value).getTime()), {
        message: "Invalid date",
      }),

    gender: z.string().min(1, "Gender is required"),

    documentNumber: z.string().optional(),
  });

/**
 * Create booking validation schema
 */
export const createBookingSchema = (flightDate: Date) =>
  z.object({
    contactFullname: z.string().min(1, "Contact full name is required"),

    contactEmail: z
      .string()
      .min(1, "Contact email is required")
      .email("Invalid email format"),

    contactPhone: z.string().min(1, "Contact phone is required"),

    passengers: z
      .array(createPassengerSchema(flightDate))
      .min(1, "At least one passenger is required"),
  });

/**
 * Validate a passenger's DOB against the passenger type and flight date.
 * Returns null if valid, or an error message string.
 */
export const validatePassengerDob = (
  dob: string,
  passengerType: string,
  flightDate: Date
): string | null => {
  if (!dob) return "Date of birth is required";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return "Date of birth must be in YYYY-MM-DD format";

  const dobDate = new Date(dob);
  if (Number.isNaN(dobDate.getTime())) return "Invalid date of birth";

  const age = calculateAge(dobDate, flightDate);
  if (age < 0) return "Invalid date of birth";

  if (passengerType === "ADT" && age < 12) {
    return "Adult must be 12 years or older at flight date.";
  }
  if (passengerType === "CHD" && (age < 2 || age >= 12)) {
    return "Child must be between 2 and 11 years old at flight date.";
  }
  if (passengerType === "INF" && age >= 2) {
    return "Infant must be less than 2 years old at flight date.";
  }
  return null;
};

/**
 * Validate whether a passenger needs a document number (ADT only).
 */
export const validateDocumentNumber = (value: string | undefined, passengerType: string): boolean => {
  if (passengerType === "ADT") {
    return !!value && value.trim().length > 0;
  }
  return true;
};
