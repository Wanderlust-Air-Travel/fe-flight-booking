/**
 * API configuration utilities
 * Centralized API URL handling with fallback
 */

const DEFAULT_API_URL = 'http://localhost:3000';

/**
 * Get API base URL from environment variable with fallback
 */
export function getApiUrl(): string {
	return process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;
}

/**
 * Build full API URL from path
 * Ensures proper URL construction without double slashes
 */
export function buildApiUrl(path: string): string {
	const baseUrl = getApiUrl();
	// Ensure path starts with / and baseUrl does not end with /
	const cleanedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
	const cleanedPath = path.startsWith('/') ? path : `/${path}`;
	return `${cleanedBaseUrl}${cleanedPath}`;
}

