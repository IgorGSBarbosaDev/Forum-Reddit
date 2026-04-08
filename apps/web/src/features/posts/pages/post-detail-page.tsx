import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { CommentsThread } from "../../comments/components/comments-thread";
import { useAuthSession } from "../../auth-context/auth-context";
import { formatCompactCount, formatDateTime } from "../../../shared/lib/formatters";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/ui/view-states";
import {
  useDeletePostMutation,
  useLikePostMutation,
  useSavePostMutation,
  useUnlikePostMutation,
  useUnsavePostMutation,
} from "../hooks/use-post-mutations";
import { toPostMutationMessage } from "../lib/post-mutation-errors";
import { usePostDetail } from "../hooks/use-post-detail";

function getAuthorLabel(author: { id: string; username: string | null; displayName: string | null } | null) {
  if (!author) {
    return "Deleted user";
  }

  return author.displayName || author.username || "Deleted user";
}

export function PostDetailPage() {
  const params = useParams();
  const postId = params.postId;
  const { auth, isAuthenticated } = useAuthSession();

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const detailQuery = usePostDetail(postId);

  const likeMutation = useLikePostMutation(postId ?? "");
  const unlikeMutation = useUnlikePostMutation(postId ?? "");
  const saveMutation = useSavePostMutation(postId ?? "");
  const unsaveMutation = useUnsavePostMutation(postId ?? "");
  const deleteMutation = useDeletePostMutation(postId ?? "");

  if (!postId) {
    return <ErrorState title="Post invalido" description="O identificador do post nao foi informado." />;
  }

  if (detailQuery.isLoading) {
    return <LoadingState title="Carregando post" description="Buscando detalhes completos do conteudo." />;
  }

  if (detailQuery.isError) {
    return (
      <ErrorState
        title="Falha ao carregar post"
        description={detailQuery.error.message}
        action={
          <button type="button" className="button button--primary" onClick={() => detailQuery.refetch()}>
            Tentar novamente
          </button>
        }
      />
    );
  }

  const post = detailQuery.data;
  if (!post) {
    return <EmptyState title="Post nao encontrado" description="O recurso solicitado nao retornou conteudo." />;
  }

  const isAuthor = isAuthenticated && post.author?.id === auth.userId;
  const isLikeBusy = likeMutation.isPending || unlikeMutation.isPending;
  const isSaveBusy = saveMutation.isPending || unsaveMutation.isPending;

  async function handleToggleLike() {
    setActionFeedback(null);

    const currentPost = detailQuery.data;
    if (!currentPost) {
      return;
    }

    if (!isAuthenticated) {
      setActionFeedback("Informe x-user-id no topo para curtir posts.");
      return;
    }

    try {
      if (currentPost.likedByMe) {
        await unlikeMutation.mutateAsync();
      } else {
        await likeMutation.mutateAsync();
      }
    } catch (error) {
      setActionFeedback(toPostMutationMessage(error, "Nao foi possivel atualizar curtida."));
    }
  }

  async function handleToggleSave() {
    setActionFeedback(null);

    const currentPost = detailQuery.data;
    if (!currentPost) {
      return;
    }

    if (!isAuthenticated) {
      setActionFeedback("Informe x-user-id no topo para salvar posts.");
      return;
    }

    try {
      if (currentPost.savedByMe) {
        await unsaveMutation.mutateAsync();
      } else {
        await saveMutation.mutateAsync();
      }
    } catch (error) {
      setActionFeedback(toPostMutationMessage(error, "Nao foi possivel atualizar estado de salvamento."));
    }
  }

  async function handleDeletePost() {
    setActionFeedback(null);

    if (!isAuthor) {
      setActionFeedback("Apenas o autor pode remover este post.");
      return;
    }

    const confirmed = window.confirm("Confirma a remocao deste post? A acao aplica soft delete.");
    if (!confirmed) {
      return;
    }

    try {
      await deleteMutation.mutateAsync();
      setActionFeedback("Post removido com sucesso.");
    } catch (error) {
      setActionFeedback(toPostMutationMessage(error, "Nao foi possivel remover o post."));
    }
  }

  const isRemoved = post.deletedAt !== null;

  return (
    <article className="page">
      <header className="page-header">
        <div className="page-title-row">
          <h1 className="page-title">{post.title}</h1>
          <div className="post-card__badges">
            {post.isPinned ? <span className="badge badge--brand">Pinned</span> : null}
            {post.status !== "ACTIVE" ? <span className="badge badge--warning">{post.status}</span> : null}
            {post.wasEdited ? <span className="badge">Editado</span> : null}
          </div>
        </div>

        <p className="page-subtitle">
          Por{" "}
          {post.author ? (
            <Link to={`/users/${post.author.id}`}>{getAuthorLabel(post.author)}</Link>
          ) : (
            <span>{getAuthorLabel(post.author)}</span>
          )}
          {" • "}
          <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
        </p>
      </header>

      <section className={`panel post-detail ${isRemoved ? "post-detail--removed" : ""}`}>
        <p>{post.content ?? "[post removed]"}</p>

        <ul className="meta-list" aria-label="Metadados do post">
          <li>{formatCompactCount(post.commentsCount)} comentarios</li>
          <li>{formatCompactCount(post.likesCount)} likes</li>
          <li>Comentarios {post.acceptsComments ? "habilitados" : "desabilitados"}</li>
          {post.lastEditedAt ? <li>Ultima edicao em {formatDateTime(post.lastEditedAt)}</li> : null}
        </ul>

        <div className="inline-actions">
          {isAuthor ? (
            <Link to={`/posts/${post.id}/edit`} className="button button--ghost">
              Editar post
            </Link>
          ) : null}

          <button type="button" className="button button--ghost" onClick={handleToggleLike} disabled={isLikeBusy}>
            {isLikeBusy ? "Atualizando curtida..." : post.likedByMe ? "Descurtir" : "Curtir"}
          </button>

          <button type="button" className="button button--ghost" onClick={handleToggleSave} disabled={isSaveBusy}>
            {isSaveBusy ? "Atualizando salvo..." : post.savedByMe ? "Remover dos salvos" : "Salvar post"}
          </button>

          {isAuthor ? (
            <button
              type="button"
              className="button button--danger"
              onClick={handleDeletePost}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Removendo..." : "Remover post"}
            </button>
          ) : null}
        </div>

        {actionFeedback ? <p className="inline-error">{actionFeedback}</p> : null}
      </section>

      <CommentsThread postId={post.id} acceptsComments={post.acceptsComments} />
    </article>
  );
}