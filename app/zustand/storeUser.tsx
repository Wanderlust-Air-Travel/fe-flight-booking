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


            login: (data) => {
                set({
                    user: data.user,
                    accessToken: data.access_token,
                    refreshToken: data.refresh_token,
                    isLoggedIn: true,
                })
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isLoggedIn: false,
                })
            }
        }),
        {
            name: "auth-storage",
            skipHydration: false, // ⭐ QUAN TRỌNG
            storage: createJSONStorage(() => {
                // nếu có remember thì xài localStorage
                if (localStorage.getItem("remember") === "1") {
                    return localStorage;
                } else {
                    // không remember → sessionStorage
                    return sessionStorage;
                }

            }),
        }
    )
)

export default useUserStore;