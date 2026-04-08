import { Link } from "react-router-dom";

import type { PostSummary } from "@forum-reddit/shared-types";

import { useAuthSession } from "../../auth-context/auth-context";
import { formatCompactCount, formatDateTime } from "../../../shared/lib/formatters";
import {
  useLikePostMutation,
  useSavePostMutation,
  useUnlikePostMutation,
  useUnsavePostMutation,
} from "../hooks/use-post-mutations";
import { toPostMutationMessage } from "../lib/post-mutation-errors";

type PostCardProps = {
  post: PostSummary;
};

function getAuthorLabel(post: PostSummary): string {
  if (!post.author) {
    return "Deleted user";
  }

  return post.author.displayName || post.author.username || "Deleted user";
}

export function PostCard({ post }: PostCardProps) {
  const { isAuthenticated } = useAuthSession();

  const likeMutation = useLikePostMutation(post.id);
  const unlikeMutation = useUnlikePostMutation(post.id);
  const saveMutation = useSavePostMutation(post.id);
  const unsaveMutation = useUnsavePostMutation(post.id);

  const isLikeBusy = likeMutation.isPending || unlikeMutation.isPending;
  const isSaveBusy = saveMutation.isPending || unsaveMutation.isPending;

  async function handleToggleLike() {
    if (!isAuthenticated) {
      window.alert("Informe x-user-id no topo para curtir posts.");
      return;
    }

    try {
      if (post.likedByMe) {
        await unlikeMutation.mutateAsync();
      } else {
        await likeMutation.mutateAsync();
      }
    } catch (error) {
      window.alert(toPostMutationMessage(error, "Nao foi possivel atualizar curtida."));
    }
  }

  async function handleToggleSave() {
    if (!isAuthenticated) {
      window.alert("Informe x-user-id no topo para salvar posts.");
      return;
    }

    try {
      if (post.savedByMe) {
        await unsaveMutation.mutateAsync();
      } else {
        await saveMutation.mutateAsync();
      }
    } catch (error) {
      window.alert(toPostMutationMessage(error, "Nao foi possivel atualizar item salvo."));
    }
  }

  return (
    <article className="post-card" aria-label={`Post ${post.title}`}>
      <header className="post-card__header">
        <div className="post-card__badges">
          {post.isPinned ? <span className="badge badge--brand">Pinned</span> : null}
          {post.status !== "ACTIVE" ? <span className="badge badge--warning">{post.status}</span> : null}
        </div>

        <h2 className="post-card__title">
          <Link to={`/posts/${post.id}`}>{post.title}</Link>
        </h2>

        <p className="post-card__preview">{post.contentPreview ?? "Sem conteudo textual."}</p>
      </header>

      <footer className="post-card__footer">
        <p className="post-card__meta">
          Por{" "}
          {post.author ? (
            <Link to={`/users/${post.author.id}`}>{getAuthorLabel(post)}</Link>
          ) : (
            <span>{getAuthorLabel(post)}</span>
          )}
          {" • "}
          <time dateTime={post.createdAt}>{formatDateTime(post.createdAt)}</time>
        </p>

        <ul className="meta-list" aria-label="Estatisticas do post">
          <li>{formatCompactCount(post.commentsCount)} comentarios</li>
          <li>{formatCompactCount(post.likesCount)} likes</li>
          <li>{post.savedByMe ? "Salvo" : "Nao salvo"}</li>
        </ul>

        <div className="inline-actions">
          <button type="button" className="button button--ghost" onClick={handleToggleLike} disabled={isLikeBusy}>
            {isLikeBusy ? "Atualizando..." : post.likedByMe ? "Descurtir" : "Curtir"}
          </button>

          <button type="button" className="button button--ghost" onClick={handleToggleSave} disabled={isSaveBusy}>
            {isSaveBusy ? "Atualizando..." : post.savedByMe ? "Remover salvo" : "Salvar"}
          </button>
        </div>
      </footer>
    </article>
  );
}