"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { apiClient } from "@/lib/api-client";
import { formatBRL, formatDate, toDateInput } from "@/lib/format";
import type { TypeAccount } from "@/types/type-account";
import {
  STATUS_BY_TYPE,
  TRANSACTION_TYPE_LABEL,
  type FinancialTransaction,
  type TransactionStatus,
  type TransactionType,
} from "@/types/financial-transaction";

interface FormState {
  type_account_id: string;
  type: TransactionType;
  description: string;
  amount: string;
  issue_date: string;
  due_date: string;
  status: TransactionStatus;
  settlement_date: string;
}

const EMPTY_FORM: FormState = {
  type_account_id: "",
  type: "receber",
  description: "",
  amount: "",
  issue_date: "",
  due_date: "",
  status: "pendente",
  settlement_date: "",
};

const ALL_STATUS: TransactionStatus[] = [
  "pendente",
  "recebido",
  "pago",
  "vencido",
  "cancelado",
];

export default function TransacoesPage() {
  const [items, setItems] = useState<FinancialTransaction[]>([]);
  const [accounts, setAccounts] = useState<TypeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [fType, setFType] = useState<"" | TransactionType>("");
  const [fStatus, setFStatus] = useState("");
  const [fAccount, setFAccount] = useState("");
  const [fSearch, setFSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FinancialTransaction | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return Promise.all([
      apiClient<FinancialTransaction[]>("/financial-transactions"),
      apiClient<TypeAccount[]>("/type-accounts"),
    ]).then(([tx, acc]) => {
      setLoading(false);
      if (!tx.ok) {
        setLoadError(tx.message ?? "Falha ao carregar transações.");
        return;
      }
      setLoadError("");
      setItems(tx.data ?? []);
      if (acc.ok && acc.data) setAccounts(acc.data);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const accountName = useCallback(
    (id: number) => accounts.find((a) => a.id === id)?.name ?? `#${id}`,
    [accounts]
  );

  const filtered = useMemo(() => {
    return items.filter((t) => {
      if (fType && t.type !== fType) return false;
      if (fStatus && t.status !== fStatus) return false;
      if (fAccount && String(t.type_account_id) !== fAccount) return false;
      if (
        fSearch &&
        !t.description.toLowerCase().includes(fSearch.toLowerCase())
      )
        return false;
      return true;
    });
  }, [items, fType, fStatus, fAccount, fSearch]);

  const statusOptionsFor = (type: TransactionType) =>
    STATUS_BY_TYPE[type].map((s) => ({
      value: s,
      label: s[0].toUpperCase() + s.slice(1),
    }));

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(t: FinancialTransaction) {
    setEditing(t);
    setForm({
      type_account_id: String(t.type_account_id),
      type: t.type,
      description: t.description,
      amount: t.amount,
      issue_date: toDateInput(t.issue_date),
      due_date: toDateInput(t.due_date),
      status: t.status,
      settlement_date: toDateInput(t.settlement_date),
    });
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => {
      const next = { ...f, [key]: value };
      // Ao trocar o tipo, garante status compatível.
      if (key === "type") {
        const allowed = STATUS_BY_TYPE[value as TransactionType];
        if (!allowed.includes(next.status)) next.status = allowed[0];
      }
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError("");

    const payload = {
      type_account_id: Number(form.type_account_id),
      type: form.type,
      description: form.description,
      amount: Number(form.amount),
      issue_date: form.issue_date,
      due_date: form.due_date,
      status: form.status,
      settlement_date: form.settlement_date || null,
    };

    const r = editing
      ? await apiClient(`/financial-transactions/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
      : await apiClient("/financial-transactions", {
          method: "POST",
          body: JSON.stringify(payload),
        });

    setSaving(false);

    if (!r.ok) {
      setFieldErrors(r.fieldErrors);
      if (Object.keys(r.fieldErrors).length === 0) {
        setFormError(r.message ?? "Não foi possível salvar.");
      }
      return;
    }

    setModalOpen(false);
    await load();
  }

  async function remove(t: FinancialTransaction) {
    if (!confirm(`Excluir o lançamento "${t.description}"?`)) return;
    const r = await apiClient(`/financial-transactions/${t.id}`, {
      method: "DELETE",
    });
    if (!r.ok) {
      alert(r.message ?? "Não foi possível excluir.");
      return;
    }
    await load();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Input
            id="fSearch"
            label="Descrição"
            placeholder="buscar"
            value={fSearch}
            onChange={(e) => setFSearch(e.target.value)}
          />
          <Select
            id="fType"
            label="Tipo"
            placeholder="Todos"
            value={fType}
            onChange={(e) => setFType(e.target.value as "" | TransactionType)}
            options={[
              { value: "receber", label: TRANSACTION_TYPE_LABEL.receber },
              { value: "pagar", label: TRANSACTION_TYPE_LABEL.pagar },
            ]}
          />
          <Select
            id="fStatus"
            label="Status"
            placeholder="Todos"
            value={fStatus}
            onChange={(e) => setFStatus(e.target.value)}
            options={ALL_STATUS.map((s) => ({
              value: s,
              label: s[0].toUpperCase() + s.slice(1),
            }))}
          />
          <Select
            id="fAccount"
            label="Conta"
            placeholder="Todas"
            value={fAccount}
            onChange={(e) => setFAccount(e.target.value)}
            options={accounts.map((a) => ({
              value: String(a.id),
              label: a.name,
            }))}
          />
        </div>
        <Button type="button" onClick={openCreate} className="w-auto px-5 py-2">
          Novo
        </Button>
      </div>

      {loadError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {loadError}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-primary/20 text-left text-dark/60">
              <th className="px-4 py-3 font-medium">Descrição</th>
              <th className="px-4 py-3 font-medium">Conta</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 text-right font-medium">Valor</th>
              <th className="px-4 py-3 font-medium">Emissão</th>
              <th className="px-4 py-3 font-medium">Vencimento</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-dark/40">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-dark/40">
                  Nenhum lançamento.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-primary/10 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-dark">
                    {t.description}
                  </td>
                  <td className="px-4 py-3">{accountName(t.type_account_id)}</td>
                  <td className="px-4 py-3">
                    {TRANSACTION_TYPE_LABEL[t.type]}
                  </td>
                  <td className="px-4 py-3 text-right">{formatBRL(t.amount)}</td>
                  <td className="px-4 py-3">{formatDate(t.issue_date)}</td>
                  <td className="px-4 py-3">{formatDate(t.due_date)}</td>
                  <td className="px-4 py-3 capitalize">{t.status}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(t)}
                      className="text-sm font-medium text-dark/70 hover:text-dark"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(t)}
                      className="ml-4 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        title={editing ? "Editar lançamento" : "Novo lançamento"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Select
            id="type_account_id"
            label="Conta"
            placeholder="Selecione"
            value={form.type_account_id}
            onChange={(e) => set("type_account_id", e.target.value)}
            error={fieldErrors.type_account_id}
            options={accounts.map((a) => ({
              value: String(a.id),
              label: a.name,
            }))}
            required
          />
          <Select
            id="type"
            label="Tipo"
            value={form.type}
            onChange={(e) => set("type", e.target.value as TransactionType)}
            error={fieldErrors.type}
            options={[
              { value: "receber", label: TRANSACTION_TYPE_LABEL.receber },
              { value: "pagar", label: TRANSACTION_TYPE_LABEL.pagar },
            ]}
          />
          <Input
            id="description"
            label="Descrição (mín. 10 caracteres)"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            error={fieldErrors.description}
            required
          />
          <Input
            id="amount"
            label="Valor"
            type="number"
            step="0.01"
            min="0"
            value={form.amount}
            onChange={(e) => set("amount", e.target.value)}
            error={fieldErrors.amount}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="issue_date"
              label="Emissão"
              type="date"
              value={form.issue_date}
              onChange={(e) => set("issue_date", e.target.value)}
              error={fieldErrors.issue_date}
              required
            />
            <Input
              id="due_date"
              label="Vencimento"
              type="date"
              value={form.due_date}
              onChange={(e) => set("due_date", e.target.value)}
              error={fieldErrors.due_date}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select
              id="status"
              label="Status"
              value={form.status}
              onChange={(e) =>
                set("status", e.target.value as TransactionStatus)
              }
              error={fieldErrors.status}
              options={statusOptionsFor(form.type)}
            />
            <Input
              id="settlement_date"
              label="Liquidação (opcional)"
              type="date"
              value={form.settlement_date}
              onChange={(e) => set("settlement_date", e.target.value)}
              error={fieldErrors.settlement_date}
            />
          </div>

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {formError}
            </p>
          )}

          <div className="mt-2 flex gap-2">
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-lg border border-primary px-4 py-3 text-sm font-semibold text-dark hover:bg-primary/10"
            >
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
