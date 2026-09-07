"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { apiClient } from "@/lib/api-client";
import { formatBRL } from "@/lib/format";
import type { ReportRow, ReportFilters } from "@/types/dashboard";
import type { TypeAccount } from "@/types/type-account";
import { TRANSACTION_TYPE_LABEL } from "@/types/financial-transaction";

const STATUS_OPTIONS = [
  "pendente",
  "recebido",
  "pago",
  "vencido",
  "cancelado",
].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }));

const EMPTY: ReportFilters = {
  start_date: "",
  end_date: "",
  type_account_id: "",
  type: "",
  status: "",
};

export default function RelatorioPage() {
  const [filters, setFilters] = useState<ReportFilters>(EMPTY);
  const [accounts, setAccounts] = useState<TypeAccount[]>([]);
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    apiClient<TypeAccount[]>("/type-accounts").then((r) => {
      if (r.ok && r.data) setAccounts(r.data);
    });
  }, []);

  async function runReport(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    const qs = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });

    const r = await apiClient<ReportRow[]>(
      `/dashboard/report${qs.toString() ? `?${qs}` : ""}`
    );
    setLoading(false);

    if (!r.ok) {
      setFieldErrors(r.fieldErrors);
      setError(
        Object.keys(r.fieldErrors).length === 0
          ? r.message ?? "Falha ao gerar o relatório."
          : ""
      );
      setRows([]);
      return;
    }
    setRows(r.data ?? []);
  }

  function set<K extends keyof ReportFilters>(key: K, value: ReportFilters[K]) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={runReport}
        className="grid grid-cols-1 gap-4 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-3"
      >
        <Input
          id="start_date"
          label="Início (vencimento)"
          type="date"
          value={filters.start_date}
          onChange={(e) => set("start_date", e.target.value)}
          error={fieldErrors.start_date}
        />
        <Input
          id="end_date"
          label="Fim (vencimento)"
          type="date"
          value={filters.end_date}
          onChange={(e) => set("end_date", e.target.value)}
          error={fieldErrors.end_date}
        />
        <Select
          id="type_account_id"
          label="Conta"
          placeholder="Todas"
          value={filters.type_account_id}
          onChange={(e) => set("type_account_id", e.target.value)}
          error={fieldErrors.type_account_id}
          options={accounts.map((a) => ({
            value: String(a.id),
            label: a.name,
          }))}
        />
        <Select
          id="type"
          label="Tipo"
          placeholder="Todos"
          value={filters.type}
          onChange={(e) =>
            set("type", e.target.value as ReportFilters["type"])
          }
          error={fieldErrors.type}
          options={[
            { value: "receber", label: TRANSACTION_TYPE_LABEL.receber },
            { value: "pagar", label: TRANSACTION_TYPE_LABEL.pagar },
          ]}
        />
        <Select
          id="status"
          label="Status"
          placeholder="Todos"
          value={filters.status}
          onChange={(e) => set("status", e.target.value)}
          error={fieldErrors.status}
          options={STATUS_OPTIONS}
        />
        <div className="flex items-end gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Gerando..." : "Gerar"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setFilters(EMPTY);
              setRows([]);
              setError("");
              setFieldErrors({});
            }}
            className="rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-dark hover:bg-primary/10"
          >
            Limpar
          </button>
        </div>
      </form>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-primary/20 text-left text-dark/60">
              <th className="px-4 py-3 font-medium">Ano</th>
              <th className="px-4 py-3 font-medium">Conta</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-dark/40">
                  Nenhum resultado. Ajuste os filtros e clique em Gerar.
                </td>
              </tr>
            )}
            {rows.map((r, i) => (
              <tr
                key={`${r.year}-${r.type_account_id}-${r.type}-${r.status}-${i}`}
                className="border-b border-primary/10 last:border-0"
              >
                <td className="px-4 py-3">{r.year}</td>
                <td className="px-4 py-3 font-medium text-dark">{r.name}</td>
                <td className="px-4 py-3">
                  {TRANSACTION_TYPE_LABEL[r.type] ?? r.type}
                </td>
                <td className="px-4 py-3 capitalize">{r.status}</td>
                <td className="px-4 py-3 text-right">{formatBRL(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
