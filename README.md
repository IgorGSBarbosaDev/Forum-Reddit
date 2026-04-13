# Forum Reddit

Monorepo com backend em Express + Prisma e frontend em React + Vite para um fórum estilo Reddit.

Este projeto foi organizado para rodar localmente com PostgreSQL via Docker e um fluxo simples de desenvolvimento:

- API em `http://localhost:3000`
- Web em `http://localhost:5173`
- Banco PostgreSQL em `localhost:5434`

## Visão Geral

O repositório é dividido em três partes principais:

- `apps/api`: API HTTP em Node.js, TypeScript, Express e Prisma
- `apps/web`: frontend em React, TypeScript e Vite
- `packages/shared-types`: tipos compartilhados entre backend e frontend

## Funcionalidades Principais

- feed de posts
- criação, edição e remoção lógica de posts
- comentários e respostas encadeadas
- curtidas em posts e comentários
- posts salvos
- seguidores e seguindo
- processamento manual de notificações
- autenticação simulada por headers para desenvolvimento local

## Stack Técnica

- Node.js
- npm workspaces
- TypeScript
- Express
- Prisma
- PostgreSQL
- React
- React Router
- TanStack Query
- Vite
- Vitest

## Pré-Requisitos

Antes de rodar o projeto, tenha instalado:

- Node.js 20+ ou superior
- npm 10+ ou superior
- Docker Desktop

## Estrutura do Repositório

```text
Forum-Reddit/
├─ apps/
│  ├─ api/
│  └─ web/
├─ packages/
│  └─ shared-types/
├─ docker-compose.yml
├─ package.json
└─ README.md
```

## Variáveis de Ambiente

O projeto usa um arquivo `.env` em `apps/api/.env`. O formato esperado hoje é:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:admin@localhost:5434/forum_reddit?schema=public"
```

Se esse arquivo não existir, crie-o em `apps/api/.env`.

## Como Rodar na Máquina

### 0. Configure as variáveis de ambiente da API

Crie o arquivo `apps/api/.env` com:

```env
PORT=3000
DATABASE_URL="postgresql://postgres:admin@localhost:5434/forum_reddit?schema=public"
```

### 1. Instale as dependências

Na raiz do projeto:

```bash
npm install
```

### 2. Suba o PostgreSQL com Docker

```bash
npm run db:up
```

Isso sobe o container definido em [`docker-compose.yml`](./docker-compose.yml) com:

- usuário: `postgres`
- senha: `admin`
- banco: `forum_reddit`
- porta exposta: `5434`

Se quiser acompanhar os logs do banco:

```bash
npm run db:logs
```

### 3. Gere o Prisma Client

```bash
npm run prisma:generate
```

### 4. Rode as migrations

```bash
npm run prisma:migrate:dev
```

Esse passo cria ou atualiza o schema do banco local.

### 5. Popule o banco com usuários de desenvolvimento

```bash
npm run db:seed
```

O seed atual cria estes usuários:

- `user-1`
- `user-2`
- `moderator-1`
- `admin`

### 6. Rode o backend

Em um terminal:

```bash
npm run dev
```

ou:

```bash
npm run dev:api
```

A API ficará disponível em:

```text
http://localhost:3000
```

### 7. Rode o frontend

Em outro terminal:

```bash
npm run dev:web
```

O frontend ficará disponível em:

```text
http://localhost:5173
```

O Vite está configurado para fazer proxy de `/api` para `http://localhost:3000`.

## Fluxo Recomendado de Desenvolvimento

Depois do setup inicial, o fluxo normal é:

1. `npm run db:up`
2. `npm run dev`
3. `npm run dev:web`

Se você apagou o volume do banco, trocou migrations ou começou do zero, rode novamente:

1. `npm run prisma:generate`
2. `npm run prisma:migrate:dev`
3. `npm run db:seed`

## Como Usar a Aplicação Localmente

Ao abrir o frontend, existe uma barra superior para configurar a sessão de desenvolvimento.

### Sessão de desenvolvimento

A aplicação não usa login real neste momento. Em vez disso, o frontend envia headers para simular o usuário atual:

- `x-user-id`
- `x-user-role`

Use IDs existentes no banco seedado, por exemplo:

- `user-1` com role `user`
- `user-2` com role `user`
- `moderator-1` com role `moderator`
- `admin` com role `admin`

### Observação importante

O usuário precisa existir no banco e estar ativo. Se você preencher um `x-user-id` inexistente, a interface vai marcar a sessão como inválida e bloquear ações autenticadas.

## Scripts Disponíveis

### Raiz do monorepo

- `npm run dev`: sobe a API em modo watch
- `npm run dev:api`: sobe a API em modo watch
- `npm run dev:web`: sobe o frontend em modo dev
- `npm run db:up`: sobe o PostgreSQL via Docker
- `npm run db:down`: derruba os containers do compose
- `npm run db:logs`: mostra os logs do PostgreSQL
- `npm run db:seed`: executa o seed do backend
- `npm run build`: gera build de todos os workspaces
- `npm run test`: roda testes da API
- `npm run test:web`: roda testes do frontend
- `npm run test:all`: roda API e frontend
- `npm run start`: inicia a API compilada
- `npm run prisma:generate`: gera o Prisma Client
- `npm run prisma:migrate:dev`: roda migrations do Prisma
- `npm run prisma:studio`: abre o Prisma Studio

### `apps/api`

- `npm run dev -w @forum-reddit/api`
- `npm run build -w @forum-reddit/api`
- `npm run test -w @forum-reddit/api`
- `npm run prisma:generate -w @forum-reddit/api`
- `npm run prisma:migrate:dev -w @forum-reddit/api`
- `npm run prisma:seed -w @forum-reddit/api`

### `apps/web`

- `npm run dev -w @forum-reddit/web`
- `npm run build -w @forum-reddit/web`
- `npm run test -w @forum-reddit/web`

## Testes

Para os testes da API, garanta antes:

1. PostgreSQL ativo (`npm run db:up`)
2. Prisma Client gerado (`npm run prisma:generate`)
3. migrations aplicadas (`npm run prisma:migrate:dev`)

### Backend

```bash
npm run test
```

### Frontend

```bash
npm run test:web
```

### Tudo

```bash
npm run test:all
```

## Build

Para validar compilação completa:

```bash
npm run build
```

## Troubleshooting

### Não consigo postar

Verifique estes pontos:

1. O PostgreSQL está rodando:

```bash
npm run db:up
```

2. As migrations foram aplicadas:

```bash
npm run prisma:migrate:dev
```

3. O seed foi executado:

```bash
npm run db:seed
```

4. Você está usando um usuário existente na barra superior, como `user-1`

5. O backend foi reiniciado depois de mudanças recentes:

```bash
npm run dev
```

Se o banco estiver vazio ou se o usuário não existir, a UI vai mostrar sessão inválida e a publicação não será permitida.

### O Docker está rodando, mas a aplicação ainda falha

O Docker só sobe o banco. Ele não roda migration nem seed automaticamente. Então container ativo não significa banco pronto para uso.

### Porta 5434 em uso

Se houver conflito, ajuste a porta no [`docker-compose.yml`](./docker-compose.yml) e no `DATABASE_URL` de `apps/api/.env`.

### Porta 3000 ou 5173 em uso

Feche o processo que estiver ocupando a porta ou altere:

- `PORT` em `apps/api/.env` para a API
- `server.port` em [`apps/web/vite.config.ts`](./apps/web/vite.config.ts) para o frontend

## Estado Atual da Autenticação

O projeto ainda usa autenticação simulada para desenvolvimento local. Isso significa:

- não existe tela de login real
- o usuário atual é definido por headers
- o backend valida se o usuário existe e está ativo
- permissões administrativas ainda dependem da role informada e do usuário existir no banco

## Resumo Rápido

Se quiser só subir o projeto do zero, rode:

```bash
# crie apps/api/.env com PORT e DATABASE_URL
npm install
npm run db:up
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
npm run dev
```

Em outro terminal:

```bash
npm run dev:web
```

Depois abra `http://localhost:5173` e use `user-1` no topo para começar a testar.
