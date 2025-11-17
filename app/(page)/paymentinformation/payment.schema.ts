import * as Yup from "yup";

export const PaymentSchema = Yup.object().shape({
  fullName: Yup.string().required("Please enter your full name"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Please enter your email"),
  phone: Yup.string()
    .matches(/^[0-9]{9,11}$/, "Phone number must be 9–11 digits")
    .required("Please enter your phone number"),
  dob: Yup.string()
    .matches(
      /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/,
      "Date of birth must follow the format DD/MM/YYYY"
    )
    .required("Please enter your date of birth"),
  address: Yup.string().required("Please enter your address"),
  acceptTerms: Yup.boolean().oneOf([true], "Please agree"),
});
