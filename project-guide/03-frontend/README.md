# Frontend - Visao Geral

## Stack

- React 18
- TypeScript
- React Router
- TanStack Query
- React Hook Form
- Zod
- Vite

## Objetivo do frontend

Entregar uma interface funcional para o forum, com:

- navegacao entre paginas
- sessao de desenvolvimento baseada em headers
- consumo tipado da API
- cache e refetch inteligentes
- mutacoes com feedback e alguns updates otimistas

## Estrutura principal

```text
apps/web/src/
|-- App.tsx
|-- main.tsx
|-- app/
|   |-- layout/
|   |-- providers/
|   `-- router/
|-- features/
|   |-- auth-context/
|   |-- posts/
|   |-- comments/
|   |-- users/
|   |-- saved-posts/
|   `-- notifications-admin/
|-- shared/
|   |-- api/
|   |-- lib/
|   `-- ui/
|-- test/
`-- styles.css
```

## Filosofia da estrutura

O frontend esta dividido por feature, nao por tipo tecnico puro.

Leitura recomendada:

1. [`01-app-shell-and-data-layer.md`](./01-app-shell-and-data-layer.md)
2. [`02-features.md`](./02-features.md)

