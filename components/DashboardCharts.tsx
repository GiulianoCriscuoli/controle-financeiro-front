"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/lib/format";
import type { DashboardSummary } from "@/types/dashboard";

const COLORS = {
  receivable: "#FECA77",
  received: "#3B9C6D",
  payable: "#E4894A",
  paid: "#C0453B",
  positive: "#3B9C6D",
  negative: "#C0453B",
};

export function DashboardCharts({ rows }: { rows: DashboardSummary[] }) {
  const data = rows.map((r) => ({
    name: r.name,
    "A receber": r.total_receivable,
    Recebido: r.total_received,
    "A pagar": r.total_payable,
    Pago: r.total_paid,
    "Saldo projetado": r.projected_balance,
    "Saldo realizado": r.realized_balance,
  }));

  const compact = (v: number) =>
    new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v);

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-dark">
          Receber vs. Pagar por conta
        </p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={compact} width={56} />
            <Tooltip
              formatter={(v) => formatBRL(Number(v))}
              contentStyle={{ borderRadius: 12, fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="A receber" fill={COLORS.receivable} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Recebido" fill={COLORS.received} radius={[4, 4, 0, 0]} />
            <Bar dataKey="A pagar" fill={COLORS.payable} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Pago" fill={COLORS.paid} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm">
        <p className="mb-4 text-sm font-semibold text-dark">Saldos por conta</p>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#00000010" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={compact} width={56} />
            <Tooltip
              formatter={(v) => formatBRL(Number(v))}
              contentStyle={{ borderRadius: 12, fontSize: 13 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Saldo projetado" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d["Saldo projetado"] >= 0
                      ? COLORS.positive
                      : COLORS.negative
                  }
                />
              ))}
            </Bar>
            <Bar dataKey="Saldo realizado" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={
                    d["Saldo realizado"] >= 0
                      ? "#8FCBB0"
                      : "#E39A93"
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
