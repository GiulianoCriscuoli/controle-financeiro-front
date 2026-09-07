"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ApiValidationError, FieldErrors } from "@/types/login";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    setFormError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const err = (data ?? {}) as ApiValidationError;
        const errors = err.errors ?? {};
        setFieldErrors({
          email: errors.email?.[0],
          password: errors.password?.[0],
        });
        // Mensagem geral só quando não há erro amarrado a um campo.
        if (!errors.email && !errors.password) {
          setFormError(err.message ?? "Não foi possível entrar.");
        }
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setFormError("Falha de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <Image
        src="/images/hall.webp"
        alt=""
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-black/85" />

      <div className="relative w-full max-w-sm rounded-3xl border border-primary/30 bg-light p-8 shadow-2xl">
        <div className="mb-6 flex justify-center rounded-xl bg-dark py-5">
          <Image
            src="/images/LOGO-GRUPO-STUDIO-V1-BRANCO.webp"
            alt="Grupo Studio"
            width={137}
            height={42}
            quality={100}
            style={{ width: "160px", height: "auto" }}
            priority
          />
        </div>

        <span className="mb-6 block text-center text-sm font-medium text-dark/70">
          Sistema de Controle Financeiro
        </span>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="email"
            label=""
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu email"
            autoComplete="email"
            error={fieldErrors.email}
            required
          />

          <Input
            id="password"
            label=""
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            autoComplete="current-password"
            error={fieldErrors.password}
            required
          />

          {formError && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
              {formError}
            </p>
          )}

          <Button type="submit" className="mt-2" disabled={loading}>
            {loading ? "Entrando..." : "Acessar"}
          </Button>
        </form>
      </div>
    </div>
  );
}