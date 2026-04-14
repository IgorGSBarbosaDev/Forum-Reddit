# Backend - Posts e Comments

Esses dois modulos representam o nucleo do forum.

## 1. Modulo Posts

Arquivos:

- `modules/posts/routes.ts`
- `modules/posts/controller.ts`
- `modules/posts/service.ts`
- `modules/posts/repository.ts`
- `modules/posts/mapper.ts`
- `modules/posts/schema.ts`
- `modules/posts/types.ts`

## `routes.ts`

Declara endpoints:

- `GET /posts`
- `GET /posts/:postId`
- `POST /posts`
- `PATCH /posts/:postId`
- `DELETE /posts/:postId`
- `PATCH /posts/:postId/status`
- `PATCH /posts/:postId/pin`

Observacoes:

- rotas mutadoras exigem `requireAuth`
- moderacao exige `requireModerator`
- validacao acontece antes do controller

## `controller.ts`

Classe: `PostsController`

Metodos:

- `listPosts`
- `getPost`
- `createPost`
- `updatePost`
- `deletePost`
- `updateStatus`
- `updatePinnedState`

Papel do controller:

- extrair `params`, `query` e `body`
- chamar service
- devolver status HTTP
- encaminhar erros para `next`

## `service.ts`

Classe: `PostsService`

### `listPosts(query, currentUserId?)`

- busca posts + total em paralelo
- mapeia cada item com `mapPostListItem`
- monta `meta`

### `getPost(postId, currentUserId?)`

- busca post detalhado
- converte ausencia para `POST_NOT_FOUND`
- mapeia com `mapPostDetail`

### `createPost(input, currentUserId)`

Fluxo:

1. garante usuario ativo
2. abre transacao
3. cria post
4. cria evento de notificacao
5. retorna detalhe completo do post criado

### `updatePost(postId, input, currentUserId)`

Regras:

- usuario ativo
- post existe
- post removido nao pode ser editado
- apenas autor pode editar

### `deletePost(postId, currentUserId)`

Regras:

- usuario ativo
- post existe
- apenas autor pode remover
- aplica soft delete se necessario

### `updateStatus(postId, input, currentUserId)`

Atualiza status do post apos validar usuario ativo e existencia.

### `updatePinnedState(postId, input, currentUserId)`

Atualiza pinagem do post.

## `repository.ts`

Classe: `PostsRepository`

### `buildPostSelect(currentUserId?)`

Select central com:

- autor
- count de comentarios
- count de likes
- like do viewer
- save do viewer

### `countFeedPosts()`

Conta posts visiveis no feed.

### `findFeedPosts(query, currentUserId?)`

Busca feed paginado.

### `findPostById(postId, currentUserId?)`

Busca detalhe de post.

### `findPostStateById(postId)`

Busca estado minimo para regras:

- `authorId`
- `status`
- `deletedAt`

### `createPost(data, client = this.prisma)`

Cria post aceitando transacao opcional.

### `updatePostContent(postId, input, client = this.prisma)`

Atualiza titulo/conteudo e metadados de edicao.

### `markPostDeleted(postId, client = this.prisma)`

Soft delete:

- placeholder de titulo
- `content = null`
- `authorId = null`
- `deletedAt = now`

### `updatePostStatus(postId, status)`

Atualiza status.

### `updatePinnedState(postId, isPinned)`

Atualiza fixacao.

### `buildFeedWhere()`

Aplica visibilidade do feed.

### `buildFeedOrderBy(query)`

Ordenacao:

1. fixados primeiro
2. campo escolhido
3. `id` como desempate deterministico

## `mapper.ts`

### `createContentPreview`

Gera preview de ate 280 caracteres.

### `mapPostListItem(post)`

Cria DTO do feed com:

- autor sanitizado
- preview
- counts
- `likedByMe`
- `savedByMe`

### `mapPostDetail(post)`

Cria DTO detalhado com:

- metadados de edicao
- `deletedAt`
- `acceptsComments`

## `schema.ts`

Exports:

- `listPostsQuerySchema`
- `createPostBodySchema`
- `updatePostBodySchema`
- `updatePostStatusBodySchema`
- `updatePostPinBodySchema`
- `postDetailsParamsSchema`

## `types.ts`

Define:

- `ListPostsQuery`
- `PostAuthorDto`
- `PostSummaryDto`
- `PostDetailDto`
- `PaginatedPostsResponse`
- `CreatePostInput`
- `UpdatePostInput`
- `UpdatePostStatusInput`
- `UpdatePostPinInput`

## 2. Modulo Comments

Arquivos:

- `modules/comments/routes.ts`
- `modules/comments/controller.ts`
- `modules/comments/service.ts`
- `modules/comments/repository.ts`
- `modules/comments/mapper.ts`
- `modules/comments/schema.ts`
- `modules/comments/types.ts`

## `routes.ts`

Endpoints:

- `POST /posts/:postId/comments`
- `GET /posts/:postId/comments`
- `POST /comments/:commentId/replies`
- `PATCH /comments/:commentId`
- `DELETE /comments/:commentId`

## `controller.ts`

Classe: `CommentsController`

Metodos:

- `createRootComment`
- `listComments`
- `createReply`
- `updateComment`
- `deleteComment`

## `service.ts`

Classe: `CommentsService`

### `createRootComment(postId, input, currentUserId)`

- garante usuario ativo
- confirma que post aceita comentarios
- cria comentario raiz
- recarrega comentario
- mapeia para DTO

### `createReply(commentId, input, currentUserId)`

- garante usuario ativo
- busca comentario pai
- confirma que o post aceita comentarios
- calcula profundidade
- bloqueia acima de `MAX_COMMENT_DEPTH`
- cria reply
- recarrega e mapeia

### `listComments(postId, currentUserId?)`

- confirma existencia do post
- busca comentarios
- monta arvore com `buildCommentTree`

### `updateComment(commentId, input, currentUserId)`

Regras:

- usuario ativo
- comentario existe
- comentario removido nao pode ser editado
- apenas autor pode editar

### `deleteComment(commentId, currentUserId)`

Regras:

- usuario ativo
- comentario existe
- apenas autor pode remover
- aplica soft delete

### `assertPostAllowsComments(postId)`

Helper privado que concentra:

- `POST_NOT_FOUND`
- `POST_NOT_COMMENTABLE`

## `repository.ts`

Classe: `CommentsRepository`

### `findPostState(postId)`

Busca estado minimo do post.

### `findCommentState(commentId)`

Busca estado minimo do comentario.

### `createComment(data)`

Cria comentario e retorna id.

### `updateComment(commentId, content)`

Atualiza conteudo e metadados de edicao.

### `markCommentDeleted(commentId)`

Soft delete do comentario.

### `findCommentById(commentId, currentUserId?)`

Busca comentario detalhado.

### `findCommentsByPostId(postId, currentUserId?)`

Busca comentarios do post, ordenados por criacao ascendente.

### `buildCommentSelect(currentUserId?)`

Select central com autor, likes e like do viewer.

## `mapper.ts`

### `mapCommentNode(comment)`

Transforma registro do banco em DTO publico.

### `buildCommentTree(comments)`

Transforma lista plana em arvore.

Algoritmo:

1. mapeia todos os nodes
2. indexa por id
3. conecta reply ao pai
4. sem pai conhecido, cai como raiz

## `schema.ts`

Exports:

- `createCommentBodySchema`
- `updateCommentBodySchema`
- `postCommentParamsSchema`
- `commentReplyParamsSchema`

## `types.ts`

Define:

- `CommentAuthorDto`
- `CommentNodeDto`
- `CreateCommentInput`
- `UpdateCommentInput`

## 3. Licoes de arquitetura desses modulos

1. service protege regra, repository protege query
2. mapper e onde a API fica publica
3. soft delete exige disciplina
4. recarregar e mapear depois da escrita simplifica consistencia

