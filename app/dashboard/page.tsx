export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-light p-5 shadow-sm">
          <p className="text-sm text-gray-500">A Receber</p>
          <p className="mt-2 text-2xl font-bold text-dark">—</p>
        </div>
        <div className="rounded-xl bg-light p-5 shadow-sm">
          <p className="text-sm text-gray-500">A Pagar</p>
          <p className="mt-2 text-2xl font-bold text-dark">—</p>
        </div>
        <div className="rounded-xl bg-light p-5 shadow-sm">
          <p className="text-sm text-gray-500">Saldo Projetado</p>
          <p className="mt-2 text-2xl font-bold text-dark">—</p>
        </div>
      </div>

      <div className="rounded-xl bg-light p-5 shadow-sm">
        <p className="text-sm font-medium text-dark">Contas recentes</p>
        <p className="mt-4 text-sm text-gray-400">
          Nenhuma conta carregada ainda — integração com a API entra em breve.
        </p>
      </div>
    </div>
  );
}