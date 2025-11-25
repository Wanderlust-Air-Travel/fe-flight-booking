interface User {
  id: string;
  email: string;
  fullname: string;
  phone: number;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;

  login: (data: {
    user: User;
    access_token: string;
    refresh_token: string;
    isLoggedIn: boolean;
  }) => void;

  logout: () => void;

  refreshAccessToken: (refreshToken: string, userId: string) => Promise<string>;

  // ⭐ THÊM DÒNG NÀY
  hydrated: boolean;
}
