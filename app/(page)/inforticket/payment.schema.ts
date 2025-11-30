import * as Yup from "yup";
import { VALIDATION_MESSAGES, VIETNAMESE_PHONE_REGEX, DATE_DD_MM_YYYY_REGEX } from "@/lib/validation-messages";

/**
 * Payment Schema - Đồng bộ với BE CreateBookingFromReservationDto
 * - Fullname: min 2, max 100 (đồng bộ với BE)
 * - Email: valid email format
 * - Phone: Vietnamese phone format (đồng bộ với BE IsVietnamesePhone)
 * - DOB: DD/MM/YYYY format
 */
export const PaymentSchema = Yup.object().shape({
  fullName: Yup.string()
    .required(VALIDATION_MESSAGES.PAYMENT.FULLNAME_REQUIRED)
    .min(2, VALIDATION_MESSAGES.PAYMENT.FULLNAME_MIN_LENGTH)
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
  
  email: Yup.string()
    .required(VALIDATION_MESSAGES.PAYMENT.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.PAYMENT.EMAIL_INVALID),
  
  phone: Yup.string()
    .required(VALIDATION_MESSAGES.PAYMENT.PHONE_REQUIRED)
    .matches(VIETNAMESE_PHONE_REGEX, VALIDATION_MESSAGES.PAYMENT.PHONE_INVALID),
  
  dob: Yup.string()
    .required(VALIDATION_MESSAGES.PAYMENT.DOB_REQUIRED)
    .matches(DATE_DD_MM_YYYY_REGEX, VALIDATION_MESSAGES.PAYMENT.DOB_INVALID_FORMAT),
  
  address: Yup.string()
    .required(VALIDATION_MESSAGES.PAYMENT.ADDRESS_REQUIRED),
  
  acceptTerms: Yup.boolean()
    .oneOf([true], VALIDATION_MESSAGES.PAYMENT.ACCEPT_TERMS_REQUIRED),
});
