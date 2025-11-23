import * as Yup from "yup";

export const RegisterSchema = Yup.object().shape({
  fullname: Yup.string()
    .required("Please enter your full name")
    .min(3, "Full name must be at least 3 characters")
    .matches(/^[A-Za-zÀ-ỹ\s]+$/, "Full name cannot contain numbers"),
  email: Yup.string()
    .required("Please enter your email")
    .email("Invalid email address"),

  password: Yup.string()
    .required("Please enter your password")
    .min(4, "Password must be at least 4 characters")
    .max(20, "Password must be less than 50 characters"),

  rePassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),

  phone: Yup.string()
    .required("Please enter your phone number")
    .matches(/^[0-9]+$/, "Phone number must contain digits only")
    .min(10, "Phone number must be at least 10 digits")
    .max(11, "Phone number must be at most 11 digits")
});
