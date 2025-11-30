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
 * Extract error message from axios error or any error
 * @param error - Error object (axios error or generic error)
 * @param defaultMessage - Default message if error message cannot be extracted
 * @returns Error message string
 */
export const getErrorMessage = (error: any, defaultMessage: string = 'Đã xảy ra lỗi'): string => {
	if (!error) {
		return defaultMessage;
	}

	// Axios error response
	if (error.response) {
		const responseData = error.response.data;
		
		// Check for message in response data
		if (responseData?.message) {
			return responseData.message;
		}
		
		// Check for error array (validation errors)
		if (Array.isArray(responseData?.message)) {
			return responseData.message.join(', ');
		}
		
		// Check for error object
		if (responseData?.error) {
			return responseData.error;
		}
		
		// Use status text as fallback
		if (error.response.statusText) {
			return error.response.statusText;
		}
	}
	
	// Generic error message
	if (error.message) {
		return error.message;
	}
	
	return defaultMessage;
};

