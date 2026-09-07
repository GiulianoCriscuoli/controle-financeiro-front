"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "Resumo" },
  { href: "/dashboard/relatorio", label: "Relatório" },
  { href: "/dashboard/tipos-conta", label: "Tipos de Conta" },
  { href: "/dashboard/transacoes", label: "Transações" },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-primary/20 bg-white">
      <div className="mx-auto flex max-w-6xl gap-1 px-6">
        {LINKS.map((l) => {
          const active =
            l.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`border-b-2 px-4 py-3 text-sm font-medium transition ${
                active
                  ? "border-primary text-dark"
                  : "border-transparent text-dark/50 hover:text-dark"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
