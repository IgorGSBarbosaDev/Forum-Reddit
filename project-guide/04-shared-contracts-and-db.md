# Shared Types e Banco de Dados

Este arquivo conecta API, Web e Prisma.

## 1. `packages/types`

Objetivo:

- centralizar contratos publicos
- impedir divergencia entre backend e frontend

## Arquivos

### `src/index.ts`

Reexporta tudo.

### `src/auth.ts`

- `UserRole`
- `MeResponse`

### `src/comments.ts`

- `CommentAuthor`
- `CommentNode`
- `CreateCommentInput`
- `UpdateCommentInput`

### `src/errors.ts`

- `ValidationIssue`
- `ApiErrorBase`
- `ValidationApiError`

### `src/operations.ts`

- `LikeResponse`
- `SaveResponse`
- `ProcessNotificationsResponse`

### `src/pagination.ts`

- `PaginationMeta`
- `PaginatedResponse<T>`

### `src/posts.ts`

- `PostAuthor`
- `PostStatus`
- `PostSortBy`
- `SortOrder`
- `ListPostsQuery`
- `PostSummary`
- `PostDetail`
- inputs de criacao/update/status/pin

### `src/saved-posts.ts`

- `SavedPostListItem`

### `src/users.ts`

- `UserSummary`
- `UserProfile`
- `RelationshipResponse`
- `FollowResponse`

## 2. Por que esse pacote e importante

Ele reduz:

- drift de contrato
- repeticao de tipos
- string solta de payload

## 3. Prisma schema

Arquivo:

- `packages/database/prisma/schema.prisma`

## Enums

- `UserStatus`
- `PostStatus`
- `NotificationEventType`

## Modelos

### `User`

Representa conta do usuario, com relacoes para posts, comentarios, likes, saves, follows e notificacoes.

### `Post`

Representa publicacao do forum, com status, pinagem, soft delete e metadados de edicao.

### `Comment`

Representa comentario com relacao recursiva de arvore via `parentId`.

### `PostLike`

Relacao unica entre usuario e post curtido.

### `CommentLike`

Relacao unica entre usuario e comentario curtido.

### `SavedPost`

Relacao unica entre usuario e post salvo.

### `Follow`

Relacao unica follower/following.

### `NotificationPreference`

Preferencia do usuario para notificacoes de perfis seguidos.

### `NotificationEvent`

Fila de eventos internos, com `processedAt` e `payload`.

## 4. Decisoes de modelagem importantes

1. `authorId` pode ser `null` em post/comentario para suportar anonymization
2. `deletedAt` suporta soft delete
3. unique composto protege likes, saves e follows duplicados
4. `depth` em comentario facilita limitar profundidade

## 5. Seed

Arquivo:

- `packages/database/prisma/seed.ts`

Cria usuarios de desenvolvimento:

- `admin`
- `user-1`
- `user-2`
- `moderator-1`
