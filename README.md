# Forum Reddit

Monorepo com tres runtimes:

- `apps/api`: API HTTP em Express
- `apps/web`: frontend React + Vite + TanStack Router
- `apps/worker`: processamento de notificacoes

Pacotes compartilhados:

- `packages/auth`: regras de autorizacao
- `packages/core`: regras de negocio por dominio
- `packages/database`: Prisma client, schema, migrations e seed
- `packages/infra`: adapters e infraestrutura
- `packages/jobs`: jobs do worker
- `packages/routes`: contratos de rotas HTTP e web
- `packages/types`: contratos tipados e validacao compartilhada

Arquitetura-base: [`docs/ARCHITECTURE_SPEC.md`](C:/Users/Igor/Documents/VSCode/Forum-Reddit/docs/ARCHITECTURE_SPEC.md)

## Requisitos

- Node.js 20+
- npm 10+
- Docker Desktop para Postgres local

## Ambiente

Crie ou ajuste o arquivo `.env` na raiz:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:admin@localhost:5434/forum_reddit?schema=public"
WORKER_INTERVAL_MS=0
```

## Setup inicial

```bash
npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
```

Endpoints locais:

- API: `http://localhost:3000`
- Web: `http://localhost:5173`
- Postgres: `localhost:5434`

## Desenvolvimento

API:

```bash
npm run dev:api
```

Web:

```bash
npm run dev:web
```

Worker:

```bash
npm run dev:worker
```

Fluxo normal de trabalho:

1. `npm run db:up`
2. `npm run dev:api`
3. `npm run dev:web`
4. `npm run dev:worker` quando precisar validar notificacoes

## Testes e validacao

Build completo:

```bash
npm run build
```

Web:

```bash
npm run test:web
```

API unit:

```bash
npm run test:api:unit
```

API integracao:

```bash
npm run test:api:db:up
npm run test:api:integration
```

Worker smoke:

```bash
npm run smoke:worker
```

Gate consolidado:

```bash
npm run verify:workspace
```

Observacoes do gate:

- `test:api:integration` exige Postgres acessivel em `localhost:5434`.
- `smoke:worker` exige `DATABASE_URL` configurada e banco acessivel.
- Quando Docker nao estiver ativo, a suite de integracao falha de forma explicita indicando `npm run test:api:db:up`.

## Estrutura

```text
Forum-Reddit/
|- apps/
|  |- api/
|  |- web/
|  `- worker/
|- packages/
|  |- auth/
|  |- core/
|  |- database/
|  |- infra/
|  |- jobs/
|  |- routes/
|  |- shared-types/
|  `- types/
|- docs/
|- compose.yml
`- package.json
```

`packages/shared-types` existe apenas como facade temporaria para compatibilidade. O contrato canonico e `@forum-reddit/types`.

## Frontend

O web agora usa:

- TanStack Router para definicao central de rotas em `apps/web/src/routes`
- TanStack Query para server state
- modulos por feature com `fetchers`, `queries`, `hooks` e `components`
- componentes compartilhados em `apps/web/src/components`

As URLs publicas foram preservadas:

- `/`
- `/posts/new`
- `/posts/:postId`
- `/posts/:postId/edit`
- `/users/:userId`
- `/users/:userId/followers`
- `/users/:userId/following`
- `/saved`
- `/admin/tools`

## Autenticacao local

O projeto usa autenticacao simulada no frontend via:

- `x-user-id`
- `x-user-role`

Usuarios do seed:

- `user-1`
- `user-2`
- `moderator-1`
- `admin`

## Troubleshooting

Postgres nao sobe:

```bash
npm run db:up
```

Se o comando falhar com pipe do Docker Desktop, o engine local nao esta ativo.

Banco subiu, mas a integracao ainda falha:

```bash
npm run prisma:migrate:dev
npm run db:seed
```

Worker falha ao iniciar:

- confira `DATABASE_URL` no `.env`
- confirme que o Postgres esta acessivel

## Referencias

- [`docs/ARCHITECTURE_SPEC.md`](C:/Users/Igor/Documents/VSCode/Forum-Reddit/docs/ARCHITECTURE_SPEC.md)
- [`docs/FRONTEND-SPEC.md`](C:/Users/Igor/Documents/VSCode/Forum-Reddit/docs/FRONTEND-SPEC.md)
