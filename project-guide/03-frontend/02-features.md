# Frontend - Features

Este arquivo cobre as features por dominio.

## 1. Feature Posts

Arquivos principais:

- `features/posts/hooks/use-feed-posts.ts`
- `features/posts/hooks/use-post-detail.ts`
- `features/posts/hooks/use-post-mutations.ts`
- `features/posts/components/post-card.tsx`
- `features/posts/lib/post-form-schema.ts`
- `features/posts/lib/post-mutation-errors.ts`
- `features/posts/pages/feed-page.tsx`
- `features/posts/pages/post-detail-page.tsx`
- `features/posts/pages/create-post-page.tsx`
- `features/posts/pages/edit-post-page.tsx`

## `use-feed-posts.ts`

Helpers:

- `toSortBy`
- `toSortOrder`
- `toPositiveInt`
- `normalizeFeedQuery`

### `useFeedPosts(query)`

- normaliza query
- usa `viewerId`
- monta query key
- chama `api.posts.list`

## `use-post-detail.ts`

### `usePostDetail(postId)`

Busca detalhe do post, habilitando query so quando houver id.

## `use-post-mutations.ts`

Tipos:

- `FeedCacheSnapshot`
- `OptimisticCacheContext`

Helpers internos:

- `updateFeedCache`
- `usePostOptimisticActions`

### hooks exportados

- `useCreatePostMutation`
- `useUpdatePostMutation`
- `useDeletePostMutation`
- `useLikePostMutation`
- `useUnlikePostMutation`
- `useSavePostMutation`
- `useUnsavePostMutation`

Pontos importantes:

- create/update/delete preferem invalidar
- like/save usam update otimista + rollback

## `post-card.tsx`

### `getAuthorLabel(post)`

Resolve label do autor.

### `PostCard({ post })`

- renderiza resumo
- permite like/save
- trata ausencia/sessao invalida

## `post-form-schema.ts`

Exports:

- `POST_TITLE_MAX_LENGTH`
- `POST_CONTENT_MAX_LENGTH`
- `postFormSchema`
- `PostFormValues`
- `toCreatePostInput`

## `post-mutation-errors.ts`

### `applyPostFieldErrors(error, setError)`

Traduz erro de validacao da API para `react-hook-form`.

### `toPostMutationMessage(error, fallbackMessage)`

Traduz codigo de erro para mensagem amigavel.

## `feed-page.tsx`

Helpers:

- `parsePositiveInt`
- `parseSortBy`
- `parseOrder`

### `FeedPage()`

- le filtros da URL
- carrega feed
- permite mudar ordenacao/paginacao
- renderiza estados de loading/erro/vazio

## `post-detail-page.tsx`

### `getAuthorLabel(author)`

Resolve label do autor no detalhe.

### `PostDetailPage()`

- carrega detalhe
- permite like/save/delete
- mostra metadados completos
- renderiza `CommentsThread`

## `create-post-page.tsx`

### `CreatePostPage()`

- exige sessao valida
- monta formulario com RHF + Zod
- trata erro por campo
- cria post e redireciona

## `edit-post-page.tsx`

### `EditPostPage()`

- exige sessao valida
- carrega post
- popula formulario
- monta patch parcial
- impede submit sem alteracao

## 2. Feature Comments

Arquivos principais:

- `features/comments/hooks/use-comment-tree.ts`
- `features/comments/hooks/use-comment-mutations.ts`
- `features/comments/components/comments-thread.tsx`
- `features/comments/lib/comment-tree.ts`
- `features/comments/lib/comment-mutation-errors.ts`

## `use-comment-tree.ts`

### `useCommentTree(postId)`

Busca arvore de comentarios do post.

## `use-comment-mutations.ts`

### helper `invalidateCommentQueries(...)`

Invalida:

- arvore de comentarios
- detalhe do post
- feed

### hooks exportados

- `useCreateRootCommentMutation`
- `useCreateReplyCommentMutation`
- `useUpdateCommentMutation`
- `useDeleteCommentMutation`
- `useLikeCommentMutation`
- `useUnlikeCommentMutation`

Likes usam update otimista na arvore.

## `comment-tree.ts`

### `patchNode`

Recursao interna.

### `patchCommentTree`

Aplica updater imutavel no node alvo.

### `setCommentLikeState`

Atualiza `likedByMe` e `likesCount` do comentario alvo.

## `comment-mutation-errors.ts`

### `toCommentMutationMessage(error, fallbackMessage)`

Traduz erro de API para mensagem amigavel.

## `comments-thread.tsx`

Helpers:

- `validateCommentContent`
- `toCommentAuthorLabel`

### componente interno `CommentComposer`

Usado para:

- comentario raiz
- reply
- edicao

### componente interno `CommentItem`

- renderiza comentario
- permite like
- permite reply
- permite editar/remover se for autor
- renderiza replies recursivamente

### `CommentsThread({ postId, acceptsComments })`

- controla composer raiz
- carrega arvore
- renderiza loading/erro/vazio

## 3. Feature Users

Arquivos:

- `features/users/hooks/use-follow-mutations.ts`
- `features/users/lib/user-mutation-errors.ts`
- `features/users/pages/user-profile-page.tsx`
- `features/users/pages/user-followers-page.tsx`
- `features/users/pages/user-following-page.tsx`

## `use-follow-mutations.ts`

Tipos:

- `UserListSnapshot`
- `FollowMutationContext`

Helpers:

- `patchFollowingState`
- `useOptimisticFollowMutation`

### hooks exportados

- `useFollowUserMutation`
- `useUnfollowUserMutation`

Esse arquivo faz update otimista de:

- perfil alvo
- perfil do viewer
- relationship
- listas paginadas

## `user-mutation-errors.ts`

### `toUserMutationMessage(error, fallbackMessage)`

Traduz erros de follow/unfollow.

## `user-profile-page.tsx`

### `UserProfilePage()`

- carrega perfil
- carrega relationship quando viewer estiver logado
- permite follow/unfollow
- navega para seguidores/seguindo

## `user-followers-page.tsx`

### helper `parsePositiveInt`

Normaliza `page`.

### `UserFollowersPage()`

Lista seguidores paginados.

## `user-following-page.tsx`

Mesma ideia para perfis seguidos.

## 4. Feature Saved Posts

Arquivo:

- `features/saved-posts/pages/saved-posts-page.tsx`

### helper `parsePositiveInt`

Normaliza query params.

### `SavedPostsPage()`

- exige sessao valida
- carrega salvos
- reaproveita `PostCard`
- mostra `savedAt`
- pagina resultados

## 5. Feature Notifications Admin

Arquivo:

- `features/notifications-admin/pages/notifications-admin-page.tsx`

### `NotificationsAdminPage()`

- exige sessao valida
- exige role moderator/admin
- dispara processamento manual
- mostra sucesso/erro

## 6. O que aprender com essas features

1. pagina monta contexto, hook busca dado, componente renderiza
2. `AppApiError` melhora muito a UX
3. update otimista foi usado onde faz sentido
4. formularios seguem um padrao consistente

