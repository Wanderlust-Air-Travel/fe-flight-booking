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
