export interface ApiResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  message?: string;
  fieldErrors: Record<string, string>;
}

function flattenErrors(
  errors?: Record<string, string[]>
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!errors) return out;
  for (const [key, msgs] of Object.entries(errors)) {
    if (Array.isArray(msgs) && msgs[0]) out[key] = msgs[0];
  }
  return out;
}

export async function apiClient<T = unknown>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      message: "Falha de conexão. Tente novamente.",
      fieldErrors: {},
    };
  }

  if (res.status === 401 && typeof window !== "undefined") {

    window.location.assign("/login");
  }

  const raw = await res.json().catch(() => null);

  return {
    ok: res.ok,
    status: res.status,
    data: res.ok ? (raw as T) : null,
    message:
      raw && typeof raw === "object" && "message" in raw
        ? (raw as { message?: string }).message
        : undefined,
    fieldErrors:
      raw && typeof raw === "object" && "errors" in raw
        ? flattenErrors((raw as { errors?: Record<string, string[]> }).errors)
        : {},
  };
}
