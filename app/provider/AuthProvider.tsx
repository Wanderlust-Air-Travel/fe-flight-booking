"use client";
import { useEffect } from "react";
import axios from "axios";
import useUserStore from "@/app/zustand/storeUser";

export default function AuthProvider({ children }) {
    const { login, logout, accessToken, refreshToken, isLoggedIn } = useUserStore();

    useEffect(() => {
        const remember = localStorage.getItem("remember");

        // Nếu user KHÔNG chọn remember → không auto login
        if (!remember) return;

        // Nếu đã có accessToken trong Zustand → coi như đã đăng nhập
        if (isLoggedIn) return;

        // Nếu có token → thử gọi API /auth/me để xác thực
        if (accessToken) {
            axios.get("http://localhost:3001/auth/me", {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
                .then((res) => {
                    login(res.data);
                })
                .catch(() => {
                    // Token hết hạn → dùng refresh token xin token mới
                    axios.post("http://localhost:3001/auth/refresh", {
                        refresh_token: refreshToken
                    })
                        .then((res) => {
                            if (res.data) {
                                login(res.data);
                            }
                        })
                        .catch(() => {
                            logout(); // refresh token cũng hết hạn → logout
                        });
                });
        }
    }, []);

    return <>{children}</>;
}
