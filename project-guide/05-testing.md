# Testes do Projeto

Este arquivo explica como os testes foram pensados e o que eles protegem.

## 1. Backend

Arquivos principais:

- `apps/api/tests/app.test.ts`
- `apps/api/tests/forum-workflows.test.ts`
- `apps/api/tests/content-sanitizer.test.ts`
- `apps/api/tests/comments-mapper.test.ts`
- `apps/api/tests/helpers/test-db.ts`

## `helpers/test-db.ts`

Funcoes importantes:

- `getBaseDatabaseUrl`
- `buildTestDatabaseUrl`
- `buildAdminDatabaseUrl`
- `quoteIdentifier`
- `readMigrationSql`
- `ensureTestDatabase`
- `resetTestDatabase`
- `createTestPrismaClient`
- `createApiTestContext`

Importancia:

- os testes da API usam banco real de teste
- o schema e recriado a cada caso

## `app.test.ts`

Cobre:

- healthcheck
- autenticacao de `/me`
- validacao de header
- rota inexistente

## `forum-workflows.test.ts`

Cobre:

- paginacao deterministica do feed
- soft delete de post
- profundidade maxima de comentarios
- conflito em like/save/follow duplicado
- validacao do current user
- processamento de notificacoes

Leia esse arquivo como documentacao executavel do dominio.

## `content-sanitizer.test.ts`

Protege regras de exposicao publica.

## `comments-mapper.test.ts`

Protege montagem da arvore de comentarios.

## 2. Frontend

Arquivos principais:

- `apps/web/src/features/posts/pages/create-post-page.test.tsx`
- `apps/web/src/shared/api/session-aware-queries.test.tsx`
- `apps/web/src/features/comments/lib/comment-tree.test.ts`
- `apps/web/src/shared/lib/formatters.test.ts`
- `apps/web/src/shared/ui/pagination-footer.test.tsx`
- `apps/web/src/test/setup.ts`
- `apps/web/src/test/server.ts`
- `apps/web/src/test/handlers.ts`

## Infra de teste frontend

### `test/handlers.ts`

Handlers MSW basicos.

### `test/server.ts`

Sobe o server MSW.

### `test/setup.ts`

Configura lifecycle dos testes e limpa estado entre casos.

## `create-post-page.test.tsx`

Garante que a tela bloqueia publicacao quando a sessao e invalida.

## `session-aware-queries.test.tsx`

Teste frontend mais importante do repositorio.

Ele protege o cache por viewer, evitando misturar estado personalizado entre usuarios.

## `comment-tree.test.ts`

Protege update imutavel de like em arvore recursiva.

## `formatters.test.ts`

Protege formatacao basica de data e numeros.

## `pagination-footer.test.tsx`

Protege renderizacao condicional e callback de paginacao.

## 3. Estrategia geral

### Backend

Mistura de:

- fluxo integrado
- utilitarios unitarios

### Frontend

Mistura de:

- teste de pagina
- teste de infra de cache
- teste unitario de utilitarios

## 4. Proximos passos naturais

- mais testes de mutacao otimista
- mais testes de formularios de edicao
- mais testes de permissoes no frontend
- mais casos extremos de service/repository

