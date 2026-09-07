// Configuração central de autenticação.

export const AUTH_COOKIE = "auth_token";

// Inclui o prefixo /api — os endpoints partem daqui.
export const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://localhost:8093/api";

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24,
};
