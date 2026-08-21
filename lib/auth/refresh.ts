/**
 * Refresh access token via Next.js auth refresh route.
 * Throws on failure so the caller can react (e.g., logout user).
 */
export async function refreshAccessToken(
  refreshToken: string,
  userId: string
): Promise<{ access_token: string; refresh_token?: string }> {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, refresh_token: refreshToken }),
  });

  if (!response.ok) {
    throw new Error("Refresh token expired");
  }

  return response.json();
}
