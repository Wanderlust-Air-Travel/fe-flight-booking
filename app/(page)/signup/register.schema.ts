import * as Yup from "yup";
import { VALIDATION_MESSAGES, VIETNAMESE_PHONE_REGEX, STRONG_PASSWORD_REGEX } from "@/lib/validation-messages";

/**
 * Register Schema - Đồng bộ với BE RegisterDto
 * - Fullname: min 2, max 100 (BE: min 2, max 100)
 * - Email: valid email format
 * - Password: 6-20 chars, must contain uppercase, lowercase, number, special char (BE: IsStrongPassword)
 * - Phone: Vietnamese phone format (BE: IsVietnamesePhone)
 */
export const RegisterSchema = Yup.object().shape({
  fullname: Yup.string()
    .required(VALIDATION_MESSAGES.AUTH.FULLNAME_REQUIRED)
    .min(2, VALIDATION_MESSAGES.AUTH.FULLNAME_MIN_LENGTH)
    .max(100, VALIDATION_MESSAGES.AUTH.FULLNAME_MAX_LENGTH)
    .matches(/^[A-Za-zÀ-ỹ\s]+$/, "Họ tên không được chứa số hoặc ký tự đặc biệt"),
  
  email: Yup.string()
    .required(VALIDATION_MESSAGES.AUTH.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID),

  password: Yup.string()
    .required(VALIDATION_MESSAGES.AUTH.PASSWORD_REQUIRED)
    .min(6, VALIDATION_MESSAGES.AUTH.PASSWORD_MIN_LENGTH)
    .max(20, VALIDATION_MESSAGES.AUTH.PASSWORD_MAX_LENGTH)
    .matches(
      STRONG_PASSWORD_REGEX,
      VALIDATION_MESSAGES.AUTH.PASSWORD_TOO_WEAK
    ),

  rePassword: Yup.string()
    .required(VALIDATION_MESSAGES.AUTH.PASSWORD_REQUIRED)
    .oneOf([Yup.ref("password")], VALIDATION_MESSAGES.AUTH.PASSWORDS_NOT_MATCH),

  phone: Yup.string()
    .required(VALIDATION_MESSAGES.AUTH.PHONE_REQUIRED)
    .matches(VIETNAMESE_PHONE_REGEX, VALIDATION_MESSAGES.AUTH.PHONE_INVALID)
});
