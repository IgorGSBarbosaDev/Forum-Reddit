# Backend - Users, Social e Admin

Este arquivo cobre os modulos que orbitam o nucleo do forum.

## 1. Modulo Users

Arquivos:

- `modules/users/routes.ts`
- `modules/users/controller.ts`
- `modules/users/service.ts`
- `modules/users/repository.ts`
- `modules/users/mapper.ts`
- `modules/users/schema.ts`
- `modules/users/types.ts`
- `packages/auth/src/current-user-guard.ts`

## `current-user-guard.ts`

Classe: `CurrentUserGuard`

### `assertActiveUser(currentUserId)`

- garante que o usuario existe
- garante que esta `ACTIVE`
- barra usuario removido/bloqueado

Esse guard separa "header chegou" de "usuario e valido no dominio".

## `routes.ts`

Endpoints:

- `GET /users/:userId`
- `GET /users/:userId/followers`
- `GET /users/:userId/following`
- `GET /users/:userId/relationship`

## `controller.ts`

Classe: `UsersController`

Metodos:

- `getProfile`
- `listFollowers`
- `listFollowing`
- `getRelationship`

## `service.ts`

Classe: `UsersService`

### `getProfile(userId, currentUserId?)`

- busca perfil
- converte ausencia para `USER_NOT_FOUND`
- mapeia com `mapUserProfile`

### `listFollowers(userId, currentUserId, page, limit)`

- garante que perfil existe
- busca lista e total em paralelo
- mapeia com `mapFollower`
- devolve paginacao

### `listFollowing(userId, currentUserId, page, limit)`

Mesmo desenho para perfis seguidos.

### `getRelationship(userId, currentUserId)`

- garante viewer ativo
- garante usuario alvo existente
- devolve `{ following }`

### `removeUser(userId)`

Marca usuario como removido e anonymiza autoria de posts/comentarios.

## `repository.ts`

Classe: `UsersRepository`

### `findProfile(userId, currentUserId?)`

Busca dados publicos + counts + flag de follow do viewer.

### `listFollowers(...)`

Busca relacoes `Follow` e seleciona `follower`.

### `countFollowers(userId)`

Conta seguidores.

### `listFollowing(...)`

Busca relacoes `Follow` e seleciona `following`.

### `countFollowing(userId)`

Conta perfis seguidos.

### `findRelationship(targetUserId, currentUserId)`

Verifica se viewer segue o alvo.

### `removeUser(userId)`

Transacao para:

- `status = REMOVED`
- `removedAt = now`
- limpar bio
- remover autor de posts/comentarios

## `mapper.ts`

### `mapUserVisibility(user)`

Se usuario estiver removido:

- `username = null`
- `displayName = null`
- `bio = null`

### `mapUserProfile`

Adiciona contadores ao DTO.

### `mapFollower`

Reusa `mapUserVisibility`.

### `mapFollowing`

Reusa `mapUserVisibility`.

## 2. Modulo Follows

Arquivos:

- `modules/follows/routes.ts`
- `modules/follows/controller.ts`
- `modules/follows/service.ts`
- `modules/follows/repository.ts`

## `routes.ts`

Endpoints:

- `POST /users/:userId/follow`
- `DELETE /users/:userId/follow`

## `controller.ts`

Classe: `FollowsController`

Metodos:

- `followUser`
- `unfollowUser`

## `service.ts`

Classe: `FollowsService`

### `followUser(targetUserId, currentUserId)`

- garante viewer ativo
- garante alvo existente
- cria follow
- retorna `{ following: true }`

### `unfollowUser(targetUserId, currentUserId)`

- garante viewer ativo
- garante alvo existente
- remove follow
- retorna `{ following: false }`

## `repository.ts`

Classe: `FollowsRepository`

### `ensureTargetUserExists(userId)`

Valida alvo.

### `createFollow(currentUserId, targetUserId)`

Regras:

- bloqueia auto-follow
- trata duplicidade com `ConflictError`

### `deleteFollow(currentUserId, targetUserId)`

Regras:

- bloqueia self-unfollow
- remove relacao se existir

## 3. Modulo Reactions

Arquivos:

- `modules/reactions/routes.ts`
- `modules/reactions/controller.ts`
- `modules/reactions/service.ts`
- `modules/reactions/repository.ts`

## `service.ts`

Classe: `ReactionsService`

Metodos:

- `likePost`
- `unlikePost`
- `likeComment`
- `unlikeComment`

Padrao:

1. viewer ativo
2. recurso existe
3. cria/remove like
4. devolve `{ liked }`

## `repository.ts`

Classe: `ReactionsRepository`

### `ensurePostExists(postId)`

Post removido conta como nao encontrado.

### `ensureCommentExists(commentId)`

Mesmo raciocinio.

### `createPostLike`

Trata duplicidade como conflito.

### `deletePostLike`

Remove like do post.

### `createCommentLike`

Cria like em comentario.

### `deleteCommentLike`

Remove like de comentario.

## 4. Modulo Saved Posts

Arquivos:

- `modules/saved-posts/routes.ts`
- `modules/saved-posts/controller.ts`
- `modules/saved-posts/service.ts`
- `modules/saved-posts/repository.ts`
- `modules/saved-posts/mapper.ts`
- `modules/saved-posts/schema.ts`
- `modules/saved-posts/types.ts`

## `routes.ts`

Endpoints:

- `POST /posts/:postId/save`
- `DELETE /posts/:postId/save`
- `GET /me/saved-posts`

## `service.ts`

Classe: `SavedPostsService`

### `savePost(postId, currentUserId)`

- viewer ativo
- post existe
- salva
- retorna `{ saved: true }`

### `unsavePost(postId, currentUserId)`

- viewer ativo
- post existe
- remove save
- retorna `{ saved: false }`

### `listSavedPosts(currentUserId, page, limit)`

- viewer ativo
- busca itens e total em paralelo
- mapeia com `mapSavedPost`

## `repository.ts`

Classe: `SavedPostsRepository`

### `ensurePostExists(postId)`

Valida existencia do post.

### `savePost(postId, userId)`

Cria save, tratando duplicidade como conflito.

### `unsavePost(postId, userId)`

Remove relacao.

### `countSavedPosts(userId)`

Conta salvos do usuario.

### `findSavedPosts(userId, page, limit)`

Busca lista paginada com dados do post salvo.

## `mapper.ts`

### `createContentPreview`

Gera preview do post salvo.

### `mapSavedPost(record)`

Monta DTO final, incluindo `savedAt`.

## 5. Modulo Notifications

Arquivos:

- `modules/notifications/routes.ts`
- `modules/notifications/controller.ts`
- `modules/notifications/service.ts`
- `modules/notifications/repository.ts`

## `routes.ts`

Endpoint:

- `POST /internal/notifications/process`

Protegido por auth + permissao de moderacao.

## `controller.ts`

Classe: `NotificationsController`

### `processPendingEvents`

Chama o service e devolve `processedCount`.

## `service.ts`

Classe: `NotificationsService`

### `processPendingEvents(currentUserId, limit = 50)`

Fluxo:

1. garante moderador/admin ativo
2. busca eventos pendentes
3. encontra seguidores do autor do evento
4. considera preferencia default e opt-in
5. marca evento como processado com payload resumido
6. acumula `processedCount`

Esse modulo ainda nao entrega notificacao ao usuario final. Hoje ele processa a fila internamente.

## `repository.ts`

Classe: `NotificationEventsRepository`

### `createPostPublishedEvent(actorId, postId, client = this.prisma)`

Cria evento de `POST_PUBLISHED`.

### `findPendingEvents(limit = 50)`

Busca fila pendente.

### `markProcessed(eventId, payload)`

Marca evento como processado e grava resumo.

## 6. Licoes de arquitetura

1. acoes sociais pequenas tambem merecem service/repository
2. `CurrentUserGuard` e regra transversal do dominio
3. payloads de mutacao pequenos simplificam contrato
4. notifications ja apontam para um desenho orientado a eventos
