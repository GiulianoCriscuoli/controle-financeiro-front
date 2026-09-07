import type { TypeAccount } from "./type-account";

export type TransactionType = "receber" | "pagar";

export type TransactionStatus =
  | "pendente"
  | "recebido"
  | "pago"
  | "vencido"
  | "cancelado";

export interface FinancialTransaction {
  id: number;
  type_account_id: number;
  type: TransactionType;
  description: string;
  amount: string; // API devolve como string "1500.00"
  issue_date: string; // ISO datetime
  due_date: string; // ISO datetime
  status: TransactionStatus;
  settlement_date: string | null;
  created_at: string;
  updated_at: string;
  type_account?: TypeAccount;
}

export interface FinancialTransactionPayload {
  type_account_id: number;
  type: TransactionType;
  description: string;
  amount: number;
  issue_date: string;
  due_date: string;
  status: TransactionStatus;
  settlement_date: string | null;
}

export const STATUS_BY_TYPE: Record<TransactionType, TransactionStatus[]> = {
  receber: ["pendente", "recebido", "vencido", "cancelado"],
  pagar: ["pendente", "pago", "vencido", "cancelado"],
};

export const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  receber: "A receber",
  pagar: "A pagar",
};
