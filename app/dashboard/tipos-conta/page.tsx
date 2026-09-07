"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { apiClient } from "@/lib/api-client";
import {
  TYPE_ACCOUNT_KIND_LABEL,
  type TypeAccount,
  type TypeAccountKind,
} from "@/types/type-account";

interface FormState {
  name: string;
  cpf_cnpj: string;
  email: string;
  phone: string;
  type: TypeAccountKind;
}

const EMPTY_FORM: FormState = {
  name: "",
  cpf_cnpj: "",
  email: "",
  phone: "",
  type: "C",
};

export default function TiposContaPage() {
  const [items, setItems] = useState<TypeAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState<"" | TypeAccountKind>("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TypeAccount | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    return apiClient<TypeAccount[]>("/type-accounts").then((r) => {
      setLoading(false);
      if (!r.ok) {
        setLoadError(r.message ?? "Falha ao carregar.");
        return;
      }
      setLoadError("");
      setItems(r.data ?? []);
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      const matchSearch =
        !search ||
        it.name.toLowerCase().includes(search.toLowerCase()) ||
        it.cpf_cnpj.includes(search) ||
        it.email.toLowerCase().includes(search.toLowerCase());
      const matchKind = !kindFilter || it.type === kindFilter;
      return matchSearch && matchKind;
    });
  }, [items, search, kindFilter]);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(it: TypeAccount) {
    setEditing(it);
    setForm({
      name: it.name,
      cpf_cnpj: it.cpf_cnpj,
      email: it.email,
      phone: it.phone,
      type: it.type,
    });
    setFieldErrors({});
    setFormError("");
    setModalOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFormError("");

    const r = editing
      ? await apiClient(`/type-accounts/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(form),
        })
      : await apiClient("/type-accounts", {
          method: "POST",
          body: JSON.stringify(form),
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

  async function remove(it: TypeAccount) {
    if (!confirm(`Excluir "${it.name}"?`)) return;
    const r = await apiClient(`/type-accounts/${it.id}`, { method: "DELETE" });
    if (!r.ok) {
      alert(
        r.message ??
          "Não foi possível excluir (pode haver transações vinculadas)."
      );
      return;
    }
    await load();
  }

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            id="search"
            label="Buscar"
            placeholder="nome, documento ou e-mail"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select
            id="kindFilter"
            label="Tipo"
            placeholder="Todos"
            value={kindFilter}
            onChange={(e) =>
              setKindFilter(e.target.value as "" | TypeAccountKind)
            }
            options={[
              { value: "C", label: "Cliente" },
              { value: "F", label: "Fornecedor" },
            ]}
          />
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="w-auto px-5 py-2"
        >
          Novo
        </Button>
      </div>

      {loadError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {loadError}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-primary/20 text-left text-dark/60">
              <th className="px-4 py-3 font-medium">Nome</th>
              <th className="px-4 py-3 font-medium">CPF/CNPJ</th>
              <th className="px-4 py-3 font-medium">E-mail</th>
              <th className="px-4 py-3 font-medium">Telefone</th>
              <th className="px-4 py-3 font-medium">Tipo</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-dark/40">
                  Carregando...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-dark/40">
                  Nenhum registro.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((it) => (
                <tr
                  key={it.id}
                  className="border-b border-primary/10 last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-dark">{it.name}</td>
                  <td className="px-4 py-3">{it.cpf_cnpj}</td>
                  <td className="px-4 py-3">{it.email}</td>
                  <td className="px-4 py-3">{it.phone}</td>
                  <td className="px-4 py-3">
                    {TYPE_ACCOUNT_KIND_LABEL[it.type]}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      onClick={() => openEdit(it)}
                      className="text-sm font-medium text-dark/70 hover:text-dark"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => remove(it)}
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
        title={editing ? "Editar tipo de conta" : "Novo tipo de conta"}
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
          <Input
            id="name"
            label="Nome"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            error={fieldErrors.name}
            required
          />
          <Input
            id="cpf_cnpj"
            label="CPF (11 dígitos) ou CNPJ (14, sem pontuação)"
            value={form.cpf_cnpj}
            onChange={(e) => set("cpf_cnpj", e.target.value)}
            error={fieldErrors.cpf_cnpj}
            required
          />
          <Input
            id="email"
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            error={fieldErrors.email}
            required
          />
          <Input
            id="phone"
            label="Telefone (10 a 11 dígitos)"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            error={fieldErrors.phone}
            required
          />
          <Select
            id="type"
            label="Tipo"
            value={form.type}
            onChange={(e) => set("type", e.target.value as TypeAccountKind)}
            error={fieldErrors.type}
            options={[
              { value: "C", label: "Cliente" },
              { value: "F", label: "Fornecedor" },
            ]}
          />

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
