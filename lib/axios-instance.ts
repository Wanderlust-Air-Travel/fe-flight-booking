/**
 * Axios instance with automatic token refresh interceptor
 * Best practice: Centralized axios configuration with automatic token refresh
 */

import useUserStore from "@/app/zustand/storeUser";
import { getErrorMessage, showError } from "@/lib/toast";
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: typeof window !== "undefined" ? "" : undefined, // Use relative URLs for Next.js API routes
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Track if we're currently refreshing token to avoid multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor: Add auth token to requests
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from store (client-side only)
    if (typeof window !== "undefined") {
      try {
        const state = useUserStore.getState();
        if (state.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        } else if (!state.accessToken && config.url && !config.url.includes("/auth/")) {
          // Log warning if no token for protected routes (except auth routes)
          console.warn("[Axios Interceptor] No access token found for request:", config.url);
        }
      } catch (error) {
        // Store not available, skip
        console.error("[Axios Interceptor] Error getting token from store:", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle 401 and refresh token automatically
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log("[Axios Interceptor] 401 Unauthorized detected, attempting token refresh...");

      if (isRefreshing) {
        // If already refreshing, queue this request
        console.log("[Axios Interceptor] Token refresh in progress, queueing request...");
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            console.log("[Axios Interceptor] Retrying queued request with new token");
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      // Only refresh on client-side
      if (typeof window === "undefined") {
        console.warn("[Axios Interceptor] Cannot refresh token on server-side");
        isRefreshing = false;
        return Promise.reject(error);
      }

      const state = useUserStore.getState();
      const { refreshToken, user, refreshAccessToken } = state;

      if (!refreshToken || !user?.id) {
        console.error("[Axios Interceptor] No refresh token or user ID available");
        // No refresh token, logout user
        state.logout();
        processQueue(new Error("No refresh token"), null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        console.log("[Axios Interceptor] Refreshing access token...");
        // Refresh token
        const newAccessToken = await refreshAccessToken(refreshToken, user.id);
        console.log("[Axios Interceptor] Token refreshed successfully");

        // Update store state (refreshAccessToken should already do this, but ensure it)
        const updatedState = useUserStore.getState();
        const tokenToUse = updatedState.accessToken || newAccessToken;

        // Process queued requests with new token
        processQueue(null, tokenToUse);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${tokenToUse}`;
        }

        console.log("[Axios Interceptor] Retrying original request with new token");
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("[Axios Interceptor] Token refresh failed:", refreshError);
        // Refresh failed, logout user
        state.logout();
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }

    // Show error toast for non-401 errors (including network errors)
    // Network errors don't have response, so we check if status is not 401 or if there's no response
    if (!error.response || error.response.status !== 401) {
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    }

    return Promise.reject(error);
  }
);

// Public axios instance for APIs that don't require authentication
export const axiosPublic = axios.create({
  baseURL: typeof window !== "undefined" ? "" : undefined,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add error interceptor for public axios instance
axiosPublic.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    // Show error toast for non-401 errors (including network errors)
    // Network errors don't have response, so we check if status is not 401 or if there's no response
    if (!error.response || error.response.status !== 401) {
      const errorMessage = getErrorMessage(error);
      showError(errorMessage);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
