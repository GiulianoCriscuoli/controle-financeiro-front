export interface LoginCredentials {
  identifier: string; // email ou CPF
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
  };
}