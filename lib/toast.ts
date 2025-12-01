/**
 * Toast notification utilities using SweetAlert2
 * Centralized helpers so the rest of the app stays decoupled from the UI library.
 *
 * Docs: https://sweetalert2.github.io/
 */

import Swal, { SweetAlertIcon } from 'sweetalert2';

/**
 * Minimal toast options interface (compatible with existing usage)
 * - Currently we only care about autoClose duration.
 */
export interface ToastOptions {
	autoClose?: number; // milliseconds
}

// Internal helper: map toast type to SweetAlert2 icon
type ToastType = 'success' | 'error' | 'warning' | 'info';

const typeToIcon = (type: ToastType): SweetAlertIcon => {
	switch (type) {
		case 'success':
			return 'success';
		case 'error':
			return 'error';
		case 'warning':
			return 'warning';
		case 'info':
		default:
			return 'info';
	}
};

// Base toast config (top-end, auto close, progress bar)
const fireToast = (icon: SweetAlertIcon, message: string, options?: ToastOptions) => {
	return Swal.fire({
		toast: true,
		position: 'top-end',
		icon,
		title: message,
		showConfirmButton: false,
		timer: options?.autoClose ?? 3000,
		timerProgressBar: true,
	});
};

/**
 * Show success toast notification
 */
export const showSuccess = (message: string, options?: ToastOptions): string => {
	fireToast('success', message, options);
	// Return a dummy ID to keep API compatible with previous react-toastify usage
	return Date.now().toString();
};

/**
 * Show error toast notification
 */
export const showError = (message: string, options?: ToastOptions): string => {
	fireToast('error', message, {
		autoClose: 5000,
		...options,
	});
	return Date.now().toString();
};

/**
 * Show warning toast notification
 */
export const showWarning = (message: string, options?: ToastOptions): string => {
	fireToast('warning', message, {
		autoClose: 4000,
		...options,
	});
	return Date.now().toString();
};

/**
 * Show info toast notification
 */
export const showInfo = (message: string, options?: ToastOptions): string => {
	fireToast('info', message, options);
	return Date.now().toString();
};

/**
 * Show loading toast notification
 * NOTE: SweetAlert2 không hỗ trợ "update theo ID" như react-toastify,
 * nên hàm này chỉ hiển thị 1 toast loading; update/dismiss sẽ tạo toast mới.
 */
export const showLoading = (message: string, options?: ToastOptions): string => {
	Swal.fire({
		toast: true,
		position: 'top-end',
		title: message,
		icon: 'info',
		showConfirmButton: false,
		timer: options?.autoClose, // đa phần loading sẽ không auto-close nếu không truyền
		timerProgressBar: !!options?.autoClose,
		didOpen: () => {
			Swal.showLoading();
		},
	});
	return Date.now().toString();
};

/**
 * "Update" existing toast
 * Do SweetAlert2 không có cơ chế update theo id, ta đơn giản tạo 1 toast mới
 * với kiểu/type tương ứng. Việc nhận toastId ở đây chỉ để giữ API cũ.
 */
export const updateToast = (
	_toastId: string,
	message: string,
	type: ToastType = 'info',
	options?: ToastOptions
): void => {
	fireToast(typeToIcon(type), message, options);
};

/**
 * Dismiss toast by ID
 * SweetAlert2 không quản lý nhiều toast cùng lúc như react-toastify,
 * nên ta chỉ close modal/toast hiện tại.
 */
export const dismissToast = (_toastId: string): void => {
	Swal.close();
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = (): void => {
	Swal.close();
};

/**
 * HTTP Status Code Error Messages Mapping
 * Professional error messages for different HTTP status codes
 */
const HTTP_STATUS_MESSAGES: Record<number, string> = {
	400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin đã nhập.',
	401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
	403: 'Bạn không có quyền truy cập tài nguyên này.',
	404: 'Không tìm thấy tài nguyên yêu cầu. Vui lòng thử lại.',
	405: 'Phương thức yêu cầu không được hỗ trợ.',
	408: 'Yêu cầu bị quá thời gian chờ. Vui lòng thử lại.',
	409: 'Dữ liệu đã tồn tại hoặc xung đột. Vui lòng kiểm tra lại.',
	422: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
	429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.',
	500: 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.',
	502: 'Máy chủ không phản hồi. Vui lòng thử lại sau.',
	503: 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
	504: 'Máy chủ quá thời gian phản hồi. Vui lòng thử lại sau.',
};

/**
 * Extract and format error message from axios error or any error
 * Professional error handling with clear, user-friendly messages
 * @param error - Error object (axios error or generic error)
 * @param defaultMessage - Default message if error message cannot be extracted
 * @returns Professional error message string in Vietnamese
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'Đã xảy ra lỗi không xác định'): string => {
	if (!error) {
		return defaultMessage;
	}

	// Handle Axios error with response (server responded with error status)
	if (error.response) {
		const status = error.response.status;
		const responseData = error.response.data;
		
		// Priority 1: Check for custom message from backend in response data
		if (responseData?.message) {
			// Handle array of validation errors
			if (Array.isArray(responseData.message)) {
				const messages = responseData.message.filter((msg: any) => msg && typeof msg === 'string');
				if (messages.length > 0) {
					return messages.length === 1 
						? messages[0] 
						: `Có ${messages.length} lỗi cần sửa: ${messages.join(', ')}`;
				}
			}
			// Handle string message
			if (typeof responseData.message === 'string' && responseData.message.trim()) {
				return responseData.message;
			}
		}
		
		// Priority 2: Check for error field in response data
		if (responseData?.error) {
			if (typeof responseData.error === 'string' && responseData.error.trim()) {
				return responseData.error;
			}
		}
		
		// Priority 3: Check for validation errors array
		if (Array.isArray(responseData?.errors)) {
			const errorMessages = responseData.errors
				.map((err: any) => {
					if (typeof err === 'string') return err;
					if (err?.message) return err.message;
					if (err?.msg) return err.msg;
					return null;
				})
				.filter((msg: string | null) => msg && msg.trim());
			
			if (errorMessages.length > 0) {
				return errorMessages.length === 1 
					? errorMessages[0] 
					: `Có ${errorMessages.length} lỗi cần sửa: ${errorMessages.join(', ')}`;
			}
		}
		
		// Priority 4: Use professional HTTP status message
		if (HTTP_STATUS_MESSAGES[status]) {
			return HTTP_STATUS_MESSAGES[status];
		}
		
		// Priority 5: Use status text if available
		if (error.response.statusText) {
			return `Lỗi ${status}: ${error.response.statusText}`;
		}
		
		// Fallback for unknown status codes
		return `Lỗi máy chủ (${status}). Vui lòng thử lại sau hoặc liên hệ hỗ trợ.`;
	}
	
	// Handle network errors (no response from server)
	if (error.request) {
		// Check for timeout
		if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
			return 'Yêu cầu bị quá thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.';
		}
		
		// Check for network errors
		if (error.code === 'ERR_NETWORK' || 
		    error.message?.includes('Network Error') || 
		    error.message?.includes('fetch failed') ||
		    error.message?.includes('Failed to fetch')) {
			return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn và thử lại.';
		}
		
		// Check for connection refused
		if (error.code === 'ECONNREFUSED' || error.message?.includes('Connection refused')) {
			return 'Máy chủ không khả dụng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.';
		}
	}
	
	// Handle generic error messages
	if (error.message) {
		const errorMsg = error.message.trim();
		
		// Filter out technical error messages and provide user-friendly alternatives
		if (errorMsg.includes('fetch failed') || errorMsg.includes('Failed to fetch')) {
			return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
		}
		
		if (errorMsg.includes('Network Error') || errorMsg.includes('NetworkError')) {
			return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet và thử lại.';
		}
		
		if (errorMsg.includes('timeout') || errorMsg.includes('Timeout')) {
			return 'Yêu cầu bị quá thời gian chờ. Vui lòng thử lại.';
		}
		
		// If it's a meaningful error message, return it
		// Otherwise, use default message
		if (errorMsg.length > 0 && !errorMsg.includes('Error') && !errorMsg.includes('error')) {
			return errorMsg;
		}
	}
	
	// Final fallback
	return defaultMessage;
};

