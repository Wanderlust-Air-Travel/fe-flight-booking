import { VALIDATION_MESSAGES } from "@/lib/validation-messages";
import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, VALIDATION_MESSAGES.AUTH.EMAIL_REQUIRED)
    .email(VALIDATION_MESSAGES.AUTH.EMAIL_INVALID),
  password: z
    .string()
    .min(1, VALIDATION_MESSAGES.AUTH.PASSWORD_REQUIRED)
    .min(6, VALIDATION_MESSAGES.AUTH.PASSWORD_MIN_LENGTH)
    .max(20, VALIDATION_MESSAGES.AUTH.PASSWORD_MAX_LENGTH),
});

export type LoginFormValue = z.infer<typeof LoginSchema>;
