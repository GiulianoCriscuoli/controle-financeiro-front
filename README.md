# Controle Financeiro — Front-end

Front-end do sistema de controle financeiro do Grupo Studio. Feito em **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS 4** e **Recharts**.

Consome a API Laravel (Sanctum). O token de autenticação nunca é exposto ao JavaScript do cliente: fica em um cookie **httpOnly** (`auth_token`) gravado pelos route handlers do próprio Next, que atuam como proxy para o backend.

---

## Requisitos

- **Node.js** 20.19+ ou 22.13+ (recomendado 22 LTS)
- **npm** (ou pnpm/yarn/bun)
- Backend da API rodando e acessível (por padrão em `http://localhost:8093`)

---

## Configuração

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Crie o arquivo `.env.local` na raiz (há um `.env.example` de referência):

   ```env
   # URL base da API (backend Laravel). Os endpoints partem daqui.
   API_BASE_URL=http://localhost:8093
   ```

   - `API_BASE_URL` é usada **apenas no servidor** (route handlers e Server Components). Não tem prefixo `NEXT_PUBLIC_`, portanto não vaza para o navegador.
   - As rotas do backend são montadas como `${API_BASE_URL}/api/...` (ex.: `http://localhost:8093/api/login`).

---

## Rodando

### Desenvolvimento

```bash
npm run dev
```

App em **http://localhost:3000**. A raiz `/` redireciona para `/login`.

### Build de produção

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

---

## Login de teste

Com o backend de exemplo:

| Campo | Valor |
|---|---|
| E-mail | `teste@exemplo.com` |
| Senha | `Teste@123` |

Regras de senha do backend: mínimo 8 caracteres, com maiúscula, minúscula, número e símbolo.

---

## Estrutura

```
app/
  login/page.tsx              Tela de login
  dashboard/
    layout.tsx                Header + navegação + logout
    page.tsx                  Resumo por conta + gráficos (Server Component)
    relatorio/page.tsx        Relatório consolidado com filtros
    tipos-conta/page.tsx      CRUD de tipos de conta (clientes/fornecedores)
    transacoes/page.tsx       CRUD de transações financeiras
  api/
    auth/login/route.ts       Proxy do login; grava o cookie httpOnly
    auth/logout/route.ts      Revoga o token no backend e limpa o cookie
    dashboard/route.ts        Proxy autenticado -> GET /api/dashboard
    dashboard/report/route.ts Proxy autenticado -> GET /api/dashboard/report
    type-accounts/            Proxy autenticado do CRUD (+ [id])
    financial-transactions/   Proxy autenticado do CRUD (+ [id])
components/
  ui/                         Input, Select, Button, Modal
  DashboardNav.tsx            Navegação do dashboard
  DashboardCharts.tsx         Gráficos (Recharts)
  LogoutButton.tsx
lib/
  auth.ts                     Nome/opções do cookie, API_BASE_URL
  api-server.ts               apiFetch/apiJson (servidor) + proxy genérico
  api-client.ts               apiClient (Client Components) -> chama /api/*
  format.ts                   Formatação de moeda (BRL) e datas
proxy.ts                      Proteção de rotas (ex-middleware.ts)
types/                        Tipos de login, dashboard, contas e transações
```

---

## Autenticação e proteção de rotas

- **Login** (`/api/auth/login`): recebe `{ email, password }`, encaminha para `POST /api/login`. Em caso de sucesso, grava o `token` em cookie httpOnly e devolve apenas `{ message, user }`. Em erro, repassa `{ message, errors }` e o status (ex.: `422`) para o formulário exibir a mensagem por campo.
- **Logout** (`/api/auth/logout`): lê o token do cookie, chama `POST /api/logout` com `Authorization: Bearer` e apaga o cookie.
- **`proxy.ts`**: redireciona `/` e `/dashboard/*` para `/login` quando não há cookie; e de `/login` para `/dashboard` quando já autenticado.
- **CRUD**: os Client Components chamam os route handlers locais (`/api/type-accounts`, `/api/financial-transactions`, ...), que injetam o `Bearer` a partir do cookie e repassam método, corpo e querystring para o backend.

---

## Erros de validação

O backend responde `422` com o formato Laravel:

```json
{
  "message": "...",
  "errors": { "campo": ["mensagem"] }
}
```

O `apiClient` achata isso em `fieldErrors` (`{ campo: "mensagem" }`), que os formulários exibem abaixo de cada campo. Quando não há erro amarrado a um campo, a mensagem geral é mostrada no topo do formulário.

---

## Observações

- `GET /api/dashboard` retorna `500` se existir transação com `type_account_id` apontando para um tipo de conta inexistente (registro órfão). Nesse caso, o resumo mostra o detalhe do erro e as demais telas seguem funcionando.
- Excluir um tipo de conta com transações vinculadas depende da regra do backend (FK / validação).
