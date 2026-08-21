import {
  DATE_DD_MM_YYYY_REGEX,
  VALIDATION_MESSAGES,
  VIETNAMESE_PHONE_REGEX,
} from "@/lib/validation-messages";
import { z } from "zod";

export const PaymentSchema = z.object({
  fullName: z
    .string()
    .min(1, VALIDATION_MESSAGES.PAYMENT.FULLNAME_REQUIRED)
    .min(2, VALIDATION_MESSAGES.PAYMENT.FULLNAME_MIN_LENGTH)
    .max(100, "Họ tên không được vượt quá 100 ký tự"),

  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.PAYMENT.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.PAYMENT.EMAIL_INVALID),

  phone: z
    .string()
    .min(1, VALIDATION_MESSAGES.PAYMENT.PHONE_REQUIRED)
    .regex(VIETNAMESE_PHONE_REGEX, VALIDATION_MESSAGES.PAYMENT.PHONE_INVALID),

  dob: z
    .string()
    .min(1, VALIDATION_MESSAGES.PAYMENT.DOB_REQUIRED)
    .regex(DATE_DD_MM_YYYY_REGEX, VALIDATION_MESSAGES.PAYMENT.DOB_INVALID_FORMAT),

  address: z.string().min(1, VALIDATION_MESSAGES.PAYMENT.ADDRESS_REQUIRED),

  acceptTerms: z.boolean().refine((v) => v === true, {
    message: VALIDATION_MESSAGES.PAYMENT.ACCEPT_TERMS_REQUIRED,
  }),
});

export type PaymentFormValue = z.infer<typeof PaymentSchema>;
