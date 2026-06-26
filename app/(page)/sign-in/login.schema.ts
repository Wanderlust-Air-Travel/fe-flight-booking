import * as Yup from "yup";
import { VALIDATION_MESSAGES } from "@/lib/validation-messages";

/**
 * Login Schema - Đồng bộ với BE LoginDto
 * BE chỉ hỗ trợ email, không hỗ trợ phone
 */
export const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .required(VALIDATION_MESSAGES.AUTH.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID),

  password: Yup.string()
    .required(VALIDATION_MESSAGES.AUTH.PASSWORD_REQUIRED)
    .min(6, VALIDATION_MESSAGES.AUTH.PASSWORD_MIN_LENGTH)
    .max(20, VALIDATION_MESSAGES.AUTH.PASSWORD_MAX_LENGTH),
});
