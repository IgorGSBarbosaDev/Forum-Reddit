# Forum Reddit API

Bootstrap inicial de uma API de forum estilo Reddit com:

- Node.js
- TypeScript
- Express
- Prisma
- PostgreSQL

## Scripts

- `npm run dev`: sobe a API em modo watch
- `npm run build`: compila o projeto
- `npm run start`: executa a build compilada
- `npm run prisma:generate`: gera o Prisma Client
- `npm run prisma:migrate:dev`: cria/aplica migrations em desenvolvimento
- `npm run prisma:studio`: abre o Prisma Studio

## Setup local

1. Instale as dependencias:

```bash
npm install
```

2. Ajuste o arquivo `.env` com sua conexao PostgreSQL.

3. Gere o client do Prisma:

```bash
npm run prisma:generate
```

4. Crie a migration inicial:

```bash
npm run prisma:migrate:dev -- --name init
```

5. Rode a API:

```bash
npm run dev
```

## Estrutura inicial

- `src/server.ts`: bootstrap do servidor
- `src/app.ts`: configuracao do Express
- `src/routes/index.ts`: rota base e healthcheck
- `src/lib/prisma.ts`: inicializacao do Prisma Client com adapter PostgreSQL
- `prisma/schema.prisma`: modelagem inicial do dominio
- `prisma.config.ts`: configuracao do Prisma 7

## Dominio coberto no schema

O schema inicial contempla:

- usuarios
- postagens
- comentarios encadeados com profundidade
- curtidas em postagens e comentarios
- postagens salvas
- seguidores
- preferencia de notificacao
- eventos de notificacao assincronos para publicacao de postagens

As regras de edicao, exclusao logica, anonimização e relacoes unicas ja ficaram refletidas no modelo inicial.
