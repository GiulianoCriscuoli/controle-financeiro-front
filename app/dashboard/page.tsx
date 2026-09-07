import { redirect } from "next/navigation";
import { apiJson, ApiError } from "@/lib/api-server";
import { formatBRL } from "@/lib/format";
import { DashboardCharts } from "@/components/DashboardCharts";
import type { DashboardSummary } from "@/types/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let rows: DashboardSummary[] = [];

  try {
    rows = await apiJson<DashboardSummary[]>("/dashboard");
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) redirect("/login");
    const detail =
      e instanceof ApiError
        ? `${e.status} — ${e.message}`
        : e instanceof Error
          ? e.message
          : String(e);
    console.error("[dashboard] falha ao carregar /dashboard:", e);
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        <p className="font-medium">Não foi possível carregar o resumo financeiro.</p>
        <p className="mt-1 text-xs text-red-500">{detail}</p>
      </div>
    );
  }

  if (!Array.isArray(rows)) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        <p className="font-medium">Formato inesperado da API.</p>
        <pre className="mt-1 overflow-x-auto text-xs text-red-500">
          {JSON.stringify(rows, null, 2)}
        </pre>
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-xl bg-white p-8 text-center text-sm text-dark/40 shadow-sm">
        Nenhum dado disponível.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardCharts rows={rows} />

      {/* Um cartão de resumo por conta — cada conta tem seus próprios totais. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rows.map((r) => (
          <AccountCard key={r.type_account_id} row={r} />
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-primary/20 text-left text-dark/60">
              <th className="px-4 py-3 font-medium">Conta</th>
              <th className="px-4 py-3 text-right font-medium">A receber</th>
              <th className="px-4 py-3 text-right font-medium">Recebido</th>
              <th className="px-4 py-3 text-right font-medium">Venc. receber</th>
              <th className="px-4 py-3 text-right font-medium">A pagar</th>
              <th className="px-4 py-3 text-right font-medium">Pago</th>
              <th className="px-4 py-3 text-right font-medium">Venc. pagar</th>
              <th className="px-4 py-3 text-right font-medium">Projetado</th>
              <th className="px-4 py-3 text-right font-medium">Realizado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.type_account_id}
                className="border-b border-primary/10 last:border-0"
              >
                <td className="px-4 py-3 font-medium text-dark">{r.name}</td>
                <td className="px-4 py-3 text-right">
                  {formatBRL(r.total_receivable)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatBRL(r.total_received)}
                </td>
                <td className="px-4 py-3 text-right text-red-600">
                  {formatBRL(r.total_overdue_receivable)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatBRL(r.total_payable)}
                </td>
                <td className="px-4 py-3 text-right">
                  {formatBRL(r.total_paid)}
                </td>
                <td className="px-4 py-3 text-right text-red-600">
                  {formatBRL(r.total_overdue_payable)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatBRL(r.projected_balance)}
                </td>
                <td className="px-4 py-3 text-right font-medium">
                  {formatBRL(r.realized_balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountCard({ row }: { row: DashboardSummary }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-dark">{row.name}</p>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Line label="A receber" value={row.total_receivable} />
        <Line label="Recebido" value={row.total_received} />
        <Line
          label="Venc. a receber"
          value={row.total_overdue_receivable}
          danger
        />
        <Line label="A pagar" value={row.total_payable} />
        <Line label="Pago" value={row.total_paid} />
        <Line
          label="Venc. a pagar"
          value={row.total_overdue_payable}
          danger
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-primary/20 pt-4">
        <div>
          <p className="text-xs text-dark/50">Saldo projetado</p>
          <p className="text-lg font-bold text-dark">
            {formatBRL(row.projected_balance)}
          </p>
        </div>
        <div>
          <p className="text-xs text-dark/50">Saldo realizado</p>
          <p className="text-lg font-bold text-dark">
            {formatBRL(row.realized_balance)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Line({
  label,
  value,
  danger,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-dark/50">{label}</span>
      <span className={danger ? "font-medium text-red-600" : "font-medium"}>
        {formatBRL(value)}
      </span>
    </div>
  );
}
