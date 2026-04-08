# Forum Reddit Monorepo

Monorepo com backend API e frontend web para o projeto de forum estilo Reddit.

## Workspaces

- `apps/api`: backend Node.js + TypeScript + Express + Prisma
- `apps/web`: frontend React + TypeScript + Vite
- `packages/shared-types`: contratos compartilhados (tipos de API)
- `docs`: documentação funcional e técnica do projeto

## Scripts do root

- `npm run dev`: sobe o backend (`apps/api`) em watch
- `npm run dev:api`: mesmo comportamento do `dev`
- `npm run dev:web`: sobe o frontend (`apps/web`)
- `npm run build`: build de todos os workspaces com script `build`
- `npm run test`: executa testes do backend
- `npm run start`: executa backend compilado
- `npm run prisma:generate`: gera Prisma Client para `apps/api`
- `npm run prisma:migrate:dev`: roda migration no backend
- `npm run prisma:studio`: abre Prisma Studio do backend

## Setup local

1. Instale dependências no root:

```bash
npm install
```

2. Ajuste o `.env` na raiz com `DATABASE_URL`.

3. Gere o client do Prisma:

```bash
npm run prisma:generate
```

4. Rode o backend:

```bash
npm run dev
```

5. Rode o frontend em outro terminal:

```bash
npm run dev:web
```

## Observações

- O frontend usa proxy de desenvolvimento para `/api` apontando para `http://localhost:3000`.
- O contrato compartilhado inicial está em `packages/shared-types/src`.
- Toda documentação do projeto foi consolidada em `docs/`.
