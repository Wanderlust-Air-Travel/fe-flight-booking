/**
 * Booking Validation Schemas
 * Separates validation logic from UI components
 */

import { calculateAge, isAdult } from "@/lib/passenger-utils";
import * as Yup from "yup";

/**
 * Create passenger validation schema
 */
export const createPassengerSchema = (flightDate: Date) =>
  Yup.object().shape({
    passengerType: Yup.string()
      .oneOf(["ADT", "CHD", "INF"], "Invalid passenger type")
      .required("Passenger type is required"),

    fullname: Yup.string().required("Full name is required"),

    dob: Yup.string()
      .required("Date of birth is required")
      .test("dob-format", "Date of birth must be in YYYY-MM-DD format", (value) => {
        if (!value) return false;
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        return dateRegex.test(value);
      })
      .test("dob-age-validation", "Invalid date of birth for passenger type", function (value) {
        if (!value) return false;
        const { passengerType } = this.parent;
        const dobDate = new Date(value);
        if (Number.isNaN(dobDate.getTime())) return false;

        const age = calculateAge(dobDate, flightDate);
        if (age < 0) return false;

        if (passengerType === "ADT" && age < 12) {
          return this.createError({
            message: "Adult must be 12 years or older at flight date.",
          });
        }
        if (passengerType === "CHD" && (age < 2 || age >= 12)) {
          return this.createError({
            message: "Child must be between 2 and 11 years old at flight date.",
          });
        }
        if (passengerType === "INF" && age >= 2) {
          return this.createError({
            message: "Infant must be less than 2 years old at flight date.",
          });
        }
        return true;
      }),

    gender: Yup.string().required("Gender is required"),

    documentNumber: Yup.string().test(
      "documentNumber-required",
      "Document number is required for adults",
      function (value) {
        const { passengerType } = this.parent;
        // ADT requires documentNumber, CHD and INF do not
        if (passengerType === "ADT") {
          return !!value && value.trim().length > 0;
        }
        // CHD and INF: documentNumber is optional
        return true;
      }
    ),
  });

/**
 * Create booking validation schema
 */
export const createBookingSchema = (flightDate: Date) =>
  Yup.object().shape({
    contactFullname: Yup.string().required("Contact full name is required"),

    contactEmail: Yup.string().email("Invalid email format").required("Contact email is required"),

    contactPhone: Yup.string().required("Contact phone is required"),

    passengers: Yup.array()
      .of(createPassengerSchema(flightDate))
      .min(1, "At least one passenger is required")
      .required("Passengers are required")
      .test(
        "infant-adult-ratio",
        "Each adult can only accompany maximum 1 infant. Additional infant(s) must be booked as Child (CHD).",
        (passengers) => {
          if (!passengers) return true;
          const adults = passengers.filter((p: any) => p.passengerType === "ADT").length;
          const infants = passengers.filter((p: any) => p.passengerType === "INF").length;
          return infants <= adults;
        }
      )
      .test(
        "infant-requires-adult",
        "Infants (INF) must be accompanied by at least one adult (ADT)",
        function (passengers) {
          if (!passengers) return true;
          const adults = passengers.filter((p: any) => p.passengerType === "ADT").length;
          const infants = passengers.filter((p: any) => p.passengerType === "INF").length;
          if (infants > 0 && adults === 0) {
            return this.createError({
              message: "Infants (INF) must be accompanied by at least one adult (ADT)",
            });
          }
          return true;
        }
      )
      .test(
        "adult-age-validation",
        "Adults accompanying infants must be 18 years or older at flight date",
        function (passengers) {
          if (!passengers) return true;
          const infants = passengers.filter((p: any) => p.passengerType === "INF");
          if (infants.length === 0) return true;

          const adults = passengers.filter((p: any) => p.passengerType === "ADT");
          for (const adult of adults) {
            if (!adult.dob) continue;
            const dobDate = new Date(adult.dob);
            if (Number.isNaN(dobDate.getTime())) continue;

            if (!isAdult(dobDate, flightDate)) {
              return this.createError({
                message: `Adult passenger "${adult.fullname || "Passenger"}" must be 18 years or older at flight date to accompany an infant.`,
              });
            }
          }
          return true;
        }
      ),
  });
