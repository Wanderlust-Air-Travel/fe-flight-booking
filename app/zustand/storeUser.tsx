// "use client"
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { AuthState } from "@/types/user-login-type";

const useUserStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isLoggedIn: false,

            // trạng thái hydrate
            hydrated: false,

            login: (data) => {
                set({
                    user: data.user,
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    isLoggedIn: true,
                });
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isLoggedIn: false,
                });
            },

            refreshAccessToken: async (refreshToken: string, userId: string) => {
                try {
                    const response = await fetch('/api/auth/refresh', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            userId,
                            refresh_token: refreshToken,
                        }),
                    });

                    const data = await response.json();

                    if (response.ok && data.access_token) {
                        set({
                            accessToken: data.access_token,
                            refreshToken: data.refresh_token || refreshToken,
                        });
                        return data.access_token;
                    } else {
                        // Refresh token cũng hết hạn, logout
                        set({
                            user: null,
                            accessToken: null,
                            refreshToken: null,
                            isLoggedIn: false,
                        });
                        throw new Error('Refresh token expired');
                    }
                } catch (error) {
                    // Refresh failed, logout
                    set({
                        user: null,
                        accessToken: null,
                        refreshToken: null,
                        isLoggedIn: false,
                    });
                    throw error;
                }
            },
        }),

        {
            name: "auth-storage",
            skipHydration: false,

            storage: createJSONStorage(() => {
                // nếu có remember → dùng localStorage
                if (typeof window !== "undefined" &&
                    localStorage.getItem("remember") === "1") {
                    return localStorage;
                }

                // ngược lại sessionStorage
                return sessionStorage;
            }),

            // ⭐ khi storage được hydrate xong → đánh dấu
            onRehydrateStorage: () => (state) => {
                if (state) state.hydrated = true;
            },
        }
    )
);

export default useUserStore;
