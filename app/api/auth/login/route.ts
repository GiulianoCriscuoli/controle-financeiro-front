import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, AUTH_COOKIE, AUTH_COOKIE_OPTIONS } from "@/lib/auth";
import type { ApiValidationError, LoginApiSuccess } from "@/types/login";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { message: "Requisição inválida." },
      { status: 400 }
    );
  }

  let apiRes: Response;

  try {
    apiRes = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: body.email ?? "",
        password: body.password ?? "",
      }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Não foi possível conectar ao servidor. Tente novamente." },
      { status: 502 }
    );
  }

  const data = (await apiRes.json().catch(() => null)) as
    | LoginApiSuccess
    | ApiValidationError
    | null;

  if (!apiRes.ok || !data || !("token" in data)) {
    const err = (data as ApiValidationError | null) ?? {
      message: "Falha no login.",
    };
    return NextResponse.json(
      { message: err.message, errors: err.errors ?? {} },
      { status: apiRes.status || 401 }
    );
  }
  
  const res = NextResponse.json({ message: data.message, user: data.user });
  res.cookies.set(AUTH_COOKIE, data.token, AUTH_COOKIE_OPTIONS);
  return res;
}
