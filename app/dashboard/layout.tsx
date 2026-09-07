import Image from "next/image";
import { LogoutButton } from "@/components/LogoutButton";
import { DashboardNav } from "@/components/DashboardNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-light">
      <header className="flex items-center justify-between border-b border-primary/30 bg-dark px-6 py-4">
        <Image
          src="/images/LOGO-GRUPO-STUDIO-V1-BRANCO.webp"
          alt="Grupo Studio"
          width={137}
          height={42}
          quality={100}
          style={{ width: "140px", height: "auto" }}
          priority
        />
        <LogoutButton />
      </header>
      <DashboardNav />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
