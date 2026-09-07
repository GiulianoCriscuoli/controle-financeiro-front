export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
}

// Resposta da API em caso de sucesso
export interface LoginApiSuccess {
  message: string;
  user: AuthUser;
  token: string;
}

export interface ApiValidationError {
  message: string;
  errors?: Record<string, string[]>;
}
export interface LoginClientResult {
  message: string;
  user: AuthUser;
}


export type FieldErrors = Partial<Record<"email" | "password", string>>;
