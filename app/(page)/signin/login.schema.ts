import * as Yup from "yup";

export const LoginSchema = Yup.object().shape({
  identifier: Yup.string()
    .test(
      "email-or-phone",
      "Please enter a valid email or phone number",
      (value) => {
        if (!value) return false;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{9,11}$/;

        return emailRegex.test(value) || phoneRegex.test(value);
      }
    )
    .required("Email or phone is required"),

  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
