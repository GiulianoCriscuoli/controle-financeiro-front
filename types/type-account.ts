export type TypeAccountKind = "C" | "F";

export interface TypeAccount {
  id: number;
  name: string;
  cpf_cnpj: string;
  email: string;
  phone: string;
  type: TypeAccountKind;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface TypeAccountPayload {
  name: string;
  cpf_cnpj: string;
  email: string;
  phone: string;
  type: TypeAccountKind;
}

export const TYPE_ACCOUNT_KIND_LABEL: Record<TypeAccountKind, string> = {
  C: "Cliente",
  F: "Fornecedor",
};
