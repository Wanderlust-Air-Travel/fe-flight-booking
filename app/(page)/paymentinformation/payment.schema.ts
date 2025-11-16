import * as Yup from "yup";

export const PaymentSchema = Yup.object().shape({
    fullName: Yup.string().required("Vui lòng nhập họ tên"),
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    phone: Yup.string()
        .matches(/^[0-9]{9,11}$/, "SĐT phải từ 9–11 số")
        .required("Vui lòng nhập SĐT"),
    dob: Yup.string()
        .matches(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/,
            "Ngày sinh phải theo định dạng DD/MM/YYYY"
        )
        .required("Vui lòng nhập ngày sinh"),
    address: Yup.string()
        .required("Vui lòng nhập địa chỉ"),
});
