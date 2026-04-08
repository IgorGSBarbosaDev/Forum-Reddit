import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";

import type { PostSortBy, SortOrder } from "@forum-reddit/shared-types";

import { PostCard } from "../components/post-card";
import { useFeedPosts } from "../hooks/use-feed-posts";
import { PaginationFooter } from "../../../shared/ui/pagination-footer";
import { EmptyState, ErrorState, LoadingState } from "../../../shared/ui/view-states";

const ALLOWED_SORT_BY: PostSortBy[] = ["createdAt", "updatedAt", "title"];
const ALLOWED_ORDER: SortOrder[] = ["asc", "desc"];

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

function parseSortBy(rawValue: string | null): PostSortBy {
  if (rawValue && ALLOWED_SORT_BY.includes(rawValue as PostSortBy)) {
    return rawValue as PostSortBy;
  }

  return "createdAt";
}

function parseOrder(rawValue: string | null): SortOrder {
  if (rawValue && ALLOWED_ORDER.includes(rawValue as SortOrder)) {
    return rawValue as SortOrder;
  }

  return "desc";
}

export function FeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(searchParams.get("limit"), 20), 100);
  const sortBy = parseSortBy(searchParams.get("sortBy"));
  const order = parseOrder(searchParams.get("order"));

  const query = useMemo(
    () => ({
      page,
      limit,
      sortBy,
      order,
    }),
    [limit, order, page, sortBy],
  );

  const postsQuery = useFeedPosts(query);

  function updateSearch(nextValues: Partial<typeof query>) {
    const next = new URLSearchParams(searchParams);
    const merged = {
      ...query,
      ...nextValues,
    };

    next.set("page", String(merged.page));
    next.set("limit", String(merged.limit));
    next.set("sortBy", merged.sortBy);
    next.set("order", merged.order);

    setSearchParams(next, {
      replace: true,
    });
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="page-title">Feed</h1>
        <p className="page-subtitle">
          Posts publicos ordenados por data, atualizacao ou titulo. Fixados sempre aparecem primeiro.
        </p>
      </header>

      <div className="panel controls-grid">
        <label className="control">
          <span>Ordenar por</span>
          <select
            value={sortBy}
            onChange={(event) => updateSearch({ sortBy: event.target.value as PostSortBy, page: 1 })}
          >
            <option value="createdAt">Criacao</option>
            <option value="updatedAt">Atualizacao</option>
            <option value="title">Titulo</option>
          </select>
        </label>

        <label className="control">
          <span>Ordem</span>
          <select
            value={order}
            onChange={(event) => updateSearch({ order: event.target.value as SortOrder, page: 1 })}
          >
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </label>

        <label className="control">
          <span>Itens por pagina</span>
          <select
            value={limit}
            onChange={(event) => updateSearch({ limit: Number(event.target.value), page: 1 })}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>

        <div className="controls-grid__action">
          <Link to="/posts/new" className="button button--primary">
            Criar post
          </Link>
        </div>
      </div>

      {postsQuery.isLoading ? (
        <LoadingState
          title="Carregando feed"
          description="Buscando os posts mais recentes para voce."
        />
      ) : null}

      {postsQuery.isError ? (
        <ErrorState
          title="Falha ao carregar feed"
          description={postsQuery.error.message}
          action={
            <button type="button" className="button button--primary" onClick={() => postsQuery.refetch()}>
              Tentar novamente
            </button>
          }
        />
      ) : null}

      {!postsQuery.isLoading && !postsQuery.isError && postsQuery.data ? (
        <>
          {postsQuery.data.data.length === 0 ? (
            <EmptyState
              title="Nenhum post encontrado"
              description="Ajuste os filtros ou crie o primeiro post deste recorte."
              action={
                <Link to="/posts/new" className="button button--primary">
                  Criar post
                </Link>
              }
            />
          ) : (
            <div className="posts-grid">
              {postsQuery.data.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}

          <PaginationFooter
            page={postsQuery.data.meta.page}
            totalPages={postsQuery.data.meta.totalPages}
            isBusy={postsQuery.isFetching}
            onPageChange={(nextPage) => updateSearch({ page: nextPage })}
          />

          {postsQuery.isFetching ? <p className="inline-muted">Atualizando resultados...</p> : null}
        </>
      ) : null}
    </section>
  );
}