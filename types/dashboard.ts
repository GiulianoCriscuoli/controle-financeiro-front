export interface DashboardSummary {
  type_account_id: number;
  name: string;
  total_receivable: number;
  total_received: number;
  total_overdue_receivable: number;
  total_payable: number;
  total_paid: number;
  total_overdue_payable: number;
  projected_balance: number;
  realized_balance: number;
}

export interface ReportRow {
  year: number;
  type_account_id: number;
  name: string;
  type: "receber" | "pagar";
  status: string;
  total: number;
}

export interface ReportFilters {
  start_date?: string;
  end_date?: string;
  type_account_id?: string;
  type?: "receber" | "pagar" | "";
  status?: string;
}
