import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, AUTH_COOKIE } from "@/lib/auth";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;

  // Avisa o backend para revogar o token (best-effort).
  if (token) {
    try {
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch {}
  }

  const res = NextResponse.json({ message: "Logout realizado." });
  res.cookies.delete(AUTH_COOKIE);
  return res;
}
