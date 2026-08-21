/**
 * Validation Messages for Frontend
 *
 * Đồng bộ với BE messages để đảm bảo validation nhất quán
 * Import từ: import { VALIDATION_MESSAGES } from '@/lib/validation-messages';
 */

export const VALIDATION_MESSAGES = {
  AUTH: {
    EMAIL_REQUIRED: "Email là bắt buộc",
    EMAIL_INVALID: "Email không hợp lệ",
    PASSWORD_REQUIRED: "Mật khẩu là bắt buộc",
    PASSWORD_TOO_WEAK:
      "Mật khẩu quá yếu. Vui lòng sử dụng ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
    PASSWORD_MIN_LENGTH: "Mật khẩu phải có ít nhất 6 ký tự",
    PASSWORD_MAX_LENGTH: "Mật khẩu không được vượt quá 20 ký tự",
    FULLNAME_REQUIRED: "Họ tên là bắt buộc",
    FULLNAME_MIN_LENGTH: "Họ tên phải có ít nhất 2 ký tự",
    FULLNAME_MAX_LENGTH: "Họ tên không được vượt quá 100 ký tự",
    PHONE_REQUIRED: "Số điện thoại là bắt buộc",
    PHONE_INVALID: "Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại Việt Nam hợp lệ",
    OTP_REQUIRED: "OTP là bắt buộc",
    OTP_INVALID_FORMAT: "OTP phải là 6 chữ số",
    PASSWORDS_NOT_MATCH: "Mật khẩu xác nhận không khớp",
  },
  BOOKING: {
    PASSENGERS_REQUIRED: "Thông tin hành khách là bắt buộc",
    PASSENGER_NAME_REQUIRED: "Tên hành khách là bắt buộc",
    PASSENGER_EMAIL_REQUIRED: "Email hành khách là bắt buộc",
    PASSENGER_PHONE_REQUIRED: "Số điện thoại hành khách là bắt buộc",
    FLIGHT_ID_REQUIRED: "Flight ID là bắt buộc",
    BOOKING_ID_REQUIRED: "Booking ID là bắt buộc",
  },
  PAYMENT: {
    FULLNAME_REQUIRED: "Họ tên là bắt buộc",
    FULLNAME_MIN_LENGTH: "Họ tên phải có ít nhất 2 ký tự",
    EMAIL_REQUIRED: "Email là bắt buộc",
    EMAIL_INVALID: "Email không hợp lệ",
    PHONE_REQUIRED: "Số điện thoại là bắt buộc",
    PHONE_INVALID: "Số điện thoại không hợp lệ",
    DOB_REQUIRED: "Ngày sinh là bắt buộc",
    DOB_INVALID_FORMAT: "Ngày sinh phải theo định dạng DD/MM/YYYY",
    ADDRESS_REQUIRED: "Địa chỉ là bắt buộc",
    ACCEPT_TERMS_REQUIRED: "Vui lòng đồng ý với điều khoản",
  },
  COMMON: {
    REQUIRED: "Trường này là bắt buộc",
    INVALID: "Giá trị không hợp lệ",
  },
} as const;

/**
 * Vietnamese phone number regex
 * Supports: 09xxxxxxxx, 08xxxxxxxx, 07xxxxxxxx, 03xxxxxxxx, 05xxxxxxxx
 */
export const VIETNAMESE_PHONE_REGEX =
  /^(0|84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-4|6-9])[0-9]{7}$/;

/**
 * Strong password regex
 * Requirements: uppercase, lowercase, number, special character, 6-20 chars
 */
export const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,20}$/;

/**
 * Date format DD/MM/YYYY
 */
export const DATE_DD_MM_YYYY_REGEX = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/;
