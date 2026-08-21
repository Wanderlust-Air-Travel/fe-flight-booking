import type { AuthState } from "@/types/user-login-type";
import { refreshAccessToken as refreshAccessTokenRequest } from "@/lib/auth/refresh";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useUserStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,

      hydrated: false,

      login: (data) => {
        set({
          user: data.user,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isLoggedIn: true,
        });
      },

      setUserRoles: (roles) => {
        set((state) => ({
          user: state.user ? { ...state.user, roles } : null,
        }));
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
          const data = await refreshAccessTokenRequest(refreshToken, userId);
          set({
            accessToken: data.access_token,
            refreshToken: data.refresh_token ?? get().refreshToken,
          });
          return data.access_token;
        } catch (error) {
          get().logout();
          throw error;
        }
      },
    }),

    {
      name: "auth-storage",
      skipHydration: false,

      storage: createJSONStorage(() => {
        if (typeof window !== "undefined" && localStorage.getItem("remember") === "1") {
          return localStorage;
        }
        return sessionStorage;
      }),

      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);

export default useUserStore;
