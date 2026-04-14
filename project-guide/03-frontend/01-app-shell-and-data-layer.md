# Frontend - App Shell e Camada de Dados

Este arquivo cobre o que sustenta a aplicacao inteira.

## 1. Entrada da aplicacao

## `src/main.tsx`

Cria o root React, renderiza `App` e carrega `styles.css`.

## `src/App.tsx`

### `App()`

Envolve a aplicacao com providers e roteador:

- `AppProviders`
- `AppRouter`

## 2. Providers

## `app/providers/app-providers.tsx`

### `AppProviders({ children })`

Registra:

1. `QueryClientProvider`
2. `AuthSessionProvider`

## `app/providers/query-client.ts`

### `shouldRetryQuery(failureCount, error)`

Nao faz retry para erros `4xx`.

### `createQueryClient()`

Configura defaults de query e mutation.

### `queryClient`

Instancia global da app.

## 3. Roteamento

## `app/router/app-router.tsx`

### `AppRouter()`

Monta rotas:

- `/`
- `/posts/new`
- `/posts/:postId`
- `/posts/:postId/edit`
- `/users/:userId`
- `/users/:userId/followers`
- `/users/:userId/following`
- `/saved`
- `/admin/tools`
- `*`

Tudo fica dentro de `AppShell`.

## 4. Layout

## `app/layout/app-shell.tsx`

### `SIDE_LINKS`

Itens da lateral.

### `AppShell()`

- renderiza `TopBar`
- consulta `health` da API
- monta layout com `Outlet`

## `app/layout/top-bar.tsx`

### `NAV_ITEMS`

Itens de navegacao superior.

### `TopBar()`

Responsabilidade:

- navegacao global
- presets de autenticacao
- campos `x-user-id` e `x-user-role`
- status textual da sessao

### `renderSessionStatus()`

Traduz sessao para mensagem de UX.

## 5. Auth context

## `features/auth-context/auth-context.tsx`

Arquivo central da sessao fake.

### helpers

- `isUserRole`
- `parseStoredAuthSession`

### `AuthSessionProvider({ children })`

Responsabilidades:

- manter sessao em estado React
- persistir no localStorage
- validar usuario via `/api/me`
- expor `viewerId`
- expor headers para API
- limpar/invalidate cache quando viewer muda

### setters expostos

- `setUserId`
- `setRole`
- `applyPreset`
- `reset`

### valores derivados

- `isAuthenticated`
- `hasActiveSession`
- `isSessionLoading`
- `sessionStatus`
- `sessionError`
- `viewerId`
- `headers`

### `useAuthSession()`

Hook publico do contexto.

## 6. Camada HTTP e API

## `shared/api/http-client.ts`

### tipos

- `QueryParams`
- `RequestOptions`
- `HttpClient`

### `AppApiError`

Erro rico com `status`, `code` e `fieldErrors`.

### helpers

- `buildRequestUrl`
- `parseResponseBody`
- `toApiError`
- `isAbortError`

### `createHttpClient(config)`

Factory do client HTTP da aplicacao.

## `shared/api/forum-api.ts`

### helpers

- `encodeId`
- `toPaginationQuery`

### `createForumApi(client)`

Agrupa operacoes por dominio:

- `platform`
- `posts`
- `comments`
- `savedPosts`
- `users`
- `notificationsAdmin`

## `shared/api/use-forum-api.ts`

### `useForumApi()`

Constroi `forumApi` usando headers atuais da sessao.

## 7. Query keys

## `shared/api/query-keys.ts`

### `PUBLIC_VIEWER_KEY`

Representa viewer publico.

### `toViewerKey(viewerId)`

Normaliza viewer vazio.

### `queryKeys`

Factories de query keys para:

- platform
- posts
- comments
- users
- saved posts

## 8. Shared UI e utilitarios

## `shared/lib/formatters.ts`

### `formatDateTime(value)`

Formata data em `pt-BR`.

### `formatCompactCount(value)`

Formata contagem compacta.

## `shared/ui/view-states.tsx`

### `StateCard`

Bloco base interno.

### `LoadingState`

Estado de carregamento.

### `EmptyState`

Estado vazio.

### `ErrorState`

Estado de erro.

## `shared/ui/pagination-footer.tsx`

### `PaginationFooter`

Componente paginador reutilizavel.

## `shared/ui/not-found-page.tsx`

### `NotFoundPage`

Fallback de rota.

## 9. Arquivo utilitario legado

## `src/lib/api.ts`

### `getHealth()`

Helper simples de healthcheck.

Hoje a app usa principalmente `shared/api/forum-api.ts`.

