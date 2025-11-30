/**
 * Toast notification utilities
 * Centralized toast functions for consistent notifications across the application
 */

import { toast, ToastOptions, Id } from 'react-toastify';

/**
 * Default toast options
 */
const defaultOptions: ToastOptions = {
	position: 'top-right',
	autoClose: 3000,
	hideProgressBar: false,
	closeOnClick: true,
	pauseOnHover: true,
	draggable: true,
	progress: undefined,
	theme: 'light',
};

/**
 * Show success toast notification
 * @param message - Success message to display
 * @param options - Optional toast configuration
 * @returns Toast ID
 */
export const showSuccess = (message: string, options?: ToastOptions): Id => {
	return toast.success(message, {
		...defaultOptions,
		...options,
	});
};

/**
 * Show error toast notification
 * @param message - Error message to display
 * @param options - Optional toast configuration
 * @returns Toast ID
 */
export const showError = (message: string, options?: ToastOptions): Id => {
	return toast.error(message, {
		...defaultOptions,
		autoClose: 5000, // Errors stay longer
		...options,
	});
};

/**
 * Show warning toast notification
 * @param message - Warning message to display
 * @param options - Optional toast configuration
 * @returns Toast ID
 */
export const showWarning = (message: string, options?: ToastOptions): Id => {
	return toast.warning(message, {
		...defaultOptions,
		autoClose: 4000, // Warnings stay a bit longer
		...options,
	});
};

/**
 * Show info toast notification
 * @param message - Info message to display
 * @param options - Optional toast configuration
 * @returns Toast ID
 */
export const showInfo = (message: string, options?: ToastOptions): Id => {
	return toast.info(message, {
		...defaultOptions,
		...options,
	});
};

/**
 * Show loading toast notification
 * @param message - Loading message to display
 * @param options - Optional toast configuration
 * @returns Toast ID (use this to dismiss the toast)
 */
export const showLoading = (message: string, options?: ToastOptions): Id => {
	return toast.loading(message, {
		...defaultOptions,
		autoClose: false, // Loading toasts don't auto-close
		...options,
	});
};

/**
 * Update existing toast
 * @param toastId - ID of the toast to update
 * @param message - New message
 * @param type - New toast type
 * @param options - Optional toast configuration
 */
export const updateToast = (
	toastId: Id,
	message: string,
	type: 'success' | 'error' | 'warning' | 'info' = 'info',
	options?: ToastOptions
): void => {
	toast.update(toastId, {
		render: message,
		type,
		...defaultOptions,
		...options,
		isLoading: false,
	});
};

/**
 * Dismiss toast by ID
 * @param toastId - ID of the toast to dismiss
 */
export const dismissToast = (toastId: Id): void => {
	toast.dismiss(toastId);
};

/**
 * Dismiss all toasts
 */
export const dismissAllToasts = (): void => {
	toast.dismiss();
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

