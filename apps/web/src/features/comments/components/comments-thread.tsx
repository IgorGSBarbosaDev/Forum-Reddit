import { useEffect, useState } from "react";
import { WebRoutes } from "@forum-reddit/routes";

import type { CommentNode } from "@forum-reddit/types";

import { useAuthSession } from "../../auth-context/auth-context";
import { Link } from "../../../routes/navigation";
import { formatCompactCount, formatDateTime } from "../../../shared/lib/formatters";
import { ErrorState, LoadingState } from "../../../components/ui/view-states";
import {
  useCreateReplyCommentMutation,
  useCreateRootCommentMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
  useUnlikeCommentMutation,
  useUpdateCommentMutation,
} from "../hooks/use-comment-mutations";
import { useCommentTree } from "../hooks/use-comment-tree";
import { toCommentMutationMessage } from "../lib/comment-mutation-errors";

const COMMENT_MAX_LENGTH = 5_000;

function validateCommentContent(content: string): string | null {
  const normalized = content.trim();

  if (normalized.length === 0) {
    return "Comentario obrigatorio.";
  }

  if (normalized.length > COMMENT_MAX_LENGTH) {
    return `Comentario deve ter ate ${COMMENT_MAX_LENGTH} caracteres.`;
  }

  return null;
}

function toCommentAuthorLabel(comment: CommentNode): string {
  if (!comment.author) {
    return "Deleted user";
  }

  return comment.author.displayName || comment.author.username || "Deleted user";
}

type CommentComposerProps = {
  submitLabel: string;
  placeholder: string;
  isPending: boolean;
  initialValue?: string;
  autoFocus?: boolean;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
};

function CommentComposer({
  submitLabel,
  placeholder,
  isPending,
  initialValue = "",
  autoFocus = false,
  onSubmit,
  onCancel,
}: CommentComposerProps) {
  const [content, setContent] = useState(initialValue);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialValue);
    setError(null);
  }, [initialValue]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const validationError = validateCommentContent(content);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSubmit(content.trim());
      if (!onCancel) {
        setContent("");
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Nao foi possivel enviar comentario.");
    }
  }

  return (
    <form className="comment-composer" onSubmit={handleSubmit} noValidate>
      <label className="control">
        <span className="sr-only">Conteudo do comentario</span>
        <textarea
          className="form-textarea"
          rows={4}
          maxLength={COMMENT_MAX_LENGTH}
          placeholder={placeholder}
          value={content}
          autoFocus={autoFocus}
          onChange={(event) => setContent(event.target.value)}
        />
      </label>

      <small className="inline-muted">
        {content.length}/{COMMENT_MAX_LENGTH}
      </small>
      {error ? <p className="inline-error">{error}</p> : null}

      <div className="inline-actions">
        <button type="submit" className="button button--primary" disabled={isPending}>
          {isPending ? "Enviando..." : submitLabel}
        </button>

        {onCancel ? (
          <button type="button" className="button button--ghost" onClick={onCancel} disabled={isPending}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}

type CommentItemProps = {
  postId: string;
  comment: CommentNode;
  canCreateComments: boolean;
  isAuthenticated: boolean;
  currentUserId: string;
};

function CommentItem({ postId, comment, canCreateComments, isAuthenticated, currentUserId }: CommentItemProps) {
  const { hasActiveSession, sessionError } = useAuthSession();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const createReplyMutation = useCreateReplyCommentMutation(postId, comment.id);
  const updateCommentMutation = useUpdateCommentMutation(postId, comment.id);
  const deleteCommentMutation = useDeleteCommentMutation(postId, comment.id);
  const likeCommentMutation = useLikeCommentMutation(postId, comment.id);
  const unlikeCommentMutation = useUnlikeCommentMutation(postId, comment.id);

  const isDeleted = comment.deletedAt !== null;
  const isAuthor = isAuthenticated && comment.author?.id === currentUserId;
  const isLikeBusy = likeCommentMutation.isPending || unlikeCommentMutation.isPending;

  async function handleToggleLike() {
    setActionError(null);

    if (!hasActiveSession) {
      setActionError(
        sessionError ?? (isAuthenticated
          ? "O usuario informado nao existe ou nao esta ativo."
          : "Informe x-user-id no topo para curtir comentarios."),
      );
      return;
    }

    try {
      if (comment.likedByMe) {
        await unlikeCommentMutation.mutateAsync();
      } else {
        await likeCommentMutation.mutateAsync();
      }
    } catch (error) {
      setActionError(toCommentMutationMessage(error, "Nao foi possivel atualizar curtida do comentario."));
    }
  }

  async function handleSubmitReply(content: string) {
    if (!hasActiveSession) {
      throw new Error(
        sessionError ?? (isAuthenticated
          ? "O usuario informado nao existe ou nao esta ativo."
          : "Informe x-user-id no topo para responder comentarios."),
      );
    }

    try {
      await createReplyMutation.mutateAsync({ content });
      setIsReplying(false);
    } catch (error) {
      throw new Error(toCommentMutationMessage(error, "Nao foi possivel publicar resposta."));
    }
  }

  async function handleSubmitEdit(content: string) {
    if (!isAuthor) {
      throw new Error("Apenas o autor pode editar este comentario.");
    }

    try {
      await updateCommentMutation.mutateAsync({ content });
      setIsEditing(false);
    } catch (error) {
      throw new Error(toCommentMutationMessage(error, "Nao foi possivel salvar alteracoes do comentario."));
    }
  }

  async function handleDeleteComment() {
    setActionError(null);

    if (!isAuthor) {
      setActionError("Apenas o autor pode remover este comentario.");
      return;
    }

    const confirmed = window.confirm("Confirma a remocao deste comentario?");
    if (!confirmed) {
      return;
    }

    try {
      await deleteCommentMutation.mutateAsync();
    } catch (error) {
      setActionError(toCommentMutationMessage(error, "Nao foi possivel remover comentario."));
    }
  }

  return (
    <article className={`comment-item ${isDeleted ? "comment-item--deleted" : ""}`}>
      <header className="comment-item__header">
        <p className="comment-item__meta">
          {comment.author ? (
            <Link to={WebRoutes.users.byId(comment.author.id)}>{toCommentAuthorLabel(comment)}</Link>
          ) : (
            <span>{toCommentAuthorLabel(comment)}</span>
          )}
          {" - "}
          <time dateTime={comment.createdAt}>{formatDateTime(comment.createdAt)}</time>
          {comment.wasEdited ? " - editado" : ""}
        </p>
      </header>

      {isEditing ? (
        <CommentComposer
          submitLabel="Salvar edicao"
          placeholder="Atualize o comentario"
          isPending={updateCommentMutation.isPending}
          initialValue={comment.content}
          autoFocus
          onSubmit={handleSubmitEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <p className="comment-item__content">{comment.content}</p>
      )}

      <ul className="meta-list" aria-label="Estatisticas do comentario">
        <li>{formatCompactCount(comment.likesCount)} likes</li>
      </ul>

      <div className="inline-actions">
        {!isDeleted ? (
          <button type="button" className="button button--ghost" onClick={handleToggleLike} disabled={isLikeBusy}>
            {isLikeBusy ? "Atualizando..." : comment.likedByMe ? "Descurtir" : "Curtir"}
          </button>
        ) : null}

        {canCreateComments && !isDeleted ? (
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setActionError(null);
              setIsReplying((previous) => !previous);
              setIsEditing(false);
            }}
            disabled={createReplyMutation.isPending}
          >
            Responder
          </button>
        ) : null}

        {isAuthor && !isDeleted ? (
          <button
            type="button"
            className="button button--ghost"
            onClick={() => {
              setActionError(null);
              setIsEditing((previous) => !previous);
              setIsReplying(false);
            }}
            disabled={updateCommentMutation.isPending}
          >
            Editar
          </button>
        ) : null}

        {isAuthor && !isDeleted ? (
          <button
            type="button"
            className="button button--danger"
            onClick={handleDeleteComment}
            disabled={deleteCommentMutation.isPending}
          >
            {deleteCommentMutation.isPending ? "Removendo..." : "Remover"}
          </button>
        ) : null}
      </div>

      {actionError ? <p className="inline-error">{actionError}</p> : null}

      {isReplying ? (
        <CommentComposer
          submitLabel="Publicar resposta"
          placeholder="Escreva sua resposta"
          isPending={createReplyMutation.isPending}
          autoFocus
          onSubmit={handleSubmitReply}
          onCancel={() => setIsReplying(false)}
        />
      ) : null}

      {comment.replies.length > 0 ? (
        <div className="comment-item__replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              postId={postId}
              comment={reply}
              canCreateComments={canCreateComments}
              isAuthenticated={isAuthenticated}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

type CommentsThreadProps = {
  postId: string;
  acceptsComments: boolean;
};

export function CommentsThread({ postId, acceptsComments }: CommentsThreadProps) {
  const { auth, hasActiveSession, isAuthenticated, sessionError, viewerId } = useAuthSession();
  const commentsQuery = useCommentTree(postId);
  const createRootCommentMutation = useCreateRootCommentMutation(postId);

  async function handleSubmitRootComment(content: string) {
    if (!hasActiveSession) {
      throw new Error(
        sessionError ?? (isAuthenticated
          ? "O usuario informado nao existe ou nao esta ativo."
          : "Informe x-user-id no topo para comentar."),
      );
    }

    try {
      await createRootCommentMutation.mutateAsync({ content });
    } catch (error) {
      throw new Error(toCommentMutationMessage(error, "Nao foi possivel publicar comentario."));
    }
  }

  return (
    <section className="panel comment-thread" aria-label="Comentarios do post">
      <h2 className="comment-thread__title">Comentarios</h2>

      {!acceptsComments ? <p className="inline-muted">Este post nao aceita novos comentarios.</p> : null}

      {acceptsComments && hasActiveSession ? (
        <CommentComposer
          submitLabel="Publicar comentario"
          placeholder="Escreva seu comentario"
          isPending={createRootCommentMutation.isPending}
          onSubmit={handleSubmitRootComment}
        />
      ) : null}

      {acceptsComments && !hasActiveSession ? (
        <p className="inline-muted">
          {sessionError ?? (isAuthenticated
            ? "O usuario informado nao existe ou nao esta ativo."
            : "Informe x-user-id no topo para adicionar comentarios.")}
        </p>
      ) : null}

      {commentsQuery.isLoading ? <LoadingState title="Carregando comentarios" /> : null}

      {commentsQuery.isError ? (
        <ErrorState
          title="Falha ao carregar comentarios"
          description={commentsQuery.error.message}
          action={
            <button type="button" className="button button--primary" onClick={() => commentsQuery.refetch()}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {!commentsQuery.isLoading && !commentsQuery.isError ? (
        commentsQuery.data && commentsQuery.data.length > 0 ? (
          <div className="comment-list">
            {commentsQuery.data.map((comment) => (
              <CommentItem
                key={comment.id}
                postId={postId}
                comment={comment}
                canCreateComments={acceptsComments}
                isAuthenticated={hasActiveSession}
                currentUserId={viewerId ?? auth.userId}
              />
            ))}
          </div>
        ) : (
          <p className="inline-muted">Ainda nao ha comentarios neste post.</p>
        )
      ) : null}
    </section>
  );
}
