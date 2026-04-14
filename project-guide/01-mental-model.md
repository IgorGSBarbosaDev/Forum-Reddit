# Mental Model do Projeto

## 1. O que este projeto esta tentando ser

Nao pense nele apenas como "um CRUD de forum".

Ele ja foi organizado com algumas preocupacoes boas de arquitetura:

- separacao clara entre transporte HTTP, regra de negocio e acesso a dados
- contratos compartilhados entre frontend e backend
- validacao de entrada em uma camada padronizada
- sanitizacao de conteudo removido
- suporte a estado personalizado por usuario no frontend
- testes cobrindo fluxo real e regras pontuais

Em outras palavras: e um projeto pequeno, mas com estrutura de projeto que pode crescer.

## 2. Monorepo

O root `package.json` usa `npm workspaces` para tratar tudo como um unico repositorio, mas com pacotes separados.

### `apps/api`

Responsavel por:

- expor endpoints HTTP
- aplicar regras de negocio
- persistir no PostgreSQL via Prisma

### `apps/web`

Responsavel por:

- renderizar a interface
- controlar sessao de desenvolvimento
- consumir a API
- manter cache e mutacoes com TanStack Query

### `packages/shared-types`

Responsavel por:

- evitar drift de contrato entre backend e frontend
- centralizar tipos de payload, respostas paginadas e modelos expostos

## 3. Padroes principais que aparecem no codigo

### 3.1 Layered architecture

No backend, a maioria das features segue:

`routes -> controller -> service -> repository -> mapper`

Por que isso importa:

- `routes` definem URL, middlewares e classe chamada
- `controller` sabe ler `req` e escrever `res`
- `service` concentra regra de negocio
- `repository` encapsula queries Prisma
- `mapper` adapta o formato interno para o DTO publico

### 3.2 Repository pattern

Os repositories escondem detalhes de Prisma do resto da aplicacao.

Beneficios:

- service nao precisa conhecer query complexa
- mudancas de select, includes e filtros ficam em um lugar
- mapeamento fica mais previsivel

### 3.3 DTO mapping

A API nao devolve modelos crus do banco.

Ela usa mappers para:

- esconder autor removido
- substituir conteudo removido por placeholders
- calcular flags como `likedByMe`, `savedByMe` e `acceptsComments`

### 3.4 Soft delete

Posts e comentarios nao sao apagados fisicamente no fluxo principal.

Em vez disso:

- `deletedAt` e preenchido
- conteudo visivel e trocado por placeholder
- `authorId` pode virar `null`

### 3.5 Sessao de desenvolvimento por headers

Nao existe login real.

O frontend envia:

- `x-user-id`
- `x-user-role`

O backend resolve isso em `request.currentUser`.

### 3.6 Contract-first no frontend

O frontend consome a API via `forum-api.ts`, tipado com `@forum-reddit/shared-types`.

### 3.7 Query keys sensiveis ao viewer

Dados personalizados por usuario sao cacheados por `viewerId`.

Exemplo:

- um post pode ter `likedByMe = true` para `user-1`
- o mesmo post pode ter `likedByMe = false` para usuario publico

## 4. Fluxo de requisicao do backend

Exemplo mental para `POST /api/posts`:

1. `resolveCurrentUser` le headers e preenche `request.currentUser`
2. `requireAuth` exige usuario autenticado
3. `validateBody(createPostBodySchema)` valida o payload
4. `PostsController.createPost` extrai dados da request
5. `PostsService.createPost` garante usuario ativo
6. service abre transacao Prisma
7. `PostsRepository.createPost` grava o post
8. `NotificationEventsRepository.createPostPublishedEvent` cria evento
9. service busca o post completo
10. `mapPostDetail` monta o DTO publico
11. resposta volta para o frontend

## 5. Fluxo de dados do frontend

Exemplo mental para o feed:

1. `FeedPage` le pagina, limit e sort da URL
2. `useFeedPosts` normaliza o query object
3. hook monta `queryKey` com viewer atual
4. hook chama `api.posts.list`
5. `useForumApi` monta o client com headers da sessao
6. `http-client.ts` faz `fetch`
7. resposta entra no cache do TanStack Query
8. `FeedPage` renderiza `PostCard`

## 6. O que um junior deve observar primeiro

1. como o backend separa responsabilidade entre service e repository
2. como o frontend evita repeticao com hooks e `forum-api.ts`
3. como os tipos compartilhados mantem o contrato consistente
4. como o cache otimista foi implementado para likes, saves e follows
5. como soft delete e sanitizacao mudam o dado publico sem destruir o dado de negocio

## 7. Onde costuma dar bug

- esquecer de invalidar query depois de mutacao
- deixar `viewerId` fora da query key
- tratar usuario autenticado como ativo sem passar pelo `CurrentUserGuard`
- devolver entidade crua sem passar por mapper/sanitizer
- esquecer que post/comentario removido ainda existe no banco

