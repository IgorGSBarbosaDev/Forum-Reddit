import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";

import { useAuthSession } from "../../auth-context/auth-context";
import { PostCard } from "../../posts/components/post-card";
import { queryKeys } from "../../../shared/api/query-keys";
import { useForumApi } from "../../../shared/api/use-forum-api";
import { formatDateTime } from "../../../shared/lib/formatters";
import { PaginationFooter } from "../../../shared/ui/pagination-footer";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/ui/view-states";

function parsePositiveInt(rawValue: string | null, fallback: number): number {
  if (!rawValue) {
    return fallback;
  }

  const parsed = Number(rawValue);
  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function SavedPostsPage() {
  const { auth, isAuthenticated } = useAuthSession();
  const api = useForumApi();

  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);

  const savedPostsQuery = useQuery({
    queryKey: queryKeys.savedPosts.list(auth.userId, page, limit),
    enabled: isAuthenticated,
    queryFn: () => api.savedPosts.listMine({ page, limit }),
  });

  function setPage(nextPage: number) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(nextPage));
    next.set("limit", String(limit));
    setSearchParams(next, { replace: true });
  }

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Sessao de autenticacao necessaria"
        description="Informe x-user-id no topo para acessar posts salvos."
      />
    );
  }

  if (savedPostsQuery.isLoading) {
    return <LoadingState title="Carregando posts salvos" />;
  }

  if (savedPostsQuery.isError) {
    return (
      <ErrorState
        title="Falha ao carregar posts salvos"
        description={savedPostsQuery.error.message}
        action={
          <button type="button" className="button button--primary" onClick={() => savedPostsQuery.refetch()}>
            Tentar novamente
          </button>
        }
      />
    );
  }

  const payload = savedPostsQuery.data;
  if (!payload || payload.data.length === 0) {
    return (
      <EmptyState
        title="Nenhum post salvo"
        description="Quando voce salvar posts no feed, eles aparecerao aqui."
      />
    );
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Posts salvos</h1>
        <p className="page-subtitle">Colecao pessoal de posts marcada para revisitar.</p>
      </header>

      <div className="posts-grid">
        {payload.data.map((savedPost) => (
          <div key={savedPost.id} className="stack-card">
            <PostCard post={savedPost} />
            <p className="inline-muted">
              Salvo em <time dateTime={savedPost.savedAt}>{formatDateTime(savedPost.savedAt)}</time>
            </p>
            <Link className="button button--ghost" to={`/posts/${savedPost.id}`}>
              Abrir post
            </Link>
          </div>
        ))}
      </div>

      <PaginationFooter
        page={payload.meta.page}
        totalPages={payload.meta.totalPages}
        isBusy={savedPostsQuery.isFetching}
        onPageChange={setPage}
      />
    </section>
  );
}