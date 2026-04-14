# Forum Reddit - Guia Completo do Projeto

Este material foi escrito como um guia de onboarding de um senior para um junior.

Objetivo:

- explicar como o projeto foi dividido
- mostrar o papel de cada camada
- detalhar o que cada service, controller, repository, mapper, hook e pagina faz
- registrar os padroes usados
- facilitar manutencao, debug e evolucao

## Ordem recomendada de leitura

1. [`01-mental-model.md`](./01-mental-model.md)
2. [`02-backend/README.md`](./02-backend/README.md)
3. [`02-backend/01-foundation.md`](./02-backend/01-foundation.md)
4. [`02-backend/02-posts-and-comments.md`](./02-backend/02-posts-and-comments.md)
5. [`02-backend/03-users-social-and-admin.md`](./02-backend/03-users-social-and-admin.md)
6. [`03-frontend/README.md`](./03-frontend/README.md)
7. [`03-frontend/01-app-shell-and-data-layer.md`](./03-frontend/01-app-shell-and-data-layer.md)
8. [`03-frontend/02-features.md`](./03-frontend/02-features.md)
9. [`04-shared-contracts-and-db.md`](./04-shared-contracts-and-db.md)
10. [`05-testing.md`](./05-testing.md)

## Estrutura desta pasta

```text
project-guide/
|-- README.md
|-- 01-mental-model.md
|-- 02-backend/
|   |-- README.md
|   |-- 01-foundation.md
|   |-- 02-posts-and-comments.md
|   `-- 03-users-social-and-admin.md
|-- 03-frontend/
|   |-- README.md
|   |-- 01-app-shell-and-data-layer.md
|   `-- 02-features.md
|-- 04-shared-contracts-and-db.md
`-- 05-testing.md
```

## Resumo executivo

Este repositorio e um monorepo com tres blocos principais:

- `apps/api`: backend HTTP em Express + Prisma
- `apps/web`: frontend em React + Vite + TanStack Query
- `packages/shared-types`: contratos TypeScript compartilhados entre backend e frontend

O projeto simula um forum estilo Reddit com:

- feed de posts
- detalhe de post
- comentarios em arvore
- likes
- posts salvos
- follow entre usuarios
- processamento manual de notificacoes
- autenticacao de desenvolvimento por headers

## Como pensar no sistema

Se voce estiver perdido, use este mapa mental:

1. o frontend chama a API via `shared/api/http-client.ts`
2. a API valida a entrada com middlewares Zod
3. a rota delega para um controller
4. o controller delega para um service
5. o service aplica regra de negocio
6. o repository conversa com Prisma/PostgreSQL
7. o mapper monta o DTO publico
8. o frontend recebe dados tipados via `shared-types`
9. TanStack Query cacheia, invalida e refaz as consultas

Esse fluxo aparece quase em todo o projeto.

