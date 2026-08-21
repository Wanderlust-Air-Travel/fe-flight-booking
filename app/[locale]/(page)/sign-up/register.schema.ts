import {
  STRONG_PASSWORD_REGEX,
  VALIDATION_MESSAGES,
  VIETNAMESE_PHONE_REGEX,
} from "@/lib/validation-messages";
import { z } from "zod";

export const RegisterSchema = z
  .object({
    fullname: z
      .string()
      .min(1, VALIDATION_MESSAGES.AUTH.FULLNAME_REQUIRED)
      .min(2, VALIDATION_MESSAGES.AUTH.FULLNAME_MIN_LENGTH)
      .max(100, VALIDATION_MESSAGES.AUTH.FULLNAME_MAX_LENGTH)
      .regex(/^[A-Za-zÀ-ỹ\s]+$/, "Họ tên không được chứa số hoặc ký tự đặc biệt"),

    email: z
      .string()
      .min(1, VALIDATION_MESSAGES.AUTH.EMAIL_REQUIRED)
      .email(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID),

    password: z
      .string()
      .min(1, VALIDATION_MESSAGES.AUTH.PASSWORD_REQUIRED)
      .min(6, VALIDATION_MESSAGES.AUTH.PASSWORD_MIN_LENGTH)
      .max(20, VALIDATION_MESSAGES.AUTH.PASSWORD_MAX_LENGTH)
      .regex(STRONG_PASSWORD_REGEX, VALIDATION_MESSAGES.AUTH.PASSWORD_TOO_WEAK),

    rePassword: z.string().min(1, VALIDATION_MESSAGES.AUTH.PASSWORD_REQUIRED),

    phone: z
      .string()
      .min(1, VALIDATION_MESSAGES.AUTH.PHONE_REQUIRED)
      .regex(VIETNAMESE_PHONE_REGEX, VALIDATION_MESSAGES.AUTH.PHONE_INVALID),
  })
  .refine((data) => data.password === data.rePassword, {
    message: VALIDATION_MESSAGES.AUTH.PASSWORDS_NOT_MATCH,
    path: ["rePassword"],
  });

export type RegisterFormValue = z.infer<typeof RegisterSchema>;
