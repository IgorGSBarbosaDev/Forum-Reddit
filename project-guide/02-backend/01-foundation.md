# Backend Foundation

Este arquivo cobre a infraestrutura que sustenta todos os modulos.

## 1. Bootstrap

## `src/server.ts`

### `bootstrap()`

- conecta no banco via Prisma
- sobe o servidor HTTP na porta configurada

### `bootstrap().catch(...)`

- loga erro fatal
- desconecta Prisma
- encerra processo com erro

## `src/app.ts`

### `createApp(prismaClient = prisma)`

Monta a instancia do Express:

- `express.json()`
- `resolveCurrentUser`
- router em `/api`
- `notFoundHandler`
- `errorHandler`

Importancia:

- centraliza composicao da app
- permite injetar Prisma alternativo nos testes

### `app`

Instancia pronta para runtime normal.

## 2. Configuracao e infraestrutura

## `src/config/env.ts`

Responsavel por:

- carregar `.env`
- validar `PORT`
- exigir `DATABASE_URL`

## `src/lib/prisma.ts`

Responsavel por:

- criar `PrismaPg`
- exportar singleton `prisma`

## `src/constants/forum.ts`

Centraliza regras compartilhadas:

- `MAX_COMMENT_DEPTH`
- placeholders de conteudo removido
- status visiveis no feed
- status que aceitam comentarios
- roles de moderacao

## 3. Router raiz

## `src/routes/index.ts`

### `createRouter(prismaClient)`

Monta sub-rotas:

- `/posts`
- comentarios
- reactions
- saved posts
- `/users`
- `/internal/notifications`

Tambem define:

- `GET /health`
- `GET /me`

### `GET /health`

Healthcheck simples da API.

### `GET /me`

Valida autenticacao e confirma que o usuario existe/esta ativo antes de devolver:

- `currentUserId`
- `role`

O frontend usa esse endpoint para validar a sessao local.

## 4. Middlewares

## `resolve-current-user.ts`

### `normalizeHeaderValue`

Normaliza header string/array.

### `resolveCurrentUser`

- le `x-user-id` e `x-user-role`
- valida com Zod
- popula `request.currentUser`

Se nao houver `x-user-id`, a request segue como publica.

## `require-auth.ts`

### `requireAuth`

Exige `request.currentUser`.

## `require-moderator.ts`

### `requireModerator`

Exige:

- usuario autenticado
- role `moderator` ou `admin`

## `validate-body.ts`

### `validateBody(schema)`

Valida body e substitui `req.body` pelo valor parseado.

O mesmo desenho existe em:

- `validate-query.ts`
- `validate-params.ts`

## `not-found.ts`

### `notFoundHandler`

Converte rota inexistente em erro padronizado.

## `error-handler.ts`

### `errorHandler`

Traduz erros conhecidos em resposta HTTP consistente:

1. `RequestValidationError`
2. `AuthenticationRequiredError`
3. `DomainError`
4. fallback `500`

## 5. Errors

Arquivos:

- `domain-error.ts`
- `authentication-required-error.ts`
- `forbidden-error.ts`
- `not-found-error.ts`
- `business-rule-error.ts`
- `conflict-error.ts`
- `request-validation-error.ts`

## Hierarquia

### `DomainError`

Classe base com `code` e `statusCode`.

### `AuthenticationRequiredError`

Erro para ausencia de autenticacao.

### `ForbiddenError`

Falta de permissao.

### `NotFoundError`

Recurso inexistente.

### `BusinessRuleError`

Regra de negocio bloqueou a operacao.

### `ConflictError`

Conflito com estado atual.

### `RequestValidationError`

Transforma issues do Zod em:

- `field`
- `message`

## 6. Schemas comuns

## `schemas/common/id.schema.ts`

Funcoes e exports:

- `createIdSchema`
- `postIdSchema`
- `userIdSchema`
- `commentIdSchema`
- `postIdParamsSchema`
- `userIdParamsSchema`
- `commentIdParamsSchema`

## `schemas/common/pagination.schema.ts`

Funcoes e exports:

- `DEFAULT_PAGE`
- `DEFAULT_LIMIT`
- `MAX_LIMIT`
- `createPaginationNumberSchema`
- `pageSchema`
- `limitSchema`
- `paginationQuerySchema`

## `schemas/common/sort.schema.ts`

Funcoes e exports:

- `sortOrderSchema`
- `createSortBySchema`
- `createSortQuerySchema`

## 7. Tipos e extensoes

## `types/authenticated-user.ts`

Define `AuthenticatedUser`.

## `types/authenticated-request.ts`

Atalho de request autenticada.

## `types/express.d.ts`

Faz module augmentation de `Express.Request` com `currentUser?`.

## 8. Utilitarios

## `utils/pagination.ts`

### `createPaginationMeta(page, limit, total)`

Monta o meta padrao de respostas paginadas.

## `utils/content-sanitizer.ts`

### `sanitizeAuthor(author, isContentRemoved = false)`

Esconde autor removido ou conteudo removido.

### `sanitizePostPublicContent(post)`

Aplica placeholder para post removido.

### `sanitizeCommentPublicContent(comment)`

Aplica placeholder para comentario removido.

### `acceptsComments(status, deletedAt)`

Regra central para aceitacao de comentarios.

## 9. Padrao base dos modulos

Quase todos seguem:

- `routes.ts`: endpoints e middlewares
- `controller.ts`: conversa com Express
- `service.ts`: regra de negocio
- `repository.ts`: acesso ao banco
- `mapper.ts`: monta DTO publico
- `schema.ts`: validacao
- `types.ts`: DTOs e inputs

