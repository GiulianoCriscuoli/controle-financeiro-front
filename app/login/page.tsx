"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [senha, setSenha] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // integração com a API Laravel (Sanctum) entra aqui depois
    console.log({ identifier, senha });
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="identifier"
            label=""
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="seu email"
            required
          />

          <Input
            id="senha"
            label=""
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••••••"
            required
          />

          <Button type="submit" className="mt-2">Acessar</Button>
        </form>
      </div>
    </div>
  );
}