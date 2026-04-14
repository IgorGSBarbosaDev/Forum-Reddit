# Backend - Visao Geral

## Stack

- Node.js
- TypeScript
- Express 5
- Prisma
- PostgreSQL
- Zod

## Objetivo do backend

O backend existe para oferecer uma API HTTP coerente para o forum, com:

- validacao padronizada
- regras de negocio centralizadas
- persistencia relacional
- respostas publicas sanitizadas

## Estrutura principal

```text
apps/api/src/
|-- app.ts
|-- server.ts
|-- config/
|-- constants/
|-- errors/
|-- lib/
|-- middlewares/
|-- routes/
|-- schemas/common/
|-- modules/
|   |-- posts/
|   |-- comments/
|   |-- users/
|   |-- follows/
|   |-- reactions/
|   |-- saved-posts/
|   `-- notifications/
|-- types/
`-- utils/
```

## Leitura recomendada

1. [`01-foundation.md`](./01-foundation.md)
2. [`02-posts-and-comments.md`](./02-posts-and-comments.md)
3. [`03-users-social-and-admin.md`](./03-users-social-and-admin.md)

## Regra de ouro desta pasta

Quando estiver lendo codigo backend, faca sempre estas perguntas:

1. isso e transporte HTTP ou regra de negocio?
2. isso deveria estar no controller ou no service?
3. isso e consulta ao banco ou transformacao de resposta?
4. essa regra esta protegendo integridade do dominio?

