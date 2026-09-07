import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_BASE_URL, AUTH_COOKIE } from "@/lib/auth";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Chama a API Laravel injetando o Bearer token guardado no cookie httpOnly.
 * Uso em Server Components / route handlers — nunca no cliente.
 */
export async function apiFetch(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = (await cookies()).get(AUTH_COOKIE)?.value;

  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
}

/** Igual ao apiFetch mas devolve o JSON já parseado, lançando ApiError em falha. */
export async function apiJson<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  let res: Response;
  try {
    res = await apiFetch(path, init);
  } catch (e) {
    throw new ApiError(
      502,
      `Sem resposta da API em ${API_BASE_URL}${
        e instanceof Error ? ` (${e.message})` : ""
      }`
    );
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && "message" in data
        ? (data as { message?: string }).message
        : null) ?? "Erro ao consultar a API.";
    throw new ApiError(res.status, message);
  }

  return data as T;
}

export async function proxy(
  req: NextRequest,
  path: string
): Promise<NextResponse> {
  const search = req.nextUrl.search;
  const method = req.method.toUpperCase();
  const hasBody = method !== "GET" && method !== "DELETE";

  let body: string | undefined;
  if (hasBody) {
    body = await req.text();
  }

  const res = await apiFetch(`${path}${search}`, {
    method,
    body: body && body.length > 0 ? body : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  return NextResponse.json(data, { status: res.status });
}
